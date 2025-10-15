import React from 'react'
import TempoReal from './pages/TempoReal'
import Previsao from './pages/Previsao'
import Surfabilidade from './pages/Surfabilidade'

function App() {
  const params = new URLSearchParams(window.location.search)
  const page = params.get('page') || 'temporeal'

  return (
    <div>
      {page === 'temporeal' && <TempoReal />}
      {page === 'previsao' && <Previsao />}
      {page === 'surfabilidade' && <Surfabilidade />}
    </div>
  )
}

export default App
