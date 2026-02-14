import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import OurMemory from './components/OurMemory';
import BeenTogether from './components/BeenTogether';
import Letter from './components/Letter';
import LetterValentine from './components/LetterValentine';
import Bouquet from './components/Bouquet';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
    <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/home" replace /> : 
                <Login setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/home" 
            element={
              isAuthenticated ? 
                <Home /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/our-memory" 
            element={
              isAuthenticated ? 
                <OurMemory /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/been-together" 
            element={
              isAuthenticated ? 
                <BeenTogether /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/letter" 
            element={
              isAuthenticated ? 
                <Letter /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/letter-valentine" 
            element={
              isAuthenticated ? 
                <LetterValentine /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/bouquet" 
            element={
              isAuthenticated ? 
                <Bouquet /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    </div>
    </Router>
  );
}

export default App;
