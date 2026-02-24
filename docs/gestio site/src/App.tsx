import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DownloadPage from "./pages/DownloadPage";
import GuidesPage from "./pages/GuidesPage";
import FAQPage from "./pages/FAQPage";
import CGUPage from "./pages/CGUPage";
import ConfidentialitePage from "./pages/ConfidentialitePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/telecharger" element={<DownloadPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/cgu" element={<CGUPage />} />
          <Route path="/confidentialite" element={<ConfidentialitePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
