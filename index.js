const axios = require("axios");

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

// Lista de APIs (puedes agregar las 8 que tengas)
const PAISES = [
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
    // Agrega aquí los otros 6 países...
];

async function consultarTodasLasAPIs() {
    let mensajes = [];

    for (const pais of PAISES) {
        try {
            const { data } = await axios.get(pais.url, {
                headers: {
                    "Authorization": `Bearer ${pais.token}`,
                    "Accept": "application/json"
                }
            });

            const arraysValidos = data.filter(item => Array.isArray(item) && item.length > 0);

            if (arraysValidos.length > 0) {
                const ultimoArray = arraysValidos[arraysValidos.length - 1];
                mensajes.push(`*${pais.nombre}*:\n${ultimoArray.join("\n")}`);
            } else {
                mensajes.push(`*${pais.nombre}*:\nNo hay datos válidos`);
            }

        } catch (error) {
            mensajes.push(`*${pais.nombre}*:\nError al consultar API (${error.message})`);
        }
    }

    if (mensajes.length > 0) {
        // Unir mensajes con doble salto de línea para dejar espacio entre países
        await enviarTelegram(mensajes.join("\n\n"));
        console.log("Mensaje enviado a Telegram");
    }
}

async function enviarTelegram(texto) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: texto,
            parse_mode: "Markdown"
        });
    } catch (error) {
        console.error("Error enviando mensaje a Telegram:", error.message);
    }
}

// Ejecutar cada 15 segundos
setInterval(consultarTodasLasAPIs, 300000);

// Primera ejecución inmediata
consultarTodasLasAPIs();
