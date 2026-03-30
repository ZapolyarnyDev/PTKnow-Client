import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styles from '../styles/pages/AdminPanelPage.module.css';

const AdminPanelPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.title}>Админ-панель</h1>
            <p className={styles.subtitle}>
              Управляйте пользователями и ключевыми настройками платформы.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <Link to="/admin/users" className={styles.card}>
            <div className={styles.cardTitle}>Пользователи</div>
            <div className={styles.cardText}>
              Смена ролей, доступов и статусов.
            </div>
          </Link>

          <div className={`${styles.card} ${styles.cardDisabled}`}>
            <div className={styles.cardTitle}>Курсы</div>
            <div className={styles.cardText}>
              Модерация курсов и контента (в разработке).
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardDisabled}`}>
            <div className={styles.cardTitle}>Отчеты</div>
            <div className={styles.cardText}>
              Метрики активности и экспорт (в разработке).
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPanelPage;
