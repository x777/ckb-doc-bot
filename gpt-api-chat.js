require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function createChatResponse(prompt, historyMsgs) {
  console.log(prompt);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are Nervos Network documentation assistant chatbot",
      },
      {
        role: "user",
        content: prompt,
      },
      ...historyMsgs,
    ],
  });

  return response;
}

module.exports = createChatResponse;
