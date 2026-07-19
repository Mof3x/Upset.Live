import { useEffect, useRef } from "react";
import { applyEdgeDiffuseOverlay } from "./edgeDiffuse";

export default function DitherCanvas({ id, src, ...props }) {
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

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Keep a clean copy so we can reintroduce the original color only in the center.
      const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

      const bayer = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5],
      ];

      const N = bayer.length;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;

          const grey =
            (data[i] + data[i + 1] + data[i + 2]) / 3;

          const threshold =
            (bayer[y % N][x % N] / (N * N)) * 255;

          const value = grey < threshold ? 0 : 255;

          data[i] = 0;
          data[i + 1] = value;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      ctx.fillStyle = "rgba(17, 9, 9, 0.25)";
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Reuse the exact same edge treatment so this canvas matches the hero image.
      applyEdgeDiffuseOverlay(canvas, 1);

      // Build a final pass that restores full color in the center like a vignette.
      // This has to happen last so the edge treatment does not wash the center back out.
      const colorCanvas = document.createElement("canvas");
      colorCanvas.width = canvas.width;
      colorCanvas.height = canvas.height;

      const colorCtx = colorCanvas.getContext("2d");
      if (colorCtx) {
        colorCtx.putImageData(originalImageData, 0, 0);

        colorCtx.save();
        colorCtx.globalCompositeOperation = "destination-in";

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        // A wide opaque center keeps the source image fully visible before fading out.
        const innerRadius = Math.min(canvas.width, canvas.height) * 0.3;
        const outerRadius = Math.min(canvas.width, canvas.height) * 0.82;

        const vignette = colorCtx.createRadialGradient(
          centerX,
          centerY,
          innerRadius,
          centerX,
          centerY,
          outerRadius
        );

        vignette.addColorStop(0, "rgba(0, 0, 0, 1)");
        vignette.addColorStop(0.6, "rgba(0, 0, 0, 1)");
        vignette.addColorStop(0.88, "rgba(0, 0, 0, 0.42)");
        vignette.addColorStop(1, "rgba(0, 0, 0, 0)");

        colorCtx.fillStyle = vignette;
        colorCtx.fillRect(0, 0, canvas.width, canvas.height);
        colorCtx.restore();

        // Draw with an explicit destination size so the overlay is not scaled twice
        // by the DPR transform on HiDPI screens.
        ctx.drawImage(colorCanvas, 0, 0, canvas.width, canvas.height, 0, 0, rect.width, rect.height);
      }
    };

    img.onload = draw;

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);

    return () => ro.disconnect();

  }, [src]);

  return <canvas ref={ref} id={id} className="DitherCanvas" {...props} />;
}