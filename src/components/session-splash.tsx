import { LogoMark } from './logo';
import styles from './session-splash.module.scss';

// Shown while the stored session is restored, so a private screen never flashes the login.
export function SessionSplash() {
  return (
    <div className={styles.splash} role="status">
      <span className={styles.pulse}>
        <LogoMark size={72} />
      </span>
      <span className={styles.label}>Carregando…</span>
    </div>
  );
}
