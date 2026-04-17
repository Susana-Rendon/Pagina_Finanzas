const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const languageSelect = document.getElementById('language-select');
const authToast = document.getElementById('auth-toast');
const isLoginPage = window.location.pathname.includes('login');

const translations = {
  es: {
    appTitle: 'Mis Finanzas',
    appTagline: 'EL LIBRO ETÉREO',
    login_title: 'Iniciar sesión',
    register_title: 'Registrar cuenta',
    label_name: 'Nombre',
    label_email: 'Correo',
    label_password: 'Contraseña',
    login_button: 'Entrar',
    register_button: 'Registrarse',
    dont_have_account: '¿No tienes cuenta?',
    create_account: 'Crear cuenta',
    already_have_account: '¿Ya tienes cuenta?',
    back_to_login: 'Volver al login',
    auth_required: 'Debes iniciar sesión para continuar.',
    fill_required: 'Por favor completa todos los campos requeridos.',
    invalid_credentials: 'Credenciales inválidas.',
    register_success: 'Cuenta creada. Redirigiendo...',
    login_success: 'Inicio de sesión exitoso. Redirigiendo...'
  },
  en: {
    appTitle: 'My Finances',
    appTagline: 'THE ETHEREAL LEDGER',
    login_title: 'Sign In',
    register_title: 'Create Account',
    label_name: 'Name',
    label_email: 'Email',
    label_password: 'Password',
    login_button: 'Sign In',
    register_button: 'Register',
    dont_have_account: 'Don’t have an account?',
    create_account: 'Create account',
    already_have_account: 'Already have an account?',
    back_to_login: 'Back to login',
    auth_required: 'You must sign in to continue.',
    fill_required: 'Please complete all required fields.',
    invalid_credentials: 'Invalid credentials.',
    register_success: 'Account created. Redirecting...',
    login_success: 'Signed in successfully. Redirecting...'
  }
};

let currentLang = localStorage.getItem('lang') || 'es';

function t(key) {
  return translations[currentLang][key] || translations.es[key] || key;
}

function showToast(message) {
  authToast.textContent = message;
  authToast.classList.add('visible');
  setTimeout(() => authToast.classList.remove('visible'), 3000);
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (key) {
      element.textContent = t(key);
    }
  });
  document.title = t(isLoginPage ? 'login_title' : 'register_title');
  if (languageSelect) {
    languageSelect.value = currentLang;
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
}

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new Error(body?.error || t('invalid_credentials'));
  }
  return body;
}

async function checkSession() {
  try {
    const session = await apiFetch('/api/session');
    if (session && session.authenticated) {
      window.location.href = '/';
    }
  } catch (err) {
    // stay on auth page
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  const payload = {
    email: formData.get('email').trim(),
    password: formData.get('password').trim()
  };
  if (!payload.email || !payload.password || (!isLoginPage && !formData.get('name').trim())) {
    showToast(t('fill_required'));
    return;
  }
  if (!isLoginPage) {
    payload.name = formData.get('name').trim();
  }

  try {
    const endpoint = isLoginPage ? '/api/login' : '/api/register';
    await apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showToast(isLoginPage ? t('login_success') : t('register_success'));
    setTimeout(() => { window.location.href = '/'; }, 800);
  } catch (err) {
    showToast(err.message || t('invalid_credentials'));
  }
});

if (languageSelect) {
  languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
}

window.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  checkSession();
});
