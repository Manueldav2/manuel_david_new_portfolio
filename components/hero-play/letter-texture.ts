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
