package com.jeddai.speaker.controllers

import io.micronaut.http.MediaType
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get
import org.slf4j.LoggerFactory

@Controller("/health")
class HealthController {

    private val logger = LoggerFactory.getLogger(HealthController::class.java)

    init {
        logger.info("Health Controller has been initialized")
    }

    @Get(produces = [MediaType.TEXT_PLAIN])
    fun health(): String {
        return "ok"
    }
}