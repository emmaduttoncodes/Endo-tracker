import { Suspense, lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DailyLogPage } from './pages/DailyLogPage';
import { CyclePage } from './pages/CyclePage';
import { MedicalPage } from './pages/MedicalPage';
import { SettingsPage } from './pages/SettingsPage';

const TrendsPage = lazy(() => import('./pages/TrendsPage').then((m) => ({ default: m.TrendsPage })));

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DailyLogPage />} />
          <Route path="cycle" element={<CyclePage />} />
          <Route path="medical" element={<MedicalPage />} />
          <Route path="trends" element={<Suspense fallback={null}><TrendsPage /></Suspense>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
