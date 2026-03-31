import styles from '../../../styles/components/FormAlert.module.css';

interface FormAlertProps {
  message: string;
  variant?: 'error' | 'success';
}

export const FormAlert: React.FC<FormAlertProps> = ({
  message,
  variant = 'error',
}) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className={
        variant === 'success' ? styles.alertSuccess : styles.alertError
      }
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div className={styles.alertTitle}>
        {variant === 'success' ? 'Готово' : 'Ошибка'}
      </div>
      <div className={styles.alertMessage}>{message}</div>
    </div>
  );
};
