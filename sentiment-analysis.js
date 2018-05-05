/**
* @param context {WebtaskContext}
*/
const Sentiment = require('sentiment');
const bunyan = require('bunyan');
const { WebClient } = require('@slack/client');

const logger = bunyan.createLogger({ name: "sentiment" });

const POSITIVE_SENTIMENT_EMOJI = 'thumbsup';
const NEGATIVE_SENTIMENT_EMOJI = 'thumbsdown';

module.exports = function (context, cb) {
    logger.info({ message: 'Entered sentiment handler', contextBody: context.body })
    let sentiment = new Sentiment();
    let user = context.body.event.user,
        messageText = context.body.event.text,
        channel = context.body.event.channel,
        token = context.body.token;

    logger.info({ user: user, messageText: messageText, channel: channel });

    let messageSentiment = sentiment.analyze(messageText);

    logger.info({ messageSentiment: messageSentiment })

    const slackWebClient = new WebClient(context.secrets.slackSentimentApiToken);
    const conversationId = channel;

    let reactionEmojiName = null;

    if (messageSentiment.score < 0) {
        reactionEmojiName = POSITIVE_SENTIMENT_EMOJI;
    } else if (messageSentiment.score > 0) {
        reactionEmojiName = NEGATIVE_SENTIMENT_EMOJI;
    }

    logger.info({ reactionEmojiName: reactionEmojiName })

    if (context.body.event.username != 'bot' && reactionEmojiName !== null) {
        slackWebClient.reactions.add({ name: reactionEmojiName, channel: conversationId, timestamp: context.body.event.ts })
            .then((res) => {
                logger.log({ responseTime: res.ts, message: 'Message Sent' });
            })
            .catch(console.error);
    }

    cb(null, context.body.challenge);
};