import React from 'react';

// Componente principal de la aplicación
const AppContent: React.FC = () => {

  return (
    <div className="App">
      <header>
        <h1>Smart Parking System</h1>
      </header>
      <main>
          <div>
            <p>Dashboard del sistema de estacionamiento</p>
          </div>
      </main>
    </div>
  );
};

function App() {
  return (
      <AppContent />
  );
}

export default App;