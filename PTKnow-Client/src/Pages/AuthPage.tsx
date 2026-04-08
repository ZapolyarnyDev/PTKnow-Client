import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import Footer from '../Components/Footer.tsx';
import Header from '../Components/Header.tsx';
import { AuthButton } from '../Components/ui/forms/AuthButton.tsx';
import { AuthInput } from '../Components/ui/forms/AuthForm.tsx';
import { ErrorModal } from '../Components/ui/forms/ErrorModal.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import style from '../styles/pages/AuthPage.module.css';

type AuthMode = 'login' | 'register';

type AuthPageContentProps = {
  resolveRecaptchaToken: (
    action: 'login' | 'register'
  ) => Promise<string | undefined>;
};

const AuthPageContent: React.FC<AuthPageContentProps> = ({
  resolveRecaptchaToken,
}) => {
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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const { login, register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const nextMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    setMode(nextMode);
  }, [searchParams]);

  const visibleError = formError || recaptchaError || error;

  useEffect(() => {
    setIsErrorModalOpen(Boolean(visibleError));
  }, [visibleError]);

  const switchMode = useCallback(
    (nextMode: AuthMode) => {
      setFormError(null);
      setRecaptchaError(null);
      clearError();
      setIsPasswordVisible(false);
      setMode(nextMode);

      if (nextMode === 'register') {
        setSearchParams({ mode: 'register' }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [clearError, setSearchParams]
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

      try {
        const recaptchaToken = await resolveRecaptchaToken('login');
        const success = await login({
          email: email.trim(),
          password,
          recaptchaToken,
        });

        if (success) {
          navigate('/profile');
        }
      } catch (recaptchaFailure) {
        setRecaptchaError(
          recaptchaFailure instanceof Error
            ? recaptchaFailure.message
            : 'Не удалось выполнить проверку безопасности.'
        );
      }
    },
    [email, login, navigate, password, resolveRecaptchaToken]
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

      try {
        const recaptchaToken = await resolveRecaptchaToken('register');
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
      } catch (recaptchaFailure) {
        setRecaptchaError(
          recaptchaFailure instanceof Error
            ? recaptchaFailure.message
            : 'Не удалось выполнить проверку безопасности.'
        );
      }
    },
    [
      email,
      firstName,
      lastName,
      middleName,
      navigate,
      password,
      register,
      resolveRecaptchaToken,
    ]
  );

  const isRegister = mode === 'register';

  const handleCloseErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
    setFormError(null);
    setRecaptchaError(null);
    clearError();
  }, [clearError]);

  return (
    <>
      <Header />
      <ErrorModal
        title={isRegister ? 'Не удалось завершить регистрацию' : 'Не удалось выполнить вход'}
        message={visibleError}
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
      />
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

const AuthPageWithRecaptcha: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const resolveRecaptchaToken = useCallback(
    async (action: 'login' | 'register') => {
      if (!executeRecaptcha) {
        throw new Error(
          'Сервис проверки временно недоступен. Обновите страницу и попробуйте снова.'
        );
      }

      const token = await executeRecaptcha(action);
      if (!token) {
        throw new Error(
          'Не удалось выполнить проверку безопасности. Попробуйте еще раз.'
        );
      }

      return token;
    },
    [executeRecaptcha]
  );

  return <AuthPageContent resolveRecaptchaToken={resolveRecaptchaToken} />;
};

const AuthPageWithoutRecaptcha: React.FC = () => {
  const resolveRecaptchaToken = useCallback(async () => undefined, []);
  return <AuthPageContent resolveRecaptchaToken={resolveRecaptchaToken} />;
};

const AuthPage: React.FC = () => {
  const recaptchaEnabled = Boolean(import.meta.env.VITE_RECAPTCHA_SITE_KEY);
  return recaptchaEnabled ? <AuthPageWithRecaptcha /> : <AuthPageWithoutRecaptcha />;
};

export default AuthPage;
