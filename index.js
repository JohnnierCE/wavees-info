const axios = require("axios");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "AQUI_TU_TOKEN_TELEGRAM";
const CHAT_ID = process.env.CHAT_ID || "AQUI_TU_CHAT_ID";

// Lista de APIs y sus tokens
const APIS = [
    {
        nombre: "RD",
        url: "https://rd.integra-metrics.com/api/v2/estado-soft?data=%7B%7D",
        token: "7c0a5d5e456db8b238879426b52d504ecd087a98c574d69d63ffb3868cf6f9b8c30ff4fbda7a265c91e70769b90497c07335cb02d0af8eca7f94a724103aaa80"
    },
    {
        nombre: "CO",
        url: "https://co.integra-metrics.com/api/v2/estado-soft?data=%7B%7D",
        token: "784531556743bc5d76129cfc057413dd73563372e896da054ed5e2856e760c20f90943f8b7deaa28ed7b3d559141329838955b1140a921d255af1e038cf917ed"
    },
    // Agrega aquí los otros 8 APIs
];

async function consultarAPI(api) {
    try {
        const { data } = await axios.get(api.url, {
            headers: {
                "Authorization": `Bearer ${api.token}`,
                "Accept": "application/json"
            }
        });

        const arraysValidos = data.filter(item => Array.isArray(item) && item.length > 0);

        if (arraysValidos.length > 0) {
            const ultimoArray = arraysValidos[arraysValidos.length - 1];
            const mensaje = `${api.nombre}: ESTADO DEL WAV FEED:\n${ultimoArray.join("\n")}`;
            await enviarTelegram(mensaje);
            console.log(`[${api.nombre}] Mensaje enviado a Telegram`);
        } else {
            console.log(`[${api.nombre}] No hay datos válidos para enviar`);
        }
    } catch (error) {
        console.error(`[${api.nombre}] Error al consultar API:`, error.message);
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

function ejecutarTodas() {
    for (const api of APIS) {
        consultarAPI(api);
    }
}

// Ejecutar cada 15 segundos
setInterval(ejecutarTodas, 15000);
ejecutarTodas();
