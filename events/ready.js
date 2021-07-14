const chalk = require("chalk");
const moment = require("moment");
const Discord = require("discord.js");
const ayarlar = require("../config.json");

var prefix = ayarlar.prefix;

module.exports = client => {
  
  console.log(
    `[${moment().format("YYYY-MM-DD HH:mm:ss")}] BOT: Aktif, komutlar başarıyla yüklendi!`
)
  console.log(
    `[${moment().format("YYYY-MM-DD HH:mm:ss")}] BOT: ${
      client.user.username
    } ismi ile başarıyla giriş yapıldı!`
  );
  client.user.setActivity('Developed By. Kayra - For GitHub (:')
  client.user.setStatus('dnd')
};
