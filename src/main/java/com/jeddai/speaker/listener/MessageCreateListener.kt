package com.jeddai.speaker.listener

import com.jeddai.speaker.command.MessageProcessor
import discord4j.core.event.domain.message.MessageCreateEvent
import reactor.core.publisher.Mono
import javax.inject.Inject

class MessageCreateListener : EventListener<MessageCreateEvent> {

    @Inject
    internal var messageProcessor: MessageProcessor? = null

    override val eventType: Class<MessageCreateEvent>
        get() = MessageCreateEvent::class.java

    override fun execute(event: MessageCreateEvent): Mono<Void> {
        return messageProcessor!!.processEvent(event)
    }
}