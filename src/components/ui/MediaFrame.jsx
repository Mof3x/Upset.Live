import "./MediaFrame.css";

export default function MediaFrame({
  children,
  ratio = "4 / 5",
  className = "",
  rounded = true,
}) {
  const classes = [
    "media-frame",
    rounded ? "media-frame--rounded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ "--media-ratio": ratio }}>
      {children}
    </div>
  );
}