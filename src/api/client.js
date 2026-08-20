// Front-end REST API Client for Apple Music PayTrack Backend Server

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
}

export async function requestResetOTP(email) {
  const res = await fetch(`${API_BASE}/api/auth/request-reset-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send verification code');
  }
  return data;
}

export async function verifyResetOTP(email, code) {
  const res = await fetch(`${API_BASE}/api/auth/verify-reset-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid verification code');
  }
  return data;
}

export async function resetAdminPassword(email, newPassword, code) {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword, code })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Password reset failed');
  }
  return data;
}

export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/api/customers`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch subscribers');
  }
  return data;
}

export async function createCustomer(customerData) {
  const res = await fetch(`${API_BASE}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register subscriber');
  }
  return data;
}

export async function updateCustomer(id, updatedData) {
  const res = await fetch(`${API_BASE}/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update subscriber');
  }
  return data;
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_BASE}/api/customers/${id}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete subscriber');
  }
  return data;
}

export async function markCustomerPaid(id) {
  const res = await fetch(`${API_BASE}/api/customers/${id}/mark-paid`, {
    method: 'POST'
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to record payment');
  }
  return data;
}

export async function sendCustomerEmail(id, subject, message) {
  const res = await fetch(`${API_BASE}/api/customers/${id}/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, message })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send email notice');
  }
  return data;
}
