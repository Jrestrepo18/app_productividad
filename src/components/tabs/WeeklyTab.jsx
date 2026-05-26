import React from 'react';
import { Calendar, Trash2, Edit2 } from 'lucide-react';

/**
 * Tab de Objetivos Semanales — muestra hábitos semanales y evaluación dominical
 */
export default function WeeklyTab({
  weeklyHabits,
  currentDate,
  hasEvaluatedWeekly,
  onOpenWeeklyModal,
  onEditHabit,
  onDeleteHabit
}) {
  const isSunday = currentDate.getDay() === 0;

  return (
    <div className="tab-content fade-in">
      <div>
        <h2 className="tab-title">Objetivos Semanales</h2>
        <p className="tab-subtitle">Constancia a largo plazo. Evaluación todos los domingos.</p>
      </div>

      {isSunday && !hasEvaluatedWeekly && (
        <div className="weekly-eval-banner">
          <div className="weekly-eval-header">
            <Calendar size={24} />
            <h3 className="weekly-eval-title">¡Hoy es Domingo!</h3>
          </div>
          <p className="weekly-eval-text">Es momento de evaluar tu desempeño semanal y cobrar tus recompensas.</p>
          <button onClick={onOpenWeeklyModal} className="weekly-eval-btn">
            Hacer Evaluación
          </button>
        </div>
      )}

      <div className="weekly-habits-grid">
        {weeklyHabits.map((habit) => (
          <div key={habit.id} className="weekly-habit-card">
            <div className="weekly-habit-info">
              <p className="weekly-habit-name">{habit.name}</p>
              <div className="weekly-habit-meta">
                <span className="weekly-habit-difficulty">{habit.difficulty}</span>
                <span className="weekly-habit-points">+{habit.points} pts</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onEditHabit(habit); }}
                className="habit-edit-btn"
                title="Editar hábito"
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteHabit(habit.id); }}
                className="habit-delete-btn"
                title="Borrar hábito"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
