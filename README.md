# Projeto IoT Simples: Monitoramento de Temperatura e Controle de LED

Este projeto demonstra os conceitos fundamentais de Internet das Coisas (IoT) utilizando o protocolo MQTT. Ele consiste em um simulador de dispositivo (Python) que envia dados de temperatura e um painel de controle web (HTML/JavaScript) que exibe esses dados e permite controlar um LED virtualmente. A comunicação é realizada através de um broker MQTT local (Mosquitto).

## Funcionalidades

* **Simulação de Sensor de Temperatura:** Um script Python gera dados de temperatura aleatórios.
* **Controle de LED Remoto:** A interface web permite ligar e desligar um LED simulado no script Python.
* **Visualização de Dados:** A interface web exibe a temperatura atual em tempo real.
* **Comunicação MQTT:** Toda a interação entre o simulador e a interface web é feita via MQTT, através de um broker local.

## Tecnologias Utilizadas

* **Backend (Simulador de Dispositivo):** Python 3.x com as bibliotecas `paho-mqtt` e `python-dotenv`.
* **Frontend (Dashboard Web):** HTML, CSS e JavaScript com a biblioteca `Paho MQTT` (para navegador).
* **Broker MQTT:** Mosquitto (instalado e rodando localmente no seu sistema Pop!_OS).

## Estrutura do Projeto

ProjetoIOT/

├── .env                              
├── sensor_led_simulador.py           
├── index.html                        
├── app.js                         
└── venv/                             

## Pré-requisitos

Certifique-se de ter o seguinte instalado em seu sistema (Pop!_OS ou outro Linux baseado em Debian):

* **Python 3.x:**
    ```bash
    sudo apt update
    sudo apt install python3 python3-pip
    ```
* **Mosquitto MQTT Broker:**
    ```bash
    sudo apt install mosquitto mosquitto-clients
    ```

## Configuração do Mosquitto Local

Para que o Mosquitto funcione como o broker local para MQTT e WebSockets (sem SSL), você precisa configurá-lo:

1.  **Edite o arquivo de configuração principal do Mosquitto:**
    ```bash
    sudo nano /etc/mosquitto/mosquitto.conf
    ```
    (Se o arquivo estiver vazio ou não existir, ou se você usa arquivos separados de configuração, procure por `sudo nano /etc/mosquitto/conf.d/default.conf` ou crie um novo arquivo, por exemplo, `sudo nano /etc/mosquitto/conf.d/myconfig.conf`).

2.  **Adicione as seguintes linhas ao final do arquivo:**
    ```
    # Listener para MQTT padrão (para o Python) na porta 1883
    listener 1883
    protocol mqtt

    # Listener para WebSocket (para o navegador) na porta 9001
    listener 9001
    protocol websockets

    # Permitir que clientes se conectem sem usuário e senha (para simplicidade)
    allow_anonymous true
    ```

3.  **Salve e feche o arquivo.**
    * No `nano`: Pressione `Ctrl + S` (para salvar) e depois `Ctrl + X` (para sair).

4.  **Reinicie o serviço Mosquitto para aplicar as mudanças:**
    ```bash
    sudo systemctl restart mosquitto
    ```

5.  **Verifique o status do Mosquitto:**
    ```bash
    systemctl status mosquitto
    ```
    Você deve ver `Active: active (running)`. Pressione `q` para sair do status.

## Configuração do Projeto e Códigos

1.  **Navegue até a pasta do seu projeto no terminal:**
    ```bash
    cd ~/Área de Trabalho/ProjetoIOT/
    ```

2.  **Crie e Ative o Ambiente Virtual Python:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
    Seu prompt do terminal deve agora começar com `(venv) ...`.

3.  **Instale as Dependências Python:**
    Com o ambiente virtual ativado:
    ```bash
    pip install paho-mqtt python-dotenv
    ```

4.  **Crie o arquivo de variáveis de ambiente (`.env`):**
    Na mesma pasta do seu script Python, crie um arquivo chamado **`.env`** (note o ponto no início) e adicione o seguinte conteúdo:
    ```
    MQTT_URL=localhost
    MQTT_PORT_TLS=1883
    MQTT_USERNAME=
    MQTT_PASSWORD=
    ```
    **Importante:** As linhas `MQTT_USERNAME` e `MQTT_PASSWORD` devem ficar vazias, pois configuramos o Mosquitto para `allow_anonymous true`.

5.  **Configure o Script Python (`sensor_led_simulador.py`):**
    Abra o arquivo `sensor_led_simulador.py` em um editor de texto e **certifique-se de que a linha que habilita TLS/SSL esteja comentada ou removida**. Procure por:
    ```python
    client.tls_set()
    ```
    E mude-a para:
    ```python
    # client.tls_set() # Comente ou remova esta linha
    ```
    Salve o arquivo.

6.  **Configure o Script JavaScript (`app.js`):**
    Abra o arquivo `app.js` em um editor de texto e configure as variáveis de conexão no topo:
    ```javascript
    // --- Configurações MQTT ---
    const MQTT_HOST = 'localhost';
    const MQTT_PORT = 9001; // Porta WebSocket sem TLS/SSL
    const MQTT_USERNAME = ''; 
    const MQTT_PASSWORD = ''; 
    const protocol = 'ws'; // Use 'ws' para WebSocket sem SSL

    // ... (restante do código) ...

    function connectMqtt() {
        // MUITO IMPORTANTE: 
        // const protocol = 'wss';

        const clientId = 'web_iot_client_' + Math.random().toString(16).substr(2, 8); // ID único

        const connectOptions = {
            clean: true,
            connectTimeout: 4000,
            clientId: clientId,
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
            reconnectPeriod: 1000 // Tenta reconectar a cada 1 segundo
        };

        mqttStatusDisplay.textContent = 'Conectando ao broker MQTT...';
        // A conexão usará o 'protocol' definido globalmente ('ws')
        client = mqtt.connect(`${protocol}://${MQTT_HOST}:${MQTT_PORT}`, connectOptions);

        // ... (resto da função e do arquivo) ...
    }
    ```
    Salve o arquivo `app.js`.

## Como Rodar o Projeto

1.  **Inicie o Backend (Simulador de Dispositivo):**
    Com o ambiente virtual Python ativado (seu terminal deve mostrar `(venv)` no prompt), na pasta do projeto:
    ```bash
    python sensor_led_simulador.py
    ```
    Você deve ver mensagens no terminal indicando a conexão bem-sucedida (`Backend conectado ao broker MQTT!`) e a publicação de dados de temperatura. **Mantenha este terminal aberto e o script rodando.**

2.  **Abra o Frontend (Dashboard Web):**
    No seu navegador web (Chrome, Firefox, etc.), abra o arquivo `index.html` diretamente. Você pode dar um clique duplo no arquivo ou arrastá-lo para a janela do navegador.

3.  **Faça um "Hard Refresh" no navegador:**
    Pressione `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (macOS). Isso garante que o navegador carregue as versões mais recentes dos seus arquivos HTML e JavaScript.

4.  **Verifique a Conexão e Interação:**
    * **No navegador:** A mensagem de status MQTT na interface deve mudar para **"Conectado ao broker MQTT!"**, e o valor da **"Temperatura Atual" deve começar a ser atualizado** em tempo real a cada poucos segundos.
    * **Teste o Controle do LED:** Clique nos botões "Ligar LED" e "Desligar LED" na interface web.
    * **No terminal (onde o Python está rodando):** Você deve ver mensagens como **"Comando recebido: LIGAR LED. Estado atual: LIGADO"** (ou DESLIGADO), confirmando que a comunicação bidirecional está funcionando perfeitamente.
