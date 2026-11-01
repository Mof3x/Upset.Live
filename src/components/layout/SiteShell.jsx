import { useState } from "react";
import Noise from "../atmosphere/Noise";
import CRTEffect from "vault66-crt-effect";
import "vault66-crt-effect/dist/vault66-crt-effect.css";
// Hub layout: HubHeader replaces the old Navbar (kept in Navbar.jsx; swap back here to revert).
import HubHeader from "./HubHeader";
import Footer from "./Footer";
import { AudioProvider } from "../audio/AudioProvider";
import { BasketProvider } from "../basket/BasketProvider";
import NowPlaying from "../audio/NowPlaying";
import { readNoiseLevel, saveNoiseLevel } from "../../lib/noiseLevel";
import "../../index.css";

export default function SiteShell({ children }) {
  const [noise, setNoise] = useState(readNoiseLevel);
  const changeNoise = (level) => {
    setNoise(level);
    saveNoiseLevel(level);
  };

  return (
    <AudioProvider>
    <BasketProvider>
    <div className="site-shell">
      {/* "Off" removes the noise canvas completely, so it stops drawing too. */}
      {noise !== "off" && (
        <div className="noise-layer" data-noise={noise}>
          <Noise
            patternSize={900}
            patternScaleX={2}
            patternScaleY={1}
            patternRefreshInterval={2}
            patternAlpha={400}
            pixelated={noise === "high"}
          />
        </div>
      )}
      <div className="crt-wrap">
        <CRTEffect
          enabled
          sweepDuration={10}
          sweepThickness={10}
          theme="custom"
          enableScanlines={false}
          enableSweep
          enableGlow
          glowColor="#201a1a"
          enableEdgeGlow
          edgeGlowColor="rgba(220, 224, 223, 0.3)"
          edgeGlowSize={28}
          enableFlicker={false}
          enableFilter={false}
        >
          <HubHeader noise={noise} onNoiseChange={changeNoise} />
          <main className="site-content">{children}</main>
          <Footer />
        </CRTEffect>
      </div>
      <NowPlaying />
    </div>
    </BasketProvider>
    </AudioProvider>
  )
}

