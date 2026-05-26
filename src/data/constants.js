// ==========================================
// Frases motivacionales diarias
// ==========================================
export const quotes = [
  { text: "No te expliques, demuéstralo.", author: "Epicteto" },
  { text: "Tu futuro se crea por lo que haces hoy, no mañana.", author: "Robert Kiyosaki" },
  { text: "La disciplina es el puente entre las metas y los logros.", author: "Jim Rohn" },
  { text: "La motivación te hace empezar. El hábito te mantiene en marcha.", author: "Jim Ryun" },
  { text: "Si no diseñas tu propio plan de vida, caerás en el de alguien más.", author: "Jim Rohn" },
  { text: "El éxito no es más que unas pocas disciplinas simples, practicadas todos los días.", author: "Jim Rohn" }
];

// ==========================================
// Reflexiones de vida para el candado diario
// ==========================================
export const lifeReflections = [
  { area: "Gratitud", title: "La Trampa de la Ingratitud", text: "Te quejas de lo que te falta, de que no tienes resultados rápidos, pero olvidas que alguien más está orando por tener la salud, el techo y las oportunidades que tú consideras 'normales'. Hoy, antes de pedir más, agradece lo que ya tienes. La gratitud elimina la ansiedad." },
  { area: "Acción", title: "El Precio de la Pereza", text: "Cada vez que eliges Netflix, el celular o quedarte en la cama sobre el esfuerzo, le estás robando a tu 'yo' del futuro. El tiempo pasa igual, la diferencia es quién serás al final. ¿De qué te arrepentirás en 5 años si sigues posponiendo tu negocio de Dropshipping?" },
  { area: "Emociones", title: "Esclavo de tus Impulsos", text: "Dices que quieres cambiar tu vida, pero un mal comentario o una invitación a salir te desvían de tu camino. Si no puedes controlar tus emociones, cualquiera puede controlarte a ti. Sé una roca. Lo que pasa afuera no debe alterar tu misión adentro." },
  { area: "Disciplina", title: "Motivación vs Disciplina", text: "Estás esperando 'sentirte bien' o 'motivado' para hacer las cosas. Eso es mentalidad de perdedor. Los ganadores hacen lo que tienen que hacer incluso cuando odian hacerlo. Construye disciplina, la motivación es una mentira." }
];

// ==========================================
// Hábitos diarios por defecto
// ==========================================
export const defaultHabits = [
  { id: 1, time: '06:00 AM', name: 'Despertar (Regla 5 seg)', difficulty: 'Dificil', points: 30, completed: false, failed: false },
  { id: 2, time: '06:15 AM', name: 'Orar / Meditar', difficulty: 'Facil', points: 10, completed: false, failed: false },
  { id: 3, time: '06:30 AM', name: 'Lectura (10 páginas)', difficulty: 'Medio', points: 20, completed: false, failed: false },
  { id: 4, time: '08:30 AM', name: 'Entrenamiento (Gym)', difficulty: 'Dificil', points: 30, completed: false, failed: false },
  { id: 5, time: '10:30 AM', name: 'Dropshipping (Trabajo duro)', difficulty: 'Dificil', points: 40, completed: false, failed: false },
];

// ==========================================
// Hábitos semanales por defecto
// ==========================================
export const defaultWeeklyHabits = [
  { id: 101, name: 'Cero Alcohol toda la semana', difficulty: 'Muy Dificil', points: 150 },
  { id: 102, name: 'No faltar al Gym (Mínimo 5 días)', difficulty: 'Dificil', points: 100 },
  { id: 103, name: 'Cero comida chatarra', difficulty: 'Medio', points: 80 }
];

// ==========================================
// Recompensas del mercado
// ==========================================
export const rewards = [
  { id: 1, name: 'Ver 1 Capítulo de Serie', cost: 150, icon: '📺' },
  { id: 3, name: 'Comer comida chatarra (1 comida)', cost: 300, icon: '🍔' },
  { id: 5, name: 'Tomar 1-2 Cervezas (Tranquilo)', cost: 500, icon: '🍺' },
  { id: 6, name: 'Comprar un antojo (< $50k COP)', cost: 600, icon: '🛍️' },
  { id: 7, name: 'Día libre de Dropshipping', cost: 800, icon: '🛌' },
  { id: 8, name: 'Salir de rumba / Tomar Guaro', cost: 1200, icon: '🥃' },
];

// ==========================================
// API Key para Gemini (opcional)
// ==========================================
export const GEMINI_API_KEY = "AIzaSyC7Frul-n4DkwdT7fLbEa90uvaj5MyQbPk";
