export const formatters = {
  // Formatear fecha en español
  date: (date: Date): string => {
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Formatear fecha y hora
  dateTime: (date: Date): string => {
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Formatear moneda chilena
  currency: (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  },

  // Formatear texto a título
  toTitle: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Truncar texto
  truncate: (text: string, maxLength: number): string => {
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  }
};

// Ejemplos de uso:
// formatters.date(new Date()) // "26 de agosto de 2025"
// formatters.currency(1500) // "$1.500"