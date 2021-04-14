package com.jeddai.speaker.exceptions

import org.slf4j.LoggerFactory
import java.util.*


object ExceptionHandler {

    private val logger = LoggerFactory.getLogger(ExceptionHandler::class.java)

    fun handleUnknownError(err: Throwable) {
        logger.error(
            String.format(
                "An unknown error occurred: %s",
                Objects.requireNonNullElse(err.message, "")
            ), err
        )
    }
}