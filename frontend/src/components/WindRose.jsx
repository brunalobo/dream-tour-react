import React from 'react';

function degToCompass(deg) {
  if (deg == null) return '--';
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return arr[(val % 16)];
}

export default function WindRose({ data, className = '' }) {
  let dir = Number(data?.winddir ?? data?.wdir10m ?? 0) || 0;
  
  // Somar 180º e manter entre 0º e 360º
  dir = (dir + 180) % 360;
  
  const wspdMs = Number(data?.wspd10m ?? data?.windSpeed ?? 0) || 0;
  const wspdKn = wspdMs * 1.943844; // m/s -> knots
  const rotation = dir; // rotate needle by degrees

  // vertical layout: compass above, text below
  return (
    <div className={`wind-panel-vertical ${className}`} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:20, padding:8}}>
      <div className="wind-svg-wrap">
        <svg className="wind-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-label="Rosa dos Ventos">
          <defs>
            <style>{`.compass-label{font-size:14px; fill:#2b5962; font-weight:700}`}</style>
          </defs>
          <circle cx="150" cy="150" r="125" fill="#fff" stroke="#2b5962" strokeWidth="2" />
          <circle cx="150" cy="150" r="95" fill="none" stroke="#cfe6ea" />
          <circle cx="150" cy="150" r="60" fill="none" stroke="#e6f0f2" />

          {/* compass labels outside the circle with more distance */}
          <text className="compass-label" x="150" y="12" textAnchor="middle">N</text>
          <text className="compass-label" x="245" y="44" textAnchor="middle">NE</text>
          <text className="compass-label" x="284" y="150" textAnchor="middle">E</text>
          <text className="compass-label" x="245" y="256" textAnchor="middle">SE</text>
          <text className="compass-label" x="150" y="292" textAnchor="middle">S</text>
          <text className="compass-label" x="55" y="256" textAnchor="middle">SW</text>
          <text className="compass-label" x="16" y="150" textAnchor="middle">W</text>
          <text className="compass-label" x="55" y="44" textAnchor="middle">NW</text>

          <g transform={`rotate(${rotation} 150 150)`}>
            <path d="M150 55 L188 190 L150 160 L112 190 Z" fill="#7cc4c9" stroke="#5aa7ab" />
            <circle cx="150" cy="150" r="9" fill="#114a52" />
          </g>
        </svg>
      </div>

      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:15}}>
        <div style={{fontSize:18, fontWeight:800, color:'#114a52'}}>{wspdKn ? `${wspdKn.toFixed(2)} nós` : '—'}</div>
        <div className="angle-badge-large">{dir.toFixed(1)}°</div>
      </div>
    </div>
  );
}