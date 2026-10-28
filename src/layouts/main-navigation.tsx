import { NavLink } from 'react-router';
import { MAIN_NAVIGATION } from './navigation.constants';

// Rendered as the desktop sidebar and as the mobile bottom nav; CSS shows one per breakpoint.
export function MainNavigation({ variant }: { variant: 'sidebar' | 'bottom' }) {
  return (
    <nav aria-label="Menu principal" data-variant={variant}>
      <ul>
        {MAIN_NAVIGATION.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
