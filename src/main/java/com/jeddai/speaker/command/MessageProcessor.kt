package com.jeddai.speaker.command

import discord4j.common.util.Snowflake
import discord4j.core.`object`.entity.User
import discord4j.core.event.domain.message.MessageCreateEvent
import io.micronaut.context.annotation.Value
import reactor.core.publisher.Mono
import javax.inject.Singleton

@Singleton
class MessageProcessor(
    @Value("command-prefix") private val prefix: String
) {

    fun processEvent(event: MessageCreateEvent): Mono<Void> {
        // The message is a webhook or a bot, ignore
        return if (event.message.author.map { obj: User -> obj.isBot }.orElse(true)) {
            Mono.empty()
        } else Mono.justOrEmpty(event.guildId)
            .switchIfEmpty(Mono.empty())
            .flatMap { guildId: Snowflake ->
                processMessage(
                    guildId,
                    event
                )
            }
    }

    private fun processMessage(
        guildId: Snowflake,
        event: MessageCreateEvent
    ): Mono<Void> {
        return Mono.justOrEmpty(event.message.channel)
            .flatMap { it }
            .then()
    }
}