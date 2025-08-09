export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Rate relative to KES (Kenyan Shilling)
}

export class CurrencyService {
  // Base currency rates (all relative to 1 KES)
  static readonly CURRENCIES: Currency[] = [
    {
      code: 'KES',
      name: 'Kenyan Shilling',
      symbol: 'KSh',
      flag: '🇰🇪',
      rate: 1.0 // Base currency
    },
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      flag: '🇺🇸',
      rate: 0.0075 // 1 KES = 0.0075 USD (approximately 133 KES = 1 USD)
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      flag: '🇬🇧',
      rate: 0.0060 // 1 KES = 0.0060 GBP (approximately 167 KES = 1 GBP)
    },
    {
      code: 'QAR',
      name: 'Qatari Riyal',
      symbol: 'QR',
      flag: '🇶🇦',
      rate: 0.027 // 1 KES = 0.027 QAR (approximately 37 KES = 1 QAR)
    },
    {
      code: 'SAR',
      name: 'Saudi Riyal',
      symbol: 'SR',
      flag: '🇸🇦',
      rate: 0.028 // 1 KES = 0.028 SAR (approximately 36 KES = 1 SAR)
    }
  ];

  // Local storage key for selected currency
  private static readonly STORAGE_KEY = 'isa_selected_currency';

  // Get all available currencies
  static getCurrencies(): Currency[] {
    return this.CURRENCIES;
  }

  // Get currency by code
  static getCurrency(code: string): Currency | undefined {
    return this.CURRENCIES.find(currency => currency.code === code);
  }

  // Get selected currency from localStorage
  static getSelectedCurrency(): Currency {
    const savedCode = localStorage.getItem(this.STORAGE_KEY);
    return this.getCurrency(savedCode || 'KES') || this.CURRENCIES[0];
  }

  // Set selected currency in localStorage
  static setSelectedCurrency(currencyCode: string): Currency | null {
    const currency = this.getCurrency(currencyCode);
    if (currency) {
      localStorage.setItem(this.STORAGE_KEY, currencyCode);
      return currency;
    }
    return null;
  }

  // Convert price from KES to specified currency
  static convertFromKES(amountInKES: number, targetCurrencyCode: string): number {
    const targetCurrency = this.getCurrency(targetCurrencyCode);
    if (!targetCurrency) return amountInKES;
    
    return amountInKES * targetCurrency.rate;
  }

  // Convert price from any currency to KES
  static convertToKES(amount: number, fromCurrencyCode: string): number {
    const fromCurrency = this.getCurrency(fromCurrencyCode);
    if (!fromCurrency) return amount;
    
    return amount / fromCurrency.rate;
  }

  // Convert between any two currencies
  static convertBetweenCurrencies(
    amount: number, 
    fromCurrencyCode: string, 
    toCurrencyCode: string
  ): number {
    if (fromCurrencyCode === toCurrencyCode) return amount;
    
    // Convert to KES first, then to target currency
    const amountInKES = this.convertToKES(amount, fromCurrencyCode);
    return this.convertFromKES(amountInKES, toCurrencyCode);
  }

  // Format price with currency symbol and proper decimal places
  static formatPrice(amount: number, currencyCode: string): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) return amount.toString();

    const convertedAmount = this.convertFromKES(amount, currencyCode);
    
    // Format based on currency
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode === 'KES' ? 'USD' : currencyCode, // Use USD formatting for KES since KES isn't widely supported
      minimumFractionDigits: currencyCode === 'KES' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'KES' ? 0 : 2,
    });

    if (currencyCode === 'KES') {
      // Custom formatting for KES
      return `${currency.symbol} ${Math.round(convertedAmount).toLocaleString()}`;
    } else if (currencyCode === 'QAR' || currencyCode === 'SAR') {
      // Custom formatting for Middle Eastern currencies
      return `${currency.symbol} ${convertedAmount.toFixed(2)}`;
    }

    // Use standard formatting for USD and GBP
    return formatter.format(convertedAmount).replace(/^[^0-9-]+/, currency.symbol + ' ');
  }

  // Get price display with currency conversion
  static getPriceDisplay(priceInKES: number, targetCurrencyCode?: string): string {
    const currency = targetCurrencyCode 
      ? this.getCurrency(targetCurrencyCode) 
      : this.getSelectedCurrency();
    
    if (!currency) return `KSh ${priceInKES.toLocaleString()}`;
    
    return this.formatPrice(priceInKES, currency.code);
  }

  // Update exchange rates (for future real-time rate updates)
  static async updateExchangeRates(): Promise<void> {
    try {
      // In a real app, this would fetch from a currency API
      // For now, we'll keep the hardcoded rates
      console.log('Exchange rates are up to date');
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  // Get checkout amount in selected currency
  static getCheckoutAmount(priceInKES: number, currencyCode?: string): {
    amount: number;
    currency: Currency;
    formattedAmount: string;
  } {
    const currency = currencyCode 
      ? this.getCurrency(currencyCode) 
      : this.getSelectedCurrency();
    
    if (!currency) {
      return {
        amount: priceInKES,
        currency: this.CURRENCIES[0],
        formattedAmount: this.formatPrice(priceInKES, 'KES')
      };
    }

    const convertedAmount = this.convertFromKES(priceInKES, currency.code);
    
    return {
      amount: convertedAmount,
      currency,
      formattedAmount: this.formatPrice(priceInKES, currency.code)
    };
  }

  // Validate currency code
  static isValidCurrency(code: string): boolean {
    return this.CURRENCIES.some(currency => currency.code === code);
  }

  // Get currency exchange rate relative to KES
  static getExchangeRate(currencyCode: string): number {
    const currency = this.getCurrency(currencyCode);
    return currency?.rate || 1.0;
  }
}
