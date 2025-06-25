import paho.mqtt.client as mqtt
import os
import time
import random
from dotenv import load_dotenv

load_dotenv() # Carrega variáveis de ambiente do .env

# --- Configurações MQTT (Use as mesmas do seu HiveMQ Cloud) ---
MQTT_BROKER = os.getenv('MQTT_URL')
MQTT_PORT = int(os.getenv('MQTT_PORT_TLS', 8883)) # Porta para Python (TLS)
MQTT_USERNAME = os.getenv('MQTT_USERNAME')
MQTT_PASSWORD = os.getenv('MQTT_PASSWORD')

# --- Tópicos do Projeto ---
TOPIC_TEMPERATURA = "casa/sala/temperatura"
TOPIC_COMANDO_LED = "casa/sala/led/comando" # Para receber comandos do frontend

# --- Variáveis de Estado do Dispositivo ---
temperatura_atual = 20.0
estado_led = "DESLIGADO"

# --- Callbacks MQTT ---
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Backend conectado ao broker MQTT!")
        # Assina o tópico de comando do LED quando conectado
        client.subscribe(TOPIC_COMANDO_LED)
        print(f"Assinado no tópico de comando: {TOPIC_COMANDO_LED}")
    else:
        print(f"Falha na conexão, código {rc}")

def on_message(client, userdata, msg):
    global estado_led
    # Quando uma mensagem é recebida no tópico de comando do LED
    if msg.topic == TOPIC_COMANDO_LED:
        comando = msg.payload.decode().upper() # Converte para maiúsculas
        if comando == "LIGAR":
            estado_led = "LIGADO"
            print(f"Comando recebido: LIGAR LED. Estado atual: {estado_led}")
        elif comando == "DESLIGAR":
            estado_led = "DESLIGADO"
            print(f"Comando recebido: DESLIGAR LED. Estado atual: {estado_led}")
        else:
            print(f"Comando desconhecido para LED: {comando}")

# --- Configuração do Cliente MQTT ---
client = mqtt.Client(client_id="PythonSimulador", protocol=mqtt.MQTTv311)
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

client.on_connect = on_connect
client.on_message = on_message

print(f"Tentando conectar ao broker {MQTT_BROKER}:{MQTT_PORT} como {MQTT_USERNAME}...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# --- Loop Principal para Publicar Dados ---
client.loop_start() # Inicia um loop em uma thread separada para processar mensagens

try:
    while True:
        # Simula a leitura da temperatura (com uma pequena variação)
        temperatura_atual += random.uniform(-0.5, 0.5)
        temperatura_atual = max(18.0, min(30.0, temperatura_atual)) # Mantém a temperatura em um range razoável

        # Publica a temperatura no tópico
        client.publish(TOPIC_TEMPERATURA, f"{temperatura_atual:.2f}")
        print(f"Publicado: {TOPIC_TEMPERATURA} -> {temperatura_atual:.2f}°C. LED: {estado_led}")

        time.sleep(5) # Publica a cada 5 segundos

except KeyboardInterrupt:
    print("Simulador encerrado.")
finally:
    client.loop_stop()
    client.disconnect()