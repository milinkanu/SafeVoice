import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';

// Public Pages
import Landing from './pages/Landing';
import Compass from './pages/Compass';
import Report from './pages/Report';
import ReportSuccess from './pages/ReportSuccess';
import Track from './pages/Track';
import Evidence from './pages/Evidence';
import IncidentLog from './pages/IncidentLog';
import EmployeeDashboard from './pages/EmployeeDashboard';

// ICC Pages
import Dashboard from './pages/icc/Dashboard';
import Login from './pages/icc/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Routes>
          {/* Public Context using PageWrapper */}
          <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
          <Route path="/employee" element={<PageWrapper><EmployeeDashboard /></PageWrapper>} />
          <Route path="/compass" element={<PageWrapper><Compass /></PageWrapper>} />
          <Route path="/report" element={<PageWrapper><Report /></PageWrapper>} />
          <Route path="/report/success" element={<PageWrapper><ReportSuccess /></PageWrapper>} />
          <Route path="/track" element={<PageWrapper><Track /></PageWrapper>} />
          <Route path="/evidence/:caseToken" element={<PageWrapper><Evidence /></PageWrapper>} />
          <Route path="/log" element={<PageWrapper><IncidentLog /></PageWrapper>} />

          {/* ICC Routes (Dashboard handles its own layout, login can use PageWrapper) */}
          <Route path="/icc/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/icc" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
