import os
import pandas as pd


pth_out = '.'
fln = 'meteo.csv'

api_key = '729378f824b5428a9378f824b5e28afc'
station_id='IRIODE146'
address = 'https://api.weather.com/v2/pws/observations/current?stationId={}&format=json&units=s&numericPrecision=decimal&apiKey={}'.format(station_id, api_key)


# Caminho completo do arquivo
file_path = f"{pth_out}/{fln}"

# Verifica se o arquivo existe
if os.path.exists(file_path):
    df_old = pd.read_csv(file_path, parse_dates=True, index_col='date')
    print("Arquivo encontrado e carregado.")
else:
    print("Arquivo não encontrado.")
    df_old = pd.DataFrame()  # opcional, cria um DataFrame vazio

#df_old = pd.read_csv('{}/{}'.format(pth_out, fln), parse_dates=True, index_col='date')

dd = pd.read_json(address)

d = dd['observations'][0]
print (d['obsTimeLocal'])

# cria dicionario com algumas variaveis
d1 = {key: d[key] for key in [ 'solarRadiation', 'uv', 'winddir', 'humidity']}

# cria dataframe juntando todas as variaveis
df = pd.DataFrame({**d['metric_si'], **d1}, index=[pd.to_datetime(d['obsTimeLocal'])])
df.index.name = 'date'
df.drop('elev', axis=1, inplace=True)

# passa vento de m/s para nos
df[['windSpeed', 'windGust']] = df[['windSpeed', 'windGust']] * 1.95

# concatena os dados
df = pd.concat([df_old, df], axis=0)

# remove dados duplicados
df.drop_duplicates(inplace=True)

df.to_csv('{}/{}'.format(pth_out, fln), float_format='%.1f', index=True)



