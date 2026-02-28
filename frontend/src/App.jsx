import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import FraudTable from './pages/FraudTable';
import UserDetail from './pages/UserDetail';

import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="fraud" element={<FraudTable />} />
          <Route path="user/:id" element={<UserDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
