import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styles from '../styles/pages/UnderConstructionPage.module.css';

const UnderConstructionPage: React.FC = () => {
  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.card}>
          <p className={styles.kicker}>В разработке</p>
          <h1 className={styles.title}>Раздел еще готовится</h1>
          <p className={styles.subtitle}>
            Мы уже работаем над этим экраном. Скоро он будет доступен.
          </p>
          <Link to="/home" className={styles.backLink}>
            Вернуться на главную
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UnderConstructionPage;
