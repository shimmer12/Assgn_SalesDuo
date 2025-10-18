import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RunsHistoryPage from "./pages/RunsHistoryPage";
import AsinRunsPage from "./pages/AsinRunsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<RunsHistoryPage />} />
        <Route path="/history/:asin" element={<AsinRunsPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}
