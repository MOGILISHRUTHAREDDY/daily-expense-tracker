document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalBalanceEl = document.getElementById('total-balance');
    const loadingEl = document.getElementById('loading');
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();

    const getLocalExpenses = () => {
        const stored = localStorage.getItem('expenses');
        return stored ? JSON.parse(stored) : [];
    };

    const saveLocalExpenses = (expenses) => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    };

    const fetchExpenses = () => {
        try {
            const expenses = getLocalExpenses();
            // Sort by date DESC
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderExpenses(expenses);
        } catch (error) {
            console.error(error);
            loadingEl.textContent = 'Error loading expenses.';
            loadingEl.style.color = 'var(--danger)';
        }
    };

    const renderExpenses = (expenses) => {
        loadingEl.style.display = 'none';
        expenseList.innerHTML = '';
        
        if (expenses.length === 0) {
            expenseList.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">No expenses found. Start tracking!</td>
                </tr>
            `;
            totalBalanceEl.textContent = '₹0.00';
            return;
        }

        let total = 0;

        expenses.forEach((expense, index) => {
            total += parseFloat(expense.amount);
            
            const tr = document.createElement('tr');
            tr.className = 'fade-in';
            tr.style.animationDelay = `${Math.min(index * 0.05, 1)}s`;
            
            // Format date correctly
            const dateObj = new Date(expense.date);
            const dateStr = !isNaN(dateObj) ? dateObj.toLocaleDateString() : expense.date;

            tr.innerHTML = `
                <td>${dateStr}</td>
                <td><strong>${escapeHTML(expense.description)}</strong></td>
                <td><span class="badge">${escapeHTML(expense.category)}</span></td>
                <td class="amount">₹${parseFloat(expense.amount).toFixed(2)}</td>
                <td>
                    <button class="btn-delete" data-id="${expense.id}" aria-label="Delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;

            expenseList.appendChild(tr);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this expense?')) {
                    deleteExpense(id);
                }
            });
        });

        // Update total
        totalBalanceEl.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const addExpense = (e) => {
        e.preventDefault();
        
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        const newExpense = { 
            id: Date.now().toString(),
            description, 
            amount, 
            category, 
            date 
        };

        try {
            const expenses = getLocalExpenses();
            expenses.push(newExpense);
            saveLocalExpenses(expenses);
            
            expenseForm.reset();
            document.getElementById('date').valueAsDate = new Date(); // Reset date to today
            fetchExpenses();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add expense.');
        }
    };

    const deleteExpense = (id) => {
        try {
            let expenses = getLocalExpenses();
            expenses = expenses.filter(exp => exp.id !== String(id));
            saveLocalExpenses(expenses);
            fetchExpenses();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete expense.');
        }
    };

    // Helper to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    expenseForm.addEventListener('submit', addExpense);
    
    // Initial fetch
    fetchExpenses();
});
