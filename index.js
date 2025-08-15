const axios = require("axios");

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

// Lista completa de países
const PAISES = [
    { nombre: "RD", url: "https://rd.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "7c0a5d5e456db8b238879426b52d504ecd087a98c574d69d63ffb3868cf6f9b8c30ff4fbda7a265c91e70769b90497c07335cb02d0af8eca7f94a724103aaa80", indice: 3 },
    { nombre: "CO", url: "https://co.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "784531556743bc5d76129cfc057413dd73563372e896da054ed5e2856e760c20f90943f8b7deaa28ed7b3d559141329838955b1140a921d255af1e038cf917ed", indice: 3 },
    { nombre: "SV", url: "https://sv.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "8d37362ef1bc9e77e6b4937584dd88706581031ca9c659403c31b915dad9f392373e9f9a26bd21fde4f0b145aa6b3ba1ceccb6333b582b02af81b5415d119287", indice: 3 },
    { nombre: "CR", url: "https://cr.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "06dfd57a8c27831a6577d5eebc7a1564b9db49c9c0664911ba1a5c823e88da3cb08879845da34604981af81e6dcc93988ce6d689041f2f89c3e71461e0940598", indice: 3 },
    { nombre: "EC", url: "https://ec.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "83f057c00b2a0ace1c8728635f072794bb28a3937b138baa765771c0e03ec85bbd24c5832ab07591e897ee95744219f62df7052a866f583553a927e6f4c6c54b", indice: 3 },
    { nombre: "GT", url: "https://gt.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "1b9b06749016cd1c3bfe0ce075ef1682745c04cfb81268370ac129da1ae4052a8635fd4b323e35b317b360a64d7e117f52cea4f5386b760f3d9c847e43357abd", indice: 3 },
    { nombre: "NI", url: "https://ni.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "284df6e890c5dc6a152ac53170ecc30ac179bedae607bf65e8f4b7805cc60cfeba222e87f1554ca90782a0bd0a193bb2e60f159681d53005c42a788450a623a7", indice: 3 },
    { nombre: "PA", url: "https://pa.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "d6267fef3bee1be21d7177764c2c07e6df3e7c9b1f7421caf9b4f417e5b79a4b112abf0df8ac05fd75bd48cf4f2015e4cc18bba7301641ccff03a15219a39132", indice: 3 },
    { nombre: "PR", url: "https://pr.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "3759aae609335e59d6c7c94e6c9a113ba1178fdc7c9e3494bbed4be0fb13e5cbae7dd22b667850d39a326fbf750f2dd9884608cef85b429a33ff5cc63a09cd87", indice: 3 },
    { nombre: "CL", url: "https://cl.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "166cb6f9a23fe170b52c616771fb67bc811cc801db86d4e0f63d3a0061020d74692efa1eaf35eff80a272c7a26cdc63b6af2b70615a52920bfd04d76c8576142", indice: 0 },
    { nombre: "UY", url: "https://uy.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "759361d51187fe9dbd526e0219a098b92d05249b29ee69778fb11e9e70cf7bdacec61f4e5b195d32948c5ba1b35dbb239a7286a69a687cbfe055d380a9209013", indice: 3 }
];

function toGB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

async function consultarPais(pais) {
    try {
        // Obtener canales
        const softResp = await axios.get(pais.url, {
            headers: { "Authorization": `Bearer ${pais.token}`, "Accept": "application/json" }
        });

        const canales = Array.isArray(softResp.data[pais.indice]) ? softResp.data[pais.indice] : [];
        let canalesTexto = canales.length > 0 ? canales.join("\n") : "TODO ESTABLE";

        // Chequear índice 6 para UTIL
        const indice6 = softResp.data[6]; // esto puede ser ["1"]
        if (Array.isArray(indice6) && indice6.includes("1")) {
            canalesTexto += `\n*UTIL: 1*`;
        }

        // Obtener estado de discos
        const feedsResp = await axios.get(`https://${pais.nombre.toLowerCase()}.integra-metrics.com/api/v2/estado-feeds?data={"time":"1 hours"}`, {
            headers: { "Authorization": `Bearer ${pais.token}`, "Accept": "application/json" }
        });

        const latestPerPc = Object.values(feedsResp.data)
            .flat()
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .reduce((acc, curr) => { if (!acc[curr.id_pc]) acc[curr.id_pc] = curr; return acc; }, {});

        // Solo mostrar discos en alerta
        const alertas = Object.values(latestPerPc).map(pc => {
            const alertasPC = [];
            const primarioLibre = toGB(pc.primary_disk_total - pc.primary_disk_used);
            if (primarioLibre < 10) alertasPC.push(`*FEED ${pc.id_pc}* 💽 - Primario ALERTA (${primarioLibre}/${toGB(pc.primary_disk_total)} GB)`);

            const secundarioLibre = toGB(pc.secondary_disk_total - pc.secondary_disk_used);
            if (secundarioLibre < 5) alertasPC.push(`*FEED ${pc.id_pc}* 💽 - Secundario ALERTA (${secundarioLibre}/${toGB(pc.secondary_disk_total)} GB)`);

            return alertasPC;
        }).flat().filter(Boolean);

        return `*${pais.nombre}*:\n${canalesTexto}${alertas.length > 0 ? "\n" + alertas.join("\n") : ""}`;

    } catch (err) {
        return `*${pais.nombre}*:\nError al consultar API (${err.message})`;
    }
}

async function ejecutarPrueba() {
    let mensajes = [];
    for (const pais of PAISES) {
        const msg = await consultarPais(pais);
        mensajes.push(msg);
    }

    await enviarTelegram(mensajes.join("\n\n"));
    console.log("Mensajes enviados a Telegram");
}

async function enviarTelegram(texto) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await axios.post(url, { chat_id: CHAT_ID, text: texto, parse_mode: "Markdown" });
    } catch (error) {
        console.error("Error enviando mensaje a Telegram:", error.message);
    }
}

// Ejecutar cada 5 minutos
setInterval(ejecutarPrueba, 300000);

// Primera ejecución inmediata
ejecutarPrueba();
