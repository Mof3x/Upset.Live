import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import SiteShell from "./components/layout/SiteShell";

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/artists/:slug" element={<ArtistPage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}