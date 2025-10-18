export default function Spinner({ size = 5 }: { size?: number }) {
  const dim = `${size}rem`;
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: dim, height: dim }}
      aria-hidden="true"
    >
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={size * 16}
        height={size * 16}
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );
}
