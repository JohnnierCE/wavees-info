const axios = require("axios");

const TELEGRAM_TOKEN = "8308992460:AAHoSoA9rWhHJCt9FuX2RkdBCVhmdnSX6d8";
const CHAT_ID = "5703312558";

const GT_API = {
  nombre: "GT",
  url: "https://gt.integra-metrics.com/api/v2/estado-soft?data=%7B%7D",
  token: "1b9b06749016cd1c3bfe0ce075ef1682745c04cfb81268370ac129da1ae4052a8635fd4b323e35b317b360a64d7e117f52cea4f5386b760f3d9c847e43357abd"
};

// Escapar caracteres especiales para MarkdownV2
function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

async function enviarCanalesIndice1() {
  try {
    const { data } = await axios.get(GT_API.url, {
      headers: {
        Authorization: `Bearer ${GT_API.token}`,
        Accept: "application/json",
      },
    });

    // Tomamos solo el índice 1
    const canalesIndice1 = Array.isArray(data[1]) ? data[1] : [];

    const mensaje =
      canalesIndice1.length > 0
        ? `*${escapeMarkdownV2(GT_API.nombre)}* - Índice 1:\n${canalesIndice1.map(escapeMarkdownV2).join("\n")}`
        : `*${escapeMarkdownV2(GT_API.nombre)}* - Índice 1: No hay datos`;

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
enviarCanalesIndice1();
