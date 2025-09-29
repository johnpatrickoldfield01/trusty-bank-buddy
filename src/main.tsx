
import { createRoot } from 'react-dom/client'
import App from './App.tsx';
import './index.css'

// Add mobile-specific class to body when running in Capacitor
if (window.matchMedia('(display-mode: standalone)').matches || 
    (window as any).Capacitor) {
  document.body.classList.add('capacitor-native');
}

// Prevent context menu on mobile
document.addEventListener('contextmenu', (e) => {
  if ((window as any).Capacitor) {
    e.preventDefault();
  }
});

// Handle mobile viewport changes
const handleViewportChange = () => {
  // Force a reflow to handle dynamic viewport changes on mobile
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', handleViewportChange);
window.addEventListener('orientationchange', handleViewportChange);
handleViewportChange();

createRoot(document.getElementById("root")!).render(<App />);
