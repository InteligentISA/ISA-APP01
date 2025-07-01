import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading?: boolean;
}

const SuggestionChips = ({ suggestions, onSuggestionClick, isLoading }: SuggestionChipsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
          disabled={isLoading}
          className="text-xs bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

export default SuggestionChips; 