
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

const renderApp = () => {
  if (!rootElement) return;
  const root = ReactDOM.createRoot(rootElement);
  
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical Render Error:", error);
    rootElement.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; padding:20px; text-align:center;">
        <h1 style="color:#1e3a8a;">Actualización en curso</h1>
        <p style="color:#64748b;">Estamos optimizando su Suite de Inspecciones. Por favor presione el botón para iniciar.</p>
        <button onclick="window.location.reload()" style="margin-top:20px; padding:15px 30px; background:#1e3a8a; color:white; border:none; border-radius:12px; font-weight:bold; cursor:pointer;">
          INICIAR APLICACIÓN
        </button>
      </div>
    `;
  }
};

// Asegurar que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
