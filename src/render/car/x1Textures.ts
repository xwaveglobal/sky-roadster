/**
 * Canvas textures for the XWAVE X1 3D model (badge wordmark, carbon weave, tyre tread).
 * Used twice: by the model builder (scripts/car/) to embed them in the GLB, and at run time,
 * where the game applies them by material name — so the runtime never decodes images from the
 * GLB (works the same in the web build, the single-file build and the native TikTok build).
 */

type Canvas = HTMLCanvasElement;

function canvas(w: number, h: number): [Canvas, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

/**
 * The XWAVE logo (owner artwork, 2026-10-25) as polygons in a 1000 × 120 box — traced from the
 * owner's PNG so it draws crisp at any size with plain canvas paths (works in the native runtime too).
 * Shapes separated by ';', points "x,y" separated by spaces.
 */
export const XWAVE_LOGO = { w: 1000, h: 120, d: '807,119 968,119 974,118 983,112 992,103 997,93 835,94 828,96 821,101 813,109;92,82 83,73 75,68 64,67 60,68 51,74 0,119 48,119 52,118 60,113;556,106 557,109 613,109 615,108 614,104 591,65 587,61 585,61 583,63;832,73 945,73 952,71 961,66 969,57 974,47 859,47 853,49 844,55 838,61;857,26 971,26 982,22 990,16 995,10 1000,1 883,1 871,6 862,16;651,1 716,108 724,115 732,118 741,120 748,120 756,119 763,115 774,106 839,1 812,1 805,4 794,21 755,84 751,88 747,90 741,90 734,84 688,9 684,4 678,1;97,53 96,56 99,62 160,117 164,119 212,119 158,70 150,67 136,66 131,63 129,57 130,52 134,47 137,46 151,45 158,41 199,1 155,1 151,3;7,1 52,41 62,46 73,46 78,44 94,30 68,7 59,1;490,119 515,119 519,118 524,115 576,35 580,31 585,29 592,31 597,35 639,106 647,117 654,119 679,119 614,13 608,7 600,2 593,0 583,0 576,1 567,5 557,14;213,1 264,104 271,112 276,115 283,119 291,120 299,120 307,117 314,112 320,107 325,99 354,36 358,31 362,30 368,30 374,36 404,101 413,112 423,118 433,120 444,119 453,115 463,106 468,99 519,1 494,1 490,2 485,7 446,83 442,88 437,90 432,90 426,84 397,22 392,13 385,7 374,1 368,0 354,1 343,8 334,16 302,84 298,89 291,90 287,88 284,84 245,6 241,2 237,1' };

/** draw the XWAVE logo, `w` wide, top-left at (x, y) */
export function drawXwaveLogo(g: CanvasRenderingContext2D, x: number, y: number, w: number, fill: string | CanvasGradient = '#ffffff') {
  const k = w / XWAVE_LOGO.w;
  g.fillStyle = fill;
  for (const shape of XWAVE_LOGO.d.split(';')) {
    g.beginPath();
    shape.split(' ').forEach((pt, i) => {
      const [px, py] = pt.split(',');
      const X = x + Number(px) * k,
        Y = y + Number(py) * k;
      if (i === 0) g.moveTo(X, Y);
      else g.lineTo(X, Y);
    });
    g.closePath();
    g.fill();
  }
}

/** the rear badge (4:1, transparent): the XWAVE logo in clean white — no blue halo (owner 2026-10-25) */
export function x1BadgeCanvas(): Canvas {
  const [c, g] = canvas(1024, 256);
  g.clearRect(0, 0, 1024, 256);
  const w = 980;
  const h = (w * XWAVE_LOGO.h) / XWAVE_LOGO.w;
  drawXwaveLogo(g, (1024 - w) / 2, (256 - h) / 2 + 6, w, '#ffffff');
  return c;
}

/** 2×2 twill carbon weave, tileable */
export function x1CarbonCanvas(): Canvas {
  const [c, g] = canvas(128, 128);
  g.fillStyle = '#16181c';
  g.fillRect(0, 0, 128, 128);
  const cell = 16;
  for (let y = 0; y < 128; y += cell) {
    for (let x = 0; x < 128; x += cell) {
      const k = ((x + y) / cell) % 4 < 2;
      const gr = k ? g.createLinearGradient(x, y, x + cell, y) : g.createLinearGradient(x, y, x, y + cell);
      gr.addColorStop(0, '#1b1e23');
      gr.addColorStop(0.5, '#33373f');
      gr.addColorStop(1, '#1b1e23');
      g.fillStyle = gr;
      g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    }
  }
  return c;
}

/** tyre tread: circumferential grooves + sipes, repeats around the tyre (u) — v runs across the width */
export function x1TreadCanvas(): Canvas {
  const [c, g] = canvas(64, 256);
  g.fillStyle = '#1a1b1e';
  g.fillRect(0, 0, 64, 256);
  // shoulders (sidewall) a little lighter
  g.fillStyle = '#202226';
  g.fillRect(0, 0, 64, 40);
  g.fillRect(0, 216, 64, 40);
  // three main grooves
  g.fillStyle = '#0b0b0d';
  for (const v of [92, 128, 164]) g.fillRect(0, v - 4, 64, 8);
  // diagonal sipes on the shoulders: these make the rotation visible
  g.strokeStyle = '#0d0d10';
  g.lineWidth = 4;
  for (let x = -16; x < 80; x += 16) {
    g.beginPath();
    g.moveTo(x, 44);
    g.lineTo(x + 10, 80);
    g.moveTo(x, 212);
    g.lineTo(x + 10, 176);
    g.stroke();
  }
  return c;
}

/**
 * v4.3 (Step 06 PBR): metallic-flake normal map for the paint's base coat (the clearcoat above stays
 * smooth). Tangent-space normals: flat background (128, 128, 255) with ~1,400 tiny flakes, each tilted
 * a little in a random direction — sparkle up close, averages out to flat in the mip chain (no
 * shimmer at distance). Deterministic; plain fillRect calls only (works with the native canvas).
 */
export function x1FlakeCanvas(): Canvas {
  const [c, g] = canvas(128, 128);
  g.fillStyle = 'rgb(128,128,255)';
  g.fillRect(0, 0, 128, 128);
  let s = 1234567;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 1400; i++) {
    const a = rnd() * Math.PI * 2;
    const t = 0.25 + rnd() * 0.45; // tilt
    const nx = Math.cos(a) * t;
    const ny = Math.sin(a) * t;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    g.fillStyle = `rgb(${Math.round((nx * 0.5 + 0.5) * 255)},${Math.round((ny * 0.5 + 0.5) * 255)},${Math.round((nz * 0.5 + 0.5) * 255)})`;
    const sz = rnd() < 0.7 ? 1 : 2;
    g.fillRect(Math.floor(rnd() * 128), Math.floor(rnd() * 128), sz, sz);
  }
  return c;
}
