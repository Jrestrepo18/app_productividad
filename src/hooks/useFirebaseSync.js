import { useState, useEffect, useCallback } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, APP_ID } from '@/lib/firebase';
import { defaultHabits, defaultWeeklyHabits, lifeReflections } from '@/data/constants';

/**
 * Custom hook que maneja toda la lógica de Firebase:
 * - Autenticación anónima
 * - Sincronización en tiempo real con Firestore
 * - Fallback a modo offline
 */
export function useFirebaseSync() {
  // Auth & loading state
  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [useOfflineMode, setUseOfflineMode] = useState(false);

  // App state
  const [dayOfMonkMode, setDayOfMonkMode] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [morningPenaltyChecked, setMorningPenaltyChecked] = useState(false);
  const [hasEvaluatedWeekly, setHasEvaluatedWeekly] = useState(false);
  const [isDailyCompletedToday, setIsDailyCompletedToday] = useState(false);
  const [habits, setHabits] = useState([]);
  const [weeklyHabits, setWeeklyHabits] = useState([]);
  const [history, setHistory] = useState([{ day: 0, points: 0 }]);
  const [penaltyJournal, setPenaltyJournal] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isMonkModeActive, setIsMonkModeActive] = useState(false);
  const [lastActiveDate, setLastActiveDate] = useState('');

  // Reflection lock state
  const [showReflectionLock, setShowReflectionLock] = useState(false);
  const [reflectionTimer, setReflectionTimer] = useState(0);
  const [todayReflection, setTodayReflection] = useState(lifeReflections[0]);

  // === Sync function ===
  const syncDB = useCallback(async (updates) => {
    if (!user || useOfflineMode) return;
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'monkMode', 'state');
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error("Error saving to Firestore:", e);
      if (e.code === 'permission-denied' || (e.message && e.message.toLowerCase().includes('permission'))) {
        setDbError(e.message);
      }
    }
  }, [user, useOfflineMode]);

  // === Auth initialization ===
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Error authenticating:", err);
        setAuthError({ code: err.code, message: err.message });
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // === Data sync with Firestore ===
  useEffect(() => {
    if (!user || useOfflineMode) return;

    const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'monkMode', 'state');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDayOfMonkMode(data.dayOfMonkMode || 1);
        setTotalPoints(data.totalPoints || 0);
        setIsMonkModeActive(data.isMonkModeActive || false);
        setMorningPenaltyChecked(data.morningPenaltyChecked || false);
        setHasEvaluatedWeekly(data.hasEvaluatedWeekly || false);
        setIsDailyCompletedToday(data.isDailyCompletedToday || false);
        setLastActiveDate(data.lastActiveDate || '');

        if (data.habits) setHabits(data.habits);
        if (data.weeklyHabits) setWeeklyHabits(data.weeklyHabits);
        if (data.history) setHistory(data.history);
        if (data.penaltyJournal) setPenaltyJournal(data.penaltyJournal);
        if (data.dailyLogs) setDailyLogs(data.dailyLogs);
        if (data.purchaseHistory) setPurchaseHistory(data.purchaseHistory);

        // Daily lock logic
        const todayStr = new Date().toLocaleDateString('es-ES');
        if (data.lastLockDate !== todayStr && !showReflectionLock && reflectionTimer === 0) {
          setTodayReflection(lifeReflections[Math.floor(Math.random() * lifeReflections.length)]);
          setShowReflectionLock(true);
          setReflectionTimer(60);
          syncDB({ lastLockDate: todayStr });
        }

        setIsDataLoaded(true);
      } else {
        // Initialize new user
        const todayStr = new Date().toLocaleDateString('es-ES');
        const initialState = {
          isMonkModeActive: false,
          dayOfMonkMode: 1,
          totalPoints: 0,
          morningPenaltyChecked: false,
          hasEvaluatedWeekly: false,
          isDailyCompletedToday: false,
          habits: [],
          weeklyHabits: [],
          history: [{ day: 0, points: 0 }],
          penaltyJournal: [],
          dailyLogs: [],
          purchaseHistory: [],
          lastLockDate: '',
          lastActiveDate: todayStr
        };
        syncDB(initialState);

        setTodayReflection(lifeReflections[Math.floor(Math.random() * lifeReflections.length)]);
        setShowReflectionLock(true);
        setReflectionTimer(60);
        setIsDataLoaded(true);
      }
    }, (error) => {
      console.error("Error fetching data:", error);
      if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('permission'))) {
        setDbError(error.message);
      }
      setIsDataLoaded(true);
    });

    return () => unsubscribe();
  }, [user, useOfflineMode]);

  // === Offline mode fallback ===
  const startOfflineMode = useCallback(() => {
    setDbError(null);
    setAuthError(null);
    setUseOfflineMode(true);
    setHabits([]);
    setWeeklyHabits([]);
    setLastActiveDate(new Date().toLocaleDateString('es-ES'));
    setIsDataLoaded(true);
    setTodayReflection(lifeReflections[Math.floor(Math.random() * lifeReflections.length)]);
    setShowReflectionLock(true);
    setReflectionTimer(60);
  }, []);

  return {
    // Auth & status
    user,
    isDataLoaded,
    authError,
    dbError,
    useOfflineMode,
    startOfflineMode,
    syncDB,

    // App data
    dayOfMonkMode, setDayOfMonkMode,
    totalPoints, setTotalPoints,
    morningPenaltyChecked, setMorningPenaltyChecked,
    hasEvaluatedWeekly, setHasEvaluatedWeekly,
    isDailyCompletedToday, setIsDailyCompletedToday,
    habits, setHabits,
    weeklyHabits, setWeeklyHabits,
    history, setHistory,
    penaltyJournal, setPenaltyJournal,
    dailyLogs, setDailyLogs,
    purchaseHistory, setPurchaseHistory,
    isMonkModeActive, setIsMonkModeActive,
    lastActiveDate, setLastActiveDate,

    // Reflection lock
    showReflectionLock, setShowReflectionLock,
    reflectionTimer, setReflectionTimer,
    todayReflection, setTodayReflection,
  };
}
