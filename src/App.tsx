
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthWrapper from "./components/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import AuthenticationModal from "./components/AuthenticationModal";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show auth modal if user is not authenticated and not loading
  const shouldShowAuth = !loading && !user && !showAuthModal;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/reset-password" element={<div>Password Reset Page</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {shouldShowAuth && (
        <AuthenticationModal
          isOpen={true}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthWrapper>
              <AppContent />
            </AuthWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
