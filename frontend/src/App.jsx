import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import FraudTable from './pages/FraudTable';
import UserDetail from './pages/UserDetail';

function AlertsStub() {
  return (
    <div className="text-slate-400 p-10 text-center animate-in fade-in">
      Alerts Panel Work In Progress! See Fraud Users for active detections.
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="fraud" element={<FraudTable />} />
          <Route path="user/:id" element={<UserDetail />} />
          <Route path="alerts" element={<AlertsStub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
