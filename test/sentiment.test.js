const sentimentAnalysis = require('../sentiment-analysis')
const { WebClient } = require('@slack/client');

const mockAddReaction = jest.fn();
jest.mock('@slack/client', () => {
    return {
        WebClient: jest.fn().mockImplementation(() => {
            return {
                reactions: {
                    add: mockAddReaction
                }
            };
        })
    }
});

const VALID_VERIFICATION_TOKEN = 'fake-verification-token';

const valid_positive_context = {
    secrets: {
        slackSentimentApiToken: 'fake-api-token',
        slackAppVerificationToken: VALID_VERIFICATION_TOKEN
    },
    body: {
        token: VALID_VERIFICATION_TOKEN,
        event: {
            user: 'fake-user',
            channel: 'fake-channel',
            text: 'I am really happy',
            ts: 'timestamp'
        },
        challenge: 'fake-challenge-token'
    }
};

const valid_negative_context = {
    secrets: {
        slackSentimentApiToken: 'fake-api-token',
        slackAppVerificationToken: VALID_VERIFICATION_TOKEN
    },
    body: {
        token: VALID_VERIFICATION_TOKEN,
        event: {
            user: 'fake-user',
            channel: 'fake-channel',
            text: 'I am so mad',
            ts: 'timestamp'
        },
        challenge: 'fake-challenge-token'
    }
};

const valid_neutral_context = {
    secrets: {
        slackSentimentApiToken: 'fake-api-token',
        slackAppVerificationToken: VALID_VERIFICATION_TOKEN
    },
    body: {
        token: VALID_VERIFICATION_TOKEN,
        event: {
            user: 'fake-user',
            channel: 'fake-channel',
            text: 'I am ok',
            ts: 'timestamp'
        },
        challenge: 'fake-challenge-token'
    }
};

const invalid_slack_input = {
    secrets: {
        slackSentimentApiToken: 'fake-api-token',
        slackAppVerificationToken: VALID_VERIFICATION_TOKEN
    },
    body: {
        token: VALID_VERIFICATION_TOKEN,
        event: {
            text: 'I am ok',
            ts: 'timestamp'
        },
        challenge: 'fake-challenge-token'
    }
};

const missing_secrets = {
    secrets: {},
    body: {
        token: VALID_VERIFICATION_TOKEN,
        event: {
            user: 'fake-user',
            channel: 'fake-channel',
            text: 'I am so mad',
            ts: 'timestamp'
        },
        challenge: 'fake-challenge-token'
    }
};

beforeEach(() => {
    WebClient.mockClear();
    mockAddReaction.mockClear();
});

describe('When given positive sentiment text', function () {
    it('should add a thumps up reaction', function () {
        sentimentAnalysis(valid_positive_context, (err, result) => {
            expect(result).toEqual(valid_positive_context.body.challenge);
        });

        expect(WebClient).toHaveBeenCalledTimes(1);
        expect(WebClient).toHaveBeenCalledWith(valid_positive_context.secrets.slackSentimentApiToken);
        expect(mockAddReaction).toHaveBeenCalledWith({
            name: 'thumbsup',
            channel: valid_positive_context.body.event.channel,
            timestamp: valid_positive_context.body.event.ts
        });
    });
});

describe('When given negative sentiment text', function () {
    it('should add a thumps down reaction', function () {
        sentimentAnalysis(valid_negative_context, (err, result) => {
            expect(result).toEqual(valid_negative_context.body.challenge);
        });
        expect(WebClient).toHaveBeenCalledTimes(1);
        expect(WebClient).toHaveBeenCalledWith(valid_negative_context.secrets.slackSentimentApiToken);
        expect(mockAddReaction).toHaveBeenCalledWith({
            name: 'thumbsdown',
            channel: valid_positive_context.body.event.channel,
            timestamp: valid_positive_context.body.event.ts
        });
    });
});

describe('When given neutral sentiment text', function () {
    it('should add no reaction', function () {
        sentimentAnalysis(valid_neutral_context, (err, result) => {
            expect(result).toEqual(valid_neutral_context.body.challenge);
        });
        expect(WebClient).toHaveBeenCalledTimes(1);
        expect(WebClient).toHaveBeenCalledWith(valid_neutral_context.secrets.slackSentimentApiToken);
        expect(mockAddReaction).not.toHaveBeenCalled();
    });
});

describe('When given invalid slack input', function () {
    it('should fail silently only logging the error', function () {
        sentimentAnalysis(invalid_slack_input, (err, result) => {
            expect(result).toEqual(invalid_slack_input.body.challenge);
        });
        expect(WebClient).toHaveBeenCalledTimes(1);
        expect(WebClient).toHaveBeenCalledWith(invalid_slack_input.secrets.slackSentimentApiToken);
        expect(mockAddReaction).not.toHaveBeenCalled();
    });
});

describe('When missing secrets', function () {
    it('should fail silently only logging the error', function () {
        sentimentAnalysis(missing_secrets, (err, result) => {
            expect(result).toEqual(missing_secrets.body.challenge);
        });
        expect(WebClient).toHaveBeenCalledTimes(0);
        expect(mockAddReaction).not.toHaveBeenCalled();
    });
});