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
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [showDetails, setShowDetails] = useState(initialMode === 'register');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  const { login, register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    const nextMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    setMode(nextMode);
    setShowDetails(nextMode === 'register');
  }, [searchParams]);

  const pageTitle = useMemo(
    () => (mode === 'register' ? 'Регистрация' : 'С возвращением'),
    [mode]
  );

  const syncMode = useCallback(
    (nextMode: AuthMode, expanded: boolean) => {
      setMode(nextMode);
      setShowDetails(expanded);
      setPassword('');
      setRecaptchaError(null);
      setFormError(null);
      setIsPasswordVisible(false);

      if (nextMode === 'register') {
        setSearchParams({ mode: 'register' }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams]
  );

  const openRegister = useCallback(() => {
    syncMode('register', true);
  }, [syncMode]);

  const openLoginPassword = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!email.trim()) {
        setFormError('Введите адрес электронной почты.');
        return;
      }
      setFormError(null);
      syncMode('login', true);
    },
    [email, syncMode]
  );

  const collapseToEmail = useCallback(() => {
    syncMode('login', false);
    setFirstName('');
    setLastName('');
    setMiddleName('');
  }, [syncMode]);

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

      const success = await login({ email, password, recaptchaToken });
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
        firstName,
        lastName,
        middleName: middleName || undefined,
        email,
        password,
        recaptchaToken,
      });

      if (success) {
        navigate('/profile');
      }
    },
    [email, executeRecaptcha, firstName, lastName, middleName, navigate, password, register]
  );

  const handleSubmit = mode === 'register'
    ? handleRegister
    : showDetails
      ? handleLogin
      : openLoginPassword;

  const visibleError = formError || recaptchaError || error;

  return (
    <>
      <Header />
      <div className={style.container}>
        <form onSubmit={handleSubmit} className={style.formAuth}>
          <legend className={style.legendAuth}>{pageTitle}</legend>

          <AuthInput
            type="email"
            placeholder="Адрес электронной почты"
            value={email}
            className={style.emailAuth}
            onChange={event => setEmail(event.target.value)}
            required
          />

          {mode === 'register' && (
            <>
              <AuthInput
                type="text"
                placeholder="Имя"
                value={firstName}
                className={style.emailAuth}
                onChange={event => setFirstName(event.target.value)}
                required
              />
              <AuthInput
                type="text"
                placeholder="Фамилия"
                value={lastName}
                className={style.emailAuth}
                onChange={event => setLastName(event.target.value)}
                required
              />
              <AuthInput
                type="text"
                placeholder="Отчество"
                value={middleName}
                className={style.emailAuth}
                onChange={event => setMiddleName(event.target.value)}
              />
            </>
          )}

          {(showDetails || mode === 'register') && (
            <div className={style.passwordField}>
              <AuthInput
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                className={style.emailAuth}
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
              <button
                type="button"
                onClick={collapseToEmail}
                className={style.backButton}
                aria-label="Назад"
              >
                ←
              </button>
            </div>
          )}

          {mode === 'register' && (
            <p className={style.recaptchaHint}>
              Форма защищена reCAPTCHA v3. Проверка выполняется автоматически.
            </p>
          )}

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
              {mode === 'register'
                ? 'Зарегистрироваться'
                : showDetails
                  ? 'Войти'
                  : 'Продолжить'}
            </AuthButton>

            {!showDetails && mode === 'login' && (
              <>
                <p className={style.registerText}>У вас нет учетной записи?</p>
                <button
                  type="button"
                  className={style.registerButton}
                  onClick={openRegister}
                >
                  Зарегистрироваться
                </button>
              </>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AuthPage;
