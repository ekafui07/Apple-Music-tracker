import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

import * as dynamoAdapter from './src/api/dbServerless.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isDynamoDB = process.env.USE_DYNAMODB === 'true';

app.use(cors());
app.use(express.json());

// SQLite Database Setup for Local Dev
let db = null;
if (!isDynamoDB) {
  const dbPath = path.join(__dirname, 'database.sqlite');
  db = new Database(dbPath);
  console.log(`[SQLite] Connected to local database at: ${dbPath}`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      plan TEXT NOT NULL,
      amount REAL NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL,
      paymentMethod TEXT NOT NULL DEFAULT 'Mobile Money',
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_history (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(customerId) REFERENCES customers(id) ON DELETE CASCADE
    );
  `);

  const AUTHORIZED_EMAILS = ['edwingligah124@gmail.com', 'gligahedwin@icloud.com'];
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount === 0) {
    const insertAdmin = db.prepare('INSERT INTO admins (email, password) VALUES (?, ?)');
    AUTHORIZED_EMAILS.forEach(email => {
      insertAdmin.run(email.toLowerCase(), 'password123');
    });
  }
} else {
  console.log('[AWS DynamoDB] Running in Serverless Mode with Amazon DynamoDB database.');
}

const AUTHORIZED_EMAILS = ['edwingligah124@gmail.com', 'gligahedwin@icloud.com'];

// ----------------------------------------------------
// REST API ENDPOINTS (Dual Engine: DynamoDB & SQLite)
// ----------------------------------------------------

// 1. Admin Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const isAuthorized = AUTHORIZED_EMAILS.some(a => a.toLowerCase() === cleanEmail);
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Access denied. Email is not authorized as admin.' });
  }

  if (isDynamoDB) {
    try {
      const admin = await dynamoAdapter.getAdminByEmail(cleanEmail);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
      return res.json({ success: true, user: { email: admin.email, name: 'Admin Manager' } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(cleanEmail);
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid password.' });
    }
    return res.json({ success: true, user: { email: admin.email, name: 'Admin Manager' } });
  }
});

// 2. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const isAuthorized = AUTHORIZED_EMAILS.some(a => a.toLowerCase() === cleanEmail);
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Email address not authorized.' });
  }

  if (isDynamoDB) {
    try {
      await dynamoAdapter.setAdminPassword(cleanEmail, newPassword);
      return res.json({ success: true, message: 'Password updated in DynamoDB.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(cleanEmail);
    if (admin) {
      db.prepare('UPDATE admins SET password = ? WHERE email = ?').run(newPassword, cleanEmail);
    } else {
      db.prepare('INSERT INTO admins (email, password) VALUES (?, ?)').run(cleanEmail, newPassword);
    }
    return res.json({ success: true, message: 'Password updated in SQLite.' });
  }
});

// 3. Get All Subscribers + History
app.get('/api/customers', async (req, res) => {
  if (isDynamoDB) {
    try {
      const customers = await dynamoAdapter.getAllCustomersWithHistory();
      return res.json(customers);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const customers = db.prepare('SELECT * FROM customers ORDER BY datetime(createdAt) DESC').all();
    const getHistory = db.prepare('SELECT * FROM payment_history WHERE customerId = ? ORDER BY datetime(date) DESC');
    const result = customers.map(c => ({ ...c, history: getHistory.all(c.id) }));
    return res.json(result);
  }
});

// 4. Register Subscriber
app.post('/api/customers', async (req, res) => {
  const { name, phone, email, plan, amount, dueDate, paymentMethod, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Subscriber name and phone are required.' });
  }

  if (isDynamoDB) {
    try {
      const created = await dynamoAdapter.createCustomerInDynamo(req.body);
      return res.json(created);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const id = `cust-${Date.now()}`;
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO customers (id, name, phone, email, plan, amount, dueDate, status, paymentMethod, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, phone, email || '', plan || 'Individual Plan', parseFloat(amount) || 20.0, dueDate, 'Active', paymentMethod || 'Mobile Money', notes || '', createdAt);

    db.prepare(`
      INSERT INTO payment_history (id, customerId, date, amount, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(`hist-${Date.now()}`, id, new Date().toISOString().split('T')[0], parseFloat(amount) || 20.0, 'Registered');

    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    newCustomer.history = db.prepare('SELECT * FROM payment_history WHERE customerId = ?').all(id);
    return res.json(newCustomer);
  }
});

// 5. Update Subscriber
app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;

  if (isDynamoDB) {
    try {
      const updated = await dynamoAdapter.updateCustomerInDynamo(id, req.body);
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const { name, phone, email, plan, amount, dueDate, status, notes } = req.body;
    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Subscriber not found.' });

    db.prepare(`
      UPDATE customers 
      SET name = ?, phone = ?, email = ?, plan = ?, amount = ?, dueDate = ?, status = ?, notes = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      phone || existing.phone,
      email !== undefined ? email : existing.email,
      plan || existing.plan,
      amount !== undefined ? parseFloat(amount) : existing.amount,
      dueDate || existing.dueDate,
      status || existing.status,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    updated.history = db.prepare('SELECT * FROM payment_history WHERE customerId = ? ORDER BY datetime(date) DESC').all(id);
    return res.json(updated);
  }
});

// 6. Delete Subscriber
app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;

  if (isDynamoDB) {
    try {
      await dynamoAdapter.deleteCustomerFromDynamo(id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Subscriber not found.' });
    db.prepare('DELETE FROM payment_history WHERE customerId = ?').run(id);
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    return res.json({ success: true });
  }
});

// 7. Mark Paid
app.post('/api/customers/:id/mark-paid', async (req, res) => {
  const { id } = req.params;

  if (isDynamoDB) {
    try {
      const updated = await dynamoAdapter.recordPaymentInDynamo(id);
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) return res.status(404).json({ error: 'Subscriber not found.' });

    const curDate = new Date(customer.dueDate || Date.now());
    curDate.setMonth(curDate.getMonth() + 1);
    const nextDueDate = curDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO payment_history (id, customerId, date, amount, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(`hist-${Date.now()}`, id, today, customer.amount, 'Paid');

    db.prepare(`
      UPDATE customers SET status = 'Active', dueDate = ? WHERE id = ?
    `).run(nextDueDate, id);

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    updated.history = db.prepare('SELECT * FROM payment_history WHERE customerId = ? ORDER BY datetime(date) DESC').all(id);
    return res.json(updated);
  }
});

// 8. Send Email
app.post('/api/customers/:id/send-email', async (req, res) => {
  const { id } = req.params;
  const { subject, message } = req.body;

  if (isDynamoDB) {
    try {
      await dynamoAdapter.logEmailInDynamo(id, subject, message);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) return res.status(404).json({ error: 'Subscriber not found.' });
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO payment_history (id, customerId, date, amount, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(`hist-${Date.now()}`, id, today, customer.amount, 'Email Sent');
    return res.json({ success: true });
  }
});

export default app;

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Apple Music PayTrack Server running on Port ${PORT}`);
    console.log(`====================================================`);
  });
}
