import { useState, useEffect } from 'react';
import { CurrencyService, Currency } from '@/services/currencyService';

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(CurrencyService.getSelectedCurrency());

  useEffect(() => {
    // Listen for currency changes from other components
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail.currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const changeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    CurrencyService.setSelectedCurrency(newCurrency.code);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: { currency: newCurrency }
    }));
  };

  const formatPrice = (priceInKES: number) => {
    return CurrencyService.formatPrice(priceInKES, currency.code);
  };

  const convertPrice = (priceInKES: number) => {
    return CurrencyService.convertFromKES(priceInKES, currency.code);
  };

  const getCheckoutAmount = (priceInKES: number) => {
    return CurrencyService.getCheckoutAmount(priceInKES, currency.code);
  };

  return {
    currency,
    changeCurrency,
    formatPrice,
    convertPrice,
    getCheckoutAmount,
    isKES: currency.code === 'KES'
  };
};

export default useCurrency;
