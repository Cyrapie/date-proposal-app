type HeartProps = {
  className?: string;
  /** `currentColor` par défaut : la couleur suit le texte parent. */
  fill?: string;
};

export function Heart({ className, fill = 'currentColor' }: HeartProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 21s-7.5-4.7-9.6-9.2C.7 8.3 2.4 4.6 5.9 3.7c2-.5 4.1.3 5.3 2 .3.4.3.4.6 0 1.2-1.7 3.3-2.5 5.3-2 3.5.9 5.2 4.6 3.5 8.1C19.5 16.3 12 21 12 21z" />
    </svg>
  );
}
