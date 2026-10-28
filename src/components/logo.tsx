import styles from './logo.module.scss';

const STAR =
  'M0 -8.5L2.116 -2.912L8.084 -2.627L3.424 1.112L4.996 6.877L0 3.6L-4.996 6.877L-3.424 1.112L-8.084 -2.627L-2.116 -2.912Z';

// The cinema ticket with the rating star, on a 64-unit grid. public/ icons are rendered from the same drawing.
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      className={styles.mark}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <rect className={styles.tile} width="64" height="64" rx="14" />
      <g transform="rotate(-12 32 32)">
        <rect
          className={styles.ticket}
          x="10"
          y="17"
          width="44"
          height="30"
          rx="4"
        />
        <circle className={styles.tile} cx="10" cy="32" r="4.5" />
        <circle className={styles.tile} cx="54" cy="32" r="4.5" />
        <path className={styles.perforation} d="M23 19.5V44.5" />
        <path
          className={styles.star}
          transform="translate(38.5 32.8)"
          d={STAR}
        />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <span className={styles.logo}>
      <LogoMark />
      <span className={styles.wordmark}>Movie Track</span>
    </span>
  );
}
