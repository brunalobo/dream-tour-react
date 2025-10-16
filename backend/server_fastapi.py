import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import asyncio
from threading import Thread
import time
import requests
from dotenv import load_dotenv
from database import init_db, get_db

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração da API do weather.com
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')
WEATHER_STATION_ID = os.getenv('WEATHER_STATION_ID', 'IRIODE90')

# Configuração do banco de dados
DATABASE_URL = os.getenv('DATABASE_URL', None)  # Se None, usa SQLite local

# Flag para controlar a thread de coleta de dados
collecting_data = True


def fetch_and_save_data():
    """
    Busca dados da API do weather.com e salva no banco de dados (PostgreSQL).
    Esta função roda em uma thread de background a cada 10 minutos.
    """
    global collecting_data
    
    if not WEATHER_API_KEY:
        print("WEATHER_API_KEY não configurada. Defina a variável de ambiente.")
        return
    
    while collecting_data:
        try:
            # Construir URL da API
            url = f"https://api.weather.com/v2/pws/observations/current?stationId={WEATHER_STATION_ID}&format=json&units=s&numericPrecision=decimal&apiKey={WEATHER_API_KEY}"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            obs = data.get('observations', [{}])[0]
            
            if not obs:
                print(f"[{datetime.now()}] Nenhuma observação retornada")
                time.sleep(300)  # Aguardar 5 minutos antes de tentar novamente
                continue
            
            # Extrair dados
            metric = obs.get('metric_si', {})
            obs_time = obs.get('obsTimeLocal', datetime.now().isoformat())
            
            # Função auxiliar para garantir valores não-negativos
            def safe_value(val):
                if val is None:
                    return None
                try:
                    num = float(val)
                    return max(0, num)
                except (ValueError, TypeError):
                    return None
            
            # Preparar dados para salvar
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
            
            # Salvar no banco de dados
            db = get_db()
            if db.save_observation(new_data):
                print(f"[{datetime.now()}] ✓ Dados salvos no BD | windSpeed={new_data['windSpeed']:.1f}, windGust={new_data['windGust']:.1f}")
            else:
                print(f"[{datetime.now()}] ⚠ Observação duplicada, pulando...")
            
            # Aguardar 10 minutos antes da próxima coleta
            time.sleep(600)
            
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now()}] Erro na requisição: {e}")
            time.sleep(600)  # Aguardar 10 minutos antes de tentar novamente
        except Exception as e:
            print(f"[{datetime.now()}] Erro ao processar dados: {e}")
            time.sleep(600)


@app.on_event("startup")
async def startup_event():
    """Iniciar a thread de coleta de dados quando a app inicia"""
    global collecting_data
    
    # Inicializar banco de dados
    init_db(DATABASE_URL)
    print("✓ Banco de dados inicializado")
    
    collecting_data = True
    thread = Thread(target=fetch_and_save_data, daemon=True)
    thread.start()
    print("✓ Thread de coleta de dados iniciada (a cada 10 minutos)")


@app.on_event("shutdown")
async def shutdown_event():
    """Parar a thread de coleta de dados quando a app encerra"""
    global collecting_data
    collecting_data = False
    print("Thread de coleta de dados parada")


@app.get("/api/station/history")
async def get_station_history(n: int = 4):
    """
    Retorna os últimos n registros de dados meteorológicos.
    Busca do banco de dados PostgreSQL.
    
    Args:
        n: Número de registros a retornar (padrão: 4 = dados de 6 em 6 horas)
    
    Returns:
        Lista de observações com timestamps e dados
    """
    try:
        db = get_db()
        observations = db.get_latest(n)
        
        if observations:
            return {
                "status": "success",
                "count": len(observations),
                "source": "database",
                "observations": observations
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
    """
    Retorna a última leitura meteorológica disponível do banco de dados.
    """
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
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
