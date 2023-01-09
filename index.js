//Create a Discord Bot using OpenAI API that interacts on the Discord Server
import * as dotenv from "dotenv";
dotenv.config();

//Prepare connection to Discord API
import { Client, GatewayIntentBits } from "discord.js";

//Create the client for Discord.JS
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

//Prepare OpenAI API
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

//Starting command, Please change to what ever you wish to start your bot
const startCommand = "!bot";

//Check for when a message on discord is sent
client.on("messageCreate", async function (message) {
  let words = message.content.split(" ");

  console.log(words);
  console.log(words[0]);
  try {
    //Don't check messages by bots
    if (message.author.bot) return;

    //If the message does not contain the start command ignore it
    if (words[0] !== startCommand) return;

    //Print list of commands for your bot to show users
    if (message.content.toLocaleLowerCase() === `${startCommand} help`) {
      message.reply(`Print command list`);
      return;
    }

    //If the second word is draw, use the DallE API to draw an image
    if (words[1] === "draw") {
      try {
        //Check if the user only asked to draw without a request
        if (words.length === 2) {
          message.reply("Please tell me something to draw.");
          return;
        }

        //Initiate the request variable
        let request = "";

        //Loop through the words starting at the second index and combine them into a sentence
        for (let i = 2; i < words.length; i++) {
          request = request + `${words[i]} `;
        }

        //Use the API to create an image
        const response = await openai.createImage({
          prompt: `${request}`,
          n: 1,
          size: "256x256",
        });

        //Get the image url
        let image_url = await response.data.data[0].url;

        //Respond with the image url
        message.reply(image_url);
        return;
      } catch (error) {
        //If error tell user that it cannot be drawn
        message.reply("Sorry I cannot draw that");
        return;
      }
    }

    //By default use OpenAI Davinci V3 to respond to the message
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Bot is a friendly chatbot. \n\
            Bot: Hello, how are you?\n\
            ${message.author.username}: ${message.content}\n\
            Bot:`,
      temperature: 0.5,
      max_tokens: 256,
      stop: ["Bot:", `${message.author.username}:`],
    });

    //Reply with message from Davinci
    message.reply(`${response.data.choices[0].text}`);
    return;
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.DISCORD_TOKEN);
console.log("Bot is Online in discord");
