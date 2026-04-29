const sections = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('.nav-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const openTransactionModalBtn = document.getElementById('open-transaction-modal');
const transactionModal = document.getElementById('transaction-modal');
const addSalaryBtn = document.getElementById('add-salary-btn');
const openFixedExpenseModalBtn = document.getElementById('open-fixed-expense-modal');
const fixedExpenseModal = document.getElementById('fixed-expense-modal');
const openSubscriptionModalBtn = document.getElementById('open-subscription-modal');
const subscriptionModal = document.getElementById('subscription-modal');
const openGoalModalBtn = document.getElementById('open-goal-modal');
const addGoalBtn = document.getElementById('add-goal-btn');
const calendarAddBillBtn = document.getElementById('calendar-add-bill');
const calendarAddIncomeBtn = document.getElementById('calendar-add-income');
const goalModal = document.getElementById('goal-modal');
const closeTransactionBtn = document.getElementById('close-transaction-modal');
const closeFixedExpenseBtn = document.getElementById('close-fixed-expense-modal');
const closeSubscriptionBtn = document.getElementById('close-subscription-modal');
const closeGoalBtn = document.getElementById('close-goal-modal');
const cancelTransactionBtn = document.getElementById('cancel-transaction');
const cancelFixedExpenseBtn = document.getElementById('cancel-fixed-expense');
const cancelSubscriptionBtn = document.getElementById('cancel-subscription');
const cancelGoalBtn = document.getElementById('cancel-goal');
const transactionForm = document.getElementById('transaction-form');
const fixedExpenseForm = document.getElementById('fixed-expense-form');
const subscriptionForm = document.getElementById('subscription-form');
const goalForm = document.getElementById('goal-form');
const toast = document.getElementById('toast');
const exportBtn = document.getElementById('export-btn');
const calendarMonthLabel = document.getElementById('calendar-month-label');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const languageSelect = document.getElementById('language-select');
const logoutBtn = document.getElementById('logout-btn');
const userGreeting = document.getElementById('user-greeting');
const avatar = document.getElementById('avatar');
const toggleBalanceBtn = document.getElementById('toggle-balance-btn');
const transactionTypeSelect = document.getElementById('transaction-type-select');
const savingsGoalField = document.getElementById('savings-goal-field');
const savingsGoalSelect = document.getElementById('savings-goal-select');

const dashboardBalance = document.getElementById('dashboard-balance');
const dashboardIncome = document.getElementById('dashboard-income');
const dashboardExpenses = document.getElementById('dashboard-expenses');
const dashboardSavings = document.getElementById('dashboard-savings');
const transactionsTable = document.getElementById('transactions-table');
const transactionsSummary = document.getElementById('transactions-summary');
const goalsList = document.getElementById('goals-list');
const calendarGrid = document.getElementById('calendar-grid');
const calendarSelectedDate = document.getElementById('calendar-selected-date');
const calendarDetails = document.getElementById('calendar-details');
const reportExpenses = document.getElementById('report-expenses');
const reportComparison = document.getElementById('report-comparison');
const reportNetflow = document.getElementById('report-netflow');
const dashboardFixed = document.getElementById('dashboard-fixed');
const dashboardSubscriptions = document.getElementById('dashboard-subscriptions');
const dashboardAvailable = document.getElementById('dashboard-available');
const dashboardGoalMessage = document.getElementById('dashboard-goal-message');
const remindersList = document.getElementById('reminders-list');
const fixedExpensesList = document.getElementById('fixed-expenses-list');
const subscriptionsList = document.getElementById('subscriptions-list');
const notificationsBtn = document.getElementById('notifications-btn');
const notificationsDropdown = document.getElementById('notifications-dropdown');
const notificationsBadge = document.getElementById('notification-badge');
const notificationsContent = document.getElementById('notifications-content');
const closeNotificationsBtn = document.getElementById('close-notifications');
const settingsBtn = document.querySelector('[aria-label="settings"]');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-modal');
const changePasswordModal = document.getElementById('change-password-modal');
const closeChangePasswordBtn = document.getElementById('close-change-password-modal');
const changePasswordForm = document.getElementById('change-password-form');
const settingsNameInput = document.getElementById('settings-name');
const settingsEmailInput = document.getElementById('settings-email');
const updateProfileBtn = document.getElementById('update-profile-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const exportDataBtn = document.getElementById('export-data-btn');
const notificationsEnabledCheckbox = document.getElementById('notifications-enabled');
const darkModeToggle = document.getElementById('dark-mode-toggle');

const translations = {
  es: {
    appTitle: 'Mis Finanzas',
    appTagline: 'THE ETHEREAL LEDGER',
    nav_dashboard: 'Dashboard',
    nav_transactions: 'Transacciones',
    nav_goals: 'Metas de Ahorro',
    nav_calendar: 'Calendario',
    nav_reports: 'Informes',
    add_transaction: 'Agregar transacción',
    help: 'Ayuda',
    sign_out: 'Cerrar sesión',
    welcome_dashboard: 'Bienvenida',
    dashboard_subtitle: 'Tu jardín financiero florece exquisitamente este mes. Revisemos tu progreso.',
    total_balance: 'Saldo total',
    monthly_income: 'Ingresos mensuales',
    monthly_expenses: 'Gastos mensuales',
    savings_goal: 'Objetivo de ahorro',
    financial_trends: 'Tendencias financieras',
    expense_distribution: 'Distribución de gastos',
    optimize_subscriptions_title: 'Optimizando suscripciones',
    optimize_subscriptions_text: 'Hemos identificado $42/mes en servicios de streaming no usados. Cancelarlos puede añadir $504 a tu meta "Villa en Provenza" este año.',
    budget_alert_title: 'Alerta de presupuesto: Entretenimiento',
    budget_alert_text: 'Has alcanzado el 85% de tu presupuesto de entretenimiento para junio. Quedan 10 días — considera una noche acogedora en casa.',
    track_cashflow: 'Controla tu flujo de caja.',
    filter_all: 'TODAS',
    filter_income: 'INGRESOS',
    filter_expense: 'GASTOS',
    filter_saving: 'AHORROS',
    total_outflow: 'Gasto total este mes',
    transactions_summary_note: '12% menos que el mes anterior',
    savings_goals_title: 'Cuidando tu futuro.',
    savings_goals_subtitle: 'Tu riqueza es un jardín. Continúa cuidando tus metas con paciencia e intención.',
    create_new_goal: 'Crear nueva meta',
    cultivate_ritual: 'Cultiva tu ritual mensual.',
    month: 'Mes',
    week: 'Semana',
    day_of_week: 'Lunes',
    selected: 'Seleccionado',
    add_bill: 'Agregar pago',
    add_income: 'Agregar ingreso',
    upcoming_rituals: 'Rituales próximos',
    monthly_financial_health: 'Salud financiera mensual.',
    export_to_excel: 'Exportar a Excel',
    total_expenses: 'Gastos totales',
    income_vs_last_month: 'Ingresos vs mes anterior',
    net_flow: 'Flujo neto',
    spending_optimization_title: 'Optimización de gasto',
    spending_optimization_text: 'Con base en tu tasa de ahorro actual, tu "Fondo de emergencia" estará completamente nutrido para diciembre. Mantén el impulso.',
    auto_nurture_title: 'Auto-cuidado activo',
    auto_nurture_text: 'Hemos identificado $120 en cambio sobrante esta semana que puede redirigirse a tu meta "Auto nuevo".',
    transaction_modal_title_add: 'Agregar transacción',
    transaction_modal_title_edit: 'Editar transacción',
    label_description: 'Descripción',
    label_category: 'Categoría',
    label_amount: 'Monto',
    label_type: 'Tipo',
    label_date: 'Fecha',
    label_note: 'Nota',
    option_expense: 'Gasto',
    option_income: 'Ingreso',
    option_saving: 'Ahorro',
    cancel: 'Cancelar',
    save_transaction: 'Guardar transacción',
    goal_modal_title: 'Crear nueva meta',
    label_goal_name: 'Nombre',
    label_goal_target: 'Objetivo',
    label_goal_saved: 'Ahorrado',
    label_goal_description: 'Descripción',
    label_goal_priority: 'Prioridad',
    label_goal_color: 'Color',
    save_goal: 'Guardar meta',
    edit: 'Editar',
    delete: 'Eliminar',
    actions: 'Acciones',
    no_transactions_day: 'No hay transacciones para este día.',
    complete: 'Completado',
    auth_required: 'Debes iniciar sesión para continuar.',
    request_error: 'Error en la petición.',
    confirm_delete_transaction: '¿Eliminar esta transacción?',
    confirm_delete_goal: '¿Eliminar esta meta de ahorro?',
    fill_required: 'Por favor completa todos los campos requeridos.',
    transaction_saved: 'Transacción guardada con éxito.',
    transaction_deleted: 'Transacción eliminada.',
    fixed_expenses_monthly: 'Gastos fijos mensuales',
    subscriptions_monthly: 'Suscripciones',
    real_available: 'Disponible real',
    add_salary: 'Agregar salario',
    salary_description_default: 'Sueldo mensual',
    salary_category: 'Salario',
    fixed_expenses_title: 'Gastos fijos',
    subscriptions_title: 'Suscripciones',
    fixed_expense_modal_title: 'Agregar gasto fijo',
    edit_fixed_expense: 'Editar gasto fijo',
    save_fixed_expense: 'Guardar gasto',
    fixed_expense_saved: 'Gasto fijo guardado.',
    fixed_expense_updated: 'Gasto fijo actualizado.',
    fixed_expense_deleted: 'Gasto fijo eliminado.',
    no_fixed_expenses: 'No hay gastos fijos registrados.',
    add_fixed_expense: 'Agregar gasto fijo',
    confirm_delete_fixed_expense: '¿Eliminar este gasto fijo?',
    subscription_modal_title: 'Agregar suscripción',
    edit_subscription: 'Editar suscripción',
    save_subscription: 'Guardar suscripción',
    subscription_saved: 'Suscripción guardada.',
    subscription_updated: 'Suscripción actualizada.',
    subscription_deleted: 'Suscripción eliminada.',
    no_subscriptions: 'No hay suscripciones registradas.',
    add_subscription: 'Agregar suscripción',
    confirm_delete_subscription: '¿Eliminar esta suscripción?',
    calendar_payment_description: 'Pago programado',
    calendar_income_description: 'Ingreso programado',
    calendar_payment_category: 'Pago',
    calendar_income_category: 'Ingreso',
    label_fixed_name: 'Nombre',
    label_due_day: 'Día de pago',
    label_subscription_name: 'Plataforma',
    label_billing_day: 'Día de cobro',
    payment_reminders_title: 'Recordatorios de pago',
    no_reminders: 'No hay recordatorios próximos.',
    goal_saved: 'Meta guardada con éxito.',
    goal_deleted: 'Meta eliminada.',
    add_savings_goal: 'Agregar meta de ahorro',
    goal_progress_message: 'Progreso de "{name}": {percent}% alcanzado. Faltan {remaining}.',
    goal_month_completed: 'Meta "{name}" cumplida al cierre de mes con {percent}%.',
    goal_month_missing: 'Meta "{name}" no cumplida al cierre de mes. Faltan {remaining}.',
    no_savings_goal: 'Agrega una meta de ahorro para comenzar.',
    export_started: 'Exportación iniciada.',
    export_error: 'Error al exportar archivo.',
    logout_success: 'Cerrando sesión...',
    user_greeting: 'Hola, {name}',
    notifications: 'Notificaciones',
    no_notifications: 'No hay notificaciones',
    settings_title: 'Configuración',
    profile_settings: 'Perfil',
    your_name: 'Tu nombre',
    email_address: 'Correo electrónico',
    save_changes: 'Guardar cambios',
    preferences: 'Preferencias',
    enable_notifications: 'Activar notificaciones',
    dark_mode: 'Modo oscuro',
    security: 'Seguridad',
    change_password: 'Cambiar contraseña',
    data_exportation: 'Exportación de datos',
    export_description: 'Descarga todos tus datos en formato Excel',
    about: 'Información',
    app_description: 'Tu gestor personal de finanzas con inteligencia integrada',
    change_password_title: 'Cambiar contraseña',
    current_password: 'Contraseña actual',
    new_password: 'Nueva contraseña',
    confirm_password: 'Confirmar contraseña',
    save_password: 'Guardar contraseña',
    profile_updated: 'Perfil actualizado con éxito.',
    password_changed: 'Contraseña cambiada con éxito.',
    password_mismatch: 'Las contraseñas no coinciden.',
    password_error: 'Error al cambiar la contraseña.',
    invalid_current_password: 'La contraseña actual es incorrecta.'
  },
  en: {
    appTitle: 'My Finances',
    appTagline: 'THE ETHEREAL LEDGER',
    nav_dashboard: 'Dashboard',
    nav_transactions: 'Transactions',
    nav_goals: 'Savings Goals',
    nav_calendar: 'Financial Calendar',
    nav_reports: 'Reports',
    add_transaction: 'Add Transaction',
    help: 'Help',
    sign_out: 'Sign Out',
    welcome_dashboard: 'Welcome',
    dashboard_subtitle: 'Your financial garden is blooming beautifully this month. Let’s review your progress.',
    total_balance: 'Total Balance',
    monthly_income: 'Monthly Income',
    monthly_expenses: 'Monthly Expenses',
    savings_goal: 'Savings Goal',
    financial_trends: 'Financial Trends',
    expense_distribution: 'Expense Distribution',
    optimize_subscriptions_title: 'Optimizing Subscriptions',
    optimize_subscriptions_text: 'We’ve identified $42/month in unused streaming services. Canceling these could add $504 to your “Villa in Provence” goal this year.',
    budget_alert_title: 'Budget Alert: Entertainment',
    budget_alert_text: 'You’ve reached 85% of your entertainment budget for June. 10 days remain — consider a cozy night in.',
    track_cashflow: 'Track your cashflow.',
    filter_all: 'ALL',
    filter_income: 'INCOME',
    filter_expense: 'EXPENSES',
    filter_saving: 'SAVINGS',
    total_outflow: 'Total Outflow This Month',
    transactions_summary_note: '12% lower than previous month',
    savings_goals_title: 'Nurturing your future.',
    savings_goals_subtitle: 'Your wealth is a garden. Continue tending to your goals with patience and intention.',
    create_new_goal: 'Create New Goal',
    cultivate_ritual: 'Cultivate your monthly ritual.',
    month: 'Month',
    week: 'Week',
    day_of_week: 'Monday',
    selected: 'Selected',
    add_bill: 'Add Bill',
    add_income: 'Add Income',
    upcoming_rituals: 'Upcoming Rituals',
    monthly_financial_health: 'Monthly financial health.',
    export_to_excel: 'Export to Excel',
    total_expenses: 'Total Expenses',
    income_vs_last_month: 'Income vs Last Month',
    net_flow: 'Net Flow',
    spending_optimization_title: 'Spending optimization',
    spending_optimization_text: 'Based on your current savings rate, your “Emergency Fund” will be fully nurtured by December. Keep the momentum.',
    auto_nurture_title: 'Auto-Nurture Active',
    auto_nurture_text: 'We’ve identified $120 in spare change this week that can be redirected to your “New Car” goal.',
    transaction_modal_title_add: 'Add Transaction',
    transaction_modal_title_edit: 'Edit Transaction',
    label_description: 'Description',
    label_category: 'Category',
    label_amount: 'Amount',
    label_type: 'Type',
    label_date: 'Date',
    label_note: 'Note',
    option_expense: 'Expense',
    option_income: 'Income',
    option_saving: 'Saving',
    cancel: 'Cancel',
    save_transaction: 'Save Transaction',
    goal_modal_title: 'Create New Goal',
    label_goal_name: 'Name',
    label_goal_target: 'Target',
    label_goal_saved: 'Saved',
    label_goal_description: 'Description',
    label_goal_priority: 'Priority',
    label_goal_color: 'Color',
    save_goal: 'Save Goal',
    edit: 'Edit',
    delete: 'Delete',
    actions: 'Actions',
    no_transactions_day: 'No transactions for this day.',
    complete: 'Complete',
    auth_required: 'You must sign in to continue.',
    request_error: 'Request error.',
    confirm_delete_transaction: 'Delete this transaction?',
    confirm_delete_goal: 'Delete this savings goal?',
    fill_required: 'Please complete all required fields.',
    transaction_saved: 'Transaction saved successfully.',
    transaction_deleted: 'Transaction deleted.',
    fixed_expenses_monthly: 'Fixed expenses monthly',
    subscriptions_monthly: 'Subscriptions',
    real_available: 'Real available',
    add_salary: 'Add salary',
    salary_description_default: 'Monthly salary',
    salary_category: 'Salary',
    fixed_expenses_title: 'Fixed Expenses',
    subscriptions_title: 'Subscriptions',
    fixed_expense_modal_title: 'Add Fixed Expense',
    edit_fixed_expense: 'Edit Fixed Expense',
    save_fixed_expense: 'Save Expense',
    fixed_expense_saved: 'Fixed expense saved.',
    fixed_expense_updated: 'Fixed expense updated.',
    fixed_expense_deleted: 'Fixed expense deleted.',
    no_fixed_expenses: 'No fixed expenses recorded.',
    add_fixed_expense: 'Add Fixed Expense',
    confirm_delete_fixed_expense: 'Delete this fixed expense?',
    subscription_modal_title: 'Add Subscription',
    edit_subscription: 'Edit Subscription',
    save_subscription: 'Save Subscription',
    subscription_saved: 'Subscription saved.',
    subscription_updated: 'Subscription updated.',
    subscription_deleted: 'Subscription deleted.',
    no_subscriptions: 'No subscriptions recorded.',
    add_subscription: 'Add Subscription',
    confirm_delete_subscription: 'Delete this subscription?',
    calendar_payment_description: 'Scheduled payment',
    calendar_income_description: 'Scheduled income',
    calendar_payment_category: 'Payment',
    calendar_income_category: 'Income',
    label_fixed_name: 'Name',
    label_due_day: 'Payment day',
    label_subscription_name: 'Platform',
    label_billing_day: 'Billing day',
    payment_reminders_title: 'Payment reminders',
    no_reminders: 'No upcoming reminders.',
    goal_saved: 'Goal saved successfully.',
    goal_deleted: 'Goal deleted.',
    add_savings_goal: 'Add savings goal',
    goal_progress_message: 'Progress for "{name}": {percent}% reached. {remaining} left to reach it.',
    goal_month_completed: 'Goal "{name}" is complete by month end with {percent}%!',
    goal_month_missing: 'Goal "{name}" is not complete yet. {remaining} needed before month end.',
    no_savings_goal: 'Add a savings goal to get started.',
    export_started: 'Export started.',
    export_error: 'Error exporting file.',
    logout_success: 'Signing out...',
    user_greeting: 'Hello, {name}',
    notifications: 'Notifications',
    no_notifications: 'No notifications',
    settings_title: 'Settings',
    profile_settings: 'Profile',
    your_name: 'Your name',
    email_address: 'Email address',
    save_changes: 'Save changes',
    preferences: 'Preferences',
    enable_notifications: 'Enable notifications',
    dark_mode: 'Dark mode',
    security: 'Security',
    change_password: 'Change password',
    data_exportation: 'Data Export',
    export_description: 'Download all your data in Excel format',
    about: 'About',
    app_description: 'Your personal financial manager with integrated intelligence',
    change_password_title: 'Change Password',
    current_password: 'Current password',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    save_password: 'Save password',
    profile_updated: 'Profile updated successfully.',
    password_changed: 'Password changed successfully.',
    password_mismatch: 'Passwords do not match.',
    password_error: 'Error changing password.',
    invalid_current_password: 'Current password is incorrect.'
  }
};

let currentLang = localStorage.getItem('lang') || 'es';
let currentUser = null;
let selectedFilter = 'all';
let selectedMonth = new Date();
let selectedCalendarDay = null;
let trendChart = null;
let pieChart = null;
let editTransactionId = null;
let editGoalId = null;

const API_BASE = window.location.port === '5500'
  ? 'http://localhost:3000'
  : window.location.origin;

function t(key, vars = {}) {
  let text = translations[currentLang][key] || translations.es[key] || key;
  Object.keys(vars).forEach((varKey) => {
    text = text.replace(`{${varKey}}`, vars[varKey]);
  });
  return text;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (key) {
      element.textContent = t(key);
    }
  });
  document.title = t('appTitle');
  const modalTitle = document.getElementById('transaction-modal-title');
  if (modalTitle && !editTransactionId) {
    modalTitle.textContent = t('transaction_modal_title_add');
  }
  if (currentUser) {
    userGreeting.textContent = t('user_greeting', { name: currentUser.name });
    avatar.textContent = currentUser.name.charAt(0).toUpperCase();
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  if (languageSelect) {
    languageSelect.value = lang;
  }
  applyTranslations();
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    throw new Error(body?.error || t('request_error'));
  }
  return body;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

function renderReminders(reminders) {
  if (!remindersList) return;
  if (!reminders.length) {
    remindersList.innerHTML = `<p>${t('no_reminders')}</p>`;
    return;
  }
  remindersList.innerHTML = reminders.map(reminder => `<div class="reminder-item"><strong>${reminder.text}</strong><span>${formatDateLabel(reminder.date)}</span></div>`).join('');
}

function switchSection(sectionId) {
  sections.forEach(section => section.classList.toggle('active-page', section.id === sectionId));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.section === sectionId));
}

// ========== FUNCIONALIDAD MOSTRAR/OCULTAR SALDO ==========
let balanceVisible = localStorage.getItem('balanceVisible') !== 'false';
let actualBalance = '$0'; // Guardar el saldo real

function updateBalanceVisibility() {
  if (balanceVisible) {
    dashboardBalance.textContent = actualBalance;
    toggleBalanceBtn.textContent = '👁';
    toggleBalanceBtn.title = 'Ocultar saldo';
  } else {
    const maskedLength = actualBalance.replace(/[^0-9]/g, '').length;
    dashboardBalance.textContent = '•'.repeat(Math.max(4, maskedLength));
    toggleBalanceBtn.textContent = '👁‍🗨';
    toggleBalanceBtn.title = 'Mostrar saldo';
  }
}

function toggleBalanceVisibility() {
  balanceVisible = !balanceVisible;
  localStorage.setItem('balanceVisible', balanceVisible);
  updateBalanceVisibility();
}

if (toggleBalanceBtn) {
  toggleBalanceBtn.addEventListener('click', toggleBalanceVisibility);
  updateBalanceVisibility();
}

navButtons.forEach(button => {
  button.addEventListener('click', () => switchSection(button.dataset.section));
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedFilter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    loadTransactions();
  });
});

if (openTransactionModalBtn) openTransactionModalBtn.addEventListener('click', () => openModal(transactionModal));
if (calendarAddBillBtn) calendarAddBillBtn.addEventListener('click', () => openCalendarTransaction('expense'));
if (calendarAddIncomeBtn) calendarAddIncomeBtn.addEventListener('click', () => openCalendarTransaction('income'));
if (addSalaryBtn) addSalaryBtn.addEventListener('click', () => openSalaryModal());
if (openGoalModalBtn) openGoalModalBtn.addEventListener('click', () => openModal(goalModal));
if (addGoalBtn) addGoalBtn.addEventListener('click', () => openModal(goalModal));
if (closeTransactionBtn) closeTransactionBtn.addEventListener('click', () => closeModal(transactionModal));
if (closeGoalBtn) closeGoalBtn.addEventListener('click', () => closeModal(goalModal));
if (cancelTransactionBtn) cancelTransactionBtn.addEventListener('click', () => closeModal(transactionModal));
if (cancelGoalBtn) cancelGoalBtn.addEventListener('click', () => closeModal(goalModal));
if (logoutBtn) logoutBtn.addEventListener('click', async () => {
  try {
    await apiFetch('/api/logout', { method: 'POST' });
  } catch (err) {
    console.error(err);
  }
  window.location.href = '/login.html';
});

if (openFixedExpenseModalBtn) openFixedExpenseModalBtn.addEventListener('click', () => openModal(fixedExpenseModal));
if (openSubscriptionModalBtn) openSubscriptionModalBtn.addEventListener('click', () => openModal(subscriptionModal));
if (closeFixedExpenseBtn) closeFixedExpenseBtn.addEventListener('click', () => closeModal(fixedExpenseModal));
if (closeSubscriptionBtn) closeSubscriptionBtn.addEventListener('click', () => closeModal(subscriptionModal));
if (cancelFixedExpenseBtn) cancelFixedExpenseBtn.addEventListener('click', () => closeModal(fixedExpenseModal));
if (cancelSubscriptionBtn) cancelSubscriptionBtn.addEventListener('click', () => closeModal(subscriptionModal));

if (languageSelect) {
  languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
}

// Event listeners para configuración
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => openModal(settingsModal));
}

if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));
}

if (closeChangePasswordBtn) {
  closeChangePasswordBtn.addEventListener('click', () => closeModal(changePasswordModal));
}

if (changePasswordBtn) {
  changePasswordBtn.addEventListener('click', () => {
    closeModal(settingsModal);
    openModal(changePasswordModal);
  });
}

if (updateProfileBtn) {
  updateProfileBtn.addEventListener('click', updateProfile);
}

if (exportDataBtn) {
  exportDataBtn.addEventListener('click', () => {
    closeModal(settingsModal);
    exportToExcel();
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', changePassword);
}

// ========== FUNCIONALIDAD DE METAS EN TRANSACCIONES ==========
async function loadSavingsGoalsForTransaction() {
  try {
    const goals = await apiFetch('/api/goals');
    savingsGoalSelect.innerHTML = '<option value="">Seleccionar meta...</option>';
    goals.forEach(goal => {
      const option = document.createElement('option');
      option.value = goal.id;
      option.textContent = `${goal.name} (${formatCurrency(goal.saved)} / ${formatCurrency(goal.target)})`;
      savingsGoalSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error cargando metas:', err);
  }
}

function handleTransactionTypeChange() {
  const selectedType = transactionTypeSelect.value;
  if (selectedType === 'saving') {
    savingsGoalField.style.display = 'block';
    loadSavingsGoalsForTransaction();
  } else {
    savingsGoalField.style.display = 'none';
    savingsGoalSelect.value = '';
  }
}

if (transactionTypeSelect) {
  transactionTypeSelect.addEventListener('change', handleTransactionTypeChange);
}

function openModal(modal) {
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (modal === transactionModal) {
    transactionForm.reset();
    editTransactionId = null;
    savingsGoalField.style.display = 'none';
    savingsGoalSelect.value = '';
    transactionTypeSelect.value = 'expense';
    document.getElementById('transaction-modal-title').textContent = t('transaction_modal_title_add');
  }
  if (modal === fixedExpenseModal) {
    fixedExpenseForm.reset();
    fixedExpenseForm.removeAttribute('data-edit-id');
    document.querySelector('#fixed-expense-modal .modal-header h3').textContent = t('fixed_expense_modal_title');
  }
  if (modal === subscriptionModal) {
    subscriptionForm.reset();
    subscriptionForm.removeAttribute('data-edit-id');
    document.querySelector('#subscription-modal .modal-header h3').textContent = t('subscription_modal_title');
  }
  if (modal === goalModal) {
    goalForm.reset();
    editGoalId = null;
  }
  if (modal === settingsModal) {
    // No limpiar nada específico para settings
  }
  if (modal === changePasswordModal) {
    changePasswordForm.reset();
  }
}

function openSalaryModal() {
  transactionForm.reset();
  editTransactionId = null;
  transactionForm.description.value = t('salary_description_default');
  transactionForm.category.value = t('salary_category');
  transactionForm.type.value = 'income';
  transactionForm.date.value = new Date().toISOString().slice(0, 10);
  transactionForm.note.value = '';
  document.getElementById('transaction-modal-title').textContent = t('transaction_modal_title_add');
  openModal(transactionModal);
}

function openCalendarTransaction(type) {
  transactionForm.reset();
  editTransactionId = null;
  transactionForm.type.value = type;
  transactionForm.date.value = selectedCalendarDay || new Date().toISOString().slice(0, 10);
  transactionForm.note.value = '';
  if (type === 'expense') {
    transactionForm.description.value = t('calendar_payment_description');
    transactionForm.category.value = t('calendar_payment_category');
  } else {
    transactionForm.description.value = t('calendar_income_description');
    transactionForm.category.value = t('calendar_income_category');
  }
  document.getElementById('transaction-modal-title').textContent = t('transaction_modal_title_add');
  openModal(transactionModal);
}

transactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(transactionForm);
  const data = {
    description: formData.get('description').trim(),
    category: formData.get('category').trim(),
    amount: Number(formData.get('amount')),
    type: formData.get('type'),
    date: formData.get('date'),
    note: formData.get('note').trim()
  };
  
  // Agregar savings_goal_id si es tipo saving
  if (data.type === 'saving') {
    const goalId = formData.get('savings_goal_id');
    if (!goalId) {
      showToast('Por favor selecciona una meta de ahorro.');
      return;
    }
    data.savings_goal_id = goalId;
  }
  
  if (!data.description || !data.category || !data.amount || !data.date) {
    showToast(t('fill_required'));
    return;
  }
  const url = editTransactionId ? `/api/transactions/${editTransactionId}` : '/api/transactions';
  const method = editTransactionId ? 'PUT' : 'POST';
  try {
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    closeModal(transactionModal);
    showToast(t('transaction_saved'));
    loadAll();
  } catch (err) {
    showToast(err.message);
  }
});

fixedExpenseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(fixedExpenseForm);
  const data = {
    name: formData.get('name').trim(),
    amount: Number(formData.get('amount')),
    due_day: Number(formData.get('due_day')),
    category: formData.get('category').trim()
  };
  if (!data.name || !data.amount || !data.due_day || !data.category) {
    showToast(t('fill_required'));
    return;
  }
  try {
    const isEdit = fixedExpenseForm.dataset.editId;
    const url = isEdit ? `/api/fixed-expenses/${fixedExpenseForm.dataset.editId}` : '/api/fixed-expenses';
    const method = isEdit ? 'PUT' : 'POST';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fixedExpenseForm.removeAttribute('data-edit-id');
    document.querySelector('#fixed-expense-modal .modal-header h3').textContent = t('fixed_expense_modal_title');
    closeModal(fixedExpenseModal);
    fixedExpenseForm.reset();
    showToast(isEdit ? t('fixed_expense_updated') : t('fixed_expense_saved'));
    loadAll();
  } catch (err) {
    showToast(err.message);
  }
});

subscriptionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(subscriptionForm);
  const data = {
    name: formData.get('name').trim(),
    amount: Number(formData.get('amount')),
    billing_day: Number(formData.get('billing_day'))
  };
  if (!data.name || !data.amount || !data.billing_day) {
    showToast(t('fill_required'));
    return;
  }
  try {
    const isEdit = subscriptionForm.dataset.editId;
    const url = isEdit ? `/api/subscriptions/${subscriptionForm.dataset.editId}` : '/api/subscriptions';
    const method = isEdit ? 'PUT' : 'POST';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    subscriptionForm.removeAttribute('data-edit-id');
    document.querySelector('#subscription-modal .modal-header h3').textContent = t('subscription_modal_title');
    closeModal(subscriptionModal);
    subscriptionForm.reset();
    showToast(isEdit ? t('subscription_updated') : t('subscription_saved'));
    loadAll();
  } catch (err) {
    showToast(err.message);
  }
});

goalForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(goalForm);
  const data = {
    name: formData.get('name').trim(),
    target: Number(formData.get('target')),
    saved: Number(formData.get('saved')),
    description: formData.get('description').trim(),
    priority: formData.get('priority'),
    color: formData.get('color')
  };
  if (!data.name || !data.target || Number.isNaN(data.saved)) {
    showToast(t('fill_required'));
    return;
  }
  const url = editGoalId ? `/api/goals/${editGoalId}` : '/api/goals';
  const method = editGoalId ? 'PUT' : 'POST';
  try {
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    closeModal(goalModal);
    showToast(t('goal_saved'));
    loadGoals();
  } catch (err) {
    showToast(err.message);
  }
});

exportBtn.addEventListener('click', async () => {
  await exportToExcel();
});

prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

function changeMonth(offset) {
  selectedMonth.setMonth(selectedMonth.getMonth() + offset);
  renderCalendar();
  loadCalendar();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function exportToExcel() {
  try {
    const response = await fetch(`${API_BASE}/api/export`, { credentials: 'include' });
    if (!response.ok) {
      showToast(t('export_error'));
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mis-finanzas.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(t('export_started'));
  } catch (err) {
    showToast(t('export_error'));
  }
}

async function loadAll() {
  await Promise.all([loadSummary(), loadTransactions(), loadGoals(), loadCalendar(), loadReports(), loadFixedExpenses(), loadSubscriptions()]);
}

async function loadSummary() {
  const data = await apiFetch('/api/summary');
  const { totals, categories, goals, reminders } = data;
  actualBalance = formatCurrency(totals.income - totals.expenses - totals.savings - totals.fixedExpenses - totals.subscriptions);
  updateBalanceVisibility();
  dashboardIncome.textContent = formatCurrency(totals.income);
  dashboardExpenses.textContent = formatCurrency(totals.expenses);
  dashboardSavings.textContent = `${goals.length ? Math.round((goals[0].saved / goals[0].target) * 100) : 0}% ${t('complete')}`;
  dashboardFixed.textContent = formatCurrency(totals.fixedExpenses);
  dashboardSubscriptions.textContent = formatCurrency(totals.subscriptions);
  dashboardAvailable.textContent = formatCurrency(totals.available);
  dashboardGoalMessage.textContent = goals.length ? buildGoalMessage(goals[0]) : t('no_savings_goal');
  renderReminders(reminders || []);
  updateNotificationBadge(reminders || []);
  renderNotifications(reminders || []);
  updateCharts(categories, data.transactions);
}

function isLastDayOfMonth(date = new Date()) {
  return date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function buildGoalMessage(goal) {
  const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  const remaining = Math.max(0, goal.target - goal.saved);
  const remainingLabel = formatCurrency(remaining);
  if (isLastDayOfMonth()) {
    return goal.saved >= goal.target
      ? t('goal_month_completed', { name: goal.name, percent })
      : t('goal_month_missing', { name: goal.name, remaining: remainingLabel });
  }
  return t('goal_progress_message', { name: goal.name, percent, remaining: remainingLabel });
}

async function loadTransactions() {
  const params = new URLSearchParams();
  if (selectedFilter !== 'all') params.append('type', selectedFilter);
  const transactions = await apiFetch(`/api/transactions?${params.toString()}`);
  transactionsTable.innerHTML = '';
  let totalOutflow = 0;
  transactions.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.description}</td>
      <td>${item.category}</td>
      <td>${formatCurrency(item.amount)}</td>
      <td>
        <button data-id="${item.id}" class="edit-tx">${t('edit')}</button>
        <button data-id="${item.id}" class="delete-tx">${t('delete')}</button>
      </td>
    `;
    transactionsTable.appendChild(row);
    if (item.amount < 0) totalOutflow += Math.abs(item.amount);
  });
  transactionsSummary.textContent = formatCurrency(totalOutflow);
  document.querySelectorAll('.edit-tx').forEach(button => {
    button.addEventListener('click', () => editTransaction(button.dataset.id));
  });
  document.querySelectorAll('.delete-tx').forEach(button => {
    button.addEventListener('click', () => deleteTransaction(button.dataset.id));
  });
}

async function loadFixedExpenses() {
  const fixedExpenses = await apiFetch('/api/fixed-expenses');
  fixedExpensesList.innerHTML = '';
  if (!fixedExpenses.length) {
    fixedExpensesList.innerHTML = `<p>${t('no_fixed_expenses')}</p>`;
    return;
  }
  fixedExpenses.forEach(item => {
    const row = document.createElement('div');
    row.className = 'tx-item';
    row.innerHTML = `
      <strong>${item.name}</strong>
      <span>${item.category} • ${formatCurrency(item.amount)} • Día ${item.due_day}</span>
      <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="ghost-btn edit-fixed" data-id="${item.id}">${t('edit')}</button>
        <button class="ghost-btn delete-fixed" data-id="${item.id}">${t('delete')}</button>
      </div>
    `;
    fixedExpensesList.appendChild(row);
  });
  document.querySelectorAll('.edit-fixed').forEach(button => {
    button.addEventListener('click', () => editFixedExpense(button.dataset.id));
  });
  document.querySelectorAll('.delete-fixed').forEach(button => {
    button.addEventListener('click', () => deleteFixedExpense(button.dataset.id));
  });
}

async function loadSubscriptions() {
  const subscriptions = await apiFetch('/api/subscriptions');
  subscriptionsList.innerHTML = '';
  if (!subscriptions.length) {
    subscriptionsList.innerHTML = `<p>${t('no_subscriptions')}</p>`;
    return;
  }
  subscriptions.forEach(item => {
    const row = document.createElement('div');
    row.className = 'tx-item';
    row.innerHTML = `
      <strong>${item.name}</strong>
      <span>${formatCurrency(item.amount)} • Día ${item.billing_day}</span>
      <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="ghost-btn edit-sub" data-id="${item.id}">${t('edit')}</button>
        <button class="ghost-btn delete-sub" data-id="${item.id}">${t('delete')}</button>
      </div>
    `;
    subscriptionsList.appendChild(row);
  });
  document.querySelectorAll('.edit-sub').forEach(button => {
    button.addEventListener('click', () => editSubscription(button.dataset.id));
  });
  document.querySelectorAll('.delete-sub').forEach(button => {
    button.addEventListener('click', () => deleteSubscription(button.dataset.id));
  });
}

async function editFixedExpense(id) {
  const items = await apiFetch('/api/fixed-expenses');
  const item = items.find(entry => entry.id === Number(id));
  if (!item) return;
  fixedExpenseForm.name.value = item.name;
  fixedExpenseForm.amount.value = item.amount;
  fixedExpenseForm.due_day.value = item.due_day;
  fixedExpenseForm.category.value = item.category;
  fixedExpenseForm.dataset.editId = id;
  document.querySelector('#fixed-expense-modal .modal-header h3').textContent = t('edit_fixed_expense');
  openModal(fixedExpenseModal);
}

async function deleteFixedExpense(id) {
  if (!confirm(t('confirm_delete_fixed_expense'))) return;
  try {
    await apiFetch(`/api/fixed-expenses/${id}`, { method: 'DELETE' });
    showToast(t('fixed_expense_deleted'));
    loadAll();
  } catch (err) {
    showToast(err.message);
  }
}

async function editSubscription(id) {
  const items = await apiFetch('/api/subscriptions');
  const item = items.find(entry => entry.id === Number(id));
  if (!item) return;
  subscriptionForm.name.value = item.name;
  subscriptionForm.amount.value = item.amount;
  subscriptionForm.billing_day.value = item.billing_day;
  subscriptionForm.dataset.editId = id;
  document.querySelector('#subscription-modal .modal-header h3').textContent = t('edit_subscription');
  openModal(subscriptionModal);
}

async function deleteSubscription(id) {
  if (!confirm(t('confirm_delete_subscription'))) return;
  try {
    await apiFetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
    showToast(t('subscription_deleted'));
    loadAll();
  } catch (err) {
    showToast(err.message);
  }
}

async function editTransaction(id) {
  const transactions = await apiFetch('/api/transactions');
  const tx = transactions.find(item => item.id === Number(id));
  if (!tx) return;
  editTransactionId = tx.id;
  transactionForm.description.value = tx.description;
  transactionForm.category.value = tx.category;
  transactionForm.amount.value = Math.abs(tx.amount);
  transactionForm.type.value = tx.type;
  transactionForm.date.value = tx.date;
  transactionForm.note.value = tx.note;
  
  // Manejar campo de meta si es tipo saving
  if (tx.type === 'saving') {
    savingsGoalField.style.display = 'block';
    loadSavingsGoalsForTransaction();
  } else {
    savingsGoalField.style.display = 'none';
  }
  
  document.getElementById('transaction-modal-title').textContent = t('transaction_modal_title_edit');
  openModal(transactionModal);
}

async function deleteTransaction(id) {
  if (!confirm(t('confirm_delete_transaction'))) return;
  try {
    await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' });
    showToast(t('transaction_deleted'));
    loadTransactions();
    loadSummary();
  } catch (err) {
    showToast(err.message);
  }
}

async function loadGoals() {
  const goals = await apiFetch('/api/goals');
  goalsList.innerHTML = '';
  goals.forEach(goal => {
    const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
    const card = document.createElement('article');
    card.className = 'goal-card';
    card.innerHTML = `
      <h3>${goal.name}</h3>
      <p>${goal.description}</p>
      <div class="goal-progress">
        <div class="goal-meta"><span>${percent}% ${t('complete')}</span><strong>${formatCurrency(goal.saved)} / ${formatCurrency(goal.target)}</strong></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${percent}%; background:${goal.color};"></div></div>
      </div>
      <div class="goal-actions">
        <button class="ghost-btn edit-goal" data-id="${goal.id}">${t('edit')}</button>
        <button class="ghost-btn delete-goal" data-id="${goal.id}">${t('delete')}</button>
      </div>
    `;
    goalsList.appendChild(card);
  });
  document.querySelectorAll('.edit-goal').forEach(button => {
    button.addEventListener('click', () => editGoal(button.dataset.id));
  });
  document.querySelectorAll('.delete-goal').forEach(button => {
    button.addEventListener('click', () => deleteGoal(button.dataset.id));
  });
}

async function editGoal(id) {
  const goals = await apiFetch('/api/goals');
  const goal = goals.find(item => item.id === Number(id));
  if (!goal) return;
  editGoalId = goal.id;
  goalForm.name.value = goal.name;
  goalForm.target.value = goal.target;
  goalForm.saved.value = goal.saved;
  goalForm.description.value = goal.description;
  goalForm.priority.value = goal.priority;
  goalForm.color.value = goal.color;
  openModal(goalModal);
}

async function deleteGoal(id) {
  if (!confirm(t('confirm_delete_goal'))) return;
  try {
    await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
    showToast(t('goal_deleted'));
    loadGoals();
  } catch (err) {
    showToast(err.message);
  }
}

function updateCharts(categories) {
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  if (!trendChart) {
    trendChart = new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Savings Flow',
          data: [1200, 1700, 1400, 1800, 2150, 2400],
          borderColor: '#8f5d9f',
          backgroundColor: 'rgba(143, 93, 159, 0.16)',
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(141, 117, 133, 0.15)' }, ticks: { beginAtZero: true } }
        }
      }
    });
  }

  if (!pieChart) {
    pieChart = new Chart(document.getElementById('pieChart'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: ['#b882b6', '#d2afc8', '#f4d4d5', '#c7b1e3'] }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    });
  } else {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.update();
  }
}

function createCalendarDays(monthDate, entries) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const emptyDays = first.getDay();
  const totalDays = last.getDate();
  calendarGrid.innerHTML = '';
  for (let i = 0; i < emptyDays; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day';
    empty.style.opacity = '0.35';
    calendarGrid.appendChild(empty);
  }
  for (let day = 1; day <= totalDays; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const items = entries[fullDate] || [];
    const card = document.createElement('div');
    card.className = 'calendar-day';
    if (!selectedCalendarDay) selectedCalendarDay = fullDate;
    if (selectedCalendarDay === fullDate) card.classList.add('active');
    card.innerHTML = `<div class="day-number">${day}</div><div class="day-markers">${items.slice(0, 3).map(() => '<span class="day-marker"></span>').join('')}</div>`;
    card.addEventListener('click', () => {
      selectedCalendarDay = fullDate;
      renderCalendar();
      populateCalendarDetails(entries[fullDate] || []);
    });
    calendarGrid.appendChild(card);
  }
  calendarSelectedDate.textContent = formatDateLabel(selectedCalendarDay || `${year}-${String(month + 1).padStart(2, '0')}-01`);
}

function populateCalendarDetails(transactions) {
  calendarDetails.innerHTML = '';
  if (!transactions.length) {
    calendarDetails.innerHTML = `<p>${t('no_transactions_day')}</p>`;
    return;
  }
  transactions.forEach(tx => {
    const item = document.createElement('div');
    item.className = 'tx-item';
    item.innerHTML = `<strong>${tx.description}</strong><span>${tx.category} • ${formatCurrency(tx.amount)}</span><span>${tx.note || ''}</span>`;
    calendarDetails.appendChild(item);
  });
}

async function loadCalendar() {
  const year = selectedMonth.getFullYear();
  const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
  const data = await apiFetch(`/api/calendar?month=${year}-${month}`);
  const entries = data.calendar || {};
  createCalendarDays(selectedMonth, entries);
  populateCalendarDetails(entries[selectedCalendarDay] || []);
}

function renderCalendar() {
  calendarMonthLabel.textContent = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

async function loadReports() {
  const data = await apiFetch('/api/summary');
  const totalOut = data.totals.expenses + data.totals.fixedExpenses + data.totals.subscriptions;
  reportExpenses.textContent = formatCurrency(totalOut);
  reportNetflow.textContent = formatCurrency(data.totals.netFlow);
  reportComparison.textContent = '+12%';
}

async function loadSession() {
  try {
    const session = await apiFetch('/api/session');
    if (!session || !session.authenticated) {
      window.location.href = '/login.html';
      return false;
    }
    currentUser = session.user;
    return true;
  } catch (err) {
    return false;
  }
}

function updateNotificationBadge(notifications) {
  if (!notificationsBadge) return;
  const count = notifications.length;
  if (count > 0) {
    notificationsBadge.textContent = count;
    notificationsBadge.style.display = 'flex';
  } else {
    notificationsBadge.style.display = 'none';
  }
}

function renderNotifications(notifications) {
  if (!notificationsContent) return;
  
  if (!notifications || notifications.length === 0) {
    notificationsContent.innerHTML = `<p class="notification-empty">${t('no_notifications')}</p>`;
    return;
  }

  notificationsContent.innerHTML = notifications.map(notification => {
    const isUrgent = notification.type === 'fixed' || notification.type === 'subscription';
    const urgentClass = isUrgent ? 'urgent' : '';
    return `
      <div class="notification-item ${urgentClass}">
        <strong>${notification.text}</strong>
        <span>${formatDateLabel(notification.date)}</span>
      </div>
    `;
  }).join('');
}

function toggleNotificationsDropdown() {
  if (!notificationsDropdown) return;
  notificationsDropdown.classList.toggle('active');
}

function closeNotificationsDropdown() {
  if (!notificationsDropdown) return;
  notificationsDropdown.classList.remove('active');
}

// Event listeners para notificaciones
if (notificationsBtn) {
  notificationsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotificationsDropdown();
  });
}

if (closeNotificationsBtn) {
  closeNotificationsBtn.addEventListener('click', closeNotificationsDropdown);
}

// Cerrar dropdown cuando se hace clic fuera
document.addEventListener('click', (e) => {
  if (notificationsDropdown && notificationsBtn && 
      !notificationsDropdown.contains(e.target) && 
      !notificationsBtn.contains(e.target)) {
    closeNotificationsDropdown();
  }
});

// Event listeners para configuración
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => openModal(settingsModal));
}

if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));
}

if (closeChangePasswordBtn) {
  closeChangePasswordBtn.addEventListener('click', () => closeModal(changePasswordModal));
}

if (changePasswordBtn) {
  changePasswordBtn.addEventListener('click', () => {
    closeModal(settingsModal);
    openModal(changePasswordModal);
  });
}

if (updateProfileBtn) {
  updateProfileBtn.addEventListener('click', updateProfile);
}

if (exportDataBtn) {
  exportDataBtn.addEventListener('click', () => {
    closeModal(settingsModal);
    exportToExcel();
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', changePassword);
}

// Cargar datos del usuario en configuración
function loadSettingsData() {
  if (currentUser && settingsNameInput) {
    settingsNameInput.value = currentUser.name || '';
    if (settingsEmailInput) {
      settingsEmailInput.value = currentUser.email || '';
    }
  }
  
  // Cargar preferencias
  const notificationsEnabled = localStorage.getItem('notificationsEnabled');
  if (notificationsEnabledCheckbox) {
    notificationsEnabledCheckbox.checked = notificationsEnabled !== 'false';
  }
  
  const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
  if (darkModeToggle) {
    darkModeToggle.checked = darkModeEnabled;
  }
  
  // Aplicar modo oscuro si está guardado
  applyDarkMode(darkModeEnabled);
}

function applyDarkMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}

async function updateProfile() {
  const newName = settingsNameInput?.value?.trim();
  
  if (!newName) {
    showToast(t('fill_required'));
    return;
  }
  
  try {
    const response = await apiFetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    
    currentUser.name = newName;
    if (userGreeting) {
      userGreeting.textContent = t('user_greeting', { name: currentUser.name });
    }
    if (avatar) {
      avatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }
    
    showToast(t('profile_updated'));
    closeModal(settingsModal);
    applyTranslations();
  } catch (err) {
    showToast(err.message);
  }
}

async function changePassword(event) {
  event.preventDefault();
  const formData = new FormData(changePasswordForm);
  const currentPassword = formData.get('current_password');
  const newPassword = formData.get('new_password');
  const confirmPassword = formData.get('confirm_password');
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast(t('fill_required'));
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast(t('password_mismatch'));
    return;
  }
  
  try {
    const response = await apiFetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
    
    changePasswordForm.reset();
    closeModal(changePasswordModal);
    openModal(settingsModal);
    showToast(t('password_changed'));
  } catch (err) {
    showToast(err.message || t('password_error'));
  }
}

// Event listeners para modo oscuro y notificaciones
if (notificationsEnabledCheckbox) {
  notificationsEnabledCheckbox.addEventListener('change', () => {
    localStorage.setItem('notificationsEnabled', notificationsEnabledCheckbox.checked);
  });
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('change', () => {
    const enabled = darkModeToggle.checked;
    localStorage.setItem('darkMode', enabled);
    applyDarkMode(enabled);
  });
}

async function initialize() {
  setLanguage(currentLang);
  const authenticated = await loadSession();
  if (!authenticated) return;
  applyTranslations();
  if (currentUser) {
    userGreeting.textContent = t('user_greeting', { name: currentUser.name });
    avatar.textContent = currentUser.name.charAt(0).toUpperCase();
    loadSettingsData();
  }
  await loadAll();
}

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  initialize();
});
