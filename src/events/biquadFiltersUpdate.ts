import { MusicEventHandler } from "@handlers/MusicEventHandler"
import { ForgeMusic } from "@structures/ForgeMusic"
import { Interpreter } from "@tryforge/forgescript"
import { GuildQueueEvent } from "discord-player"

/**
 * The event should be listen to.
 */
const eventName = GuildQueueEvent.BiquadFiltersUpdate

export default new MusicEventHandler({
    name: eventName,
    description: "Executed when biquad filters is updated.",
    async listener(queue, oldFilters, newFilters) {
        const commands = this.getExtension(ForgeMusic).commands.get(eventName)
        if (!commands) return;

        for (const command of commands) {
            Interpreter.run({
                obj: {},
                client: this,
                command,
                environment: { queue, oldFilters, newFilters },
                data: command.compiled.code
            })
        }
    }
})