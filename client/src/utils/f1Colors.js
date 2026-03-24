// Paleta oficial de la temporada F1 2026 mapeada con los nombres exactos de la BD
export const teamColors = {
  McLaren: '#ef8733',
  Mercedes: '#75F1D3',
  'Red Bull': '#4570C0', // Antes decía 'Red Bull Racing'
  Ferrari: '#D52E37',
  Williams: '#3267D4',
  'RB F1 Team': '#7091f8', // Antes decía 'VCARB'
  'Aston Martin': '#4B9774',
  'Haas F1 Team': '#DFE1E2', // Antes decía 'Haas'
  Audi: '#EB4526',
  'Alpine F1 Team': '#479FE2', // Antes decía 'Alpine'
  'Cadillac F1 Team': '#AAAADD' // Antes decía 'Cadillac'
}

// Función de ayuda para usar en tus componentes de React
export const getTeamColor = (teamName) => {
  return teamColors[teamName] || '#333333' // Gris oscuro por defecto si no encuentra el equipo
}
