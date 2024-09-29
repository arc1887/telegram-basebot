const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const readline = require('readline');
const handleCommand = require('./case');

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const tokenPath = './token.txt';
const tokenExists = fs.existsSync(tokenPath);

const start = async () => {
  let token;

  if (!tokenExists) {
    token = await question('Enter your bot token: ');
    fs.writeFileSync(tokenPath, token);
  } else {
    token = fs.readFileSync(tokenPath, 'utf8');
  }

  const conn = new TelegramBot(token, { polling: true });
  if (!conn) return console.log('Bot tidak bisa terhubung\nBot cannot connect');
  console.log("Bot berhasil dikoneksi!");

  conn.on("message", async (m) => {
    //if (!m.text.includes("/")) return;
    await handleCommand(conn, m);
  });
};

start();

let file = require.resolve(__filename)
  require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file)
    console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
    delete require.cache[file]
    require(file)
  }
)