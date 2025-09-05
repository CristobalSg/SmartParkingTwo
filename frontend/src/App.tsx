import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./presentation/pages/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Aquí irán más rutas, como /dashboard, /profile, etc. */}
      </Routes>
    </Router>
  );
}

export default App;