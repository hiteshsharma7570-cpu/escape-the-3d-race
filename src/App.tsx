import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LeagueHub from "./pages/LeagueHub";
import FriendsRoom from "./pages/FriendsRoom";
import Maintenance from "./pages/Maintenance";
import { GameErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <GameErrorBoundary
                onRecover={() => {
                  // Hard reload — Index.tsx hydrates from localStorage on mount,
                  // so this restores the last known-good GameState automatically.
                  if (typeof window !== "undefined") window.location.reload();
                }}
              >
                <Index />
              </GameErrorBoundary>
            }
          />
          <Route path="/leagues" element={<LeagueHub />} />
          <Route path="/leagues/room/:roomCode" element={<FriendsRoom />} />
          <Route path="/maintenance" element={<Maintenance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
