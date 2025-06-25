// --- Configurações MQTT ---
const MQTT_HOST = 'localhost';
const MQTT_PORT = 9001; // Porta WebSocket sem TLS/SSL
const MQTT_USERNAME = ''; // Deixe em branco para Mosquitto local (se allow_anonymous true)
const MQTT_PASSWORD = ''; // Deixe em branco

const protocol = 'ws'; // <--- ESTA É A ÚNICA DECLARAÇÃO DE 'protocol' QUE VOCÊ PRECISA

// --- Tópicos do Projeto ---
const TOPIC_TEMPERATURA = "casa/sala/temperatura";
const TOPIC_COMANDO_LED = "casa/sala/led/comando";

// --- Elementos da Interface ---
const temperaturaDisplay = document.getElementById('temperaturaDisplay');
const btnLedOn = document.getElementById('btnLedOn');
const btnLedOff = document.getElementById('btnLedOff');
const mqttStatusDisplay = document.getElementById('mqttStatus');

// --- Cliente MQTT ---
let client;

function connectMqtt() {
    // REMOVA A LINHA ABAIXO, ELA CAUSA A DUPLICAÇÃO E O ERRO!
    // const protocol = 'wss'; // Antigo: Usar 'wss' para conexão segura com HiveMQ Cloud

    const clientId = 'web_iot_client_' + Math.random().toString(16).substr(2, 8); // ID único

    const connectOptions = {
        clean: true,
        connectTimeout: 4000,
        clientId: clientId,
        username: MQTT_USERNAME, // Usará a variável global (vazia, se for o caso)
        password: MQTT_PASSWORD, // Usará a variável global (vazia, se for o caso)
        reconnectPeriod: 1000 // Tenta reconectar a cada 1 segundo
    };

    mqttStatusDisplay.textContent = 'Conectando ao broker MQTT...';
    // Agora, 'protocol' aqui se referirá à variável global 'ws'
    client = mqtt.connect(`${protocol}://${MQTT_HOST}:${MQTT_PORT}`, connectOptions);

    client.on('connect', () => {
        console.log('Frontend conectado ao broker MQTT!');
        mqttStatusDisplay.textContent = 'Conectado ao broker MQTT!';
        // Subscrever ao tópico de temperatura
        client.subscribe(TOPIC_TEMPERATURA, (err) => {
            if (!err) {
                console.log('Inscrito no tópico de temperatura.');
            } else {
                console.error('Erro ao subscrever tópico de temperatura:', err);
            }
        });
    });

    client.on('message', (topic, message) => {
        const payload = message.toString();
        // console.log(`Mensagem recebida em ${topic}: ${payload}`); // Para depuração

        if (topic === TOPIC_TEMPERATURA) {
            temperaturaDisplay.textContent = parseFloat(payload).toFixed(2);
        }
    });

    client.on('error', (err) => {
        console.error('Erro MQTT no Frontend:', err);
        mqttStatusDisplay.textContent = 'Erro na conexão MQTT!';
        // client.end(); // Não encerre aqui para permitir reconexão
    });

    client.on('close', () => {
        console.log('Conexão MQTT do Frontend fechada.');
        mqttStatusDisplay.textContent = 'Conexão MQTT fechada.';
    });

    client.on('offline', () => {
        console.log('Cliente MQTT do Frontend offline.');
        mqttStatusDisplay.textContent = 'Cliente MQTT offline.';
    });

    client.on('reconnect', () => {
        console.log('Tentando reconectar ao MQTT...');
        mqttStatusDisplay.textContent = 'Tentando reconectar...';
    });
}

// --- Funções para Enviar Comandos ---
function sendLedCommand(command) {
    if (client && client.connected) {
        client.publish(TOPIC_COMANDO_LED, command, { qos: 0, retain: false }, (err) => {
            if (err) {
                console.error('Erro ao publicar comando LED:', err);
            } else {
                console.log(`Comando LED enviado: ${command}`);
            }
        });
    } else {
        alert('Cliente MQTT não conectado. Não foi possível enviar o comando.');
        console.warn('Tentativa de enviar comando LED sem conexão MQTT.');
    }
}

// --- Event Listeners para os Botões ---
btnLedOn.addEventListener('click', () => sendLedCommand('LIGAR'));
btnLedOff.addEventListener('click', () => sendLedCommand('DESLIGAR'));

// Inicia a conexão MQTT quando a página é carregada
document.addEventListener('DOMContentLoaded', connectMqtt);