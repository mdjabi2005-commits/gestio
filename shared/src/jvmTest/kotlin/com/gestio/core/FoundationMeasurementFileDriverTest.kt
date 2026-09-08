package com.gestio.core

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.gestio.core.db.GestioDatabase
import com.gestio.core.storage.createDatabaseDriver
import java.nio.file.Files
import kotlin.test.Test
import kotlin.test.assertEquals

class FoundationMeasurementFileDriverTest {
    @Test
    fun file_driver_preserves_a_row_after_close_and_reopen() {
        createDatabaseDriver("memory").close()
        val path = Files.createTempFile("gestio-foundation-", ".db")
        try {
            val first = JdbcSqliteDriver("jdbc:sqlite:$path", schema = GestioDatabase.Schema)
            val queries = GestioDatabase(first).gestioDatabaseQueries
            queries.insertAccount("checking", "Checking")
            queries.insertTransaction(
                "persisted", "checking", null, "2026-08-31", null, 100L, "EUR", null,
                "PERSISTED", "PERSISTED", null, null, "BOOKED", "PDF", "measurement",
                null, null, null, null, null, null,
            )
            first.close()

            val second = JdbcSqliteDriver("jdbc:sqlite:$path", schema = GestioDatabase.Schema)
            try {
                val persisted = GestioDatabase(second).gestioDatabaseQueries.findById("persisted").executeAsOneOrNull()
                println("FILE_DRIVER_PERSISTENCE=$persisted")
                assertEquals("persisted", persisted)
            } finally {
                second.close()
            }
        } finally {
            Files.deleteIfExists(path)
        }
    }
}
