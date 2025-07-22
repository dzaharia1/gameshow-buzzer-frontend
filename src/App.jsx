import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BuzzerScreen from './components/BuzzerScreen';
import HostScreen from './components/HostScreen';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/buzzer" element={<BuzzerScreen />} />
        <Route path="/host" element={<HostScreen />} />
        <Route path="*" element={<Navigate to="/buzzer" />} />
      </Routes>
    </Router>
  );
}

export default App;
