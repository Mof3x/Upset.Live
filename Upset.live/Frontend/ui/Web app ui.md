![[Pasted image 20260529191439.png]]


What you want is a neon contour / specimen scan filter:

 - turns any image into thin glowing linework
 - pushes it toward black background + green/white highlights
 - adds scanlines, grain, and HUD framing

Best image qualities

It works best when the image has:

 - a clear subject silhouette
 - good contrast
 - simple background
 - enough resolution to hold edges
 - strong shapes, not too much visual clutter

It struggles with:

 - dark-on-dark images
 - very busy scenes
 - tiny low-contrast details
 - blurry or heavily compressed images

The filter pipeline

For a React app, do it like this:

 1. Grayscale the image
 2. Increase contrast
 3. Detect edges   - Sobel / Laplacian / Canny-style edge pass
 4. Threshold the edges into clean linework
 5. Posterize / quantize the tones
 6. Tint the lines neon green, cyan, or white
 7. Blur a copy of the line layer for glow
 8. Overlay scanlines + noise
 9. Add HUD boxes / labels on top

What it is called

Closest names:

 - specimen scan
 - neon contour filter
 - wireframe HUD filter
 - glow edge-detection filter

For React

Use:

 - Canvas for the filter preview
 - WebGL / shaders if you want it fast and smooth
 - OpenCV.js if you want more advanced image processing

Practical rule

If the image has a strong outline and readable forms, the effect will look good.
If it’s too flat or busy, the filter will turn muddy.

![[Pasted image 20260529191814.png]]
What gives it the look

 - deep cyan-blue sky
 - buildings pushed toward green/teal
 - heavy film grain / noise
 - slightly underexposed shadows
 - high-contrast window lights
 - soft, compressed, scanned feel

How to recreate it for any image

 1. Raise contrast
 2. Shift shadows to teal/green
 3. Push highlights toward pale green/white
 4. Lower saturation overall
 5. Add grain/noise overlay
 6. Slight blur or softness
 7. Optional vignette and darkened blacks

Best image types

 - skylines
 - buildings
 - night scenes
 - strong geometric subjects

React filter name

 - blue-hour grain
 - teal city scan
 - cyberpunk film grade

If you want, I can turn this into a filter recipe list for your app, with names like grain, tealShift, duotone, and scanlines.
![[Pasted image 20260529192000.png]] To get a “low‑poly / PS2” look in a React web app, treat it as post-processing (an image filter). Best results come from WebGL shaders (GPU), not CPU canvas loops.

  Core PS2-style ingredients (stack these)

   1. Render at low internal resolution (e.g., 320×240 or 426×240), then upscale to full size with nearest-neighbor.
   2. Color reduction / posterize (simulate 16‑bit-ish color): quantize RGB to e.g. 32–64 steps.
   3. Ordered dithering (PS1/PS2 vibe): Bayer matrix dithering after quantization.
   4. Noise + slight jitter (subtle temporal wobble).
   5. (If doing 3D) Low-poly geometry + vertex snapping (snap positions in vertex shader) + nearest texture filtering.

  Recommended implementation path (React)

   - Use three.js + @react-three/fiber and a postprocess pass: - Render scene → low-res render target
   - Fullscreen quad shader pass that does pixelate + posterize + dithering

  Fragment shader “image filter” (pixelate + posterize + Bayer dithering)

   uniform sampler2D tDiffuse;
   uniform vec2 resolution;   // screen px
   uniform float pixelSize;   // e.g. 4.0
   uniform float steps;       // e.g. 48.0
   
   float bayer(vec2 p) { // 4x4 Bayer
     int x = int(mod(p.x, 4.0));
     int y = int(mod(p.y, 4.0));
     int i = x + y*4;
     float m[16] = float[16](
       0., 8., 2.,10.,
      12., 4.,14., 6.,
       3.,11., 1., 9.,
      15., 7.,13., 5.
     );
     return m[i] / 16.0 - 0.5;
   }
   
   void main() {
     vec2 uv = gl_FragCoord.xy / resolution;
   
     // pixelate
     vec2 puv = floor(uv * resolution / pixelSize) * pixelSize / resolution;
   
     vec3 c = texture2D(tDiffuse, puv).rgb;
   
     // dither + posterize
     float d = bayer(gl_FragCoord.xy) / steps;
     c = floor((c + d) * steps) / steps;
   
     gl_FragColor = vec4(c, 1.0);
   }

  If you tell me which you’re filtering (a static <img>, webcam, or a 3D scene), I can give you a drop-in React component using either canvas2d or react-three-fiber.

❯ a static image

● For a static image, the simplest “PS2/low‑poly” filter is: downscale → (optional) dither+posterize → upscale with nearest-neighbor using <canvas>.

```
  React component (Canvas2D)

   import React, { useEffect, useRef } from "react";
   
   const BAYER4 = [
     0,  8,  2, 10,
    12,  4, 14,  6,
     3, 11,  1,  9,
    15,  7, 13,  5,
   ];
   
   function clamp01(x){ return Math.max(0, Math.min(1, x)); }
   
   export function Ps2Image({
     src,
     pixelSize = 4,     // bigger = chunkier pixels
     steps = 48,        // lower = more banding (try 24–64)
     dither = 1.0,      // 0..1
     style,
   }) {
     const canvasRef = useRef(null);
   
     useEffect(() => {
       const img = new Image();
       img.crossOrigin = "anonymous"; // requires CORS if remote
       img.onload = () => {
         const canvas = canvasRef.current;
         const ctx = canvas.getContext("2d");
   
         // Output size = displayed size (use CSS to control)
         const outW = img.naturalWidth;
         const outH = img.naturalHeight;
   
         canvas.width = outW;
         canvas.height = outH;
   
         // 1) draw low-res
         const lowW = Math.max(1, Math.floor(outW / pixelSize));
         const lowH = Math.max(1, Math.floor(outH / pixelSize));
         const off = document.createElement("canvas");
         off.width = lowW;
         off.height = lowH;
         const offCtx = off.getContext("2d");
         offCtx.imageSmoothingEnabled = true;
         offCtx.drawImage(img, 0, 0, lowW, lowH);
   
         // 2) posterize + ordered dithering at low-res
         const im = offCtx.getImageData(0, 0, lowW, lowH);
         const data = im.data;
   
         for (let y = 0; y < lowH; y++) {
           for (let x = 0; x < lowW; x++) {
             const i = (y * lowW + x) * 4;
   
             const b = (BAYER4[(x & 3) + ((y & 3) << 2)] / 16) - 0.5; // -0.5..0.5
             const n = (b * dither) / steps;
   
             for (let c = 0; c < 3; c++) {
               let v = data[i + c] / 255;
               v = clamp01(v + n);
               v = Math.floor(v * steps) / steps;
               data[i + c] = Math.round(v * 255);
             }
           }
         }
         offCtx.putImageData(im, 0, 0);
   
         // 3) upscale with nearest-neighbor
         ctx.imageSmoothingEnabled = false;
         ctx.clearRect(0, 0, outW, outH);
         ctx.drawImage(off, 0, 0, lowW, lowH, 0, 0, outW, outH);
       };
   
       img.src = src;
     }, [src, pixelSize, steps, dither]);
   
     return (
       <canvas
         ref={canvasRef}
         style={{ width: "100%", height: "auto", imageRendering: "pixelated", ...style }}
       />
     );
   }

  Usage

   <Ps2Image src="/my-photo.jpg" pixelSize={6} steps={32} dither={1} />
```
  If your image is from a CDN/other domain, tell me the URL—CORS is the main gotcha for reading pixels.

![[Pasted image 20260529224221.png]]


● Here’s a close “Matrix/Winamp” frame using an SVG outline + clip so your React content sits inside the same shape. Tweak the d path to match your screenshot tighter (best workflow: trace in Inkscape, then paste the path in).

   export function MatrixFrame({ children, className, style }) {
     const d = `
       M60 65
       Q80 35 120 30
       L360 30 Q410 28 440 55
       L470 95 L530 95 L560 55
       Q590 28 640 30 L900 30
       Q940 35 960 65
       Q980 95 975 120
       L975 250 Q975 285 940 295
       L120 295 Q80 285 60 250
       L60 120 Q55 95 60 65 Z
     `;
   
     return (
       <div className={className} style={{ width: "100%", maxWidth: 900, ...style }}>
         <svg viewBox="0 0 1000 320" width="100%" height="auto">
           <defs>
             <linearGradient id="metal" x1="0" x2="0" y1="0" y2="1">
               <stop offset="0" stopColor="#f6f6f6" />
               <stop offset="0.35" stopColor="#9b9b9b" />
               <stop offset="0.7" stopColor="#e9e9e9" />
               <stop offset="1" stopColor="#6f6f6f" />
             </linearGradient>
   
             <linearGradient id="green" x1="0" x2="0" y1="0" y2="1">
               <stop offset="0" stopColor="#cfff2c" />
               <stop offset="0.55" stopColor="#79c300" />
               <stop offset="1" stopColor="#2f6f00" />
             </linearGradient>
   
             <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.45" />
             </filter>
   
             <clipPath id="clip"><path d={d} /></clipPath>
           </defs>
   
           {/* outer metal */}
           <path d={d} fill="url(#metal)" filter="url(#shadow)" />
           <path d={d} fill="none" stroke="#fff" strokeWidth="6" opacity="0.55" />
           <path d={d} fill="none" stroke="#000" strokeWidth="6" opacity="0.25" />
   
           {/* inner green panel */}
           <g clipPath="url(#clip)">
             <path d={d} transform="translate(18 18) scale(0.964 0.90)" fill="url(#green)" opacity="0.95" />
             <path d={d} transform="translate(18 18) scale(0.964 0.90)" fill="none" stroke="#000" strokeWidth="6" opacity="0.35" />
             <foreignObject x="90" y="90" width="820" height="180">
               <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: "100%", height: "100%" }}>
                 {children}
               </div>
             </foreignObject>
           </g>
         </svg>
       </div>
     );
   }

  If you want it to match exactly, tell me your target size (e.g. 1000×320) and I’ll help you trace/fit the exact outline into the d path.


