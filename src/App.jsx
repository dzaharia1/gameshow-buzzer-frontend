import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BuzzerScreen from './components/BuzzerScreen';
import HostScreen from './components/HostScreen';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    font-family: 'Luckiest Guy', 'Avenir', sans-serif;
    font-weight: 700;
    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background: url('/background.png') no-repeat center center;
    background-size: cover;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100%;
    /* min-height: 100vh; */
    height: 100dvh;
    margin: 0;
    padding: 0;
    border: 0;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  a {
    color: #646cff;
    text-decoration: inherit;
  }
  body {
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 320px;
    min-height: 100vh;
    width: 100vw;
    height: 100dvh;
    padding: 0;
    border: 0;
    margin: 0;
  }
  h1 {
    font-size: 3.2em;
  }
  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/buzzer" element={<BuzzerScreen />} />
          <Route path="/host" element={<HostScreen />} />
          <Route path="*" element={<Navigate to="/buzzer" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
