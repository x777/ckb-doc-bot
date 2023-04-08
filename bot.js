require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const { topics } = require("./topics");
const createResponse = require("./gpt-api");

//http://t.me/ckb_doc_bot

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TG_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, "Hi");
});

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on("message", (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, "Received your message");
// });

// Listen for incoming messages by topic
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  let msgText = msg.text.toLowerCase();

  let counter = 0;

  // check the message text for each topic's keywords
  Object.keys(topics).forEach((topic) => {
    const keywords = topics[topic];
    const foundKeywords = keywords.filter((keyword) => {
      return msgText.includes(keyword);
    });

    if (foundKeywords.length > 0) {
      counter++;
      // the message contains keywords for this topic
      console.log(`Message for ${topic}: ${msgText}`);
      // TODO: handle the message for this topic
      createResponse(msgText).then(({ data }) => {
        console.log(data.choices.length);
        if (data.choices.length !== 0) {
          console.log(data.choices);
          console.log(data.choices[0].text);
          bot.sendMessage(chatId, data.choices[0].text);
        } else {
          bot.sendMessage(chatId, "Sorry, something went wrong!");
        }
      });
    }
  });

  bot.sendMessage(chatId, "Please wait, I am looking for answer...");

  if (counter == 0) {
    bot.sendMessage(
      chatId,
      "Sorry, this topic is not related to https://docs.nervos.org/"
    );
  }
});
