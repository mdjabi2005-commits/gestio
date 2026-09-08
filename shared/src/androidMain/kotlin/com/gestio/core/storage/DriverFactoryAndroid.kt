package com.gestio.core.storage

import android.content.Context
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import com.gestio.core.db.GestioDatabase
import net.zetetic.database.sqlcipher.SupportOpenHelperFactory

private var applicationContext: Context? = null

fun initializeAndroidDatabase(context: Context) {
    applicationContext = context.applicationContext
}

actual fun createDatabaseDriver(key: String): SqlDriver {
    require(key.isNotEmpty()) { "database key must be non-empty" }
    val context = checkNotNull(applicationContext) { "initializeAndroidDatabase must be called first" }
    System.loadLibrary("sqlcipher")
    return AndroidSqliteDriver(
        schema = GestioDatabase.Schema,
        context = context,
        name = "gestio.db",
        factory = SupportOpenHelperFactory(key.encodeToByteArray()),
    )
}
