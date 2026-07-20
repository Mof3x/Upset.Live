import GlowCanvas from "./components/atmosphere/glowcanvas"; 
import Noise from "./components/atmosphere/Noise";
import CRTEffect from "vault66-crt-effect";
import "vault66-crt-effect/dist/vault66-crt-effect.css";
import DitherCanvas from "./components/atmosphere/dithercanvas";
import Navbar from "./components/layout/Navbar";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
  <div className="crt-wrap">
    <div className="noise-layer">
      <Noise
        patternSize={900}
        patternScaleX={2}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={400}
        />
      </div>
        
      <div className="crt-clip">
        <CRTEffect
          enabled={true}
          sweepDuration={10}
          sweepThickness={10}
          scanlineOpacity={0.3}
          theme="custom"
          scanlineColor="#dfffeb"
          enableScanlines={true}
          enableSweep={true}
          enableGlow={true}
          glowColor="#201a1a"
          enableEdgeGlow={true}
          edgeGlowColor="rgba(220, 224, 223, 0.9)"
          edgeGlowSize={60}
          enableFlicker={false}
          enableFilter={false}
          >
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
          <article className="hero">
            <header>
              <h1>UpsetXociety</h1>
                <p>Art House</p>
              </header>
              <div className="hero-image">
              <GlowCanvas id="hero-canvas" src="/gor.jpeg" />
              </div>
          </article>
          <div className="page-content">
            <main className="HomePage">

            
              <quote className="quote-section">
                <p>"Blackness is lit, don't let anyboy tell you it's not, at the end of the day, we're all black - unless you're not, sucks to suck." - Silvia Wynter</p>
              </quote>

            <div className="bottom-grid">
              <section className="showcase-section">

                <article className="Featured">
                  <h2>Featured Work</h2>
                  <DitherCanvas id="featured-canvas" src="/gor.jpeg" />  
                  <div className="featured-info">                           
                    <h3>Title: Upset</h3>
                      <div className="art-info">
                      <div className="art-copy">
                        <p>Men and women of the Congo, Victorious independence fighters, I salute you in the name of the Congolese Government.</p>  
                        <p>I ask all of you, my friends, who tirelessly fought in our ranks, to mark this June 30, 1960, as an illustrious date that will be ever engraved in your hearts, a date whose meaning you will proudly explain to your children, so that they in turn might relate to their grandchildren and great-grandchildren the glorious history of our struggle for freedom.</p>  
                        <p>Although this independence of the Congo is being proclaimed today by agreement with Belgium, an amicable country, with which we are on equal terms, no Congolese will ever forget that independence was won in struggle, a persevering and inspired struggle carried on from day to day, a struggle, in which we were undaunted by privation or suffering and stinted neither strength nor blood.</p> 
                        <h3>Featured Artist: Upset</h3>
                          <p>It was filled with tears, fire and blood. We are deeply proud of our struggle, because it was just and noble and indispensable in putting an end to the humiliating bondage forced upon us.</p>  
                          <p>That was our lot for the eighty years of colonial rule and our wounds are too fresh and much too painful to be forgotten.</p>  
                          <p>We have experienced forced labour in exchange for pay that did not allow us to satisfy our hunger, to clothe ourselves, to have decent lodgings or to bring up our children as dearly loved ones.</p>  
                          <p>Morning, noon and night we were subjected to jeers, insults and blows because we were "Negroes". Who will ever forget that the black was addressed as "tu", not because he was a friend, but because the polite "vous" was reserved for the white man?</p>  
                          <p>We have seen our lands seized in the name of ostensibly just laws, which gave recognition only to the right of might.</p>  
                      </div>
                      <a href="/full-article" class="read-more">...read more</a>
                    </div>
                      <GlowCanvas id="featured-artist" src="/gor.jpeg" />
                  </div>
                </article>

                <article className="related-works">
                <h2>Related Works</h2>
                <div className="related-works-grid">
                  <GlowCanvas className="related-work" src="/gor.jpeg" />
                  <GlowCanvas className="related-work" src="/gor.jpeg" />
                  <GlowCanvas className="related-work" src="/gor.jpeg" />
                  <GlowCanvas className="related-work" src="/gor.jpeg" />
                </div>
                </article>

                <article className="newsletter-form">
                <h2>Stay connected</h2>
                <form>
                    <input id="email" autoComplete="email" type="email" placeholder="Enter your email" />
                    <button type="submit">Subscribe</button>
                </form>
                </article>

                </section>
            </div>
          </main>
        </div>
        </CRTEffect>
      </div>
    </div>
  );
}