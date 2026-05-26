import React, { useRef, useEffect } from 'react';
import { Flame, Coins } from 'lucide-react';

/**
 * Header de la aplicación con el nombre, día actual, puntos y frase motivacional
 */
export default function AppHeader({ dayOfMonkMode, totalPoints, dailyQuote, useOfflineMode, selectedDate, onSelectDate }) {
  const progressPercent = Math.min((dayOfMonkMode / 40) * 100, 100);

  // Generate date ribbon (-3 days to +3 days)
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + (i - 3));
    return d;
  });

  return (
    <header className="app-header">
      <div className="header-top" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h1 className="header-title">
            <Flame size={24} className="header-flame-icon" />
            Modo Monje
          </h1>
          <div style={{ marginTop: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span className="header-subtitle" style={{ margin: 0, fontWeight: 'bold' }}>Día {dayOfMonkMode} / 40</span>
             <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{Math.round(progressPercent)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
             <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary-main)', transition: 'width 0.5s ease-out' }} />
          </div>
          {useOfflineMode && <p className="header-offline-badge" style={{ marginTop: '12px' }}>Modo Offline</p>}
        </div>
        <div className="header-points-badge" style={{ marginLeft: '16px', marginTop: '4px' }}>
          <Coins size={16} className="header-coins-icon" />
          <span className="header-points-value">{totalPoints}</span>
        </div>
      </div>

      <div 
        className="date-ribbon" 
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '8px', 
          padding: '16px 0 8px 0', 
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* IE and Edge */
        }}
      >
        <style>
          {`
            .date-ribbon::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {dates.map((date, idx) => {
          const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
          const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
          const dayNum = date.getDate();
          return (
            <div key={idx} onClick={() => onSelectDate?.(date)} style={{
              flexShrink: 0,
              width: '56px',
              height: '64px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor: isSelected ? 'var(--primary-main)' : 'var(--bg-card)',
              color: isSelected ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${isSelected ? 'var(--primary-main)' : 'var(--border-default)'}`,
              boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '12px', textTransform: 'capitalize', opacity: isSelected ? 0.9 : 0.7, marginBottom: '2px' }}>{dayName}</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{dayNum}</span>
            </div>
          )
        })}
      </div>

      <div className="header-quote-card" style={{ marginTop: '12px' }}>
        <p className="header-quote-text">"{dailyQuote.text}"</p>
        <p className="header-quote-author">— {dailyQuote.author}</p>
      </div>
    </header>
  );
}
