import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';

import { formatShortName } from '../utils/formatName';

import styles from '../styles/components/Header.module.css';
import Logotype from '../assets/logo/Logotype.svg';
import Profile from '../assets/icons/profile.svg';
import { useAuth } from '../hooks/useAuth';
import { getFileUrl } from '../utils/fileUtils';
import { normalizeRole } from '../utils/roleUtils';

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
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.COURSES, label: 'Все курсы' },
  { to: ROUTES.MY_COURSES, label: 'Мои курсы' },
  { to: ROUTES.EVENTS, label: 'Мероприятия' },
  { to: ROUTES.PROJECTS, label: 'Проекты' },
];

const Header: React.FC = () => {
  const location = useLocation();
  const isAuthPage = useMemo(
    () => location.pathname === '/auth',
    [location.pathname]
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const isAuthenticated = useMemo(() => !!user, [user]);
  const displayName = useMemo(
    () => (user ? formatShortName(user.fullName) : ''),
    [user]
  );
  const avatarUrl = useMemo(
    () => (user?.avatarUrl ? getFileUrl(user.avatarUrl) : null),
    [user]
  );
  const isAdmin = useMemo(
    () => normalizeRole(user?.role) === 'ADMIN',
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

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerLogo}>
            <NavLink to="/home" onClick={closeMobileMenu}>
              <img src={Logotype} alt="Логотип" />
            </NavLink>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {NAV_ITEMS.map(item => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.navLink} ${styles.active}`
                        : styles.navLink
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <NavLink
                    to={ROUTES.ADMIN}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.navLink} ${styles.active}`
                        : styles.navLink
                    }
                  >
                    Админ
                  </NavLink>
                </li>
              )}
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
                      alt={
                        displayName
                          ? `Аватар ${displayName}`
                          : 'Аватар пользователя'
                      }
                    />
                  </div>
                  <div>
                    {displayName && (
                      <p className={styles.userName}>{displayName}</p>
                    )}
                    {user?.handle && (
                      <p className={styles.handleName}>{user.handle}</p>
                    )}
                  </div>
                  <img src={Profile} alt="" />
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
            className={`${styles.burgerButton} ${
              isMobileMenuOpen ? styles.active : ''
            }`}
            onClick={toggleMobileMenu}
            aria-label="Открыть меню"
          >
            <span className={styles.burgerLine}></span>
            <span className={styles.burgerLine}></span>
            <span className={styles.burgerLine}></span>
          </button>
        </div>

        <div
          className={`${styles.mobileMenu} ${
            isMobileMenuOpen ? styles.active : ''
          }`}
        >
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map(item => (
              <li key={item.label} className={styles.mobileNavItem}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.mobileNavLink} ${styles.active}`
                      : styles.mobileNavLink
                  }
                  onClick={handleNavLinkClick}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            {isAdmin && (
              <li className={styles.mobileNavItem}>
                <NavLink
                  to={ROUTES.ADMIN}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.mobileNavLink} ${styles.active}`
                      : styles.mobileNavLink
                  }
                  onClick={handleNavLinkClick}
                >
                  Админ
                </NavLink>
              </li>
            )}
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
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                  }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <Link
                  to="/auth"
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
    </>
  );
};

export default Header;
