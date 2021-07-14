const Discord = require('discord.js')
const ayarlar = require('../config.json')
var prefix = ayarlar.prefix
exports.run = async(client, message, args) => {
  

  const yardım = new Discord.MessageEmbed()
  .setTitle(`Yardım Menüsü`)
  .setDescription(`
  
  **__Guard Komutları__**
  > ${prefix}caps-engel \`aç\` / \`kapat\`
  > ${prefix}emoji-koruma \`aç\` / \`kapat\`
  > ${prefix}kanal-koruma \`aç\` / \`kapat\`
  > ${prefix}küfür-engel \`aç\` / \`kapat\`
  > ${prefix}reklam-engel \`aç\` / \`kapat\`
  > ${prefix}rol-koruma \`aç\` / \`kapat\`
  
  **__Log Komutu__**
  > ${prefix}mod-log #kanal
  > ${prefix}ayarlar`)
  .setColor("RANDOM")
  .setImage(client.user.displayAvatarURL())
  message.channel.send(yardım)
  
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [''],
  permlvl: 0
}

exports.help = {
  name: "yardım"
}
