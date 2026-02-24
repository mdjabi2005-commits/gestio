import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DownloadPage from "./pages/DownloadPage";
import FonctionnalitesPage from "./pages/FonctionnalitesPage";
import SecuritePage from "./pages/SecuritePage";
import ApercuPage from "./pages/ApercuPage";
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
      <BrowserRouter basename={import.meta.env.PROD ? "/gestio" : "/"}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/fonctionnalites" element={<FonctionnalitesPage />} />
          <Route path="/securite" element={<SecuritePage />} />
          <Route path="/apercu" element={<ApercuPage />} />
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
