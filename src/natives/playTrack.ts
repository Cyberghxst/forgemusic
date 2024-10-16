import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { BaseChannel, VoiceBasedChannel } from "discord.js"
import { ForgeMusic } from "@structures/ForgeMusic"
import { useMainPlayer } from "discord-player"

export default new NativeFunction({
    name: "$playTrack",
    version: "1.0.0",
    description: "Play a track by query.",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "Channel ID",
            description: "Voice channel ID to play the track on.",
            type: ArgType.Channel,
            required: true,
            rest: false,
            check: (c: BaseChannel) => c.isVoiceBased()
        },
        Arg.requiredString("Query", "Track name to be searched.")
    ],
    async execute(ctx, [voiceChannel, query]) {
        const player = useMainPlayer()
        const connectOptions = ctx.getExtension(ForgeMusic).connectOptions ?? {}
        const connectionOptionsUnion = {
            metadata: { text: ctx.channel },
            ...connectOptions
        }

        let executed = true
        const result = await player.play(<VoiceBasedChannel>voiceChannel, query, {
            nodeOptions: connectionOptionsUnion
        }).catch((e) => {
            executed = false
            return e
        })

        return executed ? this.success() : this.error(result)
    }
})