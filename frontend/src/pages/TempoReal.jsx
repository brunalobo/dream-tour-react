import React, { useEffect, useState } from 'react';
import WindRose from '../components/WindRose';
import { fetchStationNow } from '../components/stationService';
import { Bar } from 'react-chartjs-2';

export default function TempoReal() {
  const [data, setData] = useState(null);

  // compute wind speed in knots for charts (avoid undefined variable use)
  const wspdKn = data ? Number(data.wspd10m || data.windSpeed || 0) * 1.943844 : 0;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchStationNow();
        setData(res.data || res);
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    load();
    const id = setInterval(load, 60000); // update every minute
    return () => clearInterval(id);
  }, []);

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

        <div className="content">
          <div className="left-column">
            <div className="wind-panel">
              <div className="wind-panel-header">
                <div className="wind-title">Estação Meteorológica</div>
                <div className="wind-status">Atualizado há 6 minutos</div>
              </div>
              <div className="wind-subheader">Direção</div>
              <div className="wind-compass">
                <WindRose data={data} className="wind-compass-svg" />
                { (data && (data.winddir != null || data.wdir10m != null)) && (
                  <div className="angle-badge">{Number(data.winddir ?? data.wdir10m).toFixed(1) + '°'}</div>
                ) }
              </div>

              <div className="wind-values">
                <div>
                  <div className="wind-label">Velocidade</div>
                  <div className="wind-value">{data ? (Number(data.wspd10m || data.windSpeed || 0) * 1.943844).toFixed(2) + ' nós' : '—'}</div>
                </div>
                <div>
                  <div className="wind-label">Rajada</div>
                  <div className="wind-value">{data ? (Number(data.gust || data.wgust || 0) * 1.943844).toFixed(2) + ' nós' : '—'}</div>
                </div>
              </div>

              <div className="wind-subcard-column">
                <div className="wind-subcard full-width">
                  <div className="wind-subcard-title">Tempo</div>
                  <div className="wind-subcard-value">Atualizado há 6 minutos</div>
                  <div className="wind-subcard-item">Pressão Atmosférica <span> {data ? (data.pressure_hpa || data.pressure || '—') : '—'} hPa</span></div>
                  <div className="wind-subcard-item">Precipitação <span> {data ? (data.precip_mm || data.precip || '0.00') : '0.00'} mm</span></div>
                </div>
                <div className="wind-subcard full-width">
                  <div className="wind-subcard-title">Maré</div>
                  <div className="wind-subcard-value">Atualizado há 6 minutos</div>
                  <div className="wind-subcard-item">Nível do mar <span> {data ? (data.tide || '—') : '—'} m</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="charts-container">
              <div className="chart-item">
                <h4>Altura das Ondas (m)</h4>
                <div id="wave-chart" className="chart-placeholder">
                  <Bar data={{
                    labels: ['Atual'],
                    datasets: [{
                      label: 'Altura (m)',
                      data: [data ? (data.waveHeight || 1.2) : 0],
                      backgroundColor: '#7cc4c9'
                    }]
                  }} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                </div>
              </div>
              <div className="chart-item">
                <h4>Velocidade do Vento (nós)</h4>
                <div id="wind-chart" className="chart-placeholder">
                  <Bar data={{
                    labels: ['Atual'],
                    datasets: [{
                      label: 'Velocidade (nós)',
                      data: [data ? wspdKn : 0],
                      backgroundColor: '#7cc4c9'
                    }]
                  }} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                </div>
              </div>
                <div className="chart-item">
                  <h4>Maré (m)</h4>
                  <div id="tide-chart" className="chart-placeholder">
                    <Bar
                      data={{
                        labels: ['Atual'],
                        datasets: [{
                          label: 'Maré (m)',
                          data: [data ? (data.tide || 2.3) : 0],
                          backgroundColor: '#7cc4c9'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: { beginAtZero: true, ticks: { font: { size: 16 } } },
                          x: { ticks: { font: { size: 14 } } }
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="chart-item">
                  <h4>Temperatura (°C)</h4>
                  <div id="temp-chart" className="chart-placeholder">
                    <Bar
                      data={{
                        labels: ['Atual'],
                        datasets: [{
                          label: 'Temperatura (°C)',
                          data: [data ? (data.temp || 25) : 0],
                          backgroundColor: '#7cc4c9'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: { beginAtZero: true, ticks: { font: { size: 16 } } },
                          x: { ticks: { font: { size: 14 } } }
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
