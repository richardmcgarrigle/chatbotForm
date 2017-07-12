/*-----------------------------------------------------------------------------
 This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
 For a complete walkthrough of creating this type of bot see the article at
 https://aka.ms/abs-node-waterfall
 -----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', [
    function (session) {
        builder.Prompts.choice(session, "Hello... I am a claims bot, you can use me to send photos of evidence for your claim new claim. To get started I will need to know if you will be asking about a new or existing claim.", ['new', 'existing']);
    },
    function (session, results) {
        session.userData.type = results.response;
        session.send('results.response', results.response)
        if(results.response == 'new'){
            builder.Prompts.number(session, "Ok, a " + session.userData.type + " claim, I'll need your policy number to start, please enter that below");
        }
        else{
            builder.Prompts.number(session, "Ok, an " + session.userData.type + " claim, I'll need your claim number to start, please enter that below");
        }

    },
    function (session, results) {
        session.userData.policy = results.response;
        builder.Prompts.attachment(session, "Got it " + results.response + ", looking that up now. While I'm doing that please send me the photo you would like attached to your policy for this cliam.");
    },
    function (session, results) {
        session.userData.attachment = results.response;

        builder.Prompts.choice(session, "Ok, I think i got everything to submit this for you.");
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("Got it... " + session.userData.name +
            " you've been programming for " + session.userData.coding +
            " years and use " + session.userData.language + ".");
    }
]);
if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}