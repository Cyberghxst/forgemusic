const { ForgeMusic, GuildQueueEvent, YoutubeiExtractor } = require("../dist")
const { ForgeClient } = require("@tryforge/forgescript")
require("dotenv").config()

const music = new ForgeMusic({
    events: [
        GuildQueueEvent.AudioTrackAdd,
        GuildQueueEvent.Connection,
        GuildQueueEvent.ConnectionDestroyed
    ],
    extractorsLoadFilter: (extractor) => extractor !== "YouTubeExtractor"
})

const client = new ForgeClient({
    extensions: [
        music
    ],
    events: [
        "messageCreate",
        "ready"
    ],
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent",
        "GuildVoiceStates"
    ],
    token: process.env.TOKEN,
    prefixes: ["."]
})

music.commands.add({
    type: GuildQueueEvent.Connection,
    code: "$!sendMessage[$env[queue;metadata;text;id];Established a connection with <#$env[queue;channel;id]>]"
},{
    type: GuildQueueEvent.ConnectionDestroyed,
    code: "$!sendMessage[$env[queue;metadata;text;id];Connection with voice channel was forcefully destroyed.]"
},{
    type: GuildQueueEvent.AudioTrackAdd,
    code: "$!sendMessage[$env[queue;metadata;text;id];The track $bold[\"$env[track;title]\"] was added to the queue.]"
})

music.player.extractors.register(YoutubeiExtractor, {})

client.commands.add({
    name: "play",
    type: "messageCreate",
    code: `
        $c[Checking if the message author is connected to a voice channel.]
        $if[$voiceID[$guildID;$authorID]==;
            $!sendMessage[$channelID;You must be connected to a voice channel.]
            $stop
        ]

        $c[Checking if client and message author are in the same channel.]
        $if[$and[$voiceID[$guildID;$authorID]!=;$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]];
            $!sendMessage[$channelID;You must be connected to my voice channel.]
            $stop
        ]

        $c[Checking if message has arguments.]
        $if[$message==;
            $!sendMessage[$channelID;You must provide a song name.]
            $stop
        ]

        $c[Trying to play the track.]
        $#playTrack[$voiceID[$guildID;$authorID];$message]
    `
},{
    type: "ready",
    code: "$log[Client is ready;Available music providers: $getAvailableProviders]"
})

client.login()