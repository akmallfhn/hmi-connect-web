export default function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-secondary/20 blur-2xl" />
      <div className="absolute -right-10 top-16 h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
      <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primary/15 blur-2xl" />
      <div className="absolute -bottom-10 left-12 h-32 w-32 rounded-full bg-secondary/15 blur-2xl" />

      <svg
        className="absolute left-6 top-6 h-16 w-16 text-primary/30 sm:left-10 sm:top-10"
        viewBox="0 0 60 60"
        fill="none"
      >
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={8 + col * 16}
              cy={8 + row * 16}
              r="2.5"
              fill="currentColor"
            />
          ))
        )}
      </svg>

      <svg
        className="absolute bottom-10 right-10 h-16 w-28 text-secondary/40 sm:bottom-16 sm:right-16"
        viewBox="0 0 120 60"
        fill="none"
      >
        <path
          d="M2 50C20 10 40 10 60 30C80 50 100 50 118 15"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
