# Galaxy-bot
Bot automatizado de whatsapp
 
{
  "name": "galaxito-sub-bot",
  "version": "1.0.0",
  "description": "Bot de WhatsApp Galaxito Sub Bot",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "latest",
    "pino": "latest"
  }
}
  
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const preguntar = (texto) =>
  new Promise((resolve) =>
    rl.question(texto, resolve)
  );

async function iniciarBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./sesion");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });

  if (!sock.authState.creds.registered) {
    let numero = await preguntar(
      "Escribe tu número con código de país: "
    );

    numero = numero.replace(/\D/g, "");

    const codigo = await sock.requestPairingCode(numero);

    console.log("Tu código de vinculación es:", codigo);
    console.log("Vincula el bot desde WhatsApp.");
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("¡Galaxito Sub Bot está conectado!");
      rl.close();
    }

    if (connection === "close") {
      const error = lastDisconnect?.error;
      const status = error?.output?.statusCode;

      if (status !== DisconnectReason.loggedOut) {
        console.log("Reconectando...");
        iniciarBot();
      } else {
        console.log("Sesión cerrada. Debes vincular nuevamente.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const chat = msg.key.remoteJid;
      if (!chat) continue;

      const texto =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      const comando = texto.trim().toLowerCase();

      if (comando === ".menu") {
        await sock.sendMessage(chat, {
          text: `🌌 GALAXITO SUB BOT

¡Hola! Soy Galaxito :3

Comandos disponibles:
.ping - Verificar el bot
.menu - Mostrar este menú`
        });
      }

      if (comando === ".ping") {
        await sock.sendMessage(chat, {
          text: "¡Pong! 🐾 Galaxito está activo."
        });
      }
    }
  });
}

iniciarBot().catch(console.error);
  
node_modules/
sesion/
.env
  
