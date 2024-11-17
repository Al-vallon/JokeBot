const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

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
            return data.joke; // Blague en une seule partie
        } else {
            return `${data.setup}\n${data.delivery}`; // Blague en deux parties
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la blague :', error);
        return "Désolé, je n'ai pas pu trouver de blague pour le moment.";
    }
};

// Envoi d'une blague aléatoire
const sendRandomJoke = async () => {
    const channels = client.channels.cache.filter(channel => channel.type === 'GUILD_TEXT');
    console.log("Canaux récupérés:", channels.size);

    if (channels.size === 0) {
        console.log("Aucun canal texte trouvé.");
        return;
    }

    const randomChannel = channels.random();
    if (randomChannel) {
        try {
            const joke = await fetchJoke();
            randomChannel.send(joke); // Envoie la blague
        } catch (error) {
            console.error("Erreur lors de l'envoi de la blague:", error);
        }
    } else {
        console.log("Aucun canal aléatoire sélectionné.");
    }
};

// Événement "ready"
client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    
    // Envoi de blagues à intervalles réguliers toutes les 15 minutes (900 000 ms)
    setInterval(() => {
        sendRandomJoke();
    }, 900000); // Envoi toutes les 15 minutes
    
    // Envoi immédiat d'une blague pour tester
    sendRandomJoke();
});

// Connexion du bot
client.login(DISCORD_TOKEN);
