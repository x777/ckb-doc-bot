require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function createTextResponse(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt + " In the context of Nervos Network documentation.",
    // suffix: "Nervos Network",
    temperature: 0.2,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
    stop: ["You:"],
  });

  return response;
}

module.exports = createTextResponse;
