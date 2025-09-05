import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Confetti from '@/components/ui/confetti';

interface ConfettiConfig {
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

interface ConfettiContextType {
  triggerConfetti: (config?: ConfettiConfig) => void;
  isActive: boolean;
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
};

interface ConfettiProviderProps {
  children: ReactNode;
}

export const ConfettiProvider: React.FC<ConfettiProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<ConfettiConfig>({
    duration: 3000,
    particleCount: 100,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
  });

  const triggerConfetti = useCallback((customConfig?: ConfettiConfig) => {
    const finalConfig = { ...config, ...customConfig };
    setConfig(finalConfig);
    setIsActive(true);
  }, [config]);

  const onComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return (
    <ConfettiContext.Provider value={{ triggerConfetti, isActive }}>
      {children}
      <Confetti
        isActive={isActive}
        duration={config.duration}
        particleCount={config.particleCount}
        colors={config.colors}
        onComplete={onComplete}
      />
    </ConfettiContext.Provider>
  );
};
