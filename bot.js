const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Fake server for Render port trouble
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Le bot Discord fonctionne.');
});

app.listen(PORT, () => {
    console.log(`Serveur HTTP en écoute sur le port ${PORT}`);
});


// Bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Fetch a joke from the API
const fetchJoke = async () => {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any?lang=fr', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Erreur réseau : ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.type === 'single') {
            return data.joke;
        } else {
            return `${data.setup}\n${data.delivery}`;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la blague :', error);
        return "Désolé, je n'ai pas pu trouver de blague pour le moment.";
    }
};

// Send a random joke to a random channel
const sendRandomJoke = async () => {
    const channels = client.channels.cache.filter(channel => channel.type === ChannelType.GuildText);

    const channelsArray = Array.from(channels.values());
    const randomChannel = channelsArray[Math.floor(Math.random() * channelsArray.length)];

    if (randomChannel) {
        try {
            const joke = await fetchJoke();
            randomChannel.send(joke);
        } catch (error) {
            console.error("Erreur lors de l'envoi de la blague :", error);
        }
    } else {
        console.log("Aucun canal aléatoire sélectionné.");
    }
};

// Command handler for !blague
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!blague') {
        try {
            const joke = await fetchJoke();
            await message.channel.send(joke);
        } catch (error) {
            console.error("Erreur lors de la commande !blague :", error);
            await message.channel.send("Oups ! Je n'ai pas pu récupérer de blague pour le moment.");
        }
    }
});

// Event: Bot ready
client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    
    // Send jokes every 15 minutes
    setInterval(() => {
        sendRandomJoke();
    }, 28800000);
});

// Connect the bot
client.login(DISCORD_TOKEN);
