package com.jeddai.speaker.discord

import io.micronaut.context.annotation.ConfigurationProperties

@ConfigurationProperties("discord")
class DiscordConfig {
    var token: String = ""
}
