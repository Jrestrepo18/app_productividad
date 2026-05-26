import React from 'react';
import { CalendarDays, TrendingUp, ShoppingBag, BookOpen, Flame } from 'lucide-react';

const tabs = [
  { id: 'habits', icon: Flame, label: 'Rutina' },
  { id: 'weekly', icon: CalendarDays, label: 'Semanal' },
  { id: 'journal', icon: BookOpen, label: 'Diario' },
  { id: 'rewards', icon: ShoppingBag, label: 'Mercado' },
  { id: 'stats', icon: TrendingUp, label: 'Progreso' },
];

/**
 * Barra de navegación inferior estilo app móvil
 */
export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`nav-tab ${activeTab === id ? 'nav-active' : ''}`}
        >
          <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.5} />
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
