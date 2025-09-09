import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./presentation/pages/LoginPage";
import { Provider } from "./components/ui/provider";

function App() {
  return (
    <Provider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Aquí irán más rutas, como /dashboard, /profile, etc. */}
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;