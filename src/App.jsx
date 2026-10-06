import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { LiveMap } from './pages/LiveMap';
import { PlanTrip } from './pages/PlanTrip';
import { Alerts } from './pages/Alerts';
import { Report } from './pages/Report';
import { Emergency } from './pages/Emergency';
import { PastEvents } from './pages/PastEvents';
import { About } from './pages/About';
import { Officials } from './pages/Officials';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LiveMap />} />
          <Route path="plan" element={<PlanTrip />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="report" element={<Report />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="past-events" element={<PastEvents />} />
          <Route path="about" element={<About />} />
          <Route path="officials" element={<Officials />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
