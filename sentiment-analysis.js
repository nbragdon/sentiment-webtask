/**
* @param context {WebtaskContext}
*/
const Sentiment = require('sentiment');
const bunyan = require('bunyan');
const { WebClient } = require('@slack/client');

const logger = bunyan.createLogger({ name: "sentiment" });

const POSITIVE_SENTIMENT_EMOJI = 'thumbsup';
const NEGATIVE_SENTIMENT_EMOJI = 'thumbsdown';

const sentiment = new Sentiment();

module.exports = function (context, cb) {
    logger.info({ message: 'Entered sentiment handler', contextBody: context.body })
    try {
      const user = context.body.event.user;
      const messageText = context.body.event.text;
      const channel = context.body.event.channel;
      const token = context.body.token;
      
      let reactionEmojiName = null;
  
      logger.info({ user: user, messageText: messageText, channel: channel });
      
      if (context.secrets.slackAppVerificationToken !== token) {
        throw Error('Invalid verification token')
      }
      
      const slackWebClient = new WebClient(context.secrets.slackSentimentApiToken);
      
      const messageSentiment = sentiment.analyze(messageText);
  
      logger.info({ messageSentiment: messageSentiment })
  
      if (messageSentiment.score < 0) {
          reactionEmojiName = NEGATIVE_SENTIMENT_EMOJI;
      } else if (messageSentiment.score > 0) {
          reactionEmojiName = POSITIVE_SENTIMENT_EMOJI;
      }
  
      logger.info({ reactionEmojiName: reactionEmojiName })
  
      if (context.body.event.username != 'bot' && reactionEmojiName !== null) {
          slackWebClient.reactions.add({ name: reactionEmojiName, channel: channel, timestamp: context.body.event.ts })
              .then((res) => {
                  logger.log({ responseTime: res.ts, message: 'Message Sent' });
              })
              .catch((err) => {
                logger.error('Failed to add reaction', err)
              })
      }
    } catch (err) {
      logger.error(err)
    }

    cb(null, context.body.challenge);
};