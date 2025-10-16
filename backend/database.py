import os
from sqlalchemy import create_engine, Column, DateTime, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()


class WeatherObservation(Base):
    """Observações meteorológicas do banco de dados"""
    __tablename__ = 'estacao_meteo'
    __table_args__ = {'schema': 'dream_tour'}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, unique=True, index=True)
    winddir = Column(Integer, nullable=True)
    windSpeed = Column(Float, nullable=True)
    windGust = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    temp = Column(Float, nullable=True)
    humidity = Column(Integer, nullable=True)
    solarRadiation = Column(Float, nullable=True)
    uv = Column(Float, nullable=True)
    precipRate = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DatabaseManager:
    """Gerenciador de conexão com PostgreSQL"""
    
    def __init__(self, db_url=None):
        if not db_url:
            db_url = os.getenv('DATABASE_URL', 'sqlite:///./weather.db')
        
        self.engine = create_engine(db_url, echo=False)
        self.Session = sessionmaker(bind=self.engine)
        
        try:
            Base.metadata.create_all(self.engine)
            print(f"✓ Conectado ao banco de dados: {db_url}")
        except Exception as e:
            print(f"⚠ Conectado ao banco de dados: {db_url}")
            print(f"  Execute create_table.sql manualmente se necessário")
    
    def save_observation(self, data):
        """Salva observação meteorológica no banco"""
        session = self.Session()
        try:
            obs_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            
            existing = session.query(WeatherObservation).filter(
                WeatherObservation.date == obs_date
            ).first()
            
            if existing:
                return False
            
            obs = WeatherObservation(
                date=obs_date,
                winddir=data.get('winddir'),
                windSpeed=data.get('windSpeed'),
                windGust=data.get('windGust'),
                pressure=data.get('pressure'),
                temp=data.get('temp'),
                humidity=data.get('humidity'),
                solarRadiation=data.get('solarRadiation'),
                uv=data.get('uv'),
                precipRate=data.get('precipRate'),
            )
            
            session.add(obs)
            session.commit()
            return True
            
        except Exception as e:
            session.rollback()
            print(f"Erro ao salvar: {e}")
            return False
        finally:
            session.close()
    
    def get_latest(self, n=24):
        """Retorna as últimas n observações do banco"""
        session = self.Session()
        try:
            observations = session.query(WeatherObservation).order_by(
                WeatherObservation.date.desc()
            ).limit(n).all()
            
            observations.reverse()
            
            result = []
            for obs in observations:
                result.append({
                    'obsTimeLocal': obs.date.isoformat(),
                    'timestamp': obs.date.timestamp(),
                    'winddir': obs.winddir,
                    'windSpeed': obs.windSpeed,
                    'windGust': obs.windGust,
                    'pressure': obs.pressure,
                    'temp': obs.temp,
                    'humidity': obs.humidity,
                    'solarRadiation': obs.solarRadiation,
                    'uv': obs.uv,
                    'precipRate': obs.precipRate,
                })
            
            return result
        except Exception as e:
            print(f"Erro ao buscar: {e}")
            return []
        finally:
            session.close()
    
    def get_latest_observation(self):
        """Retorna última observação"""
        session = self.Session()
        try:
            obs = session.query(WeatherObservation).order_by(
                WeatherObservation.date.desc()
            ).first()
            
            if not obs:
                return None
            
            return {
                'obsTimeLocal': obs.date.isoformat(),
                'timestamp': obs.date.timestamp(),
                'winddir': obs.winddir,
                'windSpeed': obs.windSpeed,
                'windGust': obs.windGust,
                'pressure': obs.pressure,
                'temp': obs.temp,
                'humidity': obs.humidity,
                'solarRadiation': obs.solarRadiation,
                'uv': obs.uv,
                'precipRate': obs.precipRate,
            }
        except Exception as e:
            print(f"Erro ao buscar: {e}")
            return None
        finally:
            session.close()
    
    def delete_old_records(self, days=30):
        """Deleta observações mais antigas que X dias"""
        from datetime import timedelta
        
        session = self.Session()
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            deleted = session.query(WeatherObservation).filter(
                WeatherObservation.date < cutoff_date
            ).delete()
            session.commit()
            print(f"Deletados {deleted} registros")
            return deleted
        except Exception as e:
            session.rollback()
            print(f"Erro ao deletar: {e}")
            return 0
        finally:
            session.close()


db = None


def init_db(db_url=None):
    """Inicializa conexão com banco"""
    global db
    db = DatabaseManager(db_url)
    return db


def get_db():
    """Retorna instância do gerenciador"""
    global db
    if db is None:
        db = init_db()
    return db