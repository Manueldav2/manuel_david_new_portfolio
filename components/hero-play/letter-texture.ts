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
 * The printed top of a work slab or a project tile. Same idea as a letter
 * face, one word wide: painted at runtime from the webfont already on the
 * page, so a labelled object still costs nothing to download.
 *
 * The word is shrunk to fit rather than wrapped, because these are objects
 * you may see edge-on and a single line survives foreshortening better.
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
    while (ctx.measureText(text).width > room && size > 16) {
      size -= 2;
      ctx.font = `700 ${size}px ${fontFamily}`;
    }
    // Optical centring: the middle baseline sits a hair low for caps-heavy
    // words, so nudge back up by a fraction of the cap height.
    ctx.fillText(text, w / 2, h / 2 + size * 0.03);

    texture.needsUpdate = true;
  };

  paint();
  return { texture, paint };
}
