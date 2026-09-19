import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import NotFoundPage from "./pages/NotFoundPage";
import {
  AboutPage,
  ArtistsPage,
  WorksPage,
  WorkPage,
  TextsPage,
  TextPage,
  JournalPage,
  JournalPostPage,
  VaultPage,
  ContactPage,
} from "./pages/CorePages";
import SiteShell from "./components/layout/SiteShell";

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:slug" element={<ArtistPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:slug" element={<WorkPage />} />
          <Route path="/texts" element={<TextsPage />} />
          <Route path="/texts/:slug" element={<TextPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalPostPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}