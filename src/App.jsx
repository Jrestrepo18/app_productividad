import React, { useState, useEffect, useRef } from 'react';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { Bell, Flame } from 'lucide-react';
import { quotes, rewards, lifeReflections } from '@/data/constants';

// Components
import { AuthErrorScreen, DbErrorScreen } from '@/components/ErrorScreens';
import LoadingScreen from '@/components/LoadingScreen';
import ReflectionLock from '@/components/ReflectionLock';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import { PenaltyModal, AddHabitModal, WeeklyEvalModal, EditHabitModal, ConfirmModal } from '@/components/Modals';

// Tabs
import HabitsTab from '@/components/tabs/HabitsTab';
import WeeklyTab from '@/components/tabs/WeeklyTab';
import JournalTab from '@/components/tabs/JournalTab';
import RewardsTab from '@/components/tabs/RewardsTab';
import StatsTab from '@/components/tabs/StatsTab';

export default function App() {
  const firebase = useFirebaseSync();

  // === UI state ===
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('habits');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [failedHabits, setFailedHabits] = useState([]);
  const [penaltyType, setPenaltyType] = useState('endOfDay');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [currentDaily, setCurrentDaily] = useState({ gratitude: '', victory: '', improvement: '' });
  const [toasts, setToasts] = useState([]);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [rewardToBuy, setRewardToBuy] = useState(null);
  const notifiedHabitsRef = useRef({});

  // Quote changes based on the selected date in the calendar
  const today = new Date();
  const dayOne = new Date(today);
  dayOne.setDate(today.getDate() - (firebase.dayOfMonkMode - 1));
  const diffMs = selectedDate - dayOne;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const quoteIndex = Math.max(0, diffDays) % quotes.length;
  const dailyQuote = quotes[quoteIndex];

  const startMonkMode = () => {
    firebase.setIsMonkModeActive(true);
    firebase.syncDB({ isMonkModeActive: true });
  };

  const confirmStopMonkMode = () => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    const cleanHabits = firebase.habits.map(h => ({ ...h, completed: false, failed: false }));
    const cleanWeekly = firebase.weeklyHabits.map(h => ({ ...h, completed: false }));
    const resetState = {
      isMonkModeActive: false,
      dayOfMonkMode: 1,
      totalPoints: 0,
      morningPenaltyChecked: false,
      hasEvaluatedWeekly: false,
      isDailyCompletedToday: false,
      habits: cleanHabits,
      weeklyHabits: cleanWeekly,
      history: [{ day: 0, points: 0 }],
      penaltyJournal: [],
      dailyLogs: [],
      lastLockDate: todayStr
    };

    firebase.setIsMonkModeActive(false);
    firebase.setDayOfMonkMode(1);
    firebase.setTotalPoints(0);
    firebase.setMorningPenaltyChecked(false);
    firebase.setHasEvaluatedWeekly(false);
    firebase.setIsDailyCompletedToday(false);
    firebase.setHabits(cleanHabits);
    firebase.setWeeklyHabits(cleanWeekly);
    firebase.setHistory(resetState.history);
    firebase.setPenaltyJournal([]);
    firebase.setDailyLogs([]);

    firebase.syncDB(resetState);
    setShowStopConfirm(false);
  };

  const stopMonkMode = () => {
    setShowStopConfirm(true);
  };

  // === Reflection timer countdown ===
  useEffect(() => {
    if (firebase.showReflectionLock && firebase.reflectionTimer > 0) {
      const timer = setInterval(() => firebase.setReflectionTimer(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [firebase.showReflectionLock, firebase.reflectionTimer]);

  // === Notifications & Alerts ===
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addToast = (title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const triggerAlert = (habit) => {
    addToast('Modo Monje: Es hora', `Tu hábito: "${habit.name}" te espera. ¡No rompas la racha!`);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Modo Monje: Es hora', {
        body: `Tu hábito: "${habit.name}" te espera. ¡No rompas la racha!`
      });
    }
  };

  // === Auto End Day ===
  useEffect(() => {
    if (!firebase.isDataLoaded || !firebase.isMonkModeActive || !firebase.lastActiveDate) return;

    const todayStr = new Date().toLocaleDateString('es-ES');
    if (firebase.lastActiveDate !== todayStr) {
      const pending = firebase.habits.filter(h => !h.completed && !h.failed);
      if (pending.length > 0) {
        setFailedHabits(pending);
        setPenaltyType('endOfDay');
        setShowPenaltyModal(true);
      } else {
        processEndDay([], '', 'endOfDay'); // Automatically process perfect day
      }
      
      firebase.setLastActiveDate(todayStr);
      firebase.syncDB({ lastActiveDate: todayStr });
    }
  }, [firebase.isDataLoaded, firebase.isMonkModeActive, firebase.lastActiveDate, firebase.habits]);

  // === Clock, Alerts + Morning penalty check ===
  useEffect(() => {
    if (!firebase.isDataLoaded) return;
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);

      // Alertas check
      const currentDay = now.getDay();
      const dateString = now.toLocaleDateString('es-ES');
      const isoToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      
      let [time, modifier] = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ');
      let [hours, minutes] = time.split(':');
      if (hours.length === 1) hours = '0' + hours;
      const formattedNow = `${hours}:${minutes} ${modifier.toUpperCase()}`;

      firebase.habits.forEach(habit => {
        const isScheduledToday = habit.frequencyType === 'once'
          ? habit.specificDate === isoToday
          : (!habit.activeDays || habit.activeDays.includes(currentDay));
        
        if (!isScheduledToday || habit.completed || habit.failed || !habit.time) return;

        if (habit.time === formattedNow) {
          const alertKey = `${habit.id}-${dateString}-${formattedNow}`;
          if (!notifiedHabitsRef.current[alertKey]) {
            notifiedHabitsRef.current[alertKey] = true;
            triggerAlert(habit);
          }
        }
      });

      // Penalización matutina
      if (now.getHours() >= 12 && !firebase.morningPenaltyChecked) {
        const pendingMorning = firebase.habits.filter(h => {
          const isScheduledToday = h.frequencyType === 'once'
            ? h.specificDate === isoToday
            : (!h.activeDays || h.activeDays.includes(currentDay));
          return h.time.includes('AM') && !h.completed && !h.failed && isScheduledToday;
        });
        if (pendingMorning.length > 0) {
          setFailedHabits(pendingMorning);
          setPenaltyType('morning');
          setShowPenaltyModal(true);
        }
        firebase.setMorningPenaltyChecked(true);
        firebase.syncDB({ morningPenaltyChecked: true });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [firebase.habits, firebase.morningPenaltyChecked, firebase.isDataLoaded]);

  // === Core functions ===

  const toggleHabit = (habitId) => {
    const newHabits = firebase.habits.map(h => {
      if (h.id === habitId && !h.failed) {
        const isNowCompleted = !h.completed;
        const ptsChange = isNowCompleted ? h.points : -h.points;
        const newTotal = firebase.totalPoints + ptsChange;
        firebase.setTotalPoints(newTotal);
        firebase.syncDB({ totalPoints: newTotal });
        return { ...h, completed: isNowCompleted };
      }
      return h;
    });
    firebase.setHabits(newHabits);
    firebase.syncDB({ habits: newHabits });
  };

  const deleteHabit = (habitId, type) => {
    setHabitToDelete({ id: habitId, type });
  };

  const confirmDeleteHabit = () => {
    if (!habitToDelete) return;
    const { id, type } = habitToDelete;
    if (type === 'daily') {
      const newHabits = firebase.habits.filter(h => h.id !== id);
      firebase.setHabits(newHabits);
      firebase.syncDB({ habits: newHabits });
    } else {
      const newWeekly = firebase.weeklyHabits.filter(h => h.id !== id);
      firebase.setWeeklyHabits(newWeekly);
      firebase.syncDB({ weeklyHabits: newWeekly });
    }
    setHabitToDelete(null);
  };

  const saveDailyJournal = (dailyData) => {
    const dataToSave = dailyData || currentDaily;
    if (!dataToSave.gratitude || !dataToSave.victory || !dataToSave.improvement) {
      alert('Debes llenar los 3 campos para completar tu Daily.');
      return;
    }
    const newLogs = [{
      day: firebase.dayOfMonkMode,
      date: new Date().toLocaleDateString('es-ES'),
      ...dataToSave
    }, ...firebase.dailyLogs];

    const newTotal = firebase.totalPoints + 20;

    firebase.setDailyLogs(newLogs);
    firebase.setTotalPoints(newTotal);
    firebase.setIsDailyCompletedToday(true);
    setCurrentDaily({ gratitude: '', victory: '', improvement: '' });

    firebase.syncDB({ dailyLogs: newLogs, totalPoints: newTotal, isDailyCompletedToday: true });
    alert(firebase.useOfflineMode
      ? 'Daily guardado localmente. +20 Puntos.'
      : 'Daily guardado con éxito en la nube. +20 Puntos.');
  };

  const processEndDay = (failedList, excuse, type) => {
    let pointsToDeduct = 0;
    failedList.forEach(h => (pointsToDeduct += h.points));
    const newTotal = Math.max(0, firebase.totalPoints - pointsToDeduct);

    let dbUpdates = { totalPoints: newTotal };

    if (failedList.length > 0) {
      const newPenaltyJournal = [{
        day: firebase.dayOfMonkMode,
        timeOfDay: type === 'morning' ? 'Mediodía' : 'Noche',
        failedCount: failedList.length,
        excuse: excuse,
        penalty: pointsToDeduct
      }, ...firebase.penaltyJournal];
      firebase.setPenaltyJournal(newPenaltyJournal);
      dbUpdates.penaltyJournal = newPenaltyJournal;
    }

    firebase.setTotalPoints(newTotal);

    if (type === 'morning') {
      const newHabits = firebase.habits.map(h =>
        failedList.find(f => f.id === h.id) ? { ...h, failed: true } : h
      );
      firebase.setHabits(newHabits);
      dbUpdates.habits = newHabits;
      firebase.syncDB(dbUpdates);
    } else {
      const newHistory = [...firebase.history, { day: firebase.dayOfMonkMode, points: newTotal }];
      const nextDay = firebase.dayOfMonkMode + 1;
      const cleanHabits = firebase.habits.map(h => ({ ...h, completed: false, failed: false }));
      const isNewWeek = new Date().getDay() === 1;

      firebase.setHistory(newHistory);
      firebase.setDayOfMonkMode(nextDay);
      firebase.setMorningPenaltyChecked(false);
      firebase.setIsDailyCompletedToday(false);
      firebase.setHabits(cleanHabits);
      if (isNewWeek) firebase.setHasEvaluatedWeekly(false);

      dbUpdates = {
        ...dbUpdates,
        history: newHistory,
        dayOfMonkMode: nextDay,
        morningPenaltyChecked: false,
        isDailyCompletedToday: false,
        habits: cleanHabits,
        hasEvaluatedWeekly: isNewWeek ? false : firebase.hasEvaluatedWeekly
      };

      firebase.syncDB(dbUpdates);

      firebase.setTodayReflection(lifeReflections[Math.floor(Math.random() * lifeReflections.length)]);
      firebase.setShowReflectionLock(true);
      firebase.setReflectionTimer(60);
    }
  };

  const initiateEndDay = () => {
    const pending = firebase.habits.filter(h => !h.completed && !h.failed);
    if (pending.length > 0) {
      setFailedHabits(pending);
      setPenaltyType('endOfDay');
      setShowPenaltyModal(true);
    } else {
      processEndDay([], '', 'endOfDay');
    }
  };

  const handleCreateHabit = (newHabit, type, time) => {
    if (type === 'daily') {
      const newHabits = [...firebase.habits, { ...newHabit, time, completed: false, failed: false }]
        .sort((a, b) => a.time.localeCompare(b.time));
      firebase.setHabits(newHabits);
      firebase.syncDB({ habits: newHabits });
    } else {
      const newWeekly = [...firebase.weeklyHabits, newHabit];
      firebase.setWeeklyHabits(newWeekly);
      firebase.syncDB({ weeklyHabits: newWeekly });
    }
  };

  const handleEditHabitSubmit = (id, newName, newTime, newActiveDays, newFrequencyType, newSpecificDate) => {
    if (editingHabit.type === 'daily') {
      const newHabits = firebase.habits.map(h => 
        h.id === id ? { ...h, name: newName, time: newTime, activeDays: newActiveDays, frequencyType: newFrequencyType, specificDate: newSpecificDate } : h
      ).sort((a, b) => a.time.localeCompare(b.time));
      firebase.setHabits(newHabits);
      firebase.syncDB({ habits: newHabits });
    } else {
      const newWeekly = firebase.weeklyHabits.map(h => 
        h.id === id ? { ...h, name: newName } : h
      );
      firebase.setWeeklyHabits(newWeekly);
      firebase.syncDB({ weeklyHabits: newWeekly });
    }
  };

  const handleWeeklyEval = (earnedPoints) => {
    const newTotal = firebase.totalPoints + earnedPoints;
    firebase.setTotalPoints(newTotal);
    firebase.setHasEvaluatedWeekly(true);
    firebase.syncDB({ totalPoints: newTotal, hasEvaluatedWeekly: true });
    addToast('Evaluación Semanal', firebase.useOfflineMode
      ? `Evaluación completada localmente. Ganaste +${earnedPoints} puntos.`
      : `Evaluación en la nube completada. Ganaste +${earnedPoints} puntos.`);
  };

  const confirmBuyReward = () => {
    if (!rewardToBuy) return;
    const newTotal = firebase.totalPoints - rewardToBuy.cost;
    const newPurchase = {
      id: Date.now(),
      name: rewardToBuy.name,
      cost: rewardToBuy.cost,
      icon: rewardToBuy.icon,
      date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    const newHistory = [newPurchase, ...firebase.purchaseHistory];

    firebase.setTotalPoints(newTotal);
    firebase.setPurchaseHistory(newHistory);
    firebase.syncDB({ totalPoints: newTotal, purchaseHistory: newHistory });
    setRewardToBuy(null);
  };

  const buyReward = (reward) => {
    if (firebase.totalPoints >= reward.cost) {
      setRewardToBuy(reward);
    }
  };

  // === Error screens ===
  if (firebase.authError && !firebase.useOfflineMode) {
    return <AuthErrorScreen authError={firebase.authError} startOfflineMode={firebase.startOfflineMode} />;
  }
  if (firebase.dbError && !firebase.useOfflineMode) {
    return <DbErrorScreen dbError={firebase.dbError} startOfflineMode={firebase.startOfflineMode} />;
  }
  if (!firebase.isDataLoaded) {
    return <LoadingScreen />;
  }

  // === Main render ===
  if (!firebase.isMonkModeActive) {
    return (
      <div className="app-container">
        <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px', textAlign: 'center' }}>
          <Flame size={64} className="icon-blue" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>Modo Monje</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '16px', lineHeight: '1.5' }}>
            Un desafío estricto de 40 días para transformar tu vida mediante disciplina implacable, construcción de hábitos y cero distracciones.
          </p>
          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold', borderRadius: '16px' }}
            onClick={startMonkMode}
          >
            INICIAR RETO (40 Días)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-shell">

        {/* Reflection Lock */}
        {firebase.showReflectionLock && (
          <ReflectionLock
            todayReflection={firebase.todayReflection}
            reflectionTimer={firebase.reflectionTimer}
            onUnlock={() => firebase.setShowReflectionLock(false)}
          />
        )}

        {/* Header */}
        <AppHeader
          dayOfMonkMode={firebase.dayOfMonkMode}
          totalPoints={firebase.totalPoints}
          dailyQuote={dailyQuote}
          useOfflineMode={firebase.useOfflineMode}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          activeTab={activeTab}
        />

        {/* Main Content */}
        <main className="app-main">
          {activeTab === 'habits' && (
            <HabitsTab
              habits={firebase.habits}
              currentDate={currentDate}
              selectedDate={selectedDate}
              onToggleHabit={toggleHabit}
              onAddHabit={() => setShowAddHabit(true)}
              onEditHabit={(h) => setEditingHabit({ habit: h, type: 'daily' })}
              onDeleteHabit={(id) => deleteHabit(id, 'daily')}
              onEndDay={initiateEndDay}
              onShowToast={addToast}
            />
          )}
          {activeTab === 'weekly' && (
            <WeeklyTab
              weeklyHabits={firebase.weeklyHabits}
              currentDate={currentDate}
              hasEvaluatedWeekly={firebase.hasEvaluatedWeekly}
              onOpenWeeklyModal={() => setShowWeeklyModal(true)}
              onEditHabit={(h) => setEditingHabit({ habit: h, type: 'weekly' })}
              onDeleteHabit={(id) => deleteHabit(id, 'weekly')}
            />
          )}
          {activeTab === 'journal' && (
            <JournalTab
              isDailyCompletedToday={firebase.isDailyCompletedToday}
              currentDaily={currentDaily}
              setCurrentDaily={setCurrentDaily}
              onSaveDaily={saveDailyJournal}
              dailyLogs={firebase.dailyLogs}
              penaltyJournal={firebase.penaltyJournal}
              onShowToast={addToast}
              dayOfMonkMode={firebase.dayOfMonkMode}
            />
          )}
          {activeTab === 'rewards' && (
            <RewardsTab
              rewards={rewards}
              totalPoints={firebase.totalPoints}
              onBuyReward={buyReward}
              purchaseHistory={firebase.purchaseHistory}
            />
          )}
          {activeTab === 'stats' && (
            <StatsTab 
              history={firebase.history} 
              onStopMonkMode={stopMonkMode}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Modals */}
        {showPenaltyModal && (
          <PenaltyModal
            failedHabits={failedHabits}
            penaltyType={penaltyType}
            onSubmit={processEndDay}
            onClose={() => setShowPenaltyModal(false)}
          />
        )}
        {showAddHabit && (
          <AddHabitModal
            onCreateHabit={handleCreateHabit}
            onClose={() => setShowAddHabit(false)}
          />
        )}
        {showWeeklyModal && (
          <WeeklyEvalModal
            weeklyHabits={firebase.weeklyHabits}
            onSubmit={handleWeeklyEval}
            onClose={() => setShowWeeklyModal(false)}
          />
        )}
        {editingHabit && (
          <EditHabitModal
            habit={editingHabit.habit}
            onEditHabit={handleEditHabitSubmit}
            onClose={() => setEditingHabit(null)}
          />
        )}
        {habitToDelete && (
          <ConfirmModal
            title="Borrar Hábito"
            message="¿Estás seguro de que quieres borrar este hábito? Esta acción no se puede deshacer."
            onConfirm={confirmDeleteHabit}
            onCancel={() => setHabitToDelete(null)}
          />
        )}
        {showStopConfirm && (
          <ConfirmModal
            title="Abandonar Modo Monje"
            message="¿Estás SEGURO de que quieres abandonar el Modo Monje? Todo tu progreso, puntos y días volverán a CERO. Esta acción es irreversible."
            onConfirm={confirmStopMonkMode}
            onCancel={() => setShowStopConfirm(false)}
          />
        )}
        {rewardToBuy && (
          <ConfirmModal
            title="Comprar Recompensa"
            message={`¿Quieres comprar "${rewardToBuy.name}" por ${rewardToBuy.cost} puntos?`}
            onConfirm={confirmBuyReward}
            onCancel={() => setRewardToBuy(null)}
          />
        )}

        {/* Toasts */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="toast-card fade-in-up">
              <div className="toast-icon">
                <Bell size={20} />
              </div>
              <div className="toast-content">
                <h4 className="toast-title">{toast.title}</h4>
                <p className="toast-message">{toast.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
