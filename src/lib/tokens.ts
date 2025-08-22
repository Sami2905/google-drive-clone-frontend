export const tokens = {
  color: {
    brand: {
      primary: '#4F46E5',   // indigo-600
      hover: '#4338CA',     // indigo-700
      ring: 'rgba(79,70,229,.35)',
    },
    neutral: {
      bg: 'rgb(248 250 252)',     // slate-50
      bgDark: 'rgb(2 6 23)',      // slate-950
      text: 'rgb(15 23 42)',      // slate-900
      textDark: 'rgb(241 245 249)'// slate-100
    }
  },
  radius: { control: 10, card: 12 },
  spacing: 8,
  shadow: {
    card: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.12)',
  },
  motion: {
    micro: 0.14,          // 140ms
    dialog: 0.26,         // 260ms
    ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  }
} as const;
