import React, { useState } from 'react';
import { 
  PenTool, Heart, Target, TrendingUp, CheckCircle2, 
  BookOpen, CalendarDays, Search 
} from 'lucide-react';

/**
 * Tab de Diario — Check-in diario + bitácora de fallos
 */
export default function JournalTab({
  isDailyCompletedToday,
  currentDaily,
  setCurrentDaily,
  onSaveDaily,
  dailyLogs,
  penaltyJournal,
  dayOfMonkMode
}) {
  const [subTab, setSubTab] = useState('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogIdx, setExpandedLogIdx] = useState(null);

  const toggleLog = (idx) => {
    setExpandedLogIdx(expandedLogIdx === idx ? null : idx);
  };

  const filteredLogs = dailyLogs.filter(log =>
    log.gratitude.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.victory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.improvement.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.date.includes(searchQuery)
  );

  return (
    <div className="tab-content fade-in">
      {/* Sub-tabs */}
      <div className="subtab-container">
        <button
          onClick={() => setSubTab('daily')}
          className={`subtab-btn ${subTab === 'daily' ? 'subtab-active' : ''}`}
        >
          Mi Daily
        </button>
        <button
          onClick={() => setSubTab('bitacora')}
          className={`subtab-btn ${subTab === 'bitacora' ? 'subtab-active' : ''}`}
        >
          Bitácora (Fallos)
        </button>
      </div>

      {subTab === 'daily' ? (
        <div className="journal-daily">
          <div>
            <h2 className="tab-title journal-title">
              <PenTool size={20} className="icon-purple" /> Check-in Diario
            </h2>
          </div>

          {isDailyCompletedToday ? (
            <div className="daily-completed-card">
              <CheckCircle2 size={40} className="icon-emerald" />
              <h3 className="daily-completed-title">Daily Completado</h3>
              <p className="daily-completed-text">Has ganado +20 puntos. Tu mente está enfocada.</p>
            </div>
          ) : (
            <div className="daily-form">
              <div className="daily-field">
                <label className="daily-label">
                  <Heart size={16} className="icon-pink" /> Hoy doy gracias por...
                </label>
                <textarea
                  value={currentDaily.gratitude}
                  onChange={(e) => setCurrentDaily({ ...currentDaily, gratitude: e.target.value })}
                  placeholder="Escribe aquí..."
                  className="daily-textarea"
                />
              </div>

              <div className="daily-field">
                <label className="daily-label">
                  <Target size={16} className="icon-blue" /> Mi mayor victoria hoy fue...
                </label>
                <textarea
                  value={currentDaily.victory}
                  onChange={(e) => setCurrentDaily({ ...currentDaily, victory: e.target.value })}
                  placeholder="Escribe aquí..."
                  className="daily-textarea"
                />
              </div>

              <div className="daily-field">
                <label className="daily-label">
                  <TrendingUp size={16} className="icon-emerald" /> Mañana mejoraré en...
                </label>
                <textarea
                  value={currentDaily.improvement}
                  onChange={(e) => setCurrentDaily({ ...currentDaily, improvement: e.target.value })}
                  placeholder="Escribe aquí..."
                  className="daily-textarea"
                />
              </div>

              <button onClick={onSaveDaily} className="daily-save-btn">
                Guardar Daily (+20 pts)
              </button>
            </div>
          )}

          {/* Historial */}
          <div className="journal-history">
            <div className="journal-history-header">
              <h3 className="journal-history-title">
                <BookOpen size={18} className="icon-muted" /> Historial
              </h3>
              <span className="journal-count-badge">{filteredLogs.length} Entradas</span>
            </div>

            <div className="journal-search-wrapper">
              <Search size={18} className="journal-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar victorias, miedos, días..."
                className="journal-search-input"
              />
            </div>

            {dailyLogs.length === 0 ? (
              <p className="journal-empty">Aún no tienes registros. Tu historia comienza hoy.</p>
            ) : filteredLogs.length === 0 ? (
              <p className="journal-no-results">No se encontraron resultados para "{searchQuery}"</p>
            ) : (
              <div className="journal-entries">
                {filteredLogs.map((log, idx) => {
                  const isExpanded = expandedLogIdx === idx;
                  return (
                    <div 
                      key={idx} 
                      className="journal-entry-card" 
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} 
                      onClick={() => toggleLog(idx)}
                    >
                      <div className="journal-entry-header" style={{ marginBottom: isExpanded ? '12px' : '0' }}>
                        <span className="journal-entry-day" style={{ fontWeight: 'bold' }}>Día {log.day}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="journal-entry-date"><CalendarDays size={12} />{log.date}</span>
                          <span style={{ fontSize: '10px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</span>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="journal-entry-content fade-in" style={{ borderTop: '1px dashed var(--border-default)', paddingTop: '16px', marginTop: '4px' }}>
                          <div className="journal-entry-field">
                            <p className="journal-field-label pink"><Heart size={10} /> Gratitud</p>
                            <p className="journal-field-value" style={{ fontStyle: 'italic' }}>"{log.gratitude}"</p>
                          </div>
                          <div className="journal-entry-field">
                            <p className="journal-field-label blue"><Target size={10} /> Victoria</p>
                            <p className="journal-field-value" style={{ fontStyle: 'italic' }}>"{log.victory}"</p>
                          </div>
                          <div className="journal-entry-field">
                            <p className="journal-field-label emerald"><TrendingUp size={10} /> Mejora</p>
                            <p className="journal-field-value" style={{ fontStyle: 'italic' }}>"{log.improvement}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bitacora-section">
          {penaltyJournal.length === 0 ? (
            <div className="bitacora-empty">
              <p>Historial limpio. Sin excusas registradas.</p>
            </div>
          ) : (
            penaltyJournal.map((entry, idx) => (
              <div key={idx} className="bitacora-entry">
                <div className="bitacora-entry-header">
                  <span className="bitacora-entry-info">Día {entry.day} • {entry.timeOfDay}</span>
                  <span className="bitacora-entry-penalty">-{entry.penalty} pts</span>
                </div>
                <p className="bitacora-entry-excuse">"{entry.excuse}"</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
