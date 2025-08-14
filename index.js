const axios = require("axios");

const API_URL = "https://rd.integra-metrics.com/api/v2/estado-soft?data=%7B%7D";
const AUTH_TOKEN = "7c0a5d5e456db8b238879426b52d504ecd087a98c574d69d63ffb3868cf6f9b8c30ff4fbda7a265c91e70769b90497c07335cb02d0af8eca7f94a724103aaa80";

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

async function consultarAPI() {
    try {
        const { data } = await axios.get(API_URL, {
            headers: {
                "Authorization": `Bearer ${AUTH_TOKEN}`,
                "Accept": "application/json"
            }
        });

        // Filtrar solo los arrays no nulos
        const arraysValidos = data.filter(item => Array.isArray(item) && item.length > 0);

        if (arraysValidos.length > 0) {
            const ultimoArray = arraysValidos[arraysValidos.length - 1];

            const mensaje = `RD: ESTADO DEL WAV FEED:\n${ultimoArray.join("\n")}`;

            await enviarTelegram(mensaje);
            console.log("Mensaje enviado a Telegram");
        } else {
            console.log("No hay datos válidos para enviar");
        }
    } catch (error) {
        console.error("Error al consultar API:", error.message);
    }
}

async function enviarTelegram(texto) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: texto
        });
    } catch (error) {
        console.error("Error enviando mensaje a Telegram:", error.message);
    }
}

// Ejecutar cada 15 segundos
setInterval(consultarAPI, 15000);

// Primera ejecución inmediata
consultarAPI();
