import React, { useState } from 'react';
import { AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { GEMINI_API_KEY } from '@/data/constants';

/**
 * Modal para registrar penalización por hábitos fallidos
 */
export function PenaltyModal({ failedHabits, penaltyType, onSubmit, onClose }) {
  const [excuse, setExcuse] = useState('');

  let totalPenalty = 0;
  failedHabits.forEach(h => totalPenalty += h.points);

  const handleSubmit = () => {
    onSubmit(failedHabits, excuse, penaltyType);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon-warning">
            <AlertCircle size={32} />
          </div>
          <h2 className="modal-title">
            {penaltyType === 'morning' ? 'Penalización de Mediodía' : 'Penalización Final del Día'}
          </h2>
          <p className="modal-subtitle">
            {failedHabits.length} hábito(s) sin completar. Penalización: <span className="text-red">-{totalPenalty} pts</span>
          </p>
        </div>

        <div className="modal-habits-list">
          {failedHabits.map(h => (
            <div key={h.id} className="modal-habit-item">
              <X size={16} className="icon-red" />
              <span>{h.name}</span>
              <span className="modal-habit-pts">-{h.points}</span>
            </div>
          ))}
        </div>

        <div className="modal-field">
          <label className="modal-label">¿Cuál es tu excusa? (Sé brutalmente honesto)</label>
          <textarea
            value={excuse}
            onChange={(e) => setExcuse(e.target.value)}
            placeholder="Escribe aquí tu excusa..."
            className="modal-textarea"
          />
        </div>

        <button onClick={handleSubmit} className="modal-submit-btn penalty">
          Aceptar Penalización (-{totalPenalty} pts)
        </button>
      </div>
    </div>
  );
}

const DAYS = [
  { id: 1, label: 'L' },
  { id: 2, label: 'M' },
  { id: 3, label: 'X' },
  { id: 4, label: 'J' },
  { id: 5, label: 'V' },
  { id: 6, label: 'S' },
  { id: 0, label: 'D' },
];

function DaySelector({ activeDays, onChange }) {
  const toggleDay = (dayId) => {
    if (activeDays.includes(dayId)) {
      // Prevent unselecting all days
      if (activeDays.length > 1) {
        onChange(activeDays.filter(d => d !== dayId));
      }
    } else {
      onChange([...activeDays, dayId]);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'space-between' }}>
      {DAYS.map(day => {
        const isActive = activeDays.includes(day.id);
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => toggleDay(day.id)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: `1px solid ${isActive ? 'var(--primary-main)' : 'var(--border-default)'}`,
              backgroundColor: isActive ? 'var(--primary-main)' : 'var(--bg-card)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Modal para añadir un nuevo hábito
 */
export function AddHabitModal({ onCreateHabit, onClose }) {
  const [name, setName] = useState('');
  const [time, setTime] = useState('06:00 AM');
  const [type, setType] = useState('daily');
  const [frequencyType, setFrequencyType] = useState('recurring');
  const [specificDate, setSpecificDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);

    let assignedPoints = type === 'weekly' ? 80 : 20;
    let assignedDifficulty = 'Medio';

    if (GEMINI_API_KEY) {
      try {
        const promptText = `
          Eres un juez implacable de desarrollo personal. Evalúa la dificultad real y el esfuerzo físico/mental requerido para este hábito: "${name}". Tipo de hábito: ${type}.
          Debes ser muy analítico: "Leer 1 página" es ridículamente Fácil (10 pts). "Leer 50 páginas" es Difícil (40 pts). "Correr 10km" es Muy Difícil.
          Responde SOLO con un JSON válido exactamente con esta estructura: {"dificultad": "Facil", "puntos": 10} 
          Opciones estrictas de dificultad: "Facil", "Medio", "Dificil", "Muy Dificil".
          Rango de puntos si es "weekly" (semanal): entre 50 y 200.
          Rango de puntos si es "daily" (diario): entre 10 y 40.
          No agregues texto extra, solo el JSON puro.
        `;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );
        const result = await response.json();
        const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          try {
            const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanedText);
            assignedDifficulty = parsed.dificultad || 'Medio';
            assignedPoints = parsed.puntos || (type === 'weekly' ? 100 : 20);
          } catch (parseError) {
            console.error('Error parseando JSON de IA:', parseError, textResponse);
          }
        }
      } catch (error) {
        console.error('Error AI:', error);
      }
    } else {
      const rand = Math.random();
      if (type === 'weekly') {
        assignedPoints = rand > 0.5 ? 100 : 150;
        assignedDifficulty = rand > 0.5 ? 'Dificil' : 'Muy Dificil';
      } else {
        assignedPoints = rand > 0.5 ? 20 : 30;
        assignedDifficulty = rand > 0.5 ? 'Medio' : 'Dificil';
      }
    }

    const newHabit = {
      id: Date.now(),
      name,
      difficulty: assignedDifficulty,
      points: assignedPoints,
      activeDays: type === 'daily' && frequencyType === 'recurring' ? activeDays : null,
      frequencyType: type === 'daily' ? frequencyType : 'recurring',
      specificDate: type === 'daily' && frequencyType === 'once' ? specificDate : null
    };

    onCreateHabit(newHabit, type, time);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Sparkles size={20} className="icon-yellow" /> Crear Nuevo Hábito
          </h2>
        </div>

        <div className="modal-field">
          <label className="modal-label">Nombre del hábito</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Meditar 15 min..."
            className="modal-input"
          />
        </div>

        <div className="modal-field">
          <label className="modal-label">Tipo</label>
          <div className="modal-type-selector">
            <button
              onClick={() => setType('daily')}
              className={`type-btn ${type === 'daily' ? 'type-active' : ''}`}
            >
              Diario
            </button>
            <button
              onClick={() => setType('weekly')}
              className={`type-btn ${type === 'weekly' ? 'type-active' : ''}`}
            >
              Semanal
            </button>
          </div>
        </div>

        {type === 'daily' && (
          <>
            <div className="modal-field">
              <label className="modal-label">Frecuencia</label>
              <div className="modal-type-selector">
                <button
                  onClick={() => setFrequencyType('recurring')}
                  className={`type-btn ${frequencyType === 'recurring' ? 'type-active' : ''}`}
                >
                  Recurrente
                </button>
                <button
                  onClick={() => setFrequencyType('once')}
                  className={`type-btn ${frequencyType === 'once' ? 'type-active' : ''}`}
                >
                  Una sola vez
                </button>
              </div>
            </div>

            {frequencyType === 'recurring' ? (
              <div className="modal-field">
                <label className="modal-label">Días de la semana</label>
                <DaySelector activeDays={activeDays} onChange={setActiveDays} />
              </div>
            ) : (
              <div className="modal-field">
                <label className="modal-label">Fecha Específica</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="modal-input"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            )}

            <div className="modal-field">
              <label className="modal-label">Hora</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="06:00 AM"
                className="modal-input"
              />
            </div>
          </>
        )}

        <button
          onClick={handleCreate}
          disabled={isLoading || !name.trim()}
          className="modal-submit-btn create"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spin" /> Evaluando con IA...
            </>
          ) : (
            'Crear Hábito'
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Modal de evaluación semanal dominical
 */
export function WeeklyEvalModal({ weeklyHabits, onSubmit, onClose }) {
  const [evalData, setEvalData] = useState({});

  const handleSubmit = () => {
    let earnedPoints = 0;
    weeklyHabits.forEach(h => {
      if (evalData[h.id]) earnedPoints += h.points;
    });
    onSubmit(earnedPoints);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Evaluación Semanal</h2>
          <p className="modal-subtitle">¿Cumpliste estos objetivos esta semana?</p>
        </div>

        <div className="weekly-eval-list">
          {weeklyHabits.map(h => (
            <button
              key={h.id}
              onClick={() => setEvalData(prev => ({ ...prev, [h.id]: !prev[h.id] }))}
              className={`weekly-eval-item ${evalData[h.id] ? 'eval-completed' : ''}`}
            >
              <div className={`eval-check ${evalData[h.id] ? 'checked' : ''}`}>
                {evalData[h.id] ? '✓' : ''}
              </div>
              <div className="eval-info">
                <p className="eval-habit-name">{h.name}</p>
                <p className="eval-habit-points">+{h.points} pts</p>
              </div>
            </button>
          ))}
        </div>

        <button onClick={handleSubmit} className="modal-submit-btn create">
          Enviar Evaluación
        </button>
      </div>
    </div>
  );
}

/**
 * Modal para editar un hábito
 */
export function EditHabitModal({ habit, onEditHabit, onClose }) {
  const [name, setName] = useState(habit?.name || '');
  const [time, setTime] = useState(habit?.time || '06:00 AM');
  const [frequencyType, setFrequencyType] = useState(habit?.frequencyType || 'recurring');
  const [specificDate, setSpecificDate] = useState(habit?.specificDate || new Date().toISOString().split('T')[0]);
  const [activeDays, setActiveDays] = useState(habit?.activeDays || [0, 1, 2, 3, 4, 5, 6]);

  const handleEdit = () => {
    if (!name.trim()) return;
    onEditHabit(habit.id, name, time, activeDays, frequencyType, specificDate);
    onClose();
  };

  if (!habit) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Hábito</h2>
        </div>

        <div className="modal-field">
          <label className="modal-label">Nombre del hábito</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="modal-input"
          />
        </div>

        {habit.frequencyType !== undefined && (
          <>
            <div className="modal-field">
              <label className="modal-label">Frecuencia</label>
              <div className="modal-type-selector">
                <button
                  onClick={() => setFrequencyType('recurring')}
                  className={`type-btn ${frequencyType === 'recurring' ? 'type-active' : ''}`}
                >
                  Recurrente
                </button>
                <button
                  onClick={() => setFrequencyType('once')}
                  className={`type-btn ${frequencyType === 'once' ? 'type-active' : ''}`}
                >
                  Una sola vez
                </button>
              </div>
            </div>

            {frequencyType === 'recurring' ? (
              <div className="modal-field">
                <label className="modal-label">Días de la semana</label>
                <DaySelector activeDays={activeDays} onChange={setActiveDays} />
              </div>
            ) : (
              <div className="modal-field">
                <label className="modal-label">Fecha Específica</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="modal-input"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            )}
          </>
        )}

        <div className="modal-field">
          <label className="modal-label">Hora (ej. 06:00 AM)</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="modal-input"
          />
        </div>

        <button onClick={handleEdit} disabled={!name.trim()} className="modal-submit-btn create">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

/**
 * Modal de confirmación genérico
 */
export function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onCancel} 
            style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontWeight: '500' }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--accent-red)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal tipo Wizard para el Daily
 */
export function DailyWizardModal({ initialData, onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData || { gratitude: '', victory: '', improvement: '' });

  const handleKeyDown = (e, fieldName) => {
    if (e.key === 'Enter') {
      const val = data[fieldName];
      const cursorPosition = e.target.selectionStart;
      const lines = val.substr(0, cursorPosition).split('\n');
      const currentLine = lines[lines.length - 1];

      // Check if current line starts with "- "
      if (currentLine.trim().startsWith('- ')) {
        e.preventDefault();
        const insertText = '\n- ';
        const newVal = val.substring(0, cursorPosition) + insertText + val.substring(e.target.selectionEnd);
        setData({ ...data, [fieldName]: newVal });
        
        // Use timeout to update cursor position after render
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorPosition + insertText.length;
        }, 0);
      }
    }
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));
  
  const handleSave = () => {
    if (!data.gratitude || !data.victory || !data.improvement) {
      alert('Debes llenar los 3 campos para completar tu Daily.');
      return;
    }
    onSave(data);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in-up" onClick={(e) => e.stopPropagation()} style={{ minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ marginBottom: '12px' }}>
          <h2 className="modal-title" style={{ fontSize: '24px' }}>
            {step === 1 && 'Paso 1: Gratitud'}
            {step === 2 && 'Paso 2: Victoria'}
            {step === 3 && 'Paso 3: Mejora'}
          </h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 'bold', background: 'var(--bg-input)', padding: '4px 12px', borderRadius: '16px' }}>{step} / 3</span>
        </div>
        
        <div className="modal-field" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label className="modal-label" style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {step === 1 && '❤️ Hoy doy gracias por...'}
            {step === 2 && '🎯 Mi mayor victoria hoy fue...'}
            {step === 3 && '📈 Mañana mejoraré en...'}
          </label>
          <textarea
            autoFocus
            value={step === 1 ? data.gratitude : step === 2 ? data.victory : data.improvement}
            onChange={(e) => {
              const field = step === 1 ? 'gratitude' : step === 2 ? 'victory' : 'improvement';
              setData({ ...data, [field]: e.target.value });
            }}
            onKeyDown={(e) => handleKeyDown(e, step === 1 ? 'gratitude' : step === 2 ? 'victory' : 'improvement')}
            placeholder="Puedes usar guiones para hacer listas:\n- Primera cosa\n- Segunda cosa..."
            className="modal-textarea"
            style={{ flex: 1, minHeight: '200px', fontSize: '16px', lineHeight: '1.6' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {step > 1 && (
            <button 
              onClick={handlePrev} 
              style={{ flex: 1, padding: '16px', borderRadius: '12px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Anterior
            </button>
          )}
          {step < 3 ? (
            <button 
              onClick={handleNext} 
              style={{ flex: step === 1 ? 1 : 2, padding: '16px', borderRadius: '12px', background: 'var(--primary-main)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              Siguiente
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              style={{ flex: 2, padding: '16px', borderRadius: '12px', background: 'var(--accent-emerald)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              Finalizar y Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
