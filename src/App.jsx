import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import NotFoundPage from "./pages/NotFoundPage";
import {
  AboutPage,
  EthosPage,
  ArtistsPage,
  WorksPage,
  WorkPage,
  TextsPage,
  TextPage,
} from "./pages/CorePages";
import { JournalPage, JournalPostPage } from "./pages/JournalPages";
import {
  RazzPage,
  RazzIssuePage,
  RazzFeaturePage,
  ContributorsPage,
  ContributorPage,
} from "./pages/RazzPages";
import { VaultPage, VaultItemPage, ShopPage, ShopSlugPage, OrderCompletePage } from "./pages/VaultPages";
import { CommissionsPage, CommissionDisciplinePage } from "./pages/CommissionPages";
import { ContactPage, NewsletterPage } from "./pages/FormPages";
import BasketPage from "./pages/BasketPage";
import SiteShell from "./components/layout/SiteShell";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/ethos" element={<EthosPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:slug" element={<ArtistPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:slug" element={<WorkPage />} />
          <Route path="/texts" element={<TextsPage />} />
          <Route path="/texts/:slug" element={<TextPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalPostPage />} />
          <Route path="/razz" element={<RazzPage />} />
          <Route path="/razz/issues/:slug" element={<RazzIssuePage />} />
          <Route path="/razz/features/:slug" element={<RazzFeaturePage />} />
          <Route path="/contributors" element={<ContributorsPage />} />
          <Route path="/contributors/:slug" element={<ContributorPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/vault/:slug" element={<VaultItemPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ShopSlugPage />} />
          <Route path="/basket" element={<BasketPage />} />
          {/* Stripe returns buyers here after paying (see workers/checkout). */}
          <Route path="/order/complete" element={<OrderCompletePage />} />
          <Route path="/commissions" element={<CommissionsPage />} />
          <Route path="/commissions/:discipline" element={<CommissionDisciplinePage />} />
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}
