import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from threading import Thread
import time
import requests
from dotenv import load_dotenv
from database import init_db, get_db

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')
WEATHER_STATION_ID = os.getenv('WEATHER_STATION_ID', 'IRIODE146')
DATABASE_URL = os.getenv('DATABASE_URL', None)

collecting_data = True


def fetch_and_save_data():
    """Coleta dados da API weather.com a cada 10 minutos e salva no PostgreSQL"""
    global collecting_data
    
    if not WEATHER_API_KEY:
        print("WEATHER_API_KEY não configurada")
        return
    
    while collecting_data:
        try:
            url = f"https://api.weather.com/v2/pws/observations/current?stationId={WEATHER_STATION_ID}&format=json&units=s&numericPrecision=decimal&apiKey={WEATHER_API_KEY}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            obs = data.get('observations', [{}])[0]
            
            if not obs:
                print(f"[{datetime.now()}] Nenhuma observação retornada")
                time.sleep(300)
                continue
            
            metric = obs.get('metric_si', {})
            obs_time = obs.get('obsTimeLocal', datetime.now().isoformat())
            
            def safe_value(val):
                if val is None:
                    return None
                try:
                    num = float(val)
                    return max(0, num)
                except (ValueError, TypeError):
                    return None
            
            windspeed_ms = safe_value(metric.get('windSpeed')) or 0
            windgust_ms = safe_value(metric.get('windGust')) or 0
            
            new_data = {
                'date': obs_time,
                'winddir': obs.get('winddir'),
                'windSpeed': windspeed_ms * 1.943844,
                'windGust': windgust_ms * 1.943844,
                'pressure': safe_value(metric.get('pressure')),
                'temp': safe_value(metric.get('temp')),
                'humidity': obs.get('humidity'),
                'solarRadiation': safe_value(obs.get('solarRadiation')),
                'uv': safe_value(obs.get('uv')),
                'precipRate': safe_value(metric.get('precipRate')),
            }
            
            db = get_db()
            if db.save_observation(new_data):
                print(f"[{datetime.now()}] ✓ Dados salvos | windSpeed={new_data['windSpeed']:.1f}, windGust={new_data['windGust']:.1f}")
            else:
                print(f"[{datetime.now()}] ⚠ Duplicado, pulando...")
            
            time.sleep(600)
            
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now()}] Erro na requisição: {e}")
            time.sleep(600)
        except Exception as e:
            print(f"[{datetime.now()}] Erro: {e}")
            time.sleep(600)


@app.on_event("startup")
async def startup_event():
    global collecting_data
    init_db(DATABASE_URL)
    print("✓ Banco de dados inicializado")
    collecting_data = True
    thread = Thread(target=fetch_and_save_data, daemon=True)
    thread.start()
    print("✓ Thread de coleta iniciada")


@app.on_event("shutdown")
async def shutdown_event():
    global collecting_data
    collecting_data = False


@app.get("/api/station/history")
async def get_station_history(n: int = 15, interval: int = 36):
    """Retorna últimos n registros a cada 6 horas do PostgreSQL"""
    try:
        db = get_db()
        total_to_fetch = n * interval
        observations = db.get_latest(total_to_fetch)
        
        if observations:
            filtered_obs = observations[::interval][-n:]
            return {
                "status": "success",
                "count": len(filtered_obs),
                "source": "database",
                "observations": filtered_obs
            }
        else:
            return {
                "status": "error",
                "message": "No data available in database yet",
                "observations": []
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "observations": []
        }


@app.get("/api/station/now")
async def get_station_now():
    """Retorna última leitura meteorológica do banco"""
    try:
        db = get_db()
        observation = db.get_latest_observation()
        
        if observation:
            return {
                "status": "success",
                "observation": observation
            }
        else:
            return {
                "status": "error",
                "message": "No data available yet",
                "observation": None
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "observation": None
        }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
