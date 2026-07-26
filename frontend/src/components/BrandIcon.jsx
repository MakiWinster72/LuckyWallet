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
        borderRadius: "11px 11px 11px 3px",
        boxShadow: "0 2px 8px rgb(0 0 0 / 15%)",
        objectFit: "cover",
      }}
    />
  );
}
