import { useCallback, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { AuthButton } from '../Components/ui/forms/AuthButton';
import { AuthInput } from '../Components/ui/forms/AuthForm';
import style from '../styles/pages/RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      if (formError) {
        setFormError(null);
      }
    },
    [formError]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password
      ) {
        setFormError('Все поля обязательны для заполнения.');
        return;
      }

      if (formData.password.length < 12) {
        setFormError('Пароль должен содержать минимум 12 символов.');
        return;
      }

      if (!formData.email.includes('@')) {
        setFormError('Введите корректный адрес электронной почты.');
        return;
      }

      setFormError(null);

      const success = await register(formData);
      if (success) {
        navigate('/profile');
      }
    },
    [register, navigate, formData]
  );

  return (
    <>
      <Header />
      <div className={style.container}>
        <form onSubmit={handleSubmit} className={style.formRegister}>
          <legend className={style.legendRegister}>Регистрация</legend>

          <AuthInput
            type="text"
            name="firstName"
            placeholder="Имя"
            className={style.inputRegister}
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />

          <AuthInput
            type="text"
            name="lastName"
            placeholder="Фамилия"
            className={style.inputRegister}
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />

          <AuthInput
            type="text"
            name="middleName"
            placeholder="Отчество"
            className={style.inputRegister}
            value={formData.middleName}
            onChange={handleInputChange}
          />

          <AuthInput
            type="email"
            name="email"
            placeholder="Адрес электронной почты"
            className={style.inputRegister}
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <div className={style.passwordField}>
            <AuthInput
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Пароль"
              className={style.inputRegister}
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
            <button
              type="button"
              className={style.passwordToggle}
              onClick={() => setIsPasswordVisible(prev => !prev)}
              aria-label={
                isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'
              }
            >
              {isPasswordVisible ? 'Скрыть' : 'Показать'}
            </button>
          </div>

          {(formError || error) && (
            <div className={style.errorMessage} role="alert" aria-live="polite">
              <span className={style.errorIcon}>!</span>
              <span className={style.errorText}>{formError || error}</span>
            </div>
          )}

          <div className={style.buttonContainer}>
            <AuthButton
              type="submit"
              isLoading={isLoading}
              className={style.buttonRegister}
            >
              Зарегистрироваться
            </AuthButton>

            <p className={style.loginText}>Есть учетная запись?</p>
            <Link to="/auth" className={style.loginLink}>
              Войти
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default RegisterPage;
