package com.gestio.core.storage

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.native.NativeSqliteDriver
import app.cash.sqldelight.driver.native.wrapConnection
import co.touchlab.sqliter.DatabaseConfiguration
import com.gestio.core.db.GestioDatabase

actual fun createDatabaseDriver(key: String): SqlDriver {
    require(key.isNotEmpty()) { "database key must be non-empty" }
    val configuration = DatabaseConfiguration(
        name = "gestio.db",
        version = GestioDatabase.Schema.version,
        create = { connection -> wrapConnection(connection) { GestioDatabase.Schema.create(it) } },
        upgrade = { connection, oldVersion, newVersion ->
            wrapConnection(connection) { GestioDatabase.Schema.migrate(it, oldVersion, newVersion) }
        },
        key = key.encodeToByteArray(),
    )
    return NativeSqliteDriver(configuration)
}
