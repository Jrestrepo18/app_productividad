import React, { useState } from 'react';
import { CheckCircle2, Circle, X, Clock, Plus, Trash2, Edit2 } from 'lucide-react';

/**
 * Tab de Rutina Diaria — lista de hábitos con toggle y opción de agregar
 */
export default function HabitsTab({
  habits,
  currentDate,
  selectedDate,
  onToggleHabit,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onEndDay,
  onShowToast
}) {
  const [swipeState, setSwipeState] = useState({});

  const handleTouchStart = (e, id) => {
    setSwipeState(prev => ({ ...prev, [id]: { startX: e.touches[0].clientX, offset: 0 } }));
  };

  const handleTouchMove = (e, id, isDone, isFailed) => {
    if (isDone || isFailed) return;
    const startX = swipeState[id]?.startX;
    if (startX == null) return;
    
    const diff = e.touches[0].clientX - startX;
    if (diff > 0 && diff < window.innerWidth * 0.8) {
      setSwipeState(prev => ({ ...prev, [id]: { ...prev[id], offset: diff } }));
    }
  };

  const handleTouchEnd = (e, id, isDone, isFailed) => {
    if (isDone || isFailed) return;
    const offset = swipeState[id]?.offset || 0;
    if (offset > window.innerWidth * 0.4) {
      const isToday = selectedDate.getDate() === currentDate.getDate() && selectedDate.getMonth() === currentDate.getMonth();
      const isPast = selectedDate < new Date(currentDate.setHours(0,0,0,0));
      if (isToday) {
        onToggleHabit(id);
      } else if (isPast) {
        onShowToast('Acción no permitida', 'No puedes completar hábitos en el pasado.');
      } else {
        onShowToast('Acción no permitida', 'Solo puedes completar hábitos del día actual.');
      }
    }
    setSwipeState(prev => ({ ...prev, [id]: { startX: null, offset: 0 } }));
  };

  return (
    <div className="tab-content fade-in">
      <div className="tab-header">
        <h2 className="tab-title">Rutina Diaria</h2>
        <p className="tab-time-badge" style={{ textTransform: 'capitalize' }}>
          {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="habits-list">
        {habits.filter(habit => {
          const isoSelected = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
          return habit.frequencyType === 'once'
            ? habit.specificDate === isoSelected
            : (!habit.activeDays || habit.activeDays.includes(selectedDate.getDay()));
        }).map((habit) => {
          const offset = swipeState[habit.id]?.offset || 0;
          const isSwiping = offset > 0;
          const isToday = selectedDate.toDateString() === currentDate.toDateString();
          return (
            <div
              key={habit.id}
              onTouchStart={(e) => handleTouchStart(e, habit.id)}
              onTouchMove={(e) => handleTouchMove(e, habit.id, habit.completed, habit.failed)}
              onTouchEnd={(e) => handleTouchEnd(e, habit.id, habit.completed, habit.failed)}
              className={`habit-card ${
                habit.failed ? 'habit-failed' : habit.completed ? 'habit-completed' : 'habit-pending'
              }`}
              style={{
                transform: `translateX(${offset}px)`,
                transition: isSwiping ? 'none' : 'transform 0.3s ease'
              }}
            >
            <button 
              className="habit-toggle-area"
              onClick={() => {
                if (isToday) onToggleHabit(habit.id);
                else onShowToast('Acción no permitida', 'Solo puedes completar hábitos del día actual.');
              }}
              disabled={habit.failed}
            >
              <div className={`habit-check ${habit.failed ? 'check-failed' : habit.completed ? 'check-done' : 'check-pending'}`}>
                {habit.failed ? <X size={26} /> : habit.completed ? <CheckCircle2 size={26} strokeWidth={2} /> : <Circle size={26} strokeWidth={2} />}
              </div>

              <div className="habit-info">
                <p className={`habit-name ${habit.failed ? 'name-failed' : habit.completed ? 'name-completed' : ''}`}>
                  {habit.name}
                </p>
                <div className="habit-meta">
                  <span className="habit-time"><Clock size={12} /> {habit.time}</span>
                  <span className="habit-separator">•</span>
                  <span className={`habit-points ${habit.failed ? 'points-failed' : ''}`}>
                    {habit.failed ? 'Fallado' : `+${habit.points} pts`}
                  </span>
                </div>
              </div>
            </button>
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
          );
        })}
      </div>

      <button onClick={onAddHabit} className="add-habit-btn">
        <Plus size={20} /> Añadir hábito
      </button>

    </div>
  );
}
