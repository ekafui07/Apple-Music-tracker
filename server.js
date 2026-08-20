import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

import * as dynamoAdapter from './src/api/dbServerless.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isDynamoDB = process.env.USE_DYNAMODB === 'true';

// Resend Email Client
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = new Resend(RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// In-Memory OTP Store (Email -> { code, expiresAt })
const otpStore = new Map();

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
// REST API ENDPOINTS
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

// 2. Request Password Reset 6-Digit OTP Email
app.post('/api/auth/request-reset-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const isAuthorized = AUTHORIZED_EMAILS.some(a => a.toLowerCase() === cleanEmail);
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Email address is not recognized as an authorized admin.' });
  }

  // Generate secure 6-digit random verification OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, { code: otpCode, expiresAt });

  try {
    // Send Real Email via Resend API
    await resend.emails.send({
      from: 'Apple Music PayTrack <onboarding@resend.dev>',
      to: [cleanEmail],
      subject: '🔐 Apple Music PayTrack - Your 6-Digit Verification Code',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 40px 20px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1f2937;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #fa233b; padding: 12px 18px; border-radius: 14px; color: #ffffff; font-weight: bold; font-size: 20px;">
              🎵 PayTrack Pro
            </div>
            <h2 style="color: #ffffff; font-size: 22px; margin-top: 16px; font-weight: 800;">Verification Code</h2>
            <p style="color: #9ca3af; font-size: 13px;">Use the 6-digit security code below to reset your admin portal password.</p>
          </div>

          <div style="background-color: #11121a; border: 1px solid #374151; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #fa233b; font-mono: monospace;">
              ${otpCode}
            </span>
            <p style="color: #6b7280; font-size: 11px; margin-top: 8px;">Code expires in 10 minutes.</p>
          </div>

          <p style="color: #6b7280; font-size: 11px; text-align: center;">
            If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `
    });

    console.log(`[Resend Email] Dispatched 6-digit OTP code to ${cleanEmail}`);
    return res.json({ success: true, message: `Verification code sent to ${cleanEmail}` });
  } catch (err) {
    console.error('[Resend Error]', err);
    return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
  }
});

// 3. Verify 6-Digit Reset OTP Code
app.post('/api/auth/verify-reset-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const storedOTP = otpStore.get(cleanEmail);

  if (!storedOTP) {
    return res.status(400).json({ error: 'No verification code requested or code has expired.' });
  }

  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  if (storedOTP.code !== code.trim()) {
    return res.status(400).json({ error: 'Invalid verification code. Please check your inbox.' });
  }

  return res.json({ success: true, message: 'Verification code verified successfully.' });
});

// 4. Save New Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword, code } = req.body;
  if (!email || !newPassword || !code) {
    return res.status(400).json({ error: 'Email, new password, and verification code are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const storedOTP = otpStore.get(cleanEmail);

  if (!storedOTP || storedOTP.code !== code.trim()) {
    return res.status(400).json({ error: 'Unauthorized reset request or invalid code.' });
  }

  if (isDynamoDB) {
    try {
      await dynamoAdapter.setAdminPassword(cleanEmail, newPassword);
      otpStore.delete(cleanEmail);
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
    otpStore.delete(cleanEmail);
    return res.json({ success: true, message: 'Password updated in SQLite.' });
  }
});

// 5. Get All Subscribers + History
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

// 6. Register Subscriber
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

// 7. Update Subscriber
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

// 8. Delete Subscriber
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

// 9. Mark Paid
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

// 10. Send Email to Subscriber
app.post('/api/customers/:id/send-email', async (req, res) => {
  const { id } = req.params;
  const { subject, message } = req.body;

  let customer = null;
  if (isDynamoDB) {
    customer = await dynamoAdapter.getCustomerById(id);
  } else {
    customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  }

  if (!customer) return res.status(404).json({ error: 'Subscriber not found.' });

  try {
    if (customer.email) {
      await resend.emails.send({
        from: 'Apple Music PayTrack <onboarding@resend.dev>',
        to: [customer.email],
        subject: subject || 'Apple Music Subscription Update',
        html: `<div style="font-family: sans-serif; padding: 20px;">${message.replace(/\n/g, '<br/>')}</div>`
      });
    }

    if (isDynamoDB) {
      await dynamoAdapter.logEmailInDynamo(id, subject, message);
    } else {
      const today = new Date().toISOString().split('T')[0];
      db.prepare(`
        INSERT INTO payment_history (id, customerId, date, amount, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(`hist-${Date.now()}`, id, today, customer.amount, 'Email Sent');
    }

    return res.json({ success: true, message: `Email sent to ${customer.name}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
