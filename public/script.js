const sections = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('.nav-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const openTransactionModalBtn = document.getElementById('open-transaction-modal');
const transactionModal = document.getElementById('transaction-modal');
const openGoalModalBtn = document.getElementById('open-goal-modal');
const goalModal = document.getElementById('goal-modal');
const closeTransactionBtn = document.getElementById('close-transaction-modal');
const closeGoalBtn = document.getElementById('close-goal-modal');
const cancelTransactionBtn = document.getElementById('cancel-transaction');
const cancelGoalBtn = document.getElementById('cancel-goal');
const transactionForm = document.getElementById('transaction-form');
const goalForm = document.getElementById('goal-form');
const toast = document.getElementById('toast');
const exportBtn = document.getElementById('export-btn');
const calendarMonthLabel = document.getElementById('calendar-month-label');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

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

const API_BASE = window.location.port === '5500'
  ? 'http://localhost:3000'
  : window.location.origin;

async function apiFetch(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new Error(body?.error || 'Error en la petición.');
  }
  return body;
}

let selectedFilter = 'all';
let selectedMonth = new Date();
let selectedCalendarDay = null;
let trendChart = null;
let pieChart = null;
let editTransactionId = null;
let editGoalId = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

function switchSection(sectionId) {
  sections.forEach(section => section.classList.toggle('active-page', section.id === sectionId));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.section === sectionId));
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

openTransactionModalBtn.addEventListener('click', () => openModal(transactionModal));
openGoalModalBtn.addEventListener('click', () => openModal(goalModal));
closeTransactionBtn.addEventListener('click', () => closeModal(transactionModal));
closeGoalBtn.addEventListener('click', () => closeModal(goalModal));
cancelTransactionBtn.addEventListener('click', () => closeModal(transactionModal));
cancelGoalBtn.addEventListener('click', () => closeModal(goalModal));

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
    document.getElementById('transaction-modal-title').textContent = 'Add Transaction';
  }
  if (modal === goalModal) {
    goalForm.reset();
    editGoalId = null;
  }
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
  if (!data.description || !data.category || !data.amount || !data.date) {
    showToast('Por favor completa todos los campos requeridos.');
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
  } catch (err) {
    showToast(err.message || 'No se pudo guardar la transacción.');
    return;
  }
  closeModal(transactionModal);
  showToast('Transacción guardada con éxito.');
  loadAll();
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
    showToast('Por favor completa todos los campos requeridos.');
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
  } catch (err) {
    showToast(err.message || 'No se pudo guardar la meta.');
    return;
  }
  closeModal(goalModal);
  showToast('Meta guardada con éxito.');
  loadGoals();
});

exportBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_BASE}/api/export`);
    if (!response.ok) {
      showToast('Error al exportar archivo.');
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
    showToast('Exportación iniciada.');
  } catch (err) {
    showToast('Error al exportar archivo.');
  }
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

async function loadAll() {
  await Promise.all([loadSummary(), loadTransactions(), loadGoals(), loadCalendar(), loadReports()]);
}

async function loadSummary() {
  const data = await apiFetch('/api/summary');
  const { totals, categories, goals } = data;
  dashboardBalance.textContent = formatCurrency(totals.income - totals.expenses - totals.savings);
  dashboardIncome.textContent = formatCurrency(totals.income);
  dashboardExpenses.textContent = formatCurrency(totals.expenses);
  dashboardSavings.textContent = `${goals.length ? Math.round((goals[0].saved / goals[0].target) * 100) : 0}% Complete`;
  updateCharts(categories, data.transactions);
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
        <button data-id="${item.id}" class="edit-tx">Edit</button>
        <button data-id="${item.id}" class="delete-tx">Delete</button>
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
  document.getElementById('transaction-modal-title').textContent = 'Edit Transaction';
  openModal(transactionModal);
}

async function deleteTransaction(id) {
  if (!confirm('¿Eliminar esta transacción?')) return;
  try {
    await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' });
  } catch (err) {
    showToast(err.message || 'No se pudo eliminar la transacción.');
    return;
  }
  showToast('Transacción eliminada.');
  loadTransactions();
  loadSummary();
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
        <div class="goal-meta"><span>${percent}% Reached</span><strong>${formatCurrency(goal.saved)} / ${formatCurrency(goal.target)}</strong></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${percent}%; background:${goal.color};"></div></div>
      </div>
      <div class="goal-actions">
        <button class="ghost-btn edit-goal" data-id="${goal.id}">Edit</button>
        <button class="ghost-btn delete-goal" data-id="${goal.id}">Delete</button>
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
  if (!confirm('¿Eliminar esta meta de ahorro?')) return;
  try {
    await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
  } catch (err) {
    showToast(err.message || 'No se pudo eliminar la meta.');
    return;
  }
  showToast('Meta eliminada.');
  loadGoals();
}

function updateCharts(categories, transactions) {
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
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
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
    calendarDetails.innerHTML = '<p>No hay transacciones para este día.</p>';
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
  reportExpenses.textContent = formatCurrency(data.totals.expenses);
  reportNetflow.textContent = formatCurrency(data.totals.netFlow);
  reportComparison.textContent = '+12%';
}

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  loadAll();
});
