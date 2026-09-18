/**
 * FinTrack Lite — Application Logic & State Controller
 * Handles CRUD operations, localStorage synchronization, category analytics,
 * real-time search/filtering, and interactive UI feedback.
 */

// -----------------------------------------------------------------------------
// 1. Constants & Category Configuration
// -----------------------------------------------------------------------------
const STORAGE_KEY = 'fintrack_expenses_v1';

const CATEGORIES = {
    Food: { emoji: '🍔', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    Travel: { emoji: '🚇', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    Shopping: { emoji: '🛍️', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
    Education: { emoji: '🎓', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
    Recharge: { emoji: '⚡', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    Entertainment: { emoji: '🎮', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
    Other: { emoji: '📦', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' }
};

// Realistic initial sample expenses for students & hostel residents
const INITIAL_SAMPLE_EXPENSES = [
    {
        id: 'exp-1',
        description: 'Hostel Canteen Thali',
        amount: 120,
        category: 'Food',
        date: getRelativeDate(0)
    },
    {
        id: 'exp-2',
        description: 'Monthly Metro SmartCard',
        amount: 250,
        category: 'Travel',
        date: getRelativeDate(-1)
    },
    {
        id: 'exp-3',
        description: 'Semester Notebooks & Pens',
        amount: 180,
        category: 'Education',
        date: getRelativeDate(-2)
    },
    {
        id: 'exp-4',
        description: 'Unlimited 5G Mobile Recharge',
        amount: 299,
        category: 'Recharge',
        date: getRelativeDate(-3)
    },
    {
        id: 'exp-5',
        description: 'Weekend Movie & Popcorn',
        amount: 320,
        category: 'Entertainment',
        date: getRelativeDate(-4)
    },
    {
        id: 'exp-6',
        description: 'Chai & Samosa Break',
        amount: 45,
        category: 'Food',
        date: getRelativeDate(0)
    }
];

// Helper to format ISO date offset by N days
function getRelativeDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

// -----------------------------------------------------------------------------
// 2. Application State
// -----------------------------------------------------------------------------
let expenses = [];
let pendingDeleteAction = null;

// -----------------------------------------------------------------------------
// 3. DOM Elements
// -----------------------------------------------------------------------------
const dom = {
    headerDateText: document.getElementById('headerDateText'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    totalSpendingAmount: document.getElementById('totalSpendingAmount'),
    spendingCountSummary: document.getElementById('spendingCountSummary'),
    todaySpendingAmount: document.getElementById('todaySpendingAmount'),
    todayCountText: document.getElementById('todayCountText'),
    topCategoryName: document.getElementById('topCategoryName'),
    topCategoryAmount: document.getElementById('topCategoryAmount'),
    averageSpendingAmount: document.getElementById('averageSpendingAmount'),
    
    // Form elements
    expenseForm: document.getElementById('expenseForm'),
    expenseAmount: document.getElementById('expenseAmount'),
    expenseDesc: document.getElementById('expenseDesc'),
    expenseCategory: document.getElementById('expenseCategory'),
    expenseDate: document.getElementById('expenseDate'),
    amountError: document.getElementById('amountError'),
    descError: document.getElementById('descError'),
    dateError: document.getElementById('dateError'),

    // Category breakdown
    categoryBreakdownList: document.getElementById('categoryBreakdownList'),

    // List and filters
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterCategory: document.getElementById('filterCategory'),
    sortBy: document.getElementById('sortBy'),
    transactionBadge: document.getElementById('transactionBadge'),
    expenseList: document.getElementById('expenseList'),
    emptyState: document.getElementById('emptyState'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateText: document.getElementById('emptyStateText'),
    showingResultsText: document.getElementById('showingResultsText'),
    clearAllBtn: document.getElementById('clearAllBtn'),

    // Dialog & Toasts
    toastContainer: document.getElementById('toastContainer'),
    confirmDialog: document.getElementById('confirmDialog'),
    dialogTitle: document.getElementById('dialogTitle'),
    dialogDesc: document.getElementById('dialogDesc'),
    dialogCancelBtn: document.getElementById('dialogCancelBtn'),
    dialogConfirmBtn: document.getElementById('dialogConfirmBtn'),

    // Quick add chips
    quickAddChips: document.querySelectorAll('.chip-btn')
};

// -----------------------------------------------------------------------------
// 4. Initialization
// -----------------------------------------------------------------------------
function initApp() {
    initHeaderDate();
    initDefaultFormDate();
    loadExpenses();
    setupEventListeners();
    renderAll();
}

function initHeaderDate() {
    const today = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    if (dom.headerDateText) {
        dom.headerDateText.textContent = today.toLocaleDateString('en-IN', options);
    }
}

function initDefaultFormDate() {
    if (dom.expenseDate) {
        dom.expenseDate.value = getRelativeDate(0);
    }
}

// -----------------------------------------------------------------------------
// 5. Persistence & State Functions
// -----------------------------------------------------------------------------
function loadExpenses() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        try {
            expenses = JSON.parse(rawData);
            if (!Array.isArray(expenses)) expenses = [];
        } catch (err) {
            console.error('Failed to parse expenses from localStorage:', err);
            expenses = [...INITIAL_SAMPLE_EXPENSES];
            saveExpenses();
        }
    } else {
        // Bootstrap with realistic starter data
        expenses = [...INITIAL_SAMPLE_EXPENSES];
        saveExpenses();
    }
}

function saveExpenses() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (err) {
        console.error('Failed to save to localStorage:', err);
        showToast('Storage quota exceeded or unavailable', 'danger');
    }
}

// -----------------------------------------------------------------------------
// 6. Formatting Helpers
// -----------------------------------------------------------------------------
function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: num % 1 === 0 ? 0 : 2
    }).format(num);
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return '—';
    const todayStr = getRelativeDate(0);
    const yesterdayStr = getRelativeDate(-1);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
}

// -----------------------------------------------------------------------------
// 7. Calculations & Metrics
// -----------------------------------------------------------------------------
function calculateMetrics() {
    const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalCount = expenses.length;
    const todayStr = getRelativeDate(0);

    const todayExpenses = expenses.filter(item => item.date === todayStr);
    const todayAmount = todayExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // Category breakdown
    const categoryTotals = {};
    Object.keys(CATEGORIES).forEach(cat => {
        categoryTotals[cat] = 0;
    });

    expenses.forEach(item => {
        const cat = item.category && CATEGORIES[item.category] ? item.category : 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(item.amount || 0);
    });

    // Find top category
    let topCat = '—';
    let topCatSpend = 0;
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
        if (amount > topCatSpend) {
            topCatSpend = amount;
            topCat = cat;
        }
    });

    return {
        totalAmount,
        totalCount,
        todayAmount,
        todayCount: todayExpenses.length,
        averageAmount,
        categoryTotals,
        topCat,
        topCatSpend
    };
}

// -----------------------------------------------------------------------------
// 8. Renderers
// -----------------------------------------------------------------------------
function renderAll() {
    renderKPIs();
    renderCategoryBreakdown();
    renderExpenseList();
}

function renderKPIs() {
    const metrics = calculateMetrics();

    dom.totalSpendingAmount.textContent = formatCurrency(metrics.totalAmount);
    dom.spendingCountSummary.textContent = `${metrics.totalCount} ${metrics.totalCount === 1 ? 'expense' : 'expenses'} logged`;

    dom.todaySpendingAmount.textContent = formatCurrency(metrics.todayAmount);
    dom.todayCountText.textContent = `${metrics.todayCount} ${metrics.todayCount === 1 ? 'transaction' : 'transactions'} today`;

    if (metrics.topCat !== '—' && metrics.topCatSpend > 0) {
        const catConfig = CATEGORIES[metrics.topCat];
        dom.topCategoryName.textContent = `${catConfig.emoji} ${metrics.topCat}`;
        dom.topCategoryAmount.textContent = `${formatCurrency(metrics.topCatSpend)} spent`;
    } else {
        dom.topCategoryName.textContent = '—';
        dom.topCategoryAmount.textContent = 'No expenses yet';
    }

    dom.averageSpendingAmount.textContent = formatCurrency(metrics.averageAmount);
}

function renderCategoryBreakdown() {
    const metrics = calculateMetrics();
    const total = metrics.totalAmount;
    dom.categoryBreakdownList.innerHTML = '';

    // Sort categories by highest spend first
    const sortedCats = Object.entries(metrics.categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    sortedCats.forEach(([catKey, amount]) => {
        const config = CATEGORIES[catKey];
        const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;

        const catItem = document.createElement('div');
        catItem.className = 'cat-item';
        catItem.innerHTML = `
            <div class="cat-info-row">
                <div class="cat-badge-name">
                    <span class="cat-indicator-dot" style="background-color: ${config.color}"></span>
                    <span>${config.emoji} ${catKey}</span>
                </div>
                <div class="cat-spending-val">
                    <span>${formatCurrency(amount)}</span>
                    <span class="cat-percent-tag">(${percentage}%)</span>
                </div>
            </div>
            <div class="cat-progress-track">
                <div class="cat-progress-fill" style="width: ${percentage}%; background: ${config.color}"></div>
            </div>
        `;
        dom.categoryBreakdownList.appendChild(catItem);
    });
}

function getFilteredAndSortedExpenses() {
    const searchQuery = (dom.searchInput.value || '').trim().toLowerCase();
    const categoryFilter = dom.filterCategory.value;
    const sortType = dom.sortBy.value;

    let filtered = expenses.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchQuery);
        const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Sorting
    filtered.sort((a, b) => {
        switch (sortType) {
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'amount-asc':
                return Number(a.amount) - Number(b.amount);
            case 'amount-desc':
                return Number(b.amount) - Number(a.amount);
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    return filtered;
}

function renderExpenseList() {
    const filteredExpenses = getFilteredAndSortedExpenses();
    dom.expenseList.innerHTML = '';

    const totalCount = expenses.length;
    const filteredCount = filteredExpenses.length;

    dom.transactionBadge.textContent = `${filteredCount} ${filteredCount === 1 ? 'item' : 'items'}`;

    if (totalCount === 0) {
        dom.emptyState.style.display = 'flex';
        dom.emptyStateTitle.textContent = 'No Expenses Recorded';
        dom.emptyStateText.textContent = 'Use the form or quick-add buttons to start tracking your daily expenses.';
        dom.showingResultsText.textContent = '0 total records';
        return;
    }

    if (filteredCount === 0) {
        dom.emptyState.style.display = 'flex';
        dom.emptyStateTitle.textContent = 'No Matches Found';
        dom.emptyStateText.textContent = 'Try adjusting your search query or selecting "All Categories".';
        dom.showingResultsText.textContent = `0 of ${totalCount} records`;
        return;
    }

    dom.emptyState.style.display = 'none';
    dom.showingResultsText.textContent = `Showing ${filteredCount} of ${totalCount} records`;

    // Render list items
    filteredExpenses.forEach(exp => {
        const catConfig = CATEGORIES[exp.category] || CATEGORIES['Other'];
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.dataset.id = exp.id;

        li.innerHTML = `
            <div class="expense-left-block">
                <div class="cat-pill-icon" style="background-color: ${catConfig.bg}; color: ${catConfig.color};" title="${exp.category}">
                    <span>${catConfig.emoji}</span>
                </div>
                <div class="expense-text-meta">
                    <span class="expense-desc-text" title="${escapeHtml(exp.description)}">${escapeHtml(exp.description)}</span>
                    <div class="expense-sub-meta">
                        <span class="cat-label-tag" style="background-color: ${catConfig.bg}; color: ${catConfig.color};">
                            ${exp.category}
                        </span>
                        <span>•</span>
                        <span>${formatDisplayDate(exp.date)}</span>
                    </div>
                </div>
            </div>
            <div class="expense-right-block">
                <span class="expense-amount-tag">- ${formatCurrency(exp.amount)}</span>
                <button type="button" class="expense-delete-btn" data-delete-id="${exp.id}" title="Delete expense" aria-label="Delete ${escapeHtml(exp.description)}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        dom.expenseList.appendChild(li);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// -----------------------------------------------------------------------------
// 9. Actions (Add, Delete, Quick Add, Reset)
// -----------------------------------------------------------------------------
function handleAddExpense(e) {
    e.preventDefault();

    const amountVal = parseFloat(dom.expenseAmount.value);
    const descVal = dom.expenseDesc.value.trim();
    const categoryVal = dom.expenseCategory.value;
    const dateVal = dom.expenseDate.value;

    let hasError = false;

    // Validate Amount
    if (isNaN(amountVal) || amountVal <= 0) {
        dom.expenseAmount.classList.add('is-invalid');
        dom.amountError.classList.add('visible');
        hasError = true;
    } else {
        dom.expenseAmount.classList.remove('is-invalid');
        dom.amountError.classList.remove('visible');
    }

    // Validate Description
    if (!descVal) {
        dom.expenseDesc.classList.add('is-invalid');
        dom.descError.classList.add('visible');
        hasError = true;
    } else {
        dom.expenseDesc.classList.remove('is-invalid');
        dom.descError.classList.remove('visible');
    }

    // Validate Date
    if (!dateVal) {
        dom.expenseDate.classList.add('is-invalid');
        dom.dateError.classList.add('visible');
        hasError = true;
    } else {
        dom.expenseDate.classList.remove('is-invalid');
        dom.dateError.classList.remove('visible');
    }

    if (hasError) return;

    // Create new expense object
    const newExpense = {
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        description: descVal,
        amount: amountVal,
        category: categoryVal,
        date: dateVal
    };

    // Insert at beginning
    expenses.unshift(newExpense);
    saveExpenses();

    // Reset Form fields
    dom.expenseForm.reset();
    initDefaultFormDate();
    dom.expenseAmount.focus();

    renderAll();
    showToast(`Added "${newExpense.description}" (${formatCurrency(newExpense.amount)})`, 'success');
}

function handleQuickAdd(btn) {
    const amount = parseFloat(btn.dataset.amount);
    const desc = btn.dataset.desc;
    const category = btn.dataset.category;
    const date = getRelativeDate(0);

    const newExpense = {
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        description: desc,
        amount: amount,
        category: category,
        date: date
    };

    expenses.unshift(newExpense);
    saveExpenses();
    renderAll();
    showToast(`Quick added "${desc}" (${formatCurrency(amount)})`, 'success');
}

function handleDeleteExpense(id) {
    const target = expenses.find(item => item.id === id);
    if (!target) return;

    const removedItem = target;
    expenses = expenses.filter(item => item.id !== id);
    saveExpenses();
    renderAll();

    // Toast with Undo capability
    showToast(`Deleted "${removedItem.description}"`, 'info', {
        actionText: 'Undo',
        onAction: () => {
            expenses.unshift(removedItem);
            saveExpenses();
            renderAll();
            showToast(`Restored "${removedItem.description}"`, 'success');
        }
    });
}

function handleResetData() {
    openConfirmDialog(
        'Reset to Demo Data?',
        'This will replace your current records with the standard student starter expenses.',
        () => {
            expenses = JSON.parse(JSON.stringify(INITIAL_SAMPLE_EXPENSES));
            saveExpenses();
            renderAll();
            showToast('Sample expenses reloaded', 'info');
        }
    );
}

function handleClearAll() {
    if (expenses.length === 0) {
        showToast('Expense list is already empty', 'info');
        return;
    }

    openConfirmDialog(
        'Clear All Expenses?',
        'This will permanently erase all logged transactions from browser storage.',
        () => {
            expenses = [];
            saveExpenses();
            renderAll();
            showToast('All expenses cleared', 'danger');
        }
    );
}

// -----------------------------------------------------------------------------
// 10. Dialog & Toast Utilities
// -----------------------------------------------------------------------------
function openConfirmDialog(title, desc, onConfirm) {
    dom.dialogTitle.textContent = title;
    dom.dialogDesc.textContent = desc;
    pendingDeleteAction = onConfirm;
    
    if (typeof dom.confirmDialog.showModal === 'function') {
        dom.confirmDialog.showModal();
    } else {
        if (confirm(`${title}\n${desc}`)) {
            if (onConfirm) onConfirm();
        }
    }
}

function closeConfirmDialog() {
    if (typeof dom.confirmDialog.close === 'function') {
        dom.confirmDialog.close();
    }
    pendingDeleteAction = null;
}

function showToast(message, type = 'info', action = null) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    if (action && action.actionText && action.onAction) {
        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'btn-secondary btn-sm';
        actionBtn.style.marginLeft = '0.5rem';
        actionBtn.textContent = action.actionText;
        actionBtn.onclick = () => {
            action.onAction();
            removeToast(toast);
        };
        toast.appendChild(actionBtn);
    }

    dom.toastContainer.appendChild(toast);

    const timer = setTimeout(() => {
        removeToast(toast);
    }, 3800);

    toast.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            clearTimeout(timer);
            removeToast(toast);
        }
    });
}

function removeToast(toast) {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    });
}

// -----------------------------------------------------------------------------
// 11. Event Listeners
// -----------------------------------------------------------------------------
function setupEventListeners() {
    // Expense Form submit
    dom.expenseForm.addEventListener('submit', handleAddExpense);

    // Quick add chips
    dom.quickAddChips.forEach(chip => {
        chip.addEventListener('click', () => handleQuickAdd(chip));
    });

    // Reset Data button
    if (dom.resetDataBtn) {
        dom.resetDataBtn.addEventListener('click', handleResetData);
    }

    // Clear All button
    if (dom.clearAllBtn) {
        dom.clearAllBtn.addEventListener('click', handleClearAll);
    }

    // Modal buttons
    dom.dialogCancelBtn.addEventListener('click', closeConfirmDialog);
    dom.dialogConfirmBtn.addEventListener('click', () => {
        if (typeof pendingDeleteAction === 'function') {
            pendingDeleteAction();
        }
        closeConfirmDialog();
    });

    // Delegated delete expense event
    dom.expenseList.addEventListener('click', (e) => {
        const delBtn = e.target.closest('[data-delete-id]');
        if (delBtn) {
            const expId = delBtn.getAttribute('data-delete-id');
            handleDeleteExpense(expId);
        }
    });

    // Search and filter triggers
    dom.searchInput.addEventListener('input', () => {
        if (dom.searchInput.value.trim().length > 0) {
            dom.clearSearchBtn.style.display = 'block';
        } else {
            dom.clearSearchBtn.style.display = 'none';
        }
        renderExpenseList();
    });

    dom.clearSearchBtn.addEventListener('click', () => {
        dom.searchInput.value = '';
        dom.clearSearchBtn.style.display = 'none';
        dom.searchInput.focus();
        renderExpenseList();
    });

    dom.filterCategory.addEventListener('change', renderExpenseList);
    dom.sortBy.addEventListener('change', renderExpenseList);

    // Input error clear on user typing
    dom.expenseAmount.addEventListener('input', () => {
        dom.expenseAmount.classList.remove('is-invalid');
        dom.amountError.classList.remove('visible');
    });

    dom.expenseDesc.addEventListener('input', () => {
        dom.expenseDesc.classList.remove('is-invalid');
        dom.descError.classList.remove('visible');
    });
}

// -----------------------------------------------------------------------------
// 12. Run on DOM Loaded
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp);
