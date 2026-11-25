import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register offline Service Worker only on HTTP(S) origins with a PWA manifest (skip in standalone/WebIntoApp builds)
if (
  (window.location.protocol === 'http:' || window.location.protocol === 'https:') &&
  document.querySelector('link[rel="manifest"]')
) {
  registerSW({ immediate: true });
}

// Rely on CSS overscroll-behavior-y: none without non-passive touchmove preventDefault()
// so Android WebView never drops native scroll streams to a parent SwipeRefreshLayout.

createRoot(document.getElementById('root')!).render(<App />);
