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
import {
  VaultPage,
  VaultItemPage,
  MarketplacePage,
  MarketplaceSlugPage,
  LegacyShopRedirect,
  OrderCompletePage,
  ShopsPage,
  ShopPage,
  ArtistShopPage,
} from "./pages/VaultPages";
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
          {/* An artist's shop: the same page as /shops/<shop>. */}
          <Route path="/artists/:slug/shop" element={<ArtistShopPage />} />
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
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:slug" element={<MarketplaceSlugPage />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/shops/:slug" element={<ShopPage />} />
          {/* The Shop was renamed the Marketplace: old links forward to the same page. */}
          <Route path="/shop" element={<LegacyShopRedirect />} />
          <Route path="/shop/:slug" element={<LegacyShopRedirect />} />
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
