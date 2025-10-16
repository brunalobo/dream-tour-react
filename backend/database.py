"""
Módulo para gerenciar conexão com banco de dados.
Suporta PostgreSQL, MySQL e SQLite.
"""

import os
from sqlalchemy import create_engine, Column, DateTime, Float, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Criar base para os modelos
Base = declarative_base()


class WeatherObservation(Base):
    """Modelo para armazenar observações meteorológicas"""
    __tablename__ = 'weather_observations'
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
    """Gerenciador de conexão com banco de dados"""
    
    def __init__(self, db_url=None):
        """
        Inicializa o gerenciador do banco de dados.
        
        Args:
            db_url: String de conexão do banco de dados
                    Exemplos:
                    - PostgreSQL: postgresql://user:password@localhost:5432/dbname
                    - MySQL: mysql+pymysql://user:password@localhost:3306/dbname
                    - SQLite: sqlite:///./weather.db
        """
        # Se não fornecido, usar SQLite local
        if not db_url:
            db_url = os.getenv('DATABASE_URL', 'sqlite:///./weather.db')
        
        self.engine = create_engine(db_url, echo=False)
        self.Session = sessionmaker(bind=self.engine)
        
        # Tentar criar tabelas se não existirem
        try:
            Base.metadata.create_all(self.engine)
            print(f"✓ Conectado ao banco de dados: {db_url}")
        except Exception as e:
            # Se falhar (ex: permissão no Azure), apenas conecta
            # Assume que as tabelas já foram criadas manualmente
            print(f"⚠ Conectado ao banco de dados: {db_url}")
            print(f"  (Não foi possível criar tabelas automaticamente)")
            print(f"  Execute create_table.sql manualmente se necessário")
    
    def save_observation(self, data):
        """
        Salva uma observação no banco de dados.
        Evita duplicatas usando a data como chave única.
        
        Args:
            data: Dicionário com os dados da observação
        
        Returns:
            True se salvo com sucesso, False se duplicado
        """
        session = self.Session()
        try:
            # Converter string de data para datetime
            obs_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            
            # Verificar se já existe
            existing = session.query(WeatherObservation).filter(
                WeatherObservation.date == obs_date
            ).first()
            
            if existing:
                return False  # Já existe
            
            # Criar novo registro
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
            print(f"Erro ao salvar no banco: {e}")
            return False
        finally:
            session.close()
    
    def get_latest(self, n=24):
        """
        Retorna os últimas n observações do banco de dados.
        
        Args:
            n: Número de registros a retornar
        
        Returns:
            Lista de dicionários com os dados
        """
        session = self.Session()
        try:
            observations = session.query(WeatherObservation).order_by(
                WeatherObservation.date.desc()
            ).limit(n).all()
            
            # Reverter para ordem cronológica (mais antigo primeiro)
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
            print(f"Erro ao buscar do banco: {e}")
            return []
        finally:
            session.close()
    
    def get_latest_observation(self):
        """
        Retorna a última observação do banco de dados.
        
        Returns:
            Dicionário com os dados ou None
        """
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
            print(f"Erro ao buscar última observação: {e}")
            return None
        finally:
            session.close()
    
    def delete_old_records(self, days=30):
        """
        Deleta observações mais antigas que X dias.
        
        Args:
            days: Número de dias a manter
        """
        session = self.Session()
        try:
            from datetime import timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            deleted = session.query(WeatherObservation).filter(
                WeatherObservation.date < cutoff_date
            ).delete()
            
            session.commit()
            print(f"Deletados {deleted} registros antigos")
            return deleted
        except Exception as e:
            session.rollback()
            print(f"Erro ao deletar registros: {e}")
            return 0
        finally:
            session.close()


# Instância global do gerenciador de banco de dados
db = None


def init_db(db_url=None):
    """Inicializa a conexão com o banco de dados"""
    global db
    db = DatabaseManager(db_url)
    return db


def get_db():
    """Retorna a instância global do gerenciador de banco de dados"""
    global db
    if db is None:
        db = init_db()
    return db
