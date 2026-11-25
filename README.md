# Galaxy-bot

**Galaxito Sub Bot** es un bot de WhatsApp desarrollado con Node.js y Baileys.

## Requisitos

- Node.js 20 o superior
- npm
- Una cuenta de WhatsApp para vincular el dispositivo

## Instalación

1. Clona este repositorio.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el bot:

   ```bash
   npm start
   ```

4. En el primer inicio, escribe tu número de WhatsApp con código de país, solo números.
5. El terminal mostrará un código de vinculación. En WhatsApp abre **Dispositivos vinculados > Vincular un dispositivo > Vincular con número de teléfono** e introduce el código.

La sesión se guarda localmente en la carpeta `sesion/`. No compartas esa carpeta ni la subas a GitHub.

## Comandos disponibles

| Comando | Función |
| --- | --- |
| `.menu` | Muestra el menú |
| `.ping` | Comprueba que el bot responde |
| `.info` | Muestra información del bot |

## Ejecución continua

Para mantener el bot activo se necesita un servidor o proveedor de hosting compatible con Node.js 20+. Configura el comando de inicio como `npm start` y conserva el almacenamiento de la carpeta `sesion/` entre reinicios.

## Seguridad

- Nunca publiques códigos de vinculación, credenciales ni la carpeta `sesion/`.
- No compartas archivos `.env` ni secretos.
- Usa el bot respetando las condiciones de WhatsApp y evita mensajes masivos no solicitados.

## Tecnologías

- Node.js
- Baileys
- Pino
