import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SiteShell from "./components/layout/Siteshell";

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}