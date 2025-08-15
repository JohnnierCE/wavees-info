const axios = require("axios");

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

const PAIS = {
    nombre: "RD",
    token: "7c0a5d5e456db8b238879426b52d504ecd087a98c574d69d63ffb3868cf6f9b8c30ff4fbda7a265c91e70769b90497c07335cb02d0af8eca7f94a724103aaa80",
    indice: 3
};

function toGB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

async function consultarPais(pais) {
    try {
        // 1️⃣ Canales
        const softResp = await axios.get(`https://${pais.nombre.toLowerCase()}.integra-metrics.com/api/v2/estado-soft?data={}`, {
            headers: { "Authorization": `Bearer ${pais.token}`, "Accept": "application/json" }
        });

        const canales = Array.isArray(softResp.data[pais.indice]) ? softResp.data[pais.indice] : [];
        const canalesTexto = canales.length > 0 ? canales.join("\n") : "TODO ESTABLE";

        // 2️⃣ Estado discos / RAM / inodos
        const feedsResp = await axios.get(`https://${pais.nombre.toLowerCase()}.integra-metrics.com/api/v2/estado-feeds?data={"time":"1 hours"}`, {
            headers: { "Authorization": `Bearer ${pais.token}`, "Accept": "application/json" }
        });

        const latestPerPc = Object.values(feedsResp.data)
            .flat()
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .reduce((acc, curr) => { if (!acc[curr.id_pc]) acc[curr.id_pc] = curr; return acc; }, {});

        const discosTexto = Object.values(latestPerPc).map(pc => {
            const primarioLibre = toGB(pc.primary_disk_total - pc.primary_disk_used);
            const primarioTotal = toGB(pc.primary_disk_total);
            const primarioStatus = primarioLibre >= 10 ? "OK" : "ALERTA";

            const secundarioLibre = toGB(pc.secondary_disk_total - pc.secondary_disk_used);
            const secundarioTotal = toGB(pc.secondary_disk_total);
            const secundarioStatus = secundarioLibre >= 5 ? "OK" : "ALERTA";

            const ramLibre = toGB(pc.ram_total - pc.ram_used);
            const inodos = (100 - pc.inodes_free).toFixed(2);

            return `- PC ${pc.id_pc}: Primario ${primarioStatus} (${primarioLibre}/${primarioTotal} GB), Secundario ${secundarioStatus} (${secundarioLibre}/${secundarioTotal} GB), RAM libre ${ramLibre} GB, Inodos ${inodos}%`;
        }).join("\n");

        return `*${pais.nombre}*:\n${canalesTexto}\n\nEstado discos:\n${discosTexto}`;

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
