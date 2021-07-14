const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const moment = require("moment");
const Jimp = require("jimp");
const ayarlar = require("./config.json");
require("./util/eventLoader")(client);
const db = require("quick.db");
const message = require("./events/message");
let prefix = ayarlar.prefix;
  




const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./commands/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) return message.author.send("**Beni Yalnızca Sunucularda Kullanabilirsin!**");
  let permlvl = 0;
  if (message.member.permissions.has("BAN_MEMBERS")) permlvl = 2;
  if (message.member.permissions.has("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};


//---------------------------------------------------------|| ||------------------------------------------------------------------//

//etiket=prefix

client.on('message', msg => {
  if(msg.content === '<@!'+client.user.id+'>') {
    msg.channel.send(new Discord.MessageEmbed().setDescription('Merhaba, Beni Çağırmışsın :wave: \nPrefixim: '+`\`${prefix}\``).setColor('#ff0000'))
  }
})

//reklam engel
client.on("message", msg => {
  const reklam = db.fetch(`rklmengl_${msg.guild.id}`)
  
  
  if(reklam) {
    const engel = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf.gd", ".az", ".party", "discord.gg", "youtube.com", ".be"]
    if(engel.some(rklm => msg.content.includes(rklm))) {
      try {
        if(!msg.member.permissions.has("MANAGE_GUILD")) {
          msg.delete()
          return msg.reply(new Discord.MessageEmbed().setDescription("**Bu sunucuda reklam engelleme sistemi aktif! Buraya link atamazsın!**").setColor("RANDOM")).then(fade => fade.delete({timeout: 5000}))
        } 
      } catch(err) {
       console.log(err);
        
    }
  }
}
  if(!reklam) return
})
//reklam engel son

//küfür engel

client.on("message", msg => {
  const küfür = db.fetch(`kfrengl_${msg.guild.id}`)
  
  if(küfür) {
    const engel = ["oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];// Buraya engellenecek küfürlerin fazlasını yazabilirsiniz
    if(engel.some(kfr => msg.content.includes(kfr))) {
      try {
        if(!msg.member.permissions.has("MANAGE_GUILD")) {
          msg.delete()
          return msg.reply(new Discord.MessageEmbed().setDescription("**Bu sunucuda küfür engel sistemi aktif! Küfür edemezsin.**").setColor("RANDOM"))
        }
      } catch(err) {
        console.log(err)
      }
    }
  }
  if(!küfür) return
})

client.on("messageUpdate", msg => {
  const küfür = db.fetch(`kfrengl_${msg.guild.id}`)
  
  if(küfür) {
    const engel = ["oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];
    if(engel.some(kfr => msg.content.includes(kfr))) {
      try {
        if(!msg.member.permissions.has("MANAGE_GUILD")) {
          msg.delete()
          return msg.reply(new Discord.MessageEmbed().setDescription("**Bu sunucuda küfür engel sistemi aktif! Küfür edemezsin.**").setColor("RANDOM"))
        }
      } catch(err) {
        console.log(err)
      }
    }
  }
  if(!küfür) return
})


//küfür engel son
//rol koruma

client.on("roleDelete", async role => {
  let rolko = await db.fetch(`rlkrm_${role.guild.id}`);
  if (rolko) { 
         const entry = await role.guild.fetchAuditLogs({ type: "ROLE_DELETE" }).then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
  role.guild.roles.create({ data: {
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          permissions: role.permissions,
          mentionable: role.mentionable,
          position: role.position
}, reason: 'Silinen rolleri tekrardan açtım.'})
  }
})

//

client.on("roleCreate", async role => {
  let rolk = await db.fetch(`rlkrm_${role.guild.id}`);
  if (rolk) { 
       const entry = await role.guild.fetchAuditLogs({ type: "ROLE_CREATE" }).then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
  role.delete()
  }
})

//rol koruma son
//emoji koruma

client.on("emojiDelete", async (emoji, message, channels) => {
  let emojik = await db.fetch(`emjkrm_${emoji.guild.id}`)
  if (emojik) {
  const entry = await emoji.guild.fetchAuditLogs({ type: "EMOJI_DELETE" }).then(audit => audit.entries.first());
  if (entry.executor.id == client.user.id) return;
  if (entry.executor.id == emoji.guild.owner.id) return;
  if (!emoji.guild.members.cache.get(entry.executor.id).hasPermission('ADMINISTRATOR')) {
    
  emoji.guild.emojis.create(`${emoji.url}`, `${emoji.name}`).catch(console.error);

  
  }
  }
});

//emoji koruma son
//kanal koruma

client.on("channelDelete", async function(channel) {
  

  const gereksiz = await db.fetch(`kanalkoruma_${channel.guild.id}`);
  
  if(gereksiz === "aktif") {
if(gereksiz){
  let kanal = channel.parentID;
let position = kanal.position;
channel.clone().then(sa => {
  sa.setPosition(position);
  sa.send(`Merhaba sunucunuzda bir yetkili tarafından silinen kanal yeniden açılmıştır!`)
});
};
}});


//kanal koruma son
//capsengel
client.on("message", async msg => {
    if (msg.channel.type === "dm") return;
      if(msg.author.bot) return;  
        if (msg.content.length > 4) {
         if (db.fetch(`capslock_${msg.guild.id}`)) {
           let caps = msg.content.toUpperCase()
           if (msg.content == caps) {
             if (!msg.member.hasPermission("ADMINISTRATOR")) {
               if (!msg.mentions.users.first()) {
                 msg.delete()
                 return msg.channel.send(new Discord.MessageEmbed().setColor('RANDOM').setDescription(`Hey dostum! Bu sunucuda \`CapsLock Engel\` aktif vaziyette, affetmem. :sunglasses:`)).then(m => m.delete(5000))
     }
       }
     }
   }
  }
});
//capsengel son
//mod log

client.on('guildBanAdd', async (guild, user) => {
  let modlogs = db.get(`modlogkanaly_${guild.id}`)
  const modlogkanal = guild.channels.cache.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    let embed = new Discord.MessageEmbed()
    .setColor('BLACK')
    .setAuthor("Bir kişi sunucudan yasaklandı!")
    .setThumbnail(user.avatarURL()||user.defaultAvatarURL)
    .addField(`Yasaklanan kişi`, `\`\`\` ${user.tag} \`\`\` `)
    .setFooter(`${client.user.username} | Mod-Log Sistemi`)
    .setTimestamp()
    modlogkanal.send(embed)
  }
});


client.on('guildBanRemove', async (guild, user) => {
  let modlogs = db.get(`modlogkanaly_${guild.id}`)
   const modlogkanal = guild.channels.cache.find(kanal => kanal.id === modlogs);
   if(!modlogs) return;
   if(modlogs) {
     let embed = new Discord.MessageEmbed()
     .setColor('BLACK')
     .setAuthor("Bir kişinin yasağı kaldırıldı!")
     .setThumbnail(user.avatarURL()||user.defaultAvatarURL)
     .addField(`Yasağı kaldırılan kişi`, `\`\`\` ${user.tag} \`\`\` `)
     .setFooter(`${client.user.username} | Mod-Log Sistemi`)
     .setTimestamp()
     modlogkanal.send(embed)
   }
 });
client.on('channelCreate', async channel => {
  let modlogs = db.get(`modlogkanaly_${channel.guild.id}`)
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_CREATE'}).then(audit => audit.entries.first())
  let user = client.users.cache.get(entry.executor.id)
   const modlogkanal = channel.guild.channels.cache.find(kanal => kanal.id === modlogs);
   if(!modlogs) return;
   if(modlogs) {
     if (channel.type === "text") {
       let embed = new Discord.MessageEmbed()
       .setColor('BLACK')
       .setAuthor("Bir kanal oluşturuldu!")
       .addField(`Oluşturulan Kanalın İsmi: `, `${channel.name}`)
       .addField(`Oluşturulan Kanalın Türü: `, `Yazı`)
       .addField(`Kanalı Oluşturan: `, `<@${user.id}>`)
       .setFooter(`${client.user.username} | Mod-Log Sistemi`)
       .setTimestamp()
       modlogkanal.send(embed)
     }
       if (channel.type === "voice") {
       
         let embed = new Discord.MessageEmbed()
         .setColor('BLACK')
         .setAuthor("Bir kanal oluşturuldu!")
         .addField(`Oluşturulan Kanalın İsmi: `, `${channel.name}`)
         .addField(`Oluşturulan Kanalın Türü: `, `Ses`)
         .addField(`Kanalı Oluşturan: `, `<@${user.id}>`)
         .setFooter(`${client.user.username} | Mod-Log Sistemi`)
         .setTimestamp()
         modlogkanal.send(embed)
 
 
     }
 }});

 client.on('channelDelete', async channel => {
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first())
let user = client.users.cache.get(entry.executor.id)
let modlogs = db.get(`modlogkanaly_${channel.guild.id}`)
const modlogkanal = channel.guild.channels.cache.find(kanal => kanal.id === modlogs);
if(!modlogs) return;
if(modlogs) {
if (channel.type === "text") {
let embed = new Discord.MessageEmbed()
.setColor('BLACK')
.setAuthor("Bir kanal silindi!")
.addField(`Silinen Kanalın İsmi: `, `${channel.name}`)
.addField(`Silinen Kanalın Türü: `, `Yazı`)
.addField(`Kanalı Silen : `, `<@${user.id}>`)
.setFooter(`${client.user.username} | Mod-Log Sistemi`)
.setTimestamp()
modlogkanal.send(embed)
}
  if (channel.type === "voice") {

    let embed = new Discord.MessageEmbed()
    .setColor('BLACK')
    .setAuthor("Bir kanal silindi!")
    .addField(`Silinen Kanalın İsmi: `, `${channel.name}`)
    .addField(`Silinen Kanalın Türü: `, `Ses`)
    .addField(`Kanalı Silen: `, `<@${user.id}>`)
    .setFooter(`${client.user.username} | Mod-Log Sistemi`)
    .setTimestamp()
    modlogkanal.send(embed)
   }
  }
});

client.on('roleDelete', async role => {
  let modlogs =  db.get(`modlogkanaly_${role.guild.id}`)
   let entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first())
   let user = client.users.cache.get(entry.executor.id)
  const modlogkanal = role.guild.channels.cache.find(kanal => kanal.id === modlogs);
   if(!modlogs) return;
   if(modlogs) {
     let embed = new Discord.MessageEmbed()
     .setColor('BLACK')
     .setAuthor("Bir rol silindi!")
     .addField(`Silinen Rolün İsmi: `, `${role.name}`)
     .addField(`Rolü Silen: `, `<@${user.id}>`)
     .setFooter(`${client.user.username} | Mod-Log Sistemi`)
     .setTimestamp()
     modlogkanal.send(embed)
   }
 });
 
 client.on('emojiDelete', async emoji => {
  let modlogs = db.get(`modlogkanaly_${emoji.guild.id}`)
  let entry = await emoji.guild.fetchAuditLogs({type: 'EMOJI_DELETE'}).then(audit => audit.entries.first())
  let user = client.users.cache.get(entry.executor.id)
   const modlogkanal = emoji.guild.channels.cache.find(kanal => kanal.id === modlogs);
   if(!modlogs) return;
   if(modlogs) {
     let embed = new Discord.MessageEmbed()
     .setColor('BLACK')
     .setAuthor("Bir emoji silindi!")
     .addField(`Silinen Emojinin İsmi: `, `${emoji.name}`)
     .addField(`Emojiyi Silen: `, `<@${user.id}>`)
     .setFooter(`${client.user.username} | Mod-Log Sistemi`)
     .setTimestamp()
     modlogkanal.send(embed)
   }
 });
  

 client.on('roleCreate', async role => {
  let modlogs =  db.get(`modlogkanaly_${role.guild.id}`)
  let entry = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE'}).then(audit => audit.entries.first())
  let user = client.users.cache.get(entry.executor.id)
    const modlogkanal = role.guild.channels.cache.find(kanal => kanal.id === modlogs);
    if(!modlogs) return;
    if(modlogs) {
      let embed = new Discord.MessageEmbed()
      .setColor('BLACK')
      .setAuthor("Bir rol oluşturuldu!")
      .addField(`Oluşturulan Rolün İsmi : `, `${role.name}`)
      .addField(`Rolü Oluşturan : `, `<@${user.id}>`)
      .setFooter(`${client.user.username} | Mod-Log Sistemi`)
      .setTimestamp()
      modlogkanal.send(embed)
    }
  });
//MESAJ LOG
client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (newMessage.author.bot || newMessage.channel.type === "dm") return;
  if (newMessage.content.startsWith(ayarlar.prefix)) return;
  let sc = await db.fetch(`modlogkanaly_${newMessage.guild.id}`);
  let scbul = newMessage.guild.channels.cache.get(sc)
  if(!scbul) {
    
  }
  if (oldMessage.content == newMessage.content) return;
  let embed = new Discord.MessageEmbed()
    .setColor('BLACK')
    .setAuthor(`Mesaj düzenlendi!`, newMessage.author.avatarURL())
    .addField("Kullanıcı", newMessage.author)
    .addField("Eski Mesaj", "```" + oldMessage.content + "```")
    .addField("Yeni Mesaj", "```" + newMessage.content + "```")
    .addField("Kanal Adı", newMessage.channel.name)
    .addField("Mesaj ID", newMessage.id)
    .addField("Kullanıcı ID", newMessage.author.id)
    .setFooter(`Bilgilendirme  • bugün saat ${newMessage.createdAt.getHours() +
        3}:${newMessage.createdAt.getMinutes()}`
    );
  scbul.send(embed);
});

client.on("messageDelete", async deletedMessage => {
  if (deletedMessage.author.bot || deletedMessage.channel.type === "dm") return;
  if (deletedMessage.content.startsWith(ayarlar.prefix)) return;
  let sc = await db.fetch(`modlogkanaly_${deletedMessage.guild.id}`);
  let scbul = deletedMessage.guild.channels.cache.get(sc)
  if(!scbul) {
    
  }
  let embed = new Discord.MessageEmbed()
    .setColor('BLACK')
    .setAuthor(`Mesaj silindi!`, deletedMessage.author.avatarURL())
    .addField("Kullanıcı", deletedMessage.author)
    .addField("Silinen Mesaj", "```" + deletedMessage.content + "```")
    .addField("Kanal Adı", deletedMessage.channel.name)
    .addField("Mesaj ID", deletedMessage.id)
    .addField("Kullanıcı ID", deletedMessage.author.id)
    .setFooter(`Bilgilendirme  • bügün saat ${deletedMessage.createdAt.getHours() +
        3}:${deletedMessage.createdAt.getMinutes()}`
    );
  scbul.send(embed);
});
//capsengel
function percentage(partialValue, totalValue) {
   return (100 * partialValue) / totalValue;
} 

client.on('message', async(message) => {
if (!message.guild) return
let acikmi = await db.fetch(`${message.guild.id}.capsengel`)
if (!acikmi) return
if (message.author.bot) return
if (message.member.hasPermission("MANAGE_MESSAGES")) return
let matched = message.content.replace(/[^A-Z]/g, "").length
let yuzde = percentage(matched, message.content.length)
if (Math.round(yuzde) > acikmi.yuzde) {
  message.delete()
  message.author.send(new Discord.MessageEmbed().setColor("BLACK").setTimestamp().setFooter(`${message.guild.name}`,message.guild.iconURL({dynamic:true})).setAuthor("Caps Lock Engelleme Sistemi").setDescription("**Uyarı! "+message.guild.name+" sunucusunda büyük harfle yazma engeli bulunmaktadır!**\nBu sebepten göndermiş olduğunuz mesaj silindi."))
  message.channel.send(new Discord.MessageEmbed().setColor("BLACK").setTimestamp().setFooter(`${message.guild.name}`,message.guild.iconURL({dynamic:true})).setAuthor("Caps Lock Engelleme Sistemi",message.author.displayAvatarURL({dynamic:true})).setDescription(message.author.username+" - "+(message.member.nickname ? `${message.member.nickname} - ${message.author.id}` : message.author.id)+"\n**Uyarı!  Bu sunucuda büyük harfle yazma engeli bulunmaktadır!**\nBu sebepten göndermiş olduğunuz mesaj silindi.")).then(msg=>msg.delete({timeout:3000}))
}else{return}
})

client.login(ayarlar.token);