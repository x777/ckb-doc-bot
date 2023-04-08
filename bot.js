require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const { topics } = require("./topics");
const createChatResponse = require("./gpt-api-chat");
const createTextResponse = require("./gpt-api-text");

//http://t.me/ckb_doc_bot

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TG_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log("Bot is started...");

// Default mode of bot
var botMode = "assistant";

const historyMsgs = [];

bot.onText(/\/start/, (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;

  // send back the matched "whatever" to the chat
  bot.sendMessage(
    chatId,
    "Welcome to the Nervos Network documentation AI assistant!\nPlease choose mode by entering command /assistant or /manual"
  );
});

// assistant mode
bot.onText(/\/assistant/, (msg) => {
  // 'msg' is the received Message from Telegram

  const chatId = msg.chat.id;

  botMode = "assistant";

  // send back to the chat
  bot.sendMessage(
    chatId,
    `Switched to ${botMode} mode\nImportant notice: due to API answer could be delayed!`
  );
});

// manual mode
bot.onText(/\/manual/, (msg) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;

  botMode = "manual";

  // send back to the chat
  bot.sendMessage(chatId, `Switched to ${botMode} mode`);
});

bot.on("message", (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;

  let msgText = msg.text.toLowerCase();

  if (msgText == "/start" || msgText == "/manual" || msgText == "/assistant") {
    return;
  }
  switch (botMode) {
    case "assistant":
      console.log(`Bot mode: ${botMode}`);
      createChatResponse(msgText, historyMsgs)
        .then(({ data }) => {
          console.log(data);
          console.log(data.choices.length);
          if (data.choices.length !== 0) {
            console.log(data.choices);
            //   console.log(data.choices[0]);
            bot.sendMessage(chatId, data.choices[0].message.content);

            //   let userMsg = {
            //     role: "assistant",
            //     content: msgText,
            //   };
            //   historyMsgs.push(userMsg);

            let answerMsg = {
              role: "assistant",
              content: data.choices[0].message.content,
            };

            historyMsgs.push(answerMsg);
          } else {
            bot.sendMessage(chatId, "Sorry, something went wrong!");
          }
        })
        .catch((err) => {
          bot.sendMessage(chatId, `"Sorry, something went wrong! ${err} "`);
        });
      break;
    case "manual":
      console.log(`Bot mode: ${botMode}`);
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
          createTextResponse(msgText)
            .then(({ data }) => {
              console.log(data.choices.length);
              if (data.choices.length !== 0) {
                console.log(data.choices);
                console.log(data.choices[0].text);
                bot.sendMessage(chatId, data.choices[0].text);
              } else {
                bot.sendMessage(chatId, "Sorry, something went wrong!");
              }
            })
            .catch((err) => {
              bot.sendMessage(chatId, `"Sorry, something went wrong! ${err} "`);
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
      break;
    default:
      break;
  }
});
