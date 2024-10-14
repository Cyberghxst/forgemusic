import { SearchQueryType, useQueue, QueryType } from "discord-player"
import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { PLACEHOLDER_PATTERN } from "@utils/constants"
import { createContext, runInContext } from "node:vm"

export default new NativeFunction({
    name: "$searchTrack",
    version: "1.0.0",
    description: "Search for a track using the given query.",
    brackets: true,
    unwrap: true,
    args: [
        Arg.requiredString("Query", "The query to search for."),
        Arg.requiredString("Text Result", "The formatted text result to return."),
        Arg.optionalString("Engine", "The query search engine, can be extractor name to target an specific one. (custom)"),
        Arg.optionalEnum(QueryType, "Fallback Engine", "Fallback search engine to use."),
        Arg.optionalNumber("Limit", "The maximum number of results to return."),
        Arg.optionalBoolean("Add To Player", "Whether add the results to the music player."),
        {
            name: "Block Extractors", 
            description: "List of extractors to block.",
            type: ArgType.String,
            required: false,
            rest: true
        }
    ],
    async execute(ctx, [query, text, engine, fallbackEngine, limit, addToPlayer, blockedExtractors]) {
        const searchResult = await useQueue(ctx.guild).player.search(query, {
            searchEngine: engine as SearchQueryType | `ext:${string}`,
            fallbackSearchEngine: fallbackEngine,
            blockExtractors: blockedExtractors
        })

        let tracks = searchResult.tracks
        if (limit && tracks.length > limit) tracks = tracks.slice(0, limit);

        const formattedTracks = tracks.map((_, i) => text.replace(/\{position\}/g, String(i + 1)))
        .map((trackText, i) => {
            const track = tracks[i]
            const matches = trackText.match(PLACEHOLDER_PATTERN) ?? []
            const context = createContext({ track })

            for (const match of matches) {
                const placeholderValue = match.slice(1, -1)
                const result = runInContext(placeholderValue, context)

                trackText = trackText.replace(new RegExp(match, "g"), result)
            }

            return trackText
        })

        if (addToPlayer) useQueue(ctx.guild).addTrack(tracks);

        return this.success(searchResult.tracks.length > 0 ? formattedTracks.join(",") : "")
    }
})