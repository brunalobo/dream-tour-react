import React from 'react';

export default function WindBarbs({ data }) {
  const winddir = Number(data?.winddir ?? data?.wdir10m ?? 0) || 0;
  const wspdMs = Number(data?.wspd10m ?? data?.windSpeed ?? 0) || 0;
  const wspdKn = wspdMs * 1.943844; // m/s -> knots

  // Converter velocidade do vento para escala visual (0-50px para representar até 25 knots)
  const barbLength = Math.min(wspdKn * 2, 50);

  // Cores baseadas na velocidade (escala de intensidade)
  let color = '#7cc4c9';
  if (wspdKn < 5) color = '#4da6ff';      // azul fraco
  else if (wspdKn < 10) color = '#7cc4c9'; // azul médio
  else if (wspdKn < 15) color = '#ff9800'; // laranja
  else color = '#ff6b6b';                  // vermelho forte

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
      {/* SVG com barbs de vento (setas) */}
      <svg width="280" height="280" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
        {/* Círculos de fundo */}
        <circle cx="140" cy="140" r="120" fill="none" stroke="#e0e0e0" strokeWidth="1" />
        <circle cx="140" cy="140" r="80" fill="none" stroke="#e0e0e0" strokeWidth="1" />
        <circle cx="140" cy="140" r="40" fill="none" stroke="#e0e0e0" strokeWidth="1" />

        {/* Eixos (N, S, E, W) */}
        <line x1="140" y1="20" x2="140" y2="50" stroke="#004A64" strokeWidth="2" />
        <line x1="140" y1="230" x2="140" y2="260" stroke="#004A64" strokeWidth="2" />
        <line x1="20" y1="140" x2="50" y2="140" stroke="#004A64" strokeWidth="2" />
        <line x1="230" y1="140" x2="260" y2="140" stroke="#004A64" strokeWidth="2" />

        {/* Rótulos N, S, E, W */}
        <text x="140" y="15" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#004A64">N</text>
        <text x="140" y="275" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#004A64">S</text>
        <text x="265" y="145" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#004A64">E</text>
        <text x="15" y="145" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#004A64">W</text>

        {/* Flecha de direção do vento (barbs) */}
        <g transform={`translate(140, 140) rotate(${winddir})`}>
          {/* Haste principal */}
          <line x1="0" y1="0" x2="0" y2={-barbLength} stroke={color} strokeWidth="3" strokeLinecap="round" />
          
          {/* Ponta da seta */}
          <polygon points={`0,-${barbLength} -6,-${barbLength + 10} 6,-${barbLength + 10}`} fill={color} />

          {/* Barbs (pequenas hastes que indicam intensidade) */}
          {wspdKn >= 5 && <line x1="0" y1={-10} x2="8" y2={-6} stroke={color} strokeWidth="2" />}
          {wspdKn >= 10 && <line x1="0" y1={-20} x2="8" y2={-16} stroke={color} strokeWidth="2" />}
          {wspdKn >= 15 && <line x1="0" y1={-30} x2="8" y2={-26} stroke={color} strokeWidth="2" />}
          {wspdKn >= 20 && <line x1="0" y1={-40} x2="8" y2={-36} stroke={color} strokeWidth="2" />}
        </g>
      </svg>

      {/* Informações de velocidade */}
      <div style={{ textAlign: 'center', color: '#004A64' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          {wspdKn.toFixed(2)} nós
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Direção: {winddir.toFixed(0)}°
        </div>
      </div>
    </div>
  );
}
