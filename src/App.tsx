import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SwarmIntelligence from "./pages/SwarmIntelligence";
import Evolution from "./pages/Evolution";
import AIGrid from "./pages/AIGrid";
import BlackSultanOS from "./pages/BlackSultanOS";
import AJPlatform from "./pages/AJPlatform";
import MetaPhilosophy from "./pages/MetaPhilosophy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/swarm-intelligence" element={<ProtectedRoute><SwarmIntelligence /></ProtectedRoute>} />
              <Route path="/evolution" element={<ProtectedRoute><Evolution /></ProtectedRoute>} />
              <Route path="/ai-grid" element={<ProtectedRoute><AIGrid /></ProtectedRoute>} />
              <Route path="/black-sultan-os" element={<ProtectedRoute><BlackSultanOS /></ProtectedRoute>} />
              <Route path="/aj-platform" element={<ProtectedRoute><AJPlatform /></ProtectedRoute>} />
              <Route path="/meta-philosophy" element={<ProtectedRoute><MetaPhilosophy /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
