
import { AuthProvider } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AuthWrapper;
