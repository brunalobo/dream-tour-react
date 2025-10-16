import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Chart } from 'chart.js'

import 'chart.js/auto'
import './style/style.css'

// Plugin para desenhar setas no gráfico de vento
const arrowPlugin = {
  id: 'arrowPlugin',
  afterDatasetsDraw(chart) {
    // Só desenha se o plugin está explicitamente habilitado
    if (!chart.options?.plugins?.arrowPlugin?.enabled) return;
    
    const ctx = chart.ctx;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    const dataset = chart.data.datasets[0];
    let windDir = chart.options?.plugins?.arrowPlugin?.windDir || 0;
        windDir = (windDir + 180) % 360;
    
    if (!dataset || !dataset.data) return;
    
    dataset.data.forEach((value, index) => {
      const x = xScale.getPixelForValue(index);
      const y = yScale.getPixelForValue(value);
      
      const angle = (windDir * Math.PI) / 180;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-4, 4);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }
};

Chart.register(arrowPlugin);

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
