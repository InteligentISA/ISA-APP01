import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  size?: 'normal' | 'compact' | 'invisible';
  theme?: 'light' | 'dark';
}

export const HCaptchaComponent = forwardRef<HCaptcha, HCaptchaComponentProps>(({ 
  onVerify, 
  onError, 
  onExpire, 
  size = 'compact',
  theme = 'light' 
}: HCaptchaComponentProps, ref) => {
  const internalRef = useRef<HCaptcha>(null);
  const [isEnabled] = useState(() => {
    const enabled = import.meta.env.VITE_ENABLE_HCAPTCHA === 'true';
    console.log('hCaptcha enabled:', enabled);
    return enabled;
  });

  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  useEffect(() => {
    console.log('hCaptcha component mounted:', { isEnabled, siteKey, size });
  }, [isEnabled, siteKey, size]);

  // Expose the execute method to parent components
  useImperativeHandle(ref, () => ({
    execute: () => {
      console.log('hCaptcha execute called');
      return internalRef.current?.execute();
    },
    reset: () => internalRef.current?.reset(),
    getResponse: () => internalRef.current?.getResponse(),
    getRespKey: () => internalRef.current?.getRespKey(),
    isReady: () => internalRef.current?.isReady(),
    setData: (data: any) => internalRef.current?.setData(data),
    render: () => internalRef.current?.render(),
    remove: () => internalRef.current?.remove(),
    close: () => internalRef.current?.close(),
    open: () => internalRef.current?.open(),
    setTheme: (theme: string) => internalRef.current?.setTheme(theme),
    submit: () => internalRef.current?.submit(),
    getWidgetId: () => internalRef.current?.getWidgetId(),
  }));

  if (!isEnabled || !siteKey) {
    console.log('hCaptcha not rendering:', { isEnabled, siteKey });
    return null;
  }

  return (
    <div className="flex justify-center my-2">
      <HCaptcha
        ref={internalRef}
        sitekey={siteKey}
        onVerify={(token) => {
          console.log('hCaptcha verified with token:', token);
          onVerify(token);
        }}
        onError={(error) => {
          console.log('hCaptcha error:', error);
          onError?.();
        }}
        onExpire={() => {
          console.log('hCaptcha expired');
          onExpire?.();
        }}
        size={size}
        theme={theme}
      />
    </div>
  );
});

HCaptchaComponent.displayName = 'HCaptchaComponent';
