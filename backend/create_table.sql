-- Script SQL para criar a tabela no Azure PostgreSQL
-- Execute este script no seu banco de dados db_geo

-- Criar tabela weather_observations dentro do schema dream_tour
CREATE TABLE IF NOT EXISTS dream_tour.weather_observations (
    id SERIAL NOT NULL PRIMARY KEY,
    date TIMESTAMP WITHOUT TIME ZONE UNIQUE NOT NULL,
    winddir INTEGER,
    "windSpeed" FLOAT,
    "windGust" FLOAT,
    pressure FLOAT,
    temp FLOAT,
    humidity INTEGER,
    "solarRadiation" FLOAT,
    uv FLOAT,
    "precipRate" FLOAT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice na coluna date para melhor performance
CREATE INDEX IF NOT EXISTS idx_weather_observations_date 
ON dream_tour.weather_observations(date DESC);

-- Dar permissões ao usuário db_geo_user (se necessário)
GRANT SELECT, INSERT, UPDATE, DELETE ON dream_tour.weather_observations TO db_geo_user;
GRANT USAGE, SELECT ON SEQUENCE dream_tour.weather_observations_id_seq TO db_geo_user;

-- Verificar se a tabela foi criada
SELECT * FROM information_schema.tables 
WHERE table_name = 'weather_observations' AND table_schema = 'dream_tour';
