/**
* @param context {WebtaskContext}
*/
var Sentiment = require('sentiment');
var winston = require('winston@1.0.0');

module.exports = function (context, cb) {
    winston.info('Entered sentiment handler', context.body)
    let sentiment = new Sentiment();
    let user = context.body.user,
        messageText = context.body.text,
        channel = context.body.channel,
        token = context.body.token;

    winston.info('user', user);
    winston.info('messageText', messageText);
    winston.info('channel', channel);
    winston.info('token', token);

    let message_sentiment = sentiment.analyze(messageText);

    cb(null, context.body.challenge);
};