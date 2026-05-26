import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Pantalla de carga mientras se sincroniza con Firebase
 */
export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Loader2 size={48} className="loading-spinner" />
      <h2 className="loading-title">Sincronizando con la nube...</h2>
      <p className="loading-subtitle">Cargando tu progreso, Jerónimo.</p>
    </div>
  );
}
