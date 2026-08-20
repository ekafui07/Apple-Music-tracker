// Apple Music Subscription Plans and Currency Configuration

export const APPLE_MUSIC_PLANS = [
  { id: 'plan-1', name: 'Individual Plan', defaultPrice: 20.00, description: '1 Account • Lossless & Spatial Audio', color: '#fa233b' },
  { id: 'plan-2', name: 'Family Plan', defaultPrice: 35.00, description: 'Up to 6 Accounts • Personal Music Libraries', color: '#e63946' },
  { id: 'plan-3', name: 'Student Plan', defaultPrice: 10.00, description: 'Student Discount Plan', color: '#ff4d6d' },
  { id: 'plan-4', name: 'Apple One Bundle', defaultPrice: 50.00, description: 'Music, TV+, Arcade & iCloud Storage', color: '#c9184a' },
  { id: 'plan-5', name: 'Custom Tier', defaultPrice: 25.00, description: 'Custom negotiated rate plan', color: '#8b5cf6' }
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
