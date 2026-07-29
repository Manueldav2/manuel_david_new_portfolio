import * as THREE from "three";

/**
 * Letters are painted at runtime onto a 2D canvas and used as the block map.
 * No font JSON, no texture download, no Text3D: the glyph comes from the same
 * webfont the DOM is already using, so the whole toy costs zero extra bytes.
 *
 * BoxGeometry UVs already orient every face outward-upright, so one texture on
 * all six sides means the letter reads whichever way a block comes to rest.
 */

const SIZE = 256;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export type FaceTexture = {
  texture: THREE.CanvasTexture;
  /** Redraw once the webfont has actually arrived. */
  paint: () => void;
};

export function createFaceTexture(
  char: string,
  bg: string,
  fg: string,
  fontFamily: string
): FaceTexture {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const paint = () => {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // A pressed keyline, the way a moulded alphabet block has one.
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = fg;
    ctx.lineWidth = 7;
    roundedRect(ctx, 26, 26, SIZE - 52, SIZE - 52, 30);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `800 152px ${fontFamily}`;
    // Optical centring: cap height sits high of the em box centre.
    const m = ctx.measureText(char);
    const capHeight =
      m.actualBoundingBoxAscent && m.actualBoundingBoxDescent !== undefined
        ? m.actualBoundingBoxAscent
        : 108;
    ctx.fillText(char, SIZE / 2, SIZE / 2 + capHeight / 2);

    texture.needsUpdate = true;
  };

  paint();
  return { texture, paint };
}

/**
 * Break a label into at most two lines, choosing the split that makes the two
 * halves as even as possible. One-word labels stay on one line. A long name
 * like Satisfying Video Generator would otherwise shrink to nothing.
 */
function splitLabel(text: string, maxWidth: number, measure: (s: string) => number) {
  if (measure(text) <= maxWidth) return [text];
  const words = text.split(" ");
  if (words.length < 2) return [text];
  let best: string[] = [words.slice(0, 1).join(" "), words.slice(1).join(" ")];
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i += 1) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const score = Math.abs(measure(a) - measure(b));
    if (score < bestScore) {
      bestScore = score;
      best = [a, b];
    }
  }
  return best;
}

/**
 * The printed top of a work slab or a project tile. Same idea as a letter
 * face, one word wide: painted at runtime from the webfont already on the
 * page, so a labelled object still costs nothing to download.
 */
export function createLabelTexture(
  text: string,
  bg: string,
  fg: string,
  fontFamily: string,
  aspect: number
): FaceTexture {
  const h = 208;
  const w = Math.round(h * aspect);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const paint = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = fg;
    ctx.lineWidth = 5;
    roundedRect(ctx, 16, 16, w - 32, h - 32, 18);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const room = w - 76;
    let size = Math.round(h * 0.44);
    ctx.font = `700 ${size}px ${fontFamily}`;
    let lines = splitLabel(text, room, (s) => ctx.measureText(s).width);
    // Shrink until the widest line fits, re-breaking as the size changes.
    let guard = 0;
    while (size > 16 && guard < 80) {
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (widest <= room) break;
      size -= 3;
      ctx.font = `700 ${size}px ${fontFamily}`;
      lines = splitLabel(text, room, (s) => ctx.measureText(s).width);
      guard += 1;
    }

    // Optical centring: the middle baseline sits a hair low for caps-heavy
    // words, so nudge back up by a fraction of the cap height.
    const leading = size * 1.02;
    const top = h / 2 + size * 0.03 - ((lines.length - 1) * leading) / 2;
    lines.forEach((line, i) => ctx.fillText(line, w / 2, top + i * leading));

    texture.needsUpdate = true;
  };

  paint();
  return { texture, paint };
}
