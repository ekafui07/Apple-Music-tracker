import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

import * as dynamoAdapter from './src/api/dbServerless.js';
import { sendEmailViaSes } from './src/api/awsSesHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isDynamoDB = process.env.USE_DYNAMODB === 'true';

// Resend Email Client Backup
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = new Resend(RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// In-Memory OTP Store (Email -> { code, expiresAt })
const otpStore = new Map();

// Helper to dispatch email via Amazon SES (Native AWS) with fallback to Resend API
async function dispatchEmail({ to, subject, htmlBody }) {
  if (process.env.USE_AWS_SES === 'true') {
    try {
      console.log(`[Amazon SES] Attempting to send native AWS email to ${to}...`);
      await sendEmailViaSes({ to, subject, htmlBody });
      return { success: true, provider: 'Amazon SES' };
    } catch (sesErr) {
      console.warn('[Amazon SES Warning] Falling back to Resend API:', sesErr.message);
    }
  }

  // Fallback / Resend API
  if (RESEND_API_KEY) {
    await resend.emails.send({
      from: 'Apple Music PayTrack <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html: htmlBody
    });
    return { success: true, provider: 'Resend API' };
  }

  throw new Error('No active email provider available (Amazon SES or Resend).');
}

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
      autoReminders INTEGER DEFAULT 1,
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
// AUTOMATED EMAIL CRON SCHEDULER ENGINE
// ----------------------------------------------------
export async function runAutomatedEmailCron() {
  console.log('[Automated Email Scheduler] Checking subscriber due dates...');
  let subscribers = [];

  if (isDynamoDB) {
    subscribers = await dynamoAdapter.getAllCustomersWithHistory();
  } else {
    subscribers = db.prepare('SELECT * FROM customers WHERE status != "Cancelled"').all();
  }

  const today = new Date();
  let dispatchedCount = 0;
  const dispatchedLogs = [];

  for (const c of subscribers) {
    if (!c.email) continue;

    const due = new Date(c.dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 3 || diffDays <= 0) {
      const isOverdue = diffDays <= 0;
      const subject = isOverdue 
        ? `⚠️ Urgent: Apple Music Subscription Overdue for ${c.name}`
        : `🎵 Reminder: Apple Music Subscription Due in 3 Days`;

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 32px 20px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1f2937;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: #fa233b; color: white; padding: 8px 16px; border-radius: 12px; font-weight: bold; font-size: 16px;">
              🎵 Apple Music PayTrack
            </span>
            <h2 style="color: white; margin-top: 16px; font-size: 20px;">Hi ${c.name},</h2>
            <p style="color: #9ca3af; font-size: 13px;">
              ${isOverdue 
                ? `Your Apple Music <strong>${c.plan}</strong> subscription payment was due on <strong>${c.dueDate}</strong>.`
                : `Your Apple Music <strong>${c.plan}</strong> subscription is due for renewal on <strong>${c.dueDate}</strong>.`}
            </p>
          </div>

          <div style="background: #11121a; border: 1px solid #374151; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
              <span style="color: #9ca3af;">Subscription Plan:</span>
              <strong style="color: #fa233b;">${c.plan}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
              <span style="color: #9ca3af;">Set Monthly Fee:</span>
              <strong style="color: #ffffff;">₵${c.amount.toFixed(2)} / mo</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: #9ca3af;">Payment Method:</span>
              <strong style="color: #10b981;">Mobile Money (${c.phone})</strong>
            </div>
          </div>

          <p style="color: #d1d5db; font-size: 12px; line-height: 1.5; text-align: center;">
            Please send Mobile Money payment to <strong>${c.phone}</strong> to keep your Apple Music features active.
          </p>
        </div>
      `;

      try {
        await dispatchEmail({ to: c.email, subject, htmlBody });
        dispatchedCount++;
        dispatchedLogs.push({ customer: c.name, email: c.email, type: isOverdue ? 'Overdue' : 'Reminder 3D' });

        if (isDynamoDB) {
          await dynamoAdapter.logEmailInDynamo(c.id, subject, 'Automated scheduled email dispatched');
        } else {
          db.prepare(`
            INSERT INTO payment_history (id, customerId, date, amount, status)
            VALUES (?, ?, ?, ?, ?)
          `).run(`hist-${Date.now()}`, c.id, new Date().toISOString().split('T')[0], c.amount, 'Auto Email Sent');
        }
      } catch (err) {
        console.error(`[Cron Email Error] Failed sending email to ${c.name}:`, err);
      }
    }
  }

  return { success: true, dispatchedCount, logs: dispatchedLogs };
}

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

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(cleanEmail, { code: otpCode, expiresAt });

  const htmlBody = `
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
  `;

  try {
    await dispatchEmail({
      to: cleanEmail,
      subject: '🔐 Apple Music PayTrack - Your 6-Digit Verification Code',
      htmlBody
    });

    console.log(`[Email Dispatch] Sent 6-digit OTP code to ${cleanEmail}`);
    return res.json({ success: true, message: `Verification code sent to ${cleanEmail}` });
  } catch (err) {
    console.error('[Email Dispatch Error]', err);
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

// 5. Trigger Automated Email Reminders Manually
app.post('/api/cron/trigger-reminders', async (req, res) => {
  try {
    const result = await runAutomatedEmailCron();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Get All Subscribers + History
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

// 7. Register Subscriber
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

// 8. Update Subscriber
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

// 9. Delete Subscriber
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

// 10. Mark Paid
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

// 11. Send Email to Subscriber
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
    const htmlBody = `<div style="font-family: sans-serif; padding: 20px;">${message.replace(/\n/g, '<br/>')}</div>`;
    if (customer.email) {
      await dispatchEmail({ to: customer.email, subject: subject || 'Apple Music Subscription Update', htmlBody });
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
