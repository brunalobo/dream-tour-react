import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function tryFetchCandidates(base, candidates, options) {
  const tryOne = async (idx) => {
    if (idx >= candidates.length) return null;
    const url = base.replace(/\/+$/, "") + "/" + candidates[idx].replace(/^\/+/, "");
    try {
      const resp = await fetch(url, options);
      if (!resp.ok) throw new Error(`status:${resp.status}`);
      const json = await resp.json();
      return { url, json };
    } catch (err) {
      return tryOne(idx + 1);
    }
  };
  return tryOne(0);
}

function formatDateKey(key) {
  try {
    const d = new Date(key);
    if (isNaN(d)) return String(key);
    return d.toLocaleString();
  } catch {
    return String(key);
  }
}

function hsColor(hs) {
  if (hs == null) return '#eee';
  if (hs <= 0.5) return '#d0f0ff';
  if (hs <= 1.0) return '#9fe6ff';
  if (hs <= 1.5) return '#fff3b0';
  if (hs <= 2.5) return '#ffc28e';
  return '#ff9a9a';
}

export default function ActivityPlacePreview({ activityPlaceId = 2535 }) {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [metocean, setMetocean] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("agora");

  const baseApi = import.meta.env.VITE_URL_BASE || "";
  const baseCache = import.meta.env.VITE_URL_CACHE_BASE || "";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const metaCandidates = [
          `api/localidades/${activityPlaceId}`,
          `api/locality/${activityPlaceId}`,
          `localidades/${activityPlaceId}`,
          `locality/${activityPlaceId}`,
        ];
        const metaResp = await tryFetchCandidates(baseApi, metaCandidates, { method: "GET" });
        if (!metaResp) throw new Error("metadata not found");
        if (!mounted) return;
        setMeta(metaResp.json);

        const cacheBase = baseCache || baseApi;
        const metoCandidates = [
          `metocean/info?location_id=${activityPlaceId}`,
          `metocean_info?location_id=${activityPlaceId}`,
          `metocean?location_id=${activityPlaceId}`,
        ];
        const metoResp = await tryFetchCandidates(cacheBase, metoCandidates, { method: "GET" });
        if (!metoResp) {
          const metoResp2 = await tryFetchCandidates(baseApi, metoCandidates, { method: "GET" });
          if (!metoResp2) throw new Error("metocean info not found");
          if (!mounted) return;
          setMetocean(metoResp2.json);
        } else {
          if (!mounted) return;
          setMetocean(metoResp.json);
        }
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(String(err));
        setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [activityPlaceId, baseApi, baseCache]);

  const nowPoint = useMemo(() => {
    if (!metocean) return null;
    if (metocean.time_series) {
      const keys = Object.keys(metocean.time_series).sort();
      const first = metocean.time_series[keys[0]];
      return { when: keys[0], data: first };
    }
    if (Array.isArray(metocean)) return { when: null, data: metocean[0] };
    return null;
  }, [metocean]);

  const weekSeries = useMemo(() => {
    if (!metocean) return [];
    if (metocean.time_series) return Object.entries(metocean.time_series).map(([k, v]) => ({ k, v }));
    if (Array.isArray(metocean)) return metocean.map((v, i) => ({ k: i, v }));
    return [];
  }, [metocean]);

  const hourLabels = useMemo(() => weekSeries.map((s) => formatDateKey(s.k)), [weekSeries]);
  const tempSeries = useMemo(() => weekSeries.map((s) => s.v?.tsm ?? s.v?.tmax2m ?? s.v?.tmin2m ?? null), [weekSeries]);
  const windSeries = useMemo(() => weekSeries.map((s) => s.v?.wspd10m ?? null), [weekSeries]);
  const hsSeries = useMemo(() => weekSeries.map((s) => s.v?.hs ?? null), [weekSeries]);

  const tempData = { labels: hourLabels, datasets: [{ label: "Temperatura (°C)", data: tempSeries, borderColor: "#1976d2", backgroundColor: "rgba(25,118,210,0.2)", tension: 0.3, pointRadius: 3 }] };
  const windData = { labels: hourLabels, datasets: [{ label: "Vento (m/s)", data: windSeries, borderColor: "#00897b", backgroundColor: "rgba(0,137,123,0.15)", tension: 0.3, pointRadius: 3 }] };

  return (
    <div className="activity-preview" style={{padding: 12}}>
      <h3>Preview SeaSpot — Localidade {activityPlaceId}</h3>
      {loading && <div>Carregando dados...</div>}
      {error && <div style={{color: 'crimson'}}>Erro: {error}</div>}
      {!loading && !error && (
        <div>
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <div style={{flex: 1}}>
              <h4>{meta?.nome || meta?.name || meta?.displayName || 'Localidade'}</h4>
              <div style={{fontSize: 12, color: '#666'}}>{meta?.municipio && `${meta.municipio} - ${meta.estado}`}</div>
            </div>
            <div>
              <button onClick={() => setTab('agora')} style={{marginRight:6}}>Agora</button>
              <button onClick={() => setTab('semana')} style={{marginRight:6}}>Semana</button>
              <button onClick={() => setTab('dia')}>Dia a dia</button>
            </div>
          </div>

          <div style={{marginTop:12}}>
            {tab === 'agora' && (
              <div>
                <h5>Agora</h5>
                {nowPoint ? (
                  <div>
                    <div><b>Horário:</b> {formatDateKey(nowPoint.when)}</div>
                    <pre style={{background:'#f5f5f5', padding:8, overflow:'auto'}}>{JSON.stringify(nowPoint.data, null, 2)}</pre>
                  </div>
                ) : (
                  <div>Nenhum ponto atual disponível</div>
                )}
              </div>
            )}

            {tab === 'semana' && (
              <div>
                <h5>Semana</h5>
                {weekSeries.length === 0 ? (
                  <div>Sem dados</div>
                ) : (
                  <div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                      <div style={{fontWeight:700}}>HS (altura significativa) — Heatmap</div>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:`repeat(6, 1fr)`, gap:8}}>
                      {weekSeries.map((s, idx) => {
                        const hs = s.v?.hs ?? null;
                        const c = hsColor(hs);
                        return (
                          <div key={s.k || idx} style={{background:c, padding:8, borderRadius:6, minHeight:64}}>
                            <div style={{fontSize:12, color:'#222'}}>{formatDateKey(s.k)}</div>
                            <div style={{fontSize:14, fontWeight:600}}>{hs != null ? `${hs} m` : '—'}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{marginTop:12}}>
                      <div style={{marginBottom:12}}>
                        <strong>Temperatura</strong>
                        <div style={{height:200}}>
                          <Line data={tempData} options={{responsive:true, maintainAspectRatio:false}} />
                        </div>
                      </div>

                      <div>
                        <strong>Vento</strong>
                        <div style={{height:200}}>
                          <Line data={windData} options={{responsive:true, maintainAspectRatio:false}} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'dia' && (
              <div>
                <h5>Dia a dia</h5>
                <div>
                  {weekSeries.length === 0 && <div>Sem dados</div>}
                  <ul style={{maxHeight:300, overflow:'auto'}}>
                    {weekSeries.map((s) => (
                      <li key={s.k}><b>{formatDateKey(s.k)}</b> — {typeof s.v === 'object' ? JSON.stringify(s.v) : String(s.v)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
