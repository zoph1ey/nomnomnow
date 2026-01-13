// Currency configuration for international price display

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  // Price thresholds for each level (in local currency)
  // Level 1: under threshold[0], Level 2: threshold[0]-threshold[1], etc.
  thresholds: [number, number, number]  // [budget max, moderate max, pricey max]
  labels: [string, string, string, string]  // descriptions for each level
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  // North America
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    thresholds: [10, 25, 50],
    labels: ['Budget (under $10)', 'Moderate ($10-25)', 'Pricey ($25-50)', 'Splurge ($50+)']
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    thresholds: [15, 35, 70],
    labels: ['Budget (under C$15)', 'Moderate (C$15-35)', 'Pricey (C$35-70)', 'Splurge (C$70+)']
  },
  MXN: {
    code: 'MXN',
    symbol: 'MX$',
    name: 'Mexican Peso',
    thresholds: [150, 400, 800],
    labels: ['Budget (under MX$150)', 'Moderate (MX$150-400)', 'Pricey (MX$400-800)', 'Splurge (MX$800+)']
  },

  // South America
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    thresholds: [40, 100, 200],
    labels: ['Budget (under R$40)', 'Moderate (R$40-100)', 'Pricey (R$100-200)', 'Splurge (R$200+)']
  },
  ARS: {
    code: 'ARS',
    symbol: 'AR$',
    name: 'Argentine Peso',
    thresholds: [5000, 15000, 30000],
    labels: ['Budget (under AR$5000)', 'Moderate (AR$5000-15000)', 'Pricey (AR$15000-30000)', 'Splurge (AR$30000+)']
  },
  CLP: {
    code: 'CLP',
    symbol: 'CL$',
    name: 'Chilean Peso',
    thresholds: [8000, 20000, 40000],
    labels: ['Budget (under CL$8000)', 'Moderate (CL$8000-20000)', 'Pricey (CL$20000-40000)', 'Splurge (CL$40000+)']
  },
  COP: {
    code: 'COP',
    symbol: 'CO$',
    name: 'Colombian Peso',
    thresholds: [25000, 60000, 120000],
    labels: ['Budget (under CO$25000)', 'Moderate (CO$25000-60000)', 'Pricey (CO$60000-120000)', 'Splurge (CO$120000+)']
  },
  PEN: {
    code: 'PEN',
    symbol: 'S/',
    name: 'Peruvian Sol',
    thresholds: [25, 60, 120],
    labels: ['Budget (under S/25)', 'Moderate (S/25-60)', 'Pricey (S/60-120)', 'Splurge (S/120+)']
  },

  // Europe
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    thresholds: [10, 25, 50],
    labels: ['Budget (under €10)', 'Moderate (€10-25)', 'Pricey (€25-50)', 'Splurge (€50+)']
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    thresholds: [8, 20, 40],
    labels: ['Budget (under £8)', 'Moderate (£8-20)', 'Pricey (£20-40)', 'Splurge (£40+)']
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    thresholds: [15, 35, 70],
    labels: ['Budget (under CHF15)', 'Moderate (CHF15-35)', 'Pricey (CHF35-70)', 'Splurge (CHF70+)']
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    thresholds: [100, 250, 500],
    labels: ['Budget (under 100kr)', 'Moderate (100-250kr)', 'Pricey (250-500kr)', 'Splurge (500kr+)']
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    thresholds: [120, 300, 600],
    labels: ['Budget (under 120kr)', 'Moderate (120-300kr)', 'Pricey (300-600kr)', 'Splurge (600kr+)']
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    thresholds: [80, 200, 400],
    labels: ['Budget (under 80kr)', 'Moderate (80-200kr)', 'Pricey (200-400kr)', 'Splurge (400kr+)']
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish Zloty',
    thresholds: [35, 80, 160],
    labels: ['Budget (under 35zł)', 'Moderate (35-80zł)', 'Pricey (80-160zł)', 'Splurge (160zł+)']
  },
  CZK: {
    code: 'CZK',
    symbol: 'Kč',
    name: 'Czech Koruna',
    thresholds: [200, 500, 1000],
    labels: ['Budget (under 200Kč)', 'Moderate (200-500Kč)', 'Pricey (500-1000Kč)', 'Splurge (1000Kč+)']
  },
  HUF: {
    code: 'HUF',
    symbol: 'Ft',
    name: 'Hungarian Forint',
    thresholds: [3000, 8000, 15000],
    labels: ['Budget (under 3000Ft)', 'Moderate (3000-8000Ft)', 'Pricey (8000-15000Ft)', 'Splurge (15000Ft+)']
  },
  RON: {
    code: 'RON',
    symbol: 'lei',
    name: 'Romanian Leu',
    thresholds: [40, 100, 200],
    labels: ['Budget (under 40 lei)', 'Moderate (40-100 lei)', 'Pricey (100-200 lei)', 'Splurge (200 lei+)']
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    thresholds: [200, 500, 1000],
    labels: ['Budget (under ₺200)', 'Moderate (₺200-500)', 'Pricey (₺500-1000)', 'Splurge (₺1000+)']
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble',
    thresholds: [500, 1500, 3000],
    labels: ['Budget (under ₽500)', 'Moderate (₽500-1500)', 'Pricey (₽1500-3000)', 'Splurge (₽3000+)']
  },
  UAH: {
    code: 'UAH',
    symbol: '₴',
    name: 'Ukrainian Hryvnia',
    thresholds: [200, 500, 1000],
    labels: ['Budget (under ₴200)', 'Moderate (₴200-500)', 'Pricey (₴500-1000)', 'Splurge (₴1000+)']
  },

  // Asia
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    thresholds: [15, 40, 80],
    labels: ['Budget (under RM15)', 'Moderate (RM15-40)', 'Pricey (RM40-80)', 'Splurge (RM80+)']
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    thresholds: [12, 30, 60],
    labels: ['Budget (under S$12)', 'Moderate (S$12-30)', 'Pricey (S$30-60)', 'Splurge (S$60+)']
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    thresholds: [1000, 2500, 5000],
    labels: ['Budget (under ¥1000)', 'Moderate (¥1000-2500)', 'Pricey (¥2500-5000)', 'Splurge (¥5000+)']
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    thresholds: [50, 150, 300],
    labels: ['Budget (under ¥50)', 'Moderate (¥50-150)', 'Pricey (¥150-300)', 'Splurge (¥300+)']
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    thresholds: [80, 200, 400],
    labels: ['Budget (under HK$80)', 'Moderate (HK$80-200)', 'Pricey (HK$200-400)', 'Splurge (HK$400+)']
  },
  TWD: {
    code: 'TWD',
    symbol: 'NT$',
    name: 'Taiwan Dollar',
    thresholds: [200, 500, 1000],
    labels: ['Budget (under NT$200)', 'Moderate (NT$200-500)', 'Pricey (NT$500-1000)', 'Splurge (NT$1000+)']
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    thresholds: [10000, 25000, 50000],
    labels: ['Budget (under ₩10000)', 'Moderate (₩10000-25000)', 'Pricey (₩25000-50000)', 'Splurge (₩50000+)']
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    thresholds: [150, 400, 800],
    labels: ['Budget (under ฿150)', 'Moderate (฿150-400)', 'Pricey (฿400-800)', 'Splurge (฿800+)']
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    thresholds: [100000, 300000, 600000],
    labels: ['Budget (under ₫100k)', 'Moderate (₫100-300k)', 'Pricey (₫300-600k)', 'Splurge (₫600k+)']
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    thresholds: [50000, 150000, 300000],
    labels: ['Budget (under Rp50k)', 'Moderate (Rp50-150k)', 'Pricey (Rp150-300k)', 'Splurge (Rp300k+)']
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    thresholds: [300, 800, 1500],
    labels: ['Budget (under ₱300)', 'Moderate (₱300-800)', 'Pricey (₱800-1500)', 'Splurge (₱1500+)']
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    thresholds: [300, 800, 1500],
    labels: ['Budget (under ₹300)', 'Moderate (₹300-800)', 'Pricey (₹800-1500)', 'Splurge (₹1500+)']
  },
  PKR: {
    code: 'PKR',
    symbol: 'Rs',
    name: 'Pakistani Rupee',
    thresholds: [800, 2000, 4000],
    labels: ['Budget (under Rs800)', 'Moderate (Rs800-2000)', 'Pricey (Rs2000-4000)', 'Splurge (Rs4000+)']
  },
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    thresholds: [300, 800, 1500],
    labels: ['Budget (under ৳300)', 'Moderate (৳300-800)', 'Pricey (৳800-1500)', 'Splurge (৳1500+)']
  },
  LKR: {
    code: 'LKR',
    symbol: 'Rs',
    name: 'Sri Lankan Rupee',
    thresholds: [1000, 3000, 6000],
    labels: ['Budget (under Rs1000)', 'Moderate (Rs1000-3000)', 'Pricey (Rs3000-6000)', 'Splurge (Rs6000+)']
  },
  NPR: {
    code: 'NPR',
    symbol: 'Rs',
    name: 'Nepalese Rupee',
    thresholds: [500, 1500, 3000],
    labels: ['Budget (under Rs500)', 'Moderate (Rs500-1500)', 'Pricey (Rs1500-3000)', 'Splurge (Rs3000+)']
  },
  MMK: {
    code: 'MMK',
    symbol: 'K',
    name: 'Myanmar Kyat',
    thresholds: [5000, 15000, 30000],
    labels: ['Budget (under K5000)', 'Moderate (K5000-15000)', 'Pricey (K15000-30000)', 'Splurge (K30000+)']
  },
  KHR: {
    code: 'KHR',
    symbol: '៛',
    name: 'Cambodian Riel',
    thresholds: [20000, 50000, 100000],
    labels: ['Budget (under ៛20k)', 'Moderate (៛20-50k)', 'Pricey (៛50-100k)', 'Splurge (៛100k+)']
  },

  // Middle East
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    thresholds: [40, 100, 200],
    labels: ['Budget (under د.إ40)', 'Moderate (د.إ40-100)', 'Pricey (د.إ100-200)', 'Splurge (د.إ200+)']
  },
  SAR: {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    thresholds: [40, 100, 200],
    labels: ['Budget (under ﷼40)', 'Moderate (﷼40-100)', 'Pricey (﷼100-200)', 'Splurge (﷼200+)']
  },
  QAR: {
    code: 'QAR',
    symbol: 'ر.ق',
    name: 'Qatari Riyal',
    thresholds: [40, 100, 200],
    labels: ['Budget (under ر.ق40)', 'Moderate (ر.ق40-100)', 'Pricey (ر.ق100-200)', 'Splurge (ر.ق200+)']
  },
  KWD: {
    code: 'KWD',
    symbol: 'د.ك',
    name: 'Kuwaiti Dinar',
    thresholds: [3, 8, 15],
    labels: ['Budget (under د.ك3)', 'Moderate (د.ك3-8)', 'Pricey (د.ك8-15)', 'Splurge (د.ك15+)']
  },
  BHD: {
    code: 'BHD',
    symbol: 'BD',
    name: 'Bahraini Dinar',
    thresholds: [4, 10, 20],
    labels: ['Budget (under BD4)', 'Moderate (BD4-10)', 'Pricey (BD10-20)', 'Splurge (BD20+)']
  },
  OMR: {
    code: 'OMR',
    symbol: 'ر.ع.',
    name: 'Omani Rial',
    thresholds: [4, 10, 20],
    labels: ['Budget (under ر.ع.4)', 'Moderate (ر.ع.4-10)', 'Pricey (ر.ع.10-20)', 'Splurge (ر.ع.20+)']
  },
  JOD: {
    code: 'JOD',
    symbol: 'د.ا',
    name: 'Jordanian Dinar',
    thresholds: [5, 15, 30],
    labels: ['Budget (under د.ا5)', 'Moderate (د.ا5-15)', 'Pricey (د.ا15-30)', 'Splurge (د.ا30+)']
  },
  ILS: {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli Shekel',
    thresholds: [40, 100, 200],
    labels: ['Budget (under ₪40)', 'Moderate (₪40-100)', 'Pricey (₪100-200)', 'Splurge (₪200+)']
  },
  EGP: {
    code: 'EGP',
    symbol: 'E£',
    name: 'Egyptian Pound',
    thresholds: [200, 500, 1000],
    labels: ['Budget (under E£200)', 'Moderate (E£200-500)', 'Pricey (E£500-1000)', 'Splurge (E£1000+)']
  },

  // Africa
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    thresholds: [150, 400, 800],
    labels: ['Budget (under R150)', 'Moderate (R150-400)', 'Pricey (R400-800)', 'Splurge (R800+)']
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    thresholds: [5000, 15000, 30000],
    labels: ['Budget (under ₦5000)', 'Moderate (₦5000-15000)', 'Pricey (₦15000-30000)', 'Splurge (₦30000+)']
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    thresholds: [800, 2000, 4000],
    labels: ['Budget (under KSh800)', 'Moderate (KSh800-2000)', 'Pricey (KSh2000-4000)', 'Splurge (KSh4000+)']
  },
  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedi',
    thresholds: [80, 200, 400],
    labels: ['Budget (under GH₵80)', 'Moderate (GH₵80-200)', 'Pricey (GH₵200-400)', 'Splurge (GH₵400+)']
  },
  MAD: {
    code: 'MAD',
    symbol: 'د.م.',
    name: 'Moroccan Dirham',
    thresholds: [80, 200, 400],
    labels: ['Budget (under د.م.80)', 'Moderate (د.م.80-200)', 'Pricey (د.م.200-400)', 'Splurge (د.م.400+)']
  },
  TZS: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    thresholds: [15000, 40000, 80000],
    labels: ['Budget (under TSh15k)', 'Moderate (TSh15-40k)', 'Pricey (TSh40-80k)', 'Splurge (TSh80k+)']
  },

  // Oceania
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    thresholds: [15, 35, 70],
    labels: ['Budget (under A$15)', 'Moderate (A$15-35)', 'Pricey (A$35-70)', 'Splurge (A$70+)']
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    thresholds: [15, 40, 80],
    labels: ['Budget (under NZ$15)', 'Moderate (NZ$15-40)', 'Pricey (NZ$40-80)', 'Splurge (NZ$80+)']
  },
  FJD: {
    code: 'FJD',
    symbol: 'FJ$',
    name: 'Fijian Dollar',
    thresholds: [20, 50, 100],
    labels: ['Budget (under FJ$20)', 'Moderate (FJ$20-50)', 'Pricey (FJ$50-100)', 'Splurge (FJ$100+)']
  }
}

// Map country codes to default currencies
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  MY: 'MYR',
  US: 'USD',
  GB: 'GBP',
  AU: 'AUD',
  SG: 'SGD',
  JP: 'JPY',
  IN: 'INR',
  // European countries
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  BE: 'EUR', AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR',
}

/**
 * Detect currency from browser locale
 * Returns currency code (e.g., 'MYR', 'USD')
 */
export function detectCurrency(): string {
  if (typeof navigator === 'undefined') return 'USD'

  const locale = navigator.language || 'en-US'
  // locale format: "en-MY", "ms-MY", "en-US", etc.
  const parts = locale.split('-')
  const countryCode = parts[1]?.toUpperCase()

  if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
    return COUNTRY_TO_CURRENCY[countryCode]
  }

  // Fallback to USD
  return 'USD'
}

/**
 * Get currency config, with fallback to USD
 */
export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  return CURRENCIES[currencyCode] || CURRENCIES.USD
}

/**
 * Get price label for a given level and currency
 */
export function getPriceLabel(level: number, currencyCode: string): string {
  const config = getCurrencyConfig(currencyCode)
  return config.labels[level - 1] || ''
}

/**
 * Get all supported currencies as array for selectors
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES)
}
