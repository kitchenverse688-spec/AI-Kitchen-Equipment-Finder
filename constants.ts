
export const CATEGORIES = ['Any', 'Cooking', 'Refrigeration', 'Dishwashing', 'Laundry', 'Preparation'];
export const CONDITIONS = ['Any', 'New', 'Used', 'Refurbished'];
export const COUNTRIES = [
    'Saudi Arabia', 
    'UAE', 
    'Bahrain', 
    'Kuwait', 
    'Oman', 
    'Qatar', 
    'China', 
    'Germany', 
    'France', 
    'Italy', 
    'Spain', 
    'UK', 
    'USA', 
    'GCC', 
    'Europe', 
    'Asia'
];
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR'];
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

// Static conversion rates for demonstration purposes. In a real app, this would come from an API.
export const CURRENCY_RATES_TO_USD: { [key: string]: number } = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  AED: 0.27,
  SAR: 0.27,
};
