const axios = require("axios");

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

const PAIS = {
    nombre: "*RD*",
    token: "7c0a5d5e456db8b238879426b52d504ecd087a98c574d69d63ffb3868cf6f9b8c30ff4fbda7a265c91e70769b90497c07335cb02d0af8eca7f94a724103aaa80",
    indice: 3
};

function toGB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

async function consultarPais(pais) {
    try {
        // 1️⃣ Obtener canales
        const softResp = await axios.get(`https://${pais.nombre.toLowerCase()}.integra-metrics.com/api/v2/estado-soft?data={}`, {
            headers: { "Authorization": `Bearer ${pais.token}`, "Accept": "application/json" }
        });

        const canales = Array.isArray(softResp.data[pais.indice]) ? softResp.data[pais.indice] : [];
        const canalesTexto = canales.length > 0 ? canales.join("\n") : "TODO ESTABLE";

        // 2️⃣ Obtener estado de discos
        const feedsResp = await axios.get(`https://${pais.nombre.toLowerCase()}.integra-metrics.com/api/v2/estado-feeds?data={"time":"1 hours"}`, {
            headers: { "Authorization": `Bearer ${pais.token}`, "Accept": "application/json" }
        });

        // Tomar solo el último registro por PC
        const latestPerPc = Object.values(feedsResp.data)
            .flat()
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .reduce((acc, curr) => { if (!acc[curr.id_pc]) acc[curr.id_pc] = curr; return acc; }, {});

        // Solo mostrar discos que estén en alerta
        const alertas = Object.values(latestPerPc).map(pc => {
            const alertasPC = [];
            const primarioLibre = toGB(pc.primary_disk_total - pc.primary_disk_used);
            if (primarioLibre < 10) {
                alertasPC.push(`*FEED* ${pc.id_pc}* - Primario ALERTA (${primarioLibre}/${toGB(pc.primary_disk_total)} GB)`);
            }

            const secundarioLibre = toGB(pc.secondary_disk_total - pc.secondary_disk_used);
            if (secundarioLibre < 5) {
                alertasPC.push(`*FEED* ${pc.id_pc}* - Secundario ALERTA (${secundarioLibre}/${toGB(pc.secondary_disk_total)} GB)`);
            }

            return alertasPC;
        }).flat().filter(Boolean);

        const discosTexto = alertas.length > 0 ? alertas.join("\n") : "DISCOS OK";

        // ✅ Mostramos canales y solo los discos en alerta si existen
        return `*${pais.nombre}*:\n${canalesTexto}${alertas.length > 0 ? "\n" + discosTexto : ""}`;

    } catch (err) {
        return `*${pais.nombre}*:\nError al consultar API (${err.message})`;
    }
}

async function ejecutarPrueba() {
    const mensaje = await consultarPais(PAIS);
    await enviarTelegram(mensaje);
    console.log("Mensaje enviado a Telegram");
}

async function enviarTelegram(texto) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await axios.post(url, { chat_id: CHAT_ID, text: texto, parse_mode: "Markdown" });
    } catch (error) {
        console.error("Error enviando mensaje a Telegram:", error.message);
    }
}

// Ejecutar prueba inmediata
ejecutarPrueba();
