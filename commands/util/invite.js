const Commando = require('discord.js-commando');
const RichEmbed = require('discord.js').RichEmbed;
const stripIndents = require('common-tags').stripIndents;

class InviteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            aliases: ['inv', 'join', 'oauth'],
            group: 'util',
            memberName: 'invite',
            description: 'Gets the invite link'
        });
    }

    async run(msg) {
        const author = await msg.client.fetchUser('262700032262799382');

        const embed = new RichEmbed();
        embed.setAuthor('Invite the suggestion bot to your server')
            .setDescription(stripIndents`
                As a bot, I can't accept invites. Please use this link to add me to your server:
                ${await msg.client.generateInvite([
                    'SEND_MESSAGES',
                    'MANAGE_MESSAGES',
                    'ATTACH_FILES',
                    'ADD_REACTIONS'
                ])}
            `)
            .addField('Guild', stripIndents`
                If you need help, you can join my guild:
                ${msg.client.options.invite}
            `)
            .setThumbnail(msg.client.user.displayAvatarURL)
            .setFooter(`Bot made by ${author.username}#${author.discriminator}`, author.displayAvatarURL);

        const reply = await msg.author.sendEmbed(embed);

        if (msg.deletable) {
            msg.react('✅');
            msg.delete(2000);
        }

        return reply;
    }
}

module.exports = InviteCommand;