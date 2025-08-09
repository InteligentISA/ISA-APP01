import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, DollarSign } from "lucide-react";
import { CurrencyService, Currency } from "@/services/currencyService";

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
}

const CurrencySelector = ({ onCurrencyChange }: CurrencySelectorProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    CurrencyService.getSelectedCurrency()
  );
  const [isOpen, setIsOpen] = useState(false);

  const currencies = CurrencyService.getCurrencies();

  useEffect(() => {
    // Update currency in localStorage when component mounts
    CurrencyService.setSelectedCurrency(selectedCurrency.code);
  }, []);

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    CurrencyService.setSelectedCurrency(currency.code);
    setIsOpen(false);
    
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }

    // Trigger a custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('currencyChanged', { 
      detail: { currency } 
    }));
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 min-w-[100px]"
        >
          <DollarSign className="w-4 h-4" />
          <span className="flex items-center space-x-1">
            <span className="text-lg">{selectedCurrency.flag}</span>
            <span className="hidden sm:inline text-xs font-medium">{selectedCurrency.code}</span>
          </span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="start">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencySelect(currency)}
            className={`flex items-center space-x-3 cursor-pointer ${
              selectedCurrency.code === currency.code 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : ''
            }`}
          >
            <span className="text-xl">{currency.flag}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{currency.code}</span>
                <span className="text-xs text-gray-500">{currency.symbol}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {currency.name}
              </div>
            </div>
            {selectedCurrency.code === currency.code && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
