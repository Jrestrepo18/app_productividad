import React from 'react';
import { Lock } from 'lucide-react';

/**
 * Candado de reflexión diaria — obliga al usuario a leer y reflexionar
 * antes de poder usar la app.
 */
export default function ReflectionLock({ 
  todayReflection, 
  reflectionTimer, 
  onUnlock 
}) {
  return (
    <div className="reflection-overlay">
      <div className="reflection-content">
        {/* Ícono de candado */}
        <div className="reflection-icon-wrapper">
          <div className="reflection-icon-glow"></div>
          <Lock size={48} className="reflection-icon" />
        </div>

        {/* Contenido de la reflexión */}
        <div className="reflection-text-section">
          <h2 className="reflection-area-badge">
            {todayReflection.area}
          </h2>
          <h1 className="reflection-title">
            {todayReflection.title}
          </h1>
          <div className="reflection-divider"></div>
          <p className="reflection-text">
            {todayReflection.text}
          </p>
        </div>

        {/* Temporizador */}
        <div className="reflection-timer-card">
          <p className="reflection-timer-label">Tiempo de reflexión</p>
          <p className="reflection-timer-value">
            00:{reflectionTimer < 10 ? `0${reflectionTimer}` : reflectionTimer}
          </p>
          {reflectionTimer > 0 ? (
            <p className="reflection-timer-warning">No puedes avanzar. Lee e interioriza.</p>
          ) : (
            <p className="reflection-timer-ready">Tiempo cumplido. Estás listo.</p>
          )}
        </div>
      </div>

      {/* Botón de desbloqueo */}
      <div className="reflection-action">
        <button
          disabled={reflectionTimer > 0}
          onClick={onUnlock}
          className={`reflection-unlock-btn ${reflectionTimer > 0 ? 'locked' : 'unlocked'}`}
        >
          {reflectionTimer > 0 ? 'Bloqueado' : 'Desbloquear mi Día'}
        </button>
      </div>
    </div>
  );
}
