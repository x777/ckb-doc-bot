const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(process.env.OPENAI_API_KEY);
const openai = new OpenAIApi(configuration);

async function createResponse(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    //   prompt: "You: How do I combine arrays?\nJavaScript chatbot: You can use the concat() method.\nYou: How do you make an alert appear after 10 seconds?\nJavaScript chatbot",
    prompt: prompt + "Nervos Network",
    // suffix: "Nervos Network",
    temperature: 0,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
    stop: ["You:"],
  });

  return response;
}

// createResponse().then(({ data }) => {
//   console.log(data.choices);
// });

module.exports = createResponse;
