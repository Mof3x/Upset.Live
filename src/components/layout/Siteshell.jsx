import Noise from "../atmosphere/Noise";
import CRTEffect from "vault66-crt-effect";
import "vault66-crt-effect/dist/vault66-crt-effect.css";
import Navbar from "./Navbar";
import "../../index.css";

export default function SiteShell({ children }) {
  return (
    <div className="site-shell">
      <div className="noise-layer">
      <Noise
        patternSize={900}
        patternScaleX={2}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={400}
        />
      </div>
      <div className="crt-wrap">
        <CRTEffect
          enabled
          sweepDuration={10}
          sweepThickness={10}
          scanlineOpacity={0.3}
          theme="custom"
          scanlineColor="#dfffeb"
          enableScanlines
          enableSweep
          enableGlow
          glowColor="#201a1a"
          enableEdgeGlow
          edgeGlowColor="rgba(220, 224, 223, 0.9)"
          edgeGlowSize={60}
          enableFlicker={false}
          enableFilter={false}
        >
          <Navbar />
          <main className="site-content">{children}</main>
        </CRTEffect>
      </div>
    </div>
  )
}

