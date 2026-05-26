import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Tab de Progreso — gráfica de puntos a lo largo de los días
 */
export default function StatsTab({ history, onStopMonkMode }) {
  return (
    <div className="tab-content fade-in">
      <div>
        <h2 className="tab-title">Progreso</h2>
      </div>

      <div className="stats-chart-card">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#71717a"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="#71717a"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: '#27272a',
                borderRadius: '16px',
                color: '#fff'
              }}
            />
            <Line
              type="monotone"
              dataKey="points"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button 
          className="btn-danger"
          style={{ width: '100%', padding: '16px', fontWeight: 'bold', borderRadius: '12px' }}
          onClick={onStopMonkMode}
        >
          ⚠️ Rendirse / Detener Modo Monje
        </button>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
          Detener el Modo Monje reiniciará tu racha y puntos a cero.
        </p>
      </div>
    </div>
  );
}
