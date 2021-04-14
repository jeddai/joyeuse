package com.jeddai.speaker.discord

//import org.slf4j.LoggerFactory

import com.jeddai.speaker.exceptions.ExceptionHandler
import com.jeddai.speaker.listener.EventListener
import com.jeddai.speaker.listener.MessageCreateListener
import discord4j.core.DiscordClient
import discord4j.core.GatewayDiscordClient
import discord4j.core.event.domain.Event
import org.slf4j.LoggerFactory
import reactor.core.publisher.Mono
import java.time.Duration
import javax.inject.Singleton

@Singleton
class SpeakerBot(
    private val config: DiscordConfig
) {

    private val logger = LoggerFactory.getLogger(SpeakerBot::class.java)

    private val client: DiscordClient = DiscordClient.create(config.token)
    private lateinit var gateway: GatewayDiscordClient

    init {
        logger.info("Initializing SpeakerBot")

        client.gateway()
            .setAwaitConnections(false)
            .withGateway { gatewayDiscordClient ->
                gateway = gatewayDiscordClient

                register(MessageCreateListener())

                gateway.onDisconnect()
            }
    }

    private fun <T : Event> register(eventListener: EventListener<T>) {
        gateway.eventDispatcher
            .on(eventListener.eventType)
//            .doOnNext { event -> Telemetry.EVENT_COUNTER.labels(event.getClass().getSimpleName()).inc() }
            .flatMap { event ->
                eventListener.execute(event)
                    .timeout(
                        Duration.ofDays(1),
                        Mono.error(RuntimeException(String.format("%s timed out", event)))
                    )
                    .onErrorResume { err -> Mono.fromRunnable { ExceptionHandler.handleUnknownError(err) } }
            }
            .subscribe(null, ExceptionHandler::handleUnknownError)
    }

//        gateway.on(ReactionAddEvent::class.java)
//            .subscribe { event ->
//                event.member
//                logger.info(event.member.toString())
//            }

//        gateway.flatMapMany { gateway -> gateway.on(ReadyEvent::class.java) }
//            .subscribe { event ->
//                val self = event.self
//                logger.info("Logged in as ${self.username} ${self.discriminator}")
//            }
//
//        Thread().run {
//            gateway.flatMapMany { gateway -> gateway.on(MessageCreateEvent::class.java) }
//                .map { it.message }
//                .filter { message -> "!ping" == message.content }
//                .flatMap { it.channel }
//                .flatMap { channel -> channel.createMessage("Pong!") }
//                .blockLast()
//        }
//
//        Thread().run {
//            gateway.flatMapMany { gateway -> gateway.on(MessageCreateEvent::class.java) }
//                .map { event ->
//                    logger.info(event.message.content)
//                    event.message
//                }
//                .filter { message -> message.content.startsWith("!scheduleRaid") }
//                .flatMap { it.channel }
//                .flatMap { channel ->
//                    channel.createEmbed { spec ->
//                        spec.setColor(Color.RED)
//    //                                    .setAuthor("setAuthor", ANY_URL, IMAGE_URL)
//    //                                    .setImage(IMAGE_URL)
//                            .setTitle("setTitle/setUrl")
//    //                                    .setUrl(ANY_URL)
//                            .setDescription(
//                                """
//                                            setDescription
//                                            big D: is setImage
//                                            small D: is setThumbnail
//                                            <-- setColor
//                                            """.trimIndent()
//                            )
//                            .addField(
//                                "Participants",
//                                """
//                                            1.
//                                            2.
//                                            3.
//                                            4.
//                                            5.
//                                            6.
//                                        """.trimIndent(),
//                                true
//                            )
//                            .addField(
//                                "Standby List",
//                                """
//
//                                        """.trimIndent(),
//                                true
//                            )
//    //                                    .setThumbnail(IMAGE_URL)
//    //                                    .setFooter("setFooter --> setTimestamp", IMAGE_URL)
//                            .setTimestamp(Instant.now())
//                    }
//                }
//                .blockLast()
//        }
}
