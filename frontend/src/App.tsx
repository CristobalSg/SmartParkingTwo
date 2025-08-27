import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="App">
      <header>
        <h1>Smart Parking System</h1>
        {isAuthenticated && <p>Bienvenido, {user?.name}!</p>}
      </header>
      <main>
        {isAuthenticated ? (
          <div>
            <p>Dashboard del sistema de estacionamiento</p>
            <p>Usuario: {user?.email}</p>
          </div>
        ) : (
          <p>Por favor, inicia sesión para continuar</p>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;