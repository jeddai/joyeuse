package com.jeddai.speaker.command

import discord4j.core.spec.EmbedCreateSpec
import reactor.core.publisher.Mono
import java.util.function.Consumer

abstract class BaseCommand(
    names: List<String>,
    alias: String?
) {
    val names: MutableList<String> = mutableListOf()

    val alias: String?

    var isEnabled = false

    init {
        this.names.addAll(names)
        this.alias = alias
        if (this.alias != null) {
            this.names.add(this.alias)
        }
        isEnabled = true
    }

    constructor (names: List<String>) : this(names, null)

    abstract fun execute(context: Context?): Mono<Void>

    abstract fun getHelp(context: Context?): Consumer<EmbedCreateSpec>
}