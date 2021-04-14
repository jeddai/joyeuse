package com.jeddai.speaker

import io.micronaut.http.annotation.Controller
import io.micronaut.runtime.Micronaut
import org.slf4j.LoggerFactory

object Application {

    private val logger = LoggerFactory.getLogger(Application::class.java)

    @JvmStatic
    fun main(args: Array<String>) {
        logger.info("Starting application")

        Micronaut.build()
            .args(*args)
            .packages("com.jeddai")
            .eagerInitSingletons(true)
            .mainClass(Application.javaClass)
            .start()
    }
}