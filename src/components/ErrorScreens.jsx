import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

/**
 * Pantalla de error de autenticación Firebase
 */
export function AuthErrorScreen({ authError, startOfflineMode }) {
  return (
    <div className="error-screen">
      <AlertCircle size={64} className="error-icon" />
      <h2 className="error-title">Error de Configuración Firebase</h2>
      <p className="error-description">
        Código: <span className="error-code">{authError.code || 'Desconocido'}</span>
        <span className="error-detail">{authError.message}</span>
      </p>

      <div className="error-card">
        <h3 className="error-card-title">Cómo solucionarlo:</h3>

        {authError.code === 'auth/admin-restricted-operation' || authError.code === 'auth/unauthorized-domain' ? (
          <ol className="error-steps">
            <li>Este error ocurre porque el dominio actual está bloqueado por motivos de seguridad en tu cuenta de Firebase.</li>
            <li>Ve a la <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="error-link">Consola de Firebase</a> y selecciona tu proyecto <b>app-productiv</b>.</li>
            <li>En el menú lateral, ve a <b>Authentication</b> y selecciona la pestaña <b>Configuración</b> (Settings).</li>
            <li>Haz clic en <b>Dominios autorizados</b>.</li>
            <li>Haz clic en el botón de <b>Agregar dominio</b> y pega exactamente esto: <b className="error-domain">scf.usercontent.goog</b></li>
          </ol>
        ) : (
          <ol className="error-steps">
            <li>Ve a tu proyecto <b className="text-white">app-productiv</b> en la <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="error-link">Consola de Firebase</a>.</li>
            <li>En el menú lateral, abre <b>Authentication</b> y ve a la pestaña <b>Sign-in method</b>.</li>
            <li>Activa la opción <b>Anónimo</b> y guarda los cambios.</li>
          </ol>
        )}

        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="btn-primary-full">
            Ya lo configuré, recargar página
          </button>
          <button onClick={startOfflineMode} className="btn-secondary-full">
            Continuar en Modo Offline (Sin guardar en la nube)
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Pantalla de error de permisos de base de datos
 */
export function DbErrorScreen({ dbError, startOfflineMode }) {
  return (
    <div className="error-screen">
      <ShieldAlert size={64} className="error-icon" />
      <h2 className="error-title">Error de Permisos en Base de Datos</h2>
      <p className="error-description">
        Tu base de datos de Firebase está bloqueando el acceso por seguridad.
        <span className="error-detail">Detalle: {dbError}</span>
      </p>

      <div className="error-card">
        <h3 className="error-card-title">Cómo solucionarlo (Reglas de Firestore):</h3>
        <ol className="error-steps">
          <li>Ve a tu proyecto en la <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="error-link">Consola de Firebase</a>.</li>
          <li>En el menú izquierdo, haz clic en <b>Firestore Database</b>.</li>
          <li>Arriba, selecciona la pestaña <b>Reglas</b> (Rules).</li>
          <li>Borra todo el texto y pega exactamente lo siguiente:</li>
        </ol>

        <pre className="error-code-block">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}</pre>

        <ol className="error-steps" start={5}>
          <li>Haz clic en el botón <b>Publicar</b> (Publish). Espera un minuto.</li>
        </ol>

        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="btn-primary-full">
            Ya publiqué las reglas, recargar página
          </button>
          <button onClick={startOfflineMode} className="btn-secondary-full">
            Continuar en Modo Offline (Sin guardar en la nube)
          </button>
        </div>
      </div>
    </div>
  );
}
