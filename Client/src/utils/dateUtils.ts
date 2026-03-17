export const formatDay = (date: Date) =>
  date.toLocaleDateString('ru-RU', { weekday: 'short' }).toUpperCase();

export const formatDate = (date: Date) => date.getDate();

export const formatMonth = (date: Date) =>
  date.toLocaleDateString('ru-RU', { month: 'long' });

export const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatFullDate = (date: Date) =>
  date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
