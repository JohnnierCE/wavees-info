const axios = require("axios");

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

const GT_API = {
  nombre: "RD",
  url: "https://rd.integra-metrics.com/api/v2/estado-soft?data=%7B%7D",
  token: "7c0a5d5e456db8b238879426b52d504ecd087a98c574d69d63ffb3868cf6f9b8c30ff4fbda7a265c91e70769b90497c07335cb02d0af8eca7f94a724103aaa80"
};

// Escapar caracteres especiales para MarkdownV2
function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

async function enviarCanalesConFallas() {
  try {
    const { data } = await axios.get(GT_API.url, {
      headers: {
        Authorization: `Bearer ${GT_API.token}`,
        Accept: "application/json",
      },
    });

    // Tomamos solo el índice 0 (canales con fallas)
    const canalesConFallas = Array.isArray(data[3]) ? data[3] : [];

    const mensaje =
      canalesConFallas.length > 0
        ? `*${escapeMarkdownV2(GT_API.nombre)}*:\n${canalesConFallas.map(escapeMarkdownV2).join("\n")}`
        : `*${escapeMarkdownV2(GT_API.nombre)}*: No hay fallas`;

    // Enviar a Telegram
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: "MarkdownV2",
    });

    console.log("Mensaje enviado a Telegram:", mensaje);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Ejecutar
enviarCanalesConFallas();
