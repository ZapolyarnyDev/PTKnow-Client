import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from './App.tsx';

import { setupAuthInterceptor } from './api';

setupAuthInterceptor();

const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {recaptchaKey ? (
      <GoogleReCaptchaProvider
        reCaptchaKey={recaptchaKey}
        scriptProps={{ async: true, defer: true, appendTo: 'head' }}
      >
        <App />
      </GoogleReCaptchaProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
