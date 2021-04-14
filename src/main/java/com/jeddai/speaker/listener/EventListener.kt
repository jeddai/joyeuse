package com.jeddai.speaker.listener

import discord4j.core.event.domain.Event;
import reactor.core.publisher.Mono

interface EventListener<T : Event> {

    val eventType: Class<T>

    fun execute(event: T): Mono<Void>
}