# sentiment-webtask
A webtask created to analyze the sentiment of a conversation

#### Setup Slack App
To start you will need to create a slack app: https://api.slack.com/slack-apps
Things to note here:
1) You will want to save the Verification Token as a secret in the web task called `slackAppVerificationToken`

#### Setup Slack Event Subscription
You will then have to setup an event subscription for that app: https://api.slack.com/events-api#subscriptions
Things to note here: 
1) the request url can be gotten from the WebTask
2) You will need to subscribe to workspace events, for this example I did the `message.channels` event. This is public channels only.

#### Setup Slack Bot
You will also have to setup a bot to add the sentiment reactions: https://api.slack.com/custom-integrations/bot-users
You can just jump to the section called "Setting up your bot user" and follow the link to create your bot.
Things to note here:
1) You will want to save the access token as a secret in the web task called `slackSentimentApiToken`

That should be everything you will need to setup to get real time sentiment analysis on your conversations.

## Next Steps
The project could be taken in another direction where you start saving the slack/sentiment data in a DB.
Then you could run analysis on it to get answers to questions such as:
"Do these two people usually have positive or negative conversations?"
"What is the general sentiment for talk in this channel?"
"What are the most common positive words used?"
"What are the most common negative words used?"

These are just some of the questions you could answer with the data.

## Final Notes
You must respond to the slack event with a positive response code within 3 seconds. Otherwise it will send the event again. It will perform the retry up to 3 times, so if it is extended to do a lot more work that will need to be done asynchronously. 