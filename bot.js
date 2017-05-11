const config = require('./data/config.json');
const pkg = require('./package.json');
const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const oneLine = require('common-tags').oneLine;
const path = require('path');
const log = require('./util/log');
const DiscordBots = require('discordbots');

log('%s version %s (with discord.js-commando version %s) starting up...', pkg.name, pkg.version, Commando.version);

let dbots;
if (config.dbots_token) dbots = new DiscordBots(config.dbots_token);

const bot = new Commando.Client({
    owner: config.owners,
    commandPrefix: config.prefix,
    unknownCommandResponse: false,
    disableEveryone: true,
    invite: config.invite,
    disabledEvents: [
        Discord.Constants.Events.PRESENCE_UPDATE,
        Discord.Constants.Events.TYPING_START,
        Discord.Constants.Events.TYPING_STOP,
    ]
});

bot.on('error', console.error);
bot.on('warn', console.warn);
bot.on('debug', log);
bot.on('disconnect', (event) => log('Disconnected [#%s]: %s', event.code, event.reason));
bot.on('reconnecting', () => log('Reconnecting...'));
bot.on('ready', () => {
    bot.user.setGame('in public alpha');
    log('Bot ready, logged in as %s#%d (%d)', bot.user.username, bot.user.discriminator, bot.user.id);
    if (dbots) dbots.postBotStats(bot.user.id, {server_count: bot.guilds.size});
});

bot.on('commandError', (cmd, err) => {
    if(err instanceof Commando.FriendlyError) return;
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
});
bot.on('commandBlocked', (msg, reason) => {
    log(oneLine`
        Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
        blocked; ${reason}
    `);
});
bot.on('commandPrefixChange', (guild, prefix) => {
    log(oneLine`
        Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
        ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
    `);
});
bot.on('commandStatusChange', (guild, command, enabled) => {
    log(oneLine`
        Command ${command.groupID}:${command.memberName}
        ${enabled ? 'enabled' : 'disabled'}
        ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
    `);
});
bot.on('groupStatusChange', (guild, group, enabled) => {
    log(oneLine`
        Group ${group.id}
        ${enabled ? 'enabled' : 'disabled'}
        ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
    `);
});


bot.on('guildCreate', guild => {
    log('Added to guild %s (%d) owned by %s#%s', guild.name, guild.id, guild.owner.user.username, guild.owner.user.discriminator);
    if (config.log_channel)
        bot.channels.get(config.log_channel).send(oneLine`Added to guild **${guild.name}** (\`${guild.id}\`)
        owned by ${guild.owner.user} (${guild.owner.user.username}#${guild.owner.user.discriminator})`);

    if (dbots) dbots.postBotStats(bot.user.id, {server_count: bot.guilds.size});
});
bot.on('guildDelete', guild => {
    if (guild.owner) {
        log('Left the guild %s (%d) owned by %s#%s', guild.name, guild.id, guild.owner.user.username, guild.owner.user.discriminator);
        if (config.log_channel)
            bot.channels.get(config.log_channel).send(oneLine`*Left the guild **${guild.name}** (\`${guild.id}\`)
            owned by ${guild.owner.user} (${guild.owner.user.username}#${guild.owner.user.discriminator})*`);
    } else {
        log('Left the guild %s (%d)', guild.name, guild.id);
        if (config.log_channel)
            bot.channels.get(config.log_channel).send(oneLine`*Left the guild **${guild.name}** (\`${guild.id}\`)*`);
    }

    if (dbots) dbots.postBotStats(bot.user.id, {server_count: bot.guilds.size});
});


bot.setProvider(
    sqlite.open('./data/settings.sqlite3').then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

bot.registry.registerGroups([
    ['suggestions', 'Commands to manage suggestions']
]);
bot.registry.registerDefaultTypes();
bot.registry.registerDefaultGroups();
bot.registry.registerDefaultCommands();
bot.registry.registerCommandsIn(path.join(__dirname, 'commands'));

bot.login(config.token);

// Signal handlers
function exitOnSig(signal) {
    process.on(signal, () => {
        log('Got %s, exiting...', signal);
        bot.destroy();
        bot.once('disconnect', () => setTimeout(process.exit, 500));
    });
}
exitOnSig('SIGINT');
exitOnSig('SIGTERM');