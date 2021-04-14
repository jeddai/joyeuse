package com.jeddai.speaker.command

import discord4j.common.util.Snowflake
import discord4j.core.GatewayDiscordClient
import discord4j.core.`object`.entity.Guild
import discord4j.core.`object`.entity.Member
import discord4j.core.`object`.entity.Message
import discord4j.core.`object`.entity.User
import discord4j.core.`object`.entity.channel.MessageChannel
import discord4j.core.`object`.entity.channel.TextChannel
import discord4j.core.event.domain.message.MessageCreateEvent
import io.micronaut.context.annotation.Value
import reactor.core.publisher.Mono
import java.util.Optional
import java.util.function.Function
import java.util.stream.Collectors

class Context(
    val event: MessageCreateEvent,
    val prefix: String
) {
    val commandName: String

    private val arg: String?

    fun getArg(): Optional<String> {
        return Optional.ofNullable(arg)
    }

    val author: User
        get() = message.author.orElseThrow()

    val authorId: Snowflake
        get() = author.id

    val avatarUrl: String
        get() = author.avatarUrl

    val channel: Mono<MessageChannel>
        get() = message.channel

    val channelId: Snowflake
        get() = message.channelId

    val client: GatewayDiscordClient
        get() = event.client

    val content: String
        get() = message.content

    val guild: Mono<Guild>
        get() = event.guild

    val guildId: Snowflake
        get() = event.guildId.orElseThrow()

    val member: Member
        get() = event.member.orElseThrow()

    val message: Message
        get() = event.message

    val self: Mono<User>
        get() = client.self

    val selfId: Snowflake
        get() = client.selfId

    val selfAsMember: Mono<Any>
        get() = self.flatMap(Function<User, Mono<out Member?>> { self: User ->
            self.asMember(
                guildId
            )
        })

    val shardCount: Int
        get() {
            return event.shardInfo.count
        }

    val shardIndex: Int
        get() {
            return event.shardInfo.index
        }

    val username: String
        get() {
            return author.username
        }

    val isChannelNsfw: Mono<Boolean>
        get() {
            return channel
                .ofType(TextChannel::class.java)
                .map { obj: TextChannel -> obj.isNsfw }
        }

    init {
        val splitMessage: List<String> = content.split(Regex(" "), 2).stream()
            .map { obj: String -> obj.trim { it <= ' ' } }
            .filter { word -> word.isNotEmpty() }
            .collect(Collectors.toList())
        commandName = splitMessage[0].substring(prefix.length).toLowerCase()
        arg = if (splitMessage.size > 1) splitMessage[1].trim { it <= ' ' } else null
    }
}