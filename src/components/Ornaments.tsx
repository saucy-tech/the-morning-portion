interface SizedProps {
  size?: number;
  color?: string;
  className?: string;
}

interface BoxedProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sun({ size = 120, color = 'currentColor', className }: SizedProps) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const x1 = 60 + Math.cos(angle) * 32;
    const y1 = 60 + Math.sin(angle) * 32;
    const x2 = 60 + Math.cos(angle) * (i % 2 ? 44 : 50);
    const y2 = 60 + Math.sin(angle) * (i % 2 ? 44 : 50);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="22" />
      <g opacity="0.9">{rays}</g>
    </svg>
  );
}

export function Hills({ width = 480, height = 140, color = 'currentColor', className }: BoxedProps) {
  return (
    <svg
      viewBox="0 0 480 140"
      width={width}
      height={height}
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M0 110 C 60 70, 110 70, 160 100 S 250 130, 300 90 S 400 60, 480 100" />
      <path
        d="M0 130 C 80 100, 140 100, 200 120 S 320 140, 380 110 S 460 90, 480 120"
        opacity="0.6"
      />
      <circle cx="380" cy="42" r="14" />
    </svg>
  );
}

export function Arc({ width = 200, height = 200, color = 'currentColor', className }: BoxedProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={width}
      height={height}
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M 20 180 A 80 80 0 0 1 180 180" />
      <path d="M 40 180 A 60 60 0 0 1 160 180" opacity="0.7" />
      <path d="M 60 180 A 40 40 0 0 1 140 180" opacity="0.5" />
      <path d="M 80 180 A 20 20 0 0 1 120 180" opacity="0.3" />
    </svg>
  );
}

export function Mark({ size = 24, color = 'currentColor' }: SizedProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M8 10 A8 8 0 0 1 24 10"
        stroke="var(--tdw-warm)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 13 H14 C15.3 13 16 14.1 16 16 C16 14.1 16.7 13 18 13 H28"
        stroke="var(--tdw-ink-mute)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 15 C 9 13.7, 13.5 13.7, 16 16 C 18.5 13.7, 23 13.7, 27 15 V 27 C 23 25.4, 18.5 25.4, 16 28 C 13.5 25.4, 9 25.4, 5 27 Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="16" y1="16" x2="16" y2="28" stroke={color} strokeWidth="1.4" />
      <path d="M10 19 C 12 18.5, 14 18.5, 15 19" stroke={color} strokeWidth="1" />
      <path d="M17 19 C 19 18.5, 21 18.5, 23 19" stroke={color} strokeWidth="1" />
    </svg>
  );
}

export function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 7h10M8 3l4 4-4 4" />
    </svg>
  );
}
