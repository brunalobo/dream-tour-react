import React, { useEffect, useState } from 'react';
import WindRose from '../components/WindRose';
import { fetchStationNowDirect } from '../components/stationService';
import { Bar, Line } from 'react-chartjs-2';

export default function TempoReal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = React.useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStationNowDirect();
        if (mounted) {
          setData(res.data || res);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    load();
    const id = setInterval(load, 60000); // update every minute
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // compute wind speed in knots for charts
  const wspdKn = data ? Number(data.wspd10m || data.windSpeed || 0) * 1.943844 : 0;
  const gustKn = data ? Number(data.gust || data.wgust || 0) * 1.943844 : 0;
  const temp = data ? Number(data.temp || 0) : 0;
  const humidity = data ? Number(data.humidity || 0) : 0;
  const pressure = data ? Number(data.pressure_hpa || 0) : 0;
  const precip = data ? Number(data.precip_mm || 0) : 0;

  return (
    <div>
      <header>
        <nav className="wavy-navbar">
          <ul>
            <li><a href="?page=temporeal" className="active">TEMPO REAL</a></li>
            <li><a href="?page=previsao">PREVISÃO</a></li>
            <li><a href="?page=surfabilidade">SURFABILIDADE</a></li>
          </ul>
          <svg viewBox="0 0 1512 130" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M0 130L62.782 115.417C125.564 101.25 252 72.0833 377.564 72.0833C493 72.0833 629.564 101.25 756 108.333C881.564 115.417 1008 101.25 1133.56 97.5C1260 93.75 1385.56 101.25 1448.35 104.583L1512 108.333V0H1448.35C1385.56 0 1260 0 1133.56 0C1008 0 881.564 0 756 0C629.564 0 504 0 377.564 0C252 0 125.564 0 62.782 0H0V130Z"
              fill="#004A64" />
          </svg>
        </nav>
      </header>

      <main>
        <div className="main-header">
          <div className="main-header-logo">
            <img src="/image/onda_header.svg" alt="Onda" />
          </div>
          <h2>TEMPO REAL</h2>
          <div className="header-line"></div>
        </div>

        {error && (
          <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', borderRadius: '4px', margin: '20px 50px' }}>
            Erro ao carregar dados: {error}
          </div>
        )}

        <div className="content">
          <div className="left-column">
            <div className="wind-panel">
              <div className="wind-panel-header">
                <div className="wind-title">Estação Meteorológica</div>
                <div className="wind-status">{loading ? 'Carregando...' : 'Dados atualizados'}</div>
              </div>
              <div className="wind-subheader">Direção</div>
              <div className="wind-compass">
                <WindRose data={data} className="wind-compass-svg" />
              </div>

              <div className="wind-values">
                <div>
                  <div className="wind-label">Velocidade</div>
                  <div className="wind-value">{loading ? '—' : wspdKn.toFixed(2) + ' nós'}</div>
                </div>
                <div>
                  <div className="wind-label">Rajada</div>
                  <div className="wind-value">{loading ? '—' : gustKn.toFixed(2) + ' nós'}</div>
                </div>
              </div>

              <div className="wind-subcard-column">
                <div className="wind-subcard full-width">
                  <div className="wind-subcard-title">Tempo</div>
                  <div className="wind-subcard-value">{loading ? 'Carregando...' : 'Atualizado'}</div>
                  <div className="wind-subcard-item">Pressão Atmosférica <span className="highlight">{loading ? '—' : pressure.toFixed(1) + ' hPa'}</span></div>
                  <div className="wind-subcard-item">Temperatura <span className="highlight">{loading ? '—' : (temp || '—') + '°C'}</span></div>
                  <div className="wind-subcard-item">Umidade <span className="highlight">{loading ? '—' : (humidity || '—') + '%'}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="charts-container">
              <div className="chart-item">
                <h4>Vento (nós)</h4>
                <div id="wind-chart" style={{ height: '380px', position: 'relative' }}>
                  <Line
                    ref={chartRef}
                    data={{
                      labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
                      datasets: [
                        {
                          label: 'Velocidade do vento',
                          data: Array.from({length: 24}, () => wspdKn + (Math.random() - 0.5) * 3),
                          borderColor: '#2196F3',
                          backgroundColor: 'transparent',
                          borderWidth: 2,
                          pointRadius: 0,
                          pointBackgroundColor: 'transparent',
                          pointBorderColor: 'transparent',
                          pointBorderWidth: 0,
                          tension: 0.3,
                          fill: false
                        },
                        {
                          label: 'Velocidade de rajada',
                          data: Array.from({length: 24}, () => gustKn + (Math.random() - 0.5) * 3),
                          borderColor: '#4CAF50',
                          backgroundColor: 'transparent',
                          borderWidth: 2,
                          pointRadius: 4,
                          pointBackgroundColor: '#4CAF50',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 1,
                          tension: 0.3,
                          fill: false
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: 'bottom', usePointStyle: false, labels: { boxWidth: 30, boxHeight: 2, padding: 15, usePointStyle: false } },
                        filler: { propagate: false },
                        arrowPlugin: { enabled: true, windDir: data?.winddir || 0 }
                      },
                      scales: {
                        y: { 
                          beginAtZero: true, 
                          ticks: { font: { size: 12 } },
                          title: { display: true, text: 'Velocidade (nós)' }
                        },
                        x: { 
                          ticks: { font: { size: 11 } },
                          title: { display: true, text: 'Hora' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="chart-item">
                <h4>Pressão Atmosférica (hPa)</h4>
                <div id="pressure-chart" style={{ height: '380px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
                      datasets: [{
                        label: 'Pressão Atmosférica',
                        data: Array.from({length: 24}, () => pressure + (Math.random() - 0.5) * 5),
                        borderColor: '#FF9800',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#FF9800',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 1,
                        tension: 0.3,
                        fill: false
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: 'bottom', usePointStyle: false, labels: { boxWidth: 30, boxHeight: 2, padding: 15, usePointStyle: false } }
                      },
                      scales: {
                        y: { 
                          beginAtZero: false, 
                          ticks: { font: { size: 12 } },
                          title: { display: true, text: 'Pressão (hPa)' }
                        },
                        x: { 
                          ticks: { font: { size: 11 } },
                          title: { display: true, text: 'Hora' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-inner">
          <div className="footer-left">
            <img src="/image/logo_ocp_branca.png" alt="OceanPact Logo" />
          </div>

          <div className="footer-center">
            <div className="qr-codes">
              <div className="qr-item"><img src="/image/qr_code.png" alt="QR Code" /></div>
            </div>
            <div className="feedback-text">
              Sua opinião é importante. Baixe o SeaSpot, experimente e compartilhe o que achou do app. Envie um e-mail para <b>seaspot@oceanpact.com</b> e dê seu feedback.
            </div>
          </div>

          <div className="footer-right">
            <img src="/image/surf_seaspot_icon.png" alt="OceanPact SeaSpot" />
          </div>
        </div>
      </footer>
    </div>
  );
}
