export default function Spinner({
  size = 14,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${light ? "rgba(255,255,255,.4)" : "rgba(0,0,0,.15)"}`,
        borderTopColor: light ? "#fff" : "#2563eb",
        animation: "kk-spin .7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}
