import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SESSION_DIR = "./sesion";
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
let reconnecting = false;

function unwrapMessage(message) {
  let current = message;
  while (current?.ephemeralMessage || current?.viewOnceMessage || current?.viewOnceMessageV2) {
    current =
      current.ephemeralMessage?.message ||
      current.viewOnceMessage?.message ||
      current.viewOnceMessageV2?.message ||
      current;
  }
  return current;
}

function getText(message) {
  const content = unwrapMessage(message);
  return (
    content?.conversation ||
    content?.extendedTextMessage?.text ||
    content?.imageMessage?.caption ||
    content?.videoMessage?.caption ||
    content?.documentMessage?.caption ||
    ""
  ).trim();
}

async function askForPhoneNumber() {
  const terminal = createInterface({ input, output });
  try {
    const answer = await terminal.question(
      "Escribe tu número de WhatsApp con código de país (solo números): "
    );
    const number = answer.replace(/\D/g, "");
    if (!/^\d{8,15}$/.test(number)) {
      throw new Error("Número no válido. Incluye el código de país, sin + ni espacios.");
    }
    return number;
  } finally {
    terminal.close();
  }
}

async function handleMessage(sock, message) {
  if (!message?.message || message.key?.fromMe) return;

  const chat = message.key?.remoteJid;
  if (!chat || chat === "status@broadcast") return;

  const text = getText(message.message);
  if (!text.startsWith(".")) return;

  const command = text.split(/\s+/)[0].toLowerCase();

  try {
    if (command === ".menu") {
      await sock.sendMessage(chat, {
        text: [
          "🌌 *GALAXITO SUB BOT*",
          "",
          "¡Hola! Soy Galaxito :3",
          "",
          "🐾 *COMANDOS*",
          ".menu — Mostrar este menú",
          ".ping — Comprobar si estoy activo",
          ".info — Información del bot"
        ].join("\n")
      });
    } else if (command === ".ping") {
      await sock.sendMessage(chat, {
        text: "¡Pong! 🐾 Galaxito está activo."
      });
    } else if (command === ".info") {
      await sock.sendMessage(chat, {
        text: "🌌 *Galaxito Sub Bot*\nVersión 1.0.1\nBot de WhatsApp desarrollado por Noobs Interactive Inc."
      });
    }
  } catch (error) {
    logger.error({ err: error }, "No se pudo procesar el comando");
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["Galaxito Sub Bot", "Chrome", "1.0.1"]
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const message of messages) {
      await handleMessage(sock, message);
    }
  });

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "connecting") {
      logger.info("Conectando con WhatsApp...");
    }

    if (connection === "open") {
      reconnecting = false;
      logger.info("¡Galaxito Sub Bot está conectado!");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        logger.error("La sesión fue cerrada desde WhatsApp. Elimina la carpeta sesion y vuelve a vincular.");
        return;
      }

      if (!reconnecting) {
        reconnecting = true;
        logger.warn("Conexión perdida. Se intentará reconectar en 5 segundos...");
        setTimeout(() => {
          reconnecting = false;
          startBot().catch((error) => logger.error({ err: error }, "Error al reconectar"));
        }, 5000);
      }
    }
  });

  if (!state.creds.registered) {
    try {
      const number = await askForPhoneNumber();
      const pairingCode = await sock.requestPairingCode(number);
      logger.info({ pairingCode }, "Código de vinculación. Escríbelo en WhatsApp > Dispositivos vinculados.");
    } catch (error) {
      logger.error({ err: error }, "No se pudo generar el código de vinculación");
      sock.end(error);
    }
  }
}

startBot().catch((error) => {
  logger.fatal({ err: error }, "No se pudo iniciar Galaxito Sub Bot");
  process.exitCode = 1;
});
