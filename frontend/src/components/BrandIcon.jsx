export function BrandIcon({ className = "", size = 38 }) {
  return (
    <img
      src="/favicon.svg"
      className={className}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      style={{
        display: "block",
        objectFit: "cover",
      }}
    />
  );
}
