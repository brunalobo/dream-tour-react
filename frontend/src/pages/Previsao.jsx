import React from 'react';

export default function Previsao() {
  return (
    <div>
      <header>
        <nav className="wavy-navbar">
          <ul>
            <li><a href="?page=temporeal">TEMPO REAL</a></li>
            <li><a href="?page=previsao" className="active">PREVISÃO</a></li>
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
          <h2>PREVISÃO</h2>
          <div className="header-line"></div>
        </div>

        <div className="content">
          <div className="left-column">
          </div>

          <div className="right-column">
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-left">
          <img src="/image/logo_ocp_branca.png" alt="OceanPact Logo" />
        </div>
        <div className="footer-center">
          <div className="qr-codes">
            <div className="qr-item">
              <img src="/image/qr_code.png" alt="QR Code App Store" />
            </div>
          </div>
          <div className="feedback-text">
            <p>Sua opinião é importante. Baixe o SeaSpot, experimente e compartilhe o que achou do app e de que
              forma ele pode melhorar. Envie um e-mail para <b>seaspot@oceanpact.com</b> e dê seu feedback.</p>
          </div>
        </div>
        <div className="footer-right">
          <div className="seaspot-section">
            <div className="footer-logo-right">
              <img src="/image/surf_seaspot_icon.png" alt="OceanPact SeaSpot" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}