import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import Footer from '../Components/Footer.tsx';
import Header from '../Components/Header.tsx';
import { AuthButton } from '../Components/ui/forms/AuthButton.tsx';
import { AuthInput } from '../Components/ui/forms/AuthForm.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import style from '../styles/pages/AuthPage.module.css';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  const { login, register, isLoading, error } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();

  useEffect(() => {
    const nextMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    setMode(nextMode);
  }, [searchParams]);

  const switchMode = useCallback(
    (nextMode: AuthMode) => {
      setFormError(null);
      setRecaptchaError(null);
      setIsPasswordVisible(false);
      setMode(nextMode);

      if (nextMode === 'register') {
        setSearchParams({ mode: 'register' }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams]
  );

  const pageTitle = useMemo(
    () => (mode === 'register' ? 'Создание аккаунта' : 'Вход в аккаунт'),
    [mode]
  );

  const handleLogin = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (!email.trim() || !password) {
        setFormError('Введите почту и пароль.');
        return;
      }

      setFormError(null);
      setRecaptchaError(null);

      if (!executeRecaptcha) {
        setRecaptchaError('reCAPTCHA не готова. Попробуйте снова.');
        return;
      }

      const recaptchaToken = await executeRecaptcha('login');
      if (!recaptchaToken) {
        setRecaptchaError('Не удалось выполнить проверку reCAPTCHA.');
        return;
      }

      const success = await login({
        email: email.trim(),
        password,
        recaptchaToken,
      });

      if (success) {
        navigate('/profile');
      }
    },
    [email, executeRecaptcha, login, navigate, password]
  );

  const handleRegister = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
        setFormError('Все обязательные поля должны быть заполнены.');
        return;
      }

      if (!email.includes('@')) {
        setFormError('Введите корректный адрес электронной почты.');
        return;
      }

      if (password.length < 8) {
        setFormError('Пароль должен содержать минимум 8 символов.');
        return;
      }

      setFormError(null);
      setRecaptchaError(null);

      if (!executeRecaptcha) {
        setRecaptchaError('reCAPTCHA не готова. Попробуйте снова.');
        return;
      }

      const recaptchaToken = await executeRecaptcha('register');
      if (!recaptchaToken) {
        setRecaptchaError('Не удалось выполнить проверку reCAPTCHA.');
        return;
      }

      const success = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        email: email.trim(),
        password,
        recaptchaToken,
      });

      if (success) {
        navigate('/profile');
      }
    },
    [
      email,
      executeRecaptcha,
      firstName,
      lastName,
      middleName,
      navigate,
      password,
      register,
    ]
  );

  const visibleError = formError || recaptchaError || error;
  const isRegister = mode === 'register';

  return (
    <>
      <Header />
      <div className={style.container}>
        <form
          onSubmit={isRegister ? handleRegister : handleLogin}
          className={style.formAuth}
        >
          <div className={style.tabs} role="tablist" aria-label="Авторизация">
            <span
              className={`${style.tabIndicator} ${
                isRegister ? style.tabIndicatorRegister : ''
              }`}
              aria-hidden="true"
            />
            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              className={`${style.tab} ${!isRegister ? style.tabActive : ''}`}
              onClick={() => switchMode('login')}
            >
              Вход
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              className={`${style.tab} ${isRegister ? style.tabActive : ''}`}
              onClick={() => switchMode('register')}
            >
              Регистрация
            </button>
          </div>

          <legend className={style.legendAuth}>{pageTitle}</legend>

          <div
            className={`${style.formViewport} ${
              isRegister ? style.formViewportRegister : style.formViewportLogin
            }`}
          >
            <div className={style.fieldGroup}>
              <AuthInput
                type="email"
                placeholder="Адрес электронной почты"
                value={email}
                className={style.inputAuth}
                onChange={event => setEmail(event.target.value)}
                required
              />

              <div
                className={`${style.registerFields} ${
                  isRegister ? style.registerFieldsVisible : ''
                }`}
                aria-hidden={!isRegister}
              >
                <AuthInput
                  type="text"
                  placeholder="Имя"
                  value={firstName}
                  className={style.inputAuth}
                  onChange={event => setFirstName(event.target.value)}
                  required={isRegister}
                />
                <AuthInput
                  type="text"
                  placeholder="Фамилия"
                  value={lastName}
                  className={style.inputAuth}
                  onChange={event => setLastName(event.target.value)}
                  required={isRegister}
                />
                <AuthInput
                  type="text"
                  placeholder="Отчество"
                  value={middleName}
                  className={style.inputAuth}
                  onChange={event => setMiddleName(event.target.value)}
                />
              </div>

              <div className={style.passwordField}>
                <AuthInput
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="Пароль"
                  value={password}
                  className={style.inputAuth}
                  onChange={event => setPassword(event.target.value)}
                  required
                  minLength={8}
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
            </div>
          </div>

          {visibleError && (
            <div className={style.errorMessage} role="alert" aria-live="polite">
              <span className={style.errorIcon}>!</span>
              <span className={style.errorText}>{visibleError}</span>
            </div>
          )}

          <div className={style.buttonContainer}>
            <AuthButton
              type="submit"
              className={style.buttonAuth}
              isLoading={isLoading}
            >
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </AuthButton>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AuthPage;
