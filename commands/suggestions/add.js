const Commando = require('discord.js-commando');
const RichEmbed = require('discord.js').RichEmbed;

class AddCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'add',
            aliases: ['create', 'new', 'add-suggestion', 'suggestion', 'add-feedback', 'feedback'],
            group: 'suggestions',
            memberName: 'add',
            description: 'Add a suggestion',
            examples: ['add "Add music bot" "Please add a music bot to the server, because it\'s fun!"'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 60
            },
            args: [
                {
                    key: 'title',
                    prompt: 'What is the title of your suggestion?',
                    type: 'string',
                    min: 4,
                    max: 50,
                    wait: 60
                },
                {
                    key: 'description',
                    prompt: 'Please provide a description of your suggestion.',
                    type: 'string',
                    min: 10,
                    wait: 300
                }
            ],
            argsSingleQuotes: false,
        });
    }

    async run(msg, args) {
        let channel = msg.guild.settings.get('channel');
        if (!channel || !(channel = msg.guild.channels.get(channel))) {
            msg.react('❌');
            return msg.reply('Sorry, we are not taking new suggestions for the moment.');
        }

        // Ok, we create the message
        const id = msg.guild.settings.get('next_id', 1);
        const formattedId = String(id).length >= 4 ? '' + id : (String('0').repeat(4) + id).slice(-4);

        const embed = new RichEmbed();
        embed.setAuthor(`Feedback #${formattedId}`, msg.guild.iconURL)
            .addField('Title', args.title)
            .addField('Description', args.description)
            .setFooter(`Posted by ${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL)
            .setTimestamp();

        // And send it
        const suggestion = await channel.sendEmbed(embed);
        suggestion.react('👍').then(() => suggestion.react('👎'));

        // Now, save the info that we want to keep
        msg.guild.settings.set(`feedback#${id}`, suggestion.id);
        msg.guild.settings.set('next_id', id + 1);

        // Now, we can confirm the actions
        if (!msg.promptCount) msg.react('✅');
        let reply = 'Thanks you for your feedback.';
        if (channel.permissionsFor(msg.member).hasPermission('READ_MESSAGES')) {
            reply += ` You can see it in ${channel} (ID #${formattedId}).`;
        }

        reply = await msg.reply(reply);

        // Due to a limitation in discord.js-commando, we can track all messages involved in the command
        // So, we delete messages, only if the command was run in a unique message
        if (!msg.promptCount && msg.deletable && reply.deletable) {
            msg.delete(10000);
            reply.delete(10000);
        }

        return reply;
    }
}

module.exports = AddCommand;