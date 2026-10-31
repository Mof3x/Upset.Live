import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HubIcon from "./HubIcon";
import { GoLink } from "./HubParts";

// How many quick shuffles a roll shows before it settles, and how fast.
const SHUFFLES = 8;
const SHUFFLE_MS = 70;

function randomIndex(length, avoid) {
  if (length < 2) return 0;
  let next = avoid;
  while (next === avoid) next = Math.floor(Math.random() * length);
  return next;
}

// "Can't decide?": roll for something random from the archive (works, texts, journal, artists, shop).
export default function Dice({ pool }) {
  const [index, setIndex] = useState(null);
  const [rolling, setRolling] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearInterval(timer.current), []);

  if (!pool.length) return null;
  const pick = index === null ? null : pool[index % pool.length];

  function roll() {
    if (rolling) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIndex((value) => randomIndex(pool.length, value));
      return;
    }
    setRolling(true);
    let left = SHUFFLES;
    timer.current = window.setInterval(() => {
      setIndex((value) => randomIndex(pool.length, value));
      left -= 1;
      if (left <= 0) {
        window.clearInterval(timer.current);
        setRolling(false);
      }
    }, SHUFFLE_MS);
  }

  return (
    <section className="hub-dice" aria-label="Something at random">
      <button type="button" className="hub-dice__button" onClick={roll} aria-busy={rolling}>
        <HubIcon name="dice" className={rolling ? "is-rolling" : ""} />
        {pick ? "Roll again" : "Roll the dice"}
      </button>

      <div className="hub-dice__result" aria-live="polite">
        {pick ? (
          <>
            <span className="hub-dice__kind">{pick.kind}</span>
            <Link to={pick.to} className="hub-dice__title">
              {pick.title}
            </Link>
            {!rolling && <GoLink to={pick.to} />}
          </>
        ) : (
          <span className="hub-dice__prompt">Can&rsquo;t decide? Let the haus pick something for you.</span>
        )}
      </div>
    </section>
  );
}
