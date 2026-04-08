import { useCallback, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import ProfileIcon from '../assets/icons/profile.svg';
import Logotype from '../assets/logo/Logotype.svg';
import { useAuth } from '../hooks/useAuth';
import RequiredAuth from '../routes/RequiredAuth';
import RequiredRole from '../routes/RequiredRole';
import styles from '../styles/components/Header.module.css';
import { formatShortName } from '../utils/formatName';
import { getFileUrl } from '../utils/fileUtils';

const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  COURSES: '/courses',
  MY_COURSES: '/my-courses',
  EVENTS: '/events',
  PROJECTS: '/projects',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;

interface NavItem {
  to: string;
  label: string;
  authOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.COURSES, label: 'Все курсы' },
  { to: ROUTES.MY_COURSES, label: 'Мои курсы', authOnly: true },
  { to: ROUTES.EVENTS, label: 'Мероприятия' },
  { to: ROUTES.PROJECTS, label: 'Проекты' },
];

const Header: React.FC = () => {
  const location = useLocation();
  const isAuthPage = useMemo(() => location.pathname === '/auth', [location.pathname]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const isAuthenticated = Boolean(user);
  const displayName = useMemo(
    () => (user ? formatShortName(user.fullName) : ''),
    [user]
  );
  const avatarUrl = useMemo(
    () => (user?.avatarUrl ? getFileUrl(user.avatarUrl) : null),
    [user]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setIsMobileMenuOpen(false);
    window.location.href = '/home';
  }, [logout]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleNavLinkClick = useCallback(() => {
    closeMobileMenu();
  }, [closeMobileMenu]);

  const renderDesktopNavItem = (item: NavItem) => {
    const content = (
      <li key={item.label}>
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          {item.label}
        </NavLink>
      </li>
    );

    if (item.authOnly) {
      return (
        <RequiredAuth key={item.label} redirectTo={null}>
          {content}
        </RequiredAuth>
      );
    }

    return content;
  };

  const renderMobileNavItem = (item: NavItem) => {
    const content = (
      <li key={item.label} className={styles.mobileNavItem}>
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
          }
          onClick={handleNavLinkClick}
        >
          {item.label}
        </NavLink>
      </li>
    );

    if (item.authOnly) {
      return (
        <RequiredAuth key={item.label} redirectTo={null}>
          {content}
        </RequiredAuth>
      );
    }

    return content;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerLogo}>
          <NavLink to="/home" onClick={closeMobileMenu}>
            <img src={Logotype} alt="Логотип" />
          </NavLink>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map(renderDesktopNavItem)}
            <RequiredRole roles="ADMIN" redirectTo={null}>
              <li>
                <NavLink
                  to={ROUTES.ADMIN}
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                  }
                >
                  Админ
                </NavLink>
              </li>
            </RequiredRole>
          </ul>
        </nav>

        <div className={styles.authSection}>
          {isAuthenticated ? (
            <div className={styles.profileSection}>
              <Link to={ROUTES.PROFILE} className={styles.profileLink}>
                <div className={styles.userInfo}>
                  <img
                    src={avatarUrl || Logotype}
                    className={styles.userAvatar}
                    alt={displayName ? `Аватар ${displayName}` : 'Аватар пользователя'}
                  />
                </div>
                <div>
                  {displayName && <p className={styles.userName}>{displayName}</p>}
                  {user?.handle && <p className={styles.handleName}>{user.handle}</p>}
                </div>
                <img src={ProfileIcon} alt="" />
              </Link>
            </div>
          ) : (
            !isAuthPage && (
              <Link to={ROUTES.AUTH} className={styles.loginButton}>
                Войти
              </Link>
            )
          )}
        </div>

        <button
          className={`${styles.burgerButton} ${isMobileMenuOpen ? styles.active : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Открыть меню"
        >
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        <ul className={styles.mobileNavList}>
          {NAV_ITEMS.map(renderMobileNavItem)}
          <RequiredRole roles="ADMIN" redirectTo={null}>
            <li className={styles.mobileNavItem}>
              <NavLink
                to={ROUTES.ADMIN}
                className={({ isActive }) =>
                  isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
                }
                onClick={handleNavLinkClick}
              >
                Админ
              </NavLink>
            </li>
          </RequiredRole>
        </ul>

        <div className={styles.mobileAuthSection}>
          {isAuthenticated ? (
            <div className={styles.mobileProfileSection}>
              <Link
                to={ROUTES.PROFILE}
                className={styles.mobileNavLink}
                onClick={handleNavLinkClick}
              >
                Профиль
              </Link>
              <button
                onClick={handleLogout}
                className={styles.mobileNavLink}
                style={{ background: 'none', border: 'none', textAlign: 'left' }}
              >
                Выйти
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <Link
                to={ROUTES.AUTH}
                className={styles.mobileLoginButton}
                onClick={handleNavLinkClick}
              >
                Войти
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
