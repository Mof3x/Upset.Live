// Reusable CRT edge treatment for any 2D canvas.
//
// How to use it elsewhere:
// 1. Draw your main canvas image first.
// 2. Call applyEdgeDiffuseOverlay(canvas) after the draw is finished.
// 3. Tune the options object if you want a softer, sharper, or more glitchy edge.
//
// What it does:
// - Makes a low-resolution copy of the rendered canvas.
// - Blurs that copy so the texture gets soft and unstable.
// - Masks the copy so only the outer region survives.
// - Blends the edge layer back over the original canvas with tiny offsets.
//
// The result is a CRT-style diffusion that is easy to reuse across canvases.
export function applyEdgeDiffuseOverlay(
  canvas,
  intensity = 0.5,
  {
    // Lower values make the edge copy smaller, which makes the final fringe
    // look more pixelated and melted when it is scaled back up.
    downscale = 0.36,
    // Larger values make the fuzzy fringe wider and more obvious.
    blurPx = 6,
    // Controls how much of the center remains clean before the edge fade begins.
    centerClearRatio = 0.1,
    // Expands the soft falloff between the clear center and the outer edge.
    edgeSoftness = 0.28,
    // Overall opacity of the overlay layer when it is blended back in.
    opacity = 0.62,
  } = {}
) {
  // Guard against missing canvas, zero-sized canvas, or non-browser environments.
  if (!canvas || !canvas.width || !canvas.height || typeof document === "undefined") {
    return;
  }

  // Clamp intensity so all blur/alpha math stays in a safe, predictable range.
  // You can think of this as the master "strength" knob for the effect.
  const strength = Math.max(0, Math.min(intensity, 1.5));

  // Important:
  // This helper only works on a 2D canvas context.
  // If you want the same look in another component, make sure that component
  // is rendering to a normal <canvas> with getContext("2d").
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const baseWidth = canvas.width;
  const baseHeight = canvas.height;

  // Step 1: make a tiny copy of the rendered image.
  // This is the easiest way to get a crunchy, diffuse CRT fringe without
  // having to write a custom shader.
  const lowResCanvas = document.createElement("canvas");
  lowResCanvas.width = Math.max(32, Math.round(baseWidth * downscale));
  lowResCanvas.height = Math.max(32, Math.round(baseHeight * downscale));

  const lowResCtx = lowResCanvas.getContext("2d");
  if (!lowResCtx) {
    return;
  }

  // Smooth during the shrink step so the reduced copy becomes soft rather than jagged.
  // If you turn this off, the effect becomes more blocky and harsh.
  lowResCtx.imageSmoothingEnabled = true;
  lowResCtx.drawImage(
    canvas,
    0, 0, baseWidth, baseHeight,
    0, 0, lowResCanvas.width, lowResCanvas.height
  );

  // Step 2: scale the tiny copy back up to full size on a separate canvas.
  // We keep this isolated so the original canvas stays untouched until the end.
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = baseWidth;
  edgeCanvas.height = baseHeight;

  const edgeCtx = edgeCanvas.getContext("2d");
  if (!edgeCtx) {
    return;
  }

  // Step 3: blow the small copy back up and blur it.
  // This is the core of the fuzzy edge look.
  edgeCtx.imageSmoothingEnabled = true;
  edgeCtx.filter = `blur(${blurPx * strength}px)`;
  edgeCtx.drawImage(
    lowResCanvas,
    0, 0, lowResCanvas.width, lowResCanvas.height,
    0, 0, baseWidth, baseHeight
  );
  edgeCtx.filter = "none";

  // Step 4: keep only the outer region of that blurred copy.
  // destination-in means "keep the pixels only where the mask is opaque".
  const centerX = baseWidth / 2;
  const centerY = baseHeight / 2;

  const innerRadius = Math.min(baseWidth, baseHeight) * (centerClearRatio - strength * 0.04);
  const outerRadius = Math.max(baseWidth, baseHeight) * (0.50 + edgeSoftness + strength * 0.06);

  const mask = edgeCtx.createRadialGradient(
    centerX, centerY, innerRadius,
    centerX, centerY, outerRadius
  );

  // Transparent in the middle, stronger toward the border.
  // To make the edge fade more gradual, move these stops closer together.
  // To make the edge fade more abrupt, move them farther apart.
  mask.addColorStop(0, "rgba(0, 0, 0, 0.06)");
  mask.addColorStop(0.58, "rgba(0, 0, 0, 0.26)");
  mask.addColorStop(0.82, "rgba(0, 0, 0, 0.55)");
  mask.addColorStop(1, "rgba(0, 0, 0, 0.98)");

  edgeCtx.globalCompositeOperation = "destination-in";
  edgeCtx.fillStyle = mask;
  edgeCtx.fillRect(0, 0, baseWidth, baseHeight);
  edgeCtx.globalCompositeOperation = "source-over";

  // Step 5: blend the edge-only layer back into the original canvas.
  // If you want a more obvious glow, try "screen" or "lighter" here.
  // If you want a darker, dirtier CRT edge, keep "source-over".
  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  // The first draw is the softest and most visible one.
  ctx.globalAlpha = opacity * strength;
  ctx.filter = `blur(${2.5 * strength}px)`;
  ctx.drawImage(edgeCanvas, 0, 0);

  // The offset copies make the fringe feel unstable instead of perfectly centered.
  // If you want the effect to feel less glitchy, remove these extra draws.
  ctx.globalAlpha = 0.40 * opacity * strength;
  ctx.drawImage(edgeCanvas, 1, 0);

  ctx.globalAlpha = 0.32 * opacity * strength;
  ctx.drawImage(edgeCanvas, -1, 1);

  ctx.globalAlpha = 0.25 * opacity * strength;
  ctx.drawImage(edgeCanvas, 0, -1);

  ctx.filter = "none";

  ctx.restore();
}