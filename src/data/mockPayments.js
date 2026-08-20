export const APPLE_MUSIC_PLANS = [
  { id: 'plan-1', name: 'Individual Plan', defaultPrice: 20.00, description: '1 Account • Lossless & Spatial Audio', color: '#fa233b' },
  { id: 'plan-2', name: 'Family Plan', defaultPrice: 35.00, description: 'Up to 6 Accounts • Personal Music Libraries', color: '#e63946' },
  { id: 'plan-3', name: 'Student Plan', defaultPrice: 10.00, description: 'Student Discount Plan', color: '#ff4d6d' },
  { id: 'plan-4', name: 'Apple One Bundle', defaultPrice: 50.00, description: 'Music, TV+, Arcade & iCloud Storage', color: '#c9184a' },
  { id: 'plan-5', name: 'Custom Tier', defaultPrice: 25.00, description: 'Custom negotiated rate plan', color: '#8b5cf6' }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Alex Rivera',
    phone: '+233 24 234 5678',
    email: 'alex.rivera@gmail.com',
    plan: 'Family Plan',
    amount: 35.00,
    dueDate: '2026-08-22',
    status: 'Due Soon',
    paymentMethod: 'Mobile Money',
    notes: 'Primary account manager for family slots',
    history: [
      { date: '2026-07-22', amount: 35.00, status: 'Paid' }
    ]
  },
  {
    id: 'cust-2',
    name: 'Sarah Chen',
    phone: '+233 55 876 5432',
    email: 'sarah.chen@techcorp.io',
    plan: 'Individual Plan',
    amount: 20.00,
    dueDate: '2026-08-18',
    status: 'Overdue',
    paymentMethod: 'Mobile Money',
    notes: 'Requested WhatsApp Mobile Money reminder',
    history: [
      { date: '2026-07-18', amount: 20.00, status: 'Paid' }
    ]
  },
  {
    id: 'cust-3',
    name: 'dady yo',
    phone: '0202995668',
    email: 'delvin@gmail.com',
    plan: 'Individual Plan',
    amount: 25.00,
    dueDate: '2026-09-19',
    status: 'Active',
    paymentMethod: 'Mobile Money',
    notes: 'Custom negotiated rate',
    history: [
      { date: '2026-08-19', amount: 25.00, status: 'Paid' }
    ]
  },
  {
    id: 'cust-4',
    name: 'Marcus Johnson',
    phone: '+233 20 345 6789',
    email: 'marcus.j@designstudio.com',
    plan: 'Apple One Bundle',
    amount: 50.00,
    dueDate: '2026-08-28',
    status: 'Active',
    paymentMethod: 'Mobile Money',
    notes: 'Custom bundle pricing',
    history: [
      { date: '2026-07-28', amount: 50.00, status: 'Paid' }
    ]
  },
  {
    id: 'cust-5',
    name: 'Emily Watson',
    phone: '+233 24 901 2345',
    email: 'emily.w@university.edu',
    plan: 'Student Plan',
    amount: 10.00,
    dueDate: '2026-09-02',
    status: 'Active',
    paymentMethod: 'Mobile Money',
    notes: 'Student discount rate',
    history: [
      { date: '2026-08-02', amount: 10.00, status: 'Paid' }
    ]
  }
];

export const PAYMENT_METHODS = [
  'Mobile Money'
];

export const CURRENCIES = [
  { code: 'GHS', symbol: '₵', rate: 1.0, label: 'GHS (₵)' },
  { code: 'USD', symbol: '$', rate: 0.065, label: 'USD ($)' },
  { code: 'EUR', symbol: '€', rate: 0.060, label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', rate: 0.051, label: 'GBP (£)' }
];
