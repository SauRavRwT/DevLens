import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Onboarding from "./components/Onboarding/Onboarding";
import DashboardPage from "./components/Dashboard/DashboardPage";
import Error from "./components/Error/Error";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Onboarding />} />
          <Route path="dashboard/:username" element={<DashboardPage />} />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
