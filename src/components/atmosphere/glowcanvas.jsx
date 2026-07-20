import { useEffect, useRef } from "react";
import { applyEdgeDiffuseOverlay } from "./edgeDiffuse";

export default function GlowCanvas({ id, src, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
      if (!canvas) return;
  const img = new Image();
  img.src = src;

  const draw = () => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); 

    const targetAspect = rect.width / rect.height;
    const srcAspect = img.width / img.height;

    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (srcAspect > targetAspect) {
      sw = img.height * targetAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetAspect;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, rect.width, rect.height);

    // Keep a clean copy so we can reintroduce the original color in the center only.
    const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // quick overexposure check
      let brightCount = 0;
      const total = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (gray > 190) brightCount++;
      }

      const brightRatio = brightCount / total;
      console.log("brightRatio", brightRatio);
      const invert = brightRatio > 0.3;


      const bayer8 = [
         [0, 48, 12, 60, 3, 51, 15, 63],
         [32, 16, 44, 28, 35, 19, 47, 31],
         [8, 56, 4, 52, 11, 59, 7, 55],
         [40, 24, 36, 20, 43, 27, 39, 23],
         [2, 50, 14, 62, 1, 49, 13, 61],
         [34, 18, 46, 30, 33, 17, 45, 29],
         [10, 58, 6, 54, 9, 57, 5, 53],
         [42, 26, 38, 22, 41, 25, 37, 21],
        ];

      const N = bayer8.length;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          
          let gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (invert) gray = 255 - gray;

          const threshold = (bayer8[y % N][x % N] + 0.5) * (255 / (N * N));
          const v = gray > threshold ? 255 : 0;

          // white phosphor
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // glow
      ctx.globalCompositeOperation = "screen";
      ctx.filter = "blur(6px)";
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";

      // scanlines
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Add the reusable CRT-style edge diffusion after the main image and scanlines are drawn.
      applyEdgeDiffuseOverlay(canvas, 0.15);

      // Build a final pass that restores the source color in the center like an inner border.
      // This stays last so the glow and edge diffusion do not wash the middle back out.
      const colorCanvas = document.createElement("canvas");
      colorCanvas.width = canvas.width;
      colorCanvas.height = canvas.height;

      const originalCanvas = document.createElement("canvas");
      originalCanvas.width = canvas.width;
      originalCanvas.height = canvas.height;

      const originalCtx = originalCanvas.getContext("2d");
      if (originalCtx) {
        originalCtx.putImageData(originalImageData, 0, 0);
      }

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;

      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (maskCtx) {
          // ------------------------------------------------------------
          // EDGE-BASED COLOUR RESTORE MASK
          // Instead of making a rounded inner box of colour,
          // this measures how far each pixel is from the nearest edge.
          // Near the edges = mostly black/white.
          // Farther inward = gradually more original colour.
          // This gives you a natural fade from the outside in.
          // ------------------------------------------------------------

          const maskImage = maskCtx.createImageData(canvas.width, canvas.height);
          const maskData = maskImage.data;

          // ------------------------------------------------------------
          // TUNING
          // outerFade: how much of the image edge stays monochrome first
          // innerFade: how long the blend takes before reaching full colour
          //
          // Increase outerFade -> thicker black/white edge zone
          // Increase innerFade -> softer, longer transition
          // ------------------------------------------------------------
          const outerFade = 0.05; // 5% of the shortest side stays mostly monochrome
          const innerFade = 0.11; // next 11% gradually fades into full colour

          // Use the shortest side so the fade thickness feels even
          // whether the image is wide or tall.
          const minSide = Math.min(canvas.width, canvas.height);

          // Convert ratios into pixel distances.
          const startColorDistance = minSide * outerFade;
          const fullColorDistance = minSide * (outerFade + innerFade);

          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const i = (y * canvas.width + x) * 4;

              // --------------------------------------------------------
              // Distance to the nearest edge of the canvas.
              // This is the key difference:
              // we are not measuring from a box in the middle,
              // we are measuring inward from the outer frame.
              // --------------------------------------------------------
              const distLeft = x;
              const distRight = canvas.width - x;
              const distTop = y;
              const distBottom = canvas.height - y;

              const edgeDistance = Math.min(distLeft, distRight, distTop, distBottom);

              // --------------------------------------------------------
              // Map distance -> alpha
              // 0 alpha   = no colour restore near edges
              // 1 alpha   = full colour restore deeper inside
              // --------------------------------------------------------
              let t =
                (edgeDistance - startColorDistance) /
                (fullColorDistance - startColorDistance);

              // Clamp to 0..1
              t = Math.max(0, Math.min(1, t));

              // Smoothstep makes the transition feel less linear and harsh.
              t = t * t * (3 - 2 * t);

              maskData[i] = 255;
              maskData[i + 1] = 255;
              maskData[i + 2] = 255;
              maskData[i + 3] = Math.round(t * 255);
            }
          }

          maskCtx.putImageData(maskImage, 0, 0);
        }

      const colorCtx = colorCanvas.getContext("2d");
      if (colorCtx) {
        // Draw the mask first, then clip the full-color source through it.
        colorCtx.drawImage(maskCanvas, 0, 0);
        colorCtx.globalCompositeOperation = "source-in";
        if (originalCtx) {
          colorCtx.drawImage(originalCanvas, 0, 0);
        }

        // Draw in raw canvas pixel space so the DPR transform does not clip the overlay.
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(colorCanvas, 0, 0);
        ctx.restore();
      }
    };

    img.onload = draw;

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);

    return () => ro.disconnect();

  }, [src]);

  return     <canvas
      id={id}
      ref={ref}
      className="GlowCanvas"
      {...props}
    />;
}