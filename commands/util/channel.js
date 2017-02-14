const Commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;

class ChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'channel',
            group: 'util',
            memberName: 'channel',
            description: 'Shows or sets the suggestion channel.',
            format: '[#channel/"none"]',
            details: oneLine`
				If no channel is provided, the current suggestion channel will be shown.
				If the channel is "none", the prefix will be removed entirely, preventing new suggestions to be added.
				Only administrators may change the channel.
			`,
            examples: ['channel', 'channel #suggestion', 'channel none'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What would you like to set the suggestion channel to?',
                    type: 'string',
                    max: 21,
                    default: '',
                    parse: ChannelCommand.parse
                }
            ],
        });
    }

    /**
     * @param {string} value
     * @param {CommandMessage} msg
     * @return {?string}
     */
    static parse(value, msg) {
        const id = value.match(/<#(\d{18})>/)[1];
        const guild = msg.guild.channels.get(id);

        if (guild) return guild.id;
        else return 'none';
    }

    async run(msg, args) {
        // Just output the channel
        if(!args.channel) {
            const channel = msg.guild.settings.get('channel');

            let reply;
            if (channel) reply = `The suggestion channel is <#${channel}>.`;
            else reply = 'There is no suggestion channel defined yet.';

            reply = await msg.reply(reply);
            if (msg.deletable && reply.deletable) {
                msg.delete(15000);
                reply.delete(15000);
            }
            return;
        }

        // Check the user's permission before changing anything
        if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
            if (msg.deletable) msg.delete(5000);
            msg.react('❌');
            return;
        }

        // Save the channel
        if (args.channel.toLowerCase() !== 'none'){
            msg.guild.settings.set('channel', args.channel);
        } else {
            msg.guild.settings.remove('channel');
        }

        if (msg.deletable) msg.delete(5000);
        msg.react('✅');
    }
}

module.exports = ChannelCommand;