const axios = require("axios");

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

const PAISES = [
    { nombre: "RD", url: "https://rd.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "7c0a5d5e456db8b238879426b52d504ecd087a98c574d69d63ffb3868cf6f9b8c30ff4fbda7a265c91e70769b90497c07335cb02d0af8eca7f94a724103aaa80" },
    { nombre: "CO", url: "https://co.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "784531556743bc5d76129cfc057413dd73563372e896da054ed5e2856e760c20f90943f8b7deaa28ed7b3d559141329838955b1140a921d255af1e038cf917ed" },
    { nombre: "SV", url: "https://sv.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "8d37362ef1bc9e77e6b4937584dd88706581031ca9c659403c31b915dad9f392373e9f9a26bd21fde4f0b145aa6b3ba1ceccb6333b582b02af81b5415d119287" },
    { nombre: "CR", url: "https://cr.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "06dfd57a8c27831a6577d5eebc7a1564b9db49c9c0664911ba1a5c823e88da3cb08879845da34604981af81e6dcc93988ce6d689041f2f89c3e71461e0940598" },
    { nombre: "EC", url: "https://ec.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "83f057c00b2a0ace1c8728635f072794bb28a3937b138baa765771c0e03ec85bbd24c5832ab07591e897ee95744219f62df7052a866f583553a927e6f4c6c54b" },
    { nombre: "GT", url: "https://gt.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "1b9b06749016cd1c3bfe0ce075ef1682745c04cfb81268370ac129da1ae4052a8635fd4b323e35b317b360a64d7e117f52cea4f5386b760f3d9c847e43357abd" },
    { nombre: "NI", url: "https://ni.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "284df6e890c5dc6a152ac53170ecc30ac179bedae607bf65e8f4b7805cc60cfeba222e87f1554ca90782a0bd0a193bb2e60f159681d53005c42a788450a623a7" },
    { nombre: "PA", url: "https://pa.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "d6267fef3bee1be21d7177764c2c07e6df3e7c9b1f7421caf9b4f417e5b79a4b112abf0df8ac05fd75bd48cf4f2015e4cc18bba7301641ccff03a15219a39132" },
    { nombre: "PR", url: "https://pr.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "3759aae609335e59d6c7c94e6c9a113ba1178fdc7c9e3494bbed4be0fb13e5cbae7dd22b667850d39a326fbf750f2dd9884608cef85b429a33ff5cc63a09cd87" },
    { nombre: "CL", url: "https://cl.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "166cb6f9a23fe170b52c616771fb67bc811cc801db86d4e0f63d3a0061020d74692efa1eaf35eff80a272c7a26cdc63b6af2b70615a52920bfd04d76c8576142" },
    { nombre: "UY", url: "https://uy.integra-metrics.com/api/v2/estado-soft?data=%7B%7D", token: "759361d51187fe9dbd526e0219a098b92d05249b29ee69778fb11e9e70cf7bdacec61f4e5b195d32948c5ba1b35dbb239a7286a69a687cbfe055d380a9209013" }
];

function escapeMarkdown(text) {
    return text.replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

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
            const ultimoArray = arraysValidos.length > 0 ? arraysValidos[arraysValidos.length - 1] : [];

            if (ultimoArray.length === 0) {
                mensajes.push(`*${pais.nombre}*:\nEstable ✅`);
            } else {
                mensajes.push(`*${pais.nombre}*:\n${ultimoArray.map(escapeMarkdown).join("\n")}`);
            }

        } catch (error) {
            mensajes.push(`*${pais.nombre}*:\nError al consultar API (${escapeMarkdown(error.message)})`);
        }
    }

    if (mensajes.length > 0) {
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
            parse_mode: "MarkdownV2"
        });
    } catch (error) {
        console.error("Error enviando mensaje a Telegram:", error.message);
    }
}

setInterval(consultarTodasLasAPIs, 300000);
consultarTodasLasAPIs();
