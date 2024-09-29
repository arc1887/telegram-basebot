const fs = require('fs');
const afkFile = './afkData.json';

let afkUsers = new Map();

const loadAfkData = () => {
  if (fs.existsSync(afkFile)) {
    const data = JSON.parse(fs.readFileSync(afkFile));
    afkUsers = new Map(Object.entries(data));
  }
};

const saveAfkData = () => {
  fs.writeFileSync(afkFile, JSON.stringify(Object.fromEntries(afkUsers)));
};

loadAfkData();

module.exports = async (conn, m) => {
  if (!m.text) return;

  const cid = m.chat.id;
  const firstName = m.from.first_name;
  const lastName = m.from.last_name ? m.from.last_name : "";
  const username = m.from.username ? `(@${m.from.username})` : "";
  const body = m.text;
  const args = m.text.trim().split(/ +/).slice(1);
  const text = args.join(" ");
  const command = m.text.startsWith('/') ? m.text.slice(1).split(' ')[0] : '/';
  const isGroup = String(cid).startsWith("-");
  const pushname = m.from.username;
  
  const moment = require('moment-timezone');
  const jam = moment.tz('Asia/Jakarta').hour();
  const ucapan = jam < 5 ? '🌆 Selamat Subuh 🌆' :
                 jam < 12 ? '🌇 Selamat Pagi 🌇' :
                 jam < 17 ? '🏙️ Selamat Siang 🏙️' :
                 jam < 19 ? '🌅 Selamat Senja 🌅' :
                             '🌃 Selamat Malam 🌃';

  const chalk = require("chalk");
  const owner = "damnbajutudahkoyak";

  console.log(chalk.black(chalk.bgHex('#ff5e78').bold(`\n ${ucapan} `)));
  console.log(chalk.white(chalk.bgHex('#4a69bd').bold(`🚀 Ada Pesan, Om! 🚀`)));
  console.log(chalk.black(chalk.bgHex('#fdcb6e')(`📅 DATE: ${new Date().toLocaleString()}
💬 MESSAGE: ${body}
🗣 SENDER : ${firstName} ${lastName} ${username}
👤 CHAT ID: ${m.chat.id}`)));
  
  const reply = async (str) => {
    await conn.sendMessage(cid, str, {
      reply_to_message_id: m.message_id
    });
  };
  
  const mentions = async (str) => {
    const options = {
      parse_mode: 'MarkdownV2',
      reply_to_message_id: m.message_id
    };
    await conn.sendMessage(cid, str, options);
  };

  
  const now = Date.now();
  
  if (afkUsers.has(m.from.id)) {
    const afkTime = now - afkUsers.get(m.from.id).timestamp;
    const afkDuration = moment.duration(afkTime);
    const formattedDuration = `${afkDuration.days()} hari, ${afkDuration.hours()} jam, ${afkDuration.minutes()} menit, ${afkDuration.seconds()} detik`;
    afkUsers.delete(m.from.id);
    saveAfkData();
    await reply(`@${pushname} kembali online, kamu AFK selama ${formattedDuration}.`);
  }

  if (m.text) {
    await conn.sendChatAction(cid, 'typing');
  }

  switch (command) {
    case 'start': {
      await reply("Hai, bot ini baru dibuat");
    }
    break;

    case 'afk': {
      afkUsers.set(m.from.id, { timestamp: now });
      saveAfkData();
      await mentions("@" + pushname + " sekarang AFK: " + text);
    }
    break;

    default:
    
    if (body.includes("=>") || body.includes(">")) {
      if (!pushname.includes(owner)) return;
      try {
        let evaled = await eval("(async () => { return " + body.slice(2) + " })()");
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
        await reply(evaled);
      } catch (err) {
        await reply(String(err));
      }
    }
    
    if (body.includes("$")) {
      if (!pushname.includes(owner)) return;
      require("child_process").exec(m.text.slice(2), (err, stdout) => {
        if (err) return reply(`${err}`);
        if (stdout) return reply(stdout);
      });
    }
  }
};

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file);
  console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
  delete require.cache[file];
  require(file);
});