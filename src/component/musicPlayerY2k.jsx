import { useState, useRef } from "react";

export default function Y2KDevicePlayer() {
  const audioRef = useRef(null);
  const [index, setIndex] = useState(0);

  const playlist = [
    { title: "Track 1", src: "/music/track1.mp3" },
    { title: "Track 2", src: "/music/track2.mp3" },
    { title: "Track 3", src: "/music/track3.mp3" }
  ];

  const play = () => audioRef.current.play();
  const pause = () => audioRef.current.pause();
  const next = () => setIndex((i) => (i + 1) % playlist.length);
  const prev = () => setIndex((i) => (i - 1 + playlist.length) % playlist.length);

  return (
    <div className="y2k-device">
      <div className="device-screen">
        <p>{playlist[index].title}</p>
      </div>

      <audio ref={audioRef} src={playlist[index].src} />

      <div className="device-controls">
        <button onClick={prev}>⏮</button>
        <button onClick={play}>▶️</button>
        <button onClick={pause}>⏸</button>
        <button onClick={next}>⏭</button>
      </div>
    </div>
  );
}
