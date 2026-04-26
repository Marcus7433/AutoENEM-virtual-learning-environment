import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallbackPage from './pages/AuthCallbackPage';
import EssaysHistoryPage from './pages/EssaysHistoryPage';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route
        path="/historico"
        element={
          <ProtectedRoute>
            <EssaysHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route path="/configuracoes" element={<SettingsPage />} />

<Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
