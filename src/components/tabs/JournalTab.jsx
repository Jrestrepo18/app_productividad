import React, { useState } from 'react';
import { 
  PenTool, Heart, Target, TrendingUp, CheckCircle2, 
  BookOpen, CalendarDays, Search, Play
} from 'lucide-react';
import { DailyWizardModal } from '../Modals';

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
  const [showWizard, setShowWizard] = useState(false);

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
            <div className="daily-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
                <PenTool size={48} className="icon-purple" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Es hora de tu Daily</h3>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px', maxWidth: '300px', lineHeight: '1.5' }}>
                Toma un respiro. Reflexiona sobre tu día paso a paso sin distracciones.
              </p>
              <button 
                onClick={() => setShowWizard(true)} 
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold', borderRadius: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                <Play size={20} /> Iniciar Daily
              </button>
            </div>
          )}

          {showWizard && (
            <DailyWizardModal 
              initialData={currentDaily}
              onSave={(data) => {
                setCurrentDaily(data);
                onSaveDaily(data);
              }}
              onClose={() => setShowWizard(false)}
            />
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
