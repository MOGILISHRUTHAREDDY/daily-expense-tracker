require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite Connection
const db = new sqlite3.Database(path.join(__dirname, 'expense_tracker.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database successfully.');
        // Ensure the table exists
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL
        )`);
    }
});

// API Routes

// Get all expenses
app.get('/api/expenses', (req, res) => {
    const query = 'SELECT * FROM expenses ORDER BY date DESC';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching expenses:', err);
            return res.status(500).json({ error: 'Failed to fetch expenses' });
        }
        res.json(rows);
    });
});

// Add a new expense
app.post('/api/expenses', (req, res) => {
    const { description, amount, category, date } = req.body;
    
    if (!description || !amount || !category || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)';
    db.run(query, [description, amount, category, date], function(err) {
        if (err) {
            console.error('Error adding expense:', err);
            return res.status(500).json({ error: 'Failed to add expense' });
        }
        res.status(201).json({ 
            id: this.lastID,
            description,
            amount,
            category,
            date
        });
    });
});

// Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM expenses WHERE id = ?';
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Error deleting expense:', err);
            return res.status(500).json({ error: 'Failed to delete expense' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
