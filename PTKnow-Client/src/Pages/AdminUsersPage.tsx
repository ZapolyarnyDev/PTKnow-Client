import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { usersApi } from '../api';
import type { AdminUserDTO } from '../types/user';
import styles from '../styles/pages/AdminUsersPage.module.css';

const ROLE_OPTIONS = ['GUEST', 'STUDENT', 'TEACHER', 'ADMIN'] as const;

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const sortedUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }
    return [...users].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [users]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = useCallback(
    async (user: AdminUserDTO, nextRole: string) => {
      if (user.role === nextRole) {
        return;
      }

      setSavingIds(prev => new Set(prev).add(user.id));
      setError(null);

      try {
        const updated = await usersApi.updateUserRole(user.id, {
          role: nextRole,
        });
        setUsers(prev =>
          prev.map(item => (item.id === updated.id ? updated : item))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка обновления роли';
        setError(message);
        setUsers(prev =>
          prev.map(item =>
            item.id === user.id ? { ...item, role: user.role } : item
          )
        );
      } finally {
        setSavingIds(prev => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
      }
    },
    []
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Управление пользователями</h1>
              <p className={styles.subtitle}>Меняйте роли пользователей.</p>
            </div>
            <button className={styles.refreshButton} onClick={fetchUsers}>
              Обновить
            </button>
          </div>

          {loading && <div className={styles.stateMessage}>Загрузка...</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Пользователь</span>
              <span>Handle</span>
              <span>Email</span>
              <span>Роль</span>
            </div>

            {sortedUsers.map(user => (
              <div key={user.id} className={styles.tableRow}>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.fullName}</div>
                  <div className={styles.userMeta}>ID: {user.id}</div>
                </div>
                <div className={styles.cellMuted}>{user.profileHandle}</div>
                <div className={styles.cellMuted}>{user.email}</div>
                <div>
                  <select
                    className={styles.roleSelect}
                    value={user.role}
                    onChange={event =>
                      handleRoleChange(user, event.target.value)
                    }
                    disabled={savingIds.has(user.id)}
                  >
                    {ROLE_OPTIONS.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {savingIds.has(user.id) && (
                    <span className={styles.savingHint}>Сохранение...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminUsersPage;
