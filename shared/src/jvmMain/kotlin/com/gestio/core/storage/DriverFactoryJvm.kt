package com.gestio.core.storage

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.gestio.core.db.GestioDatabase

actual fun createDatabaseDriver(key: String): SqlDriver {
    require(key.isNotEmpty()) { "database key must be non-empty" }
    return JdbcSqliteDriver("jdbc:sqlite::memory:", schema = GestioDatabase.Schema)
}
