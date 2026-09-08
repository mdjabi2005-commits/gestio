package com.gestio.core.storage

import app.cash.sqldelight.db.SqlDriver

expect fun createDatabaseDriver(key: String): SqlDriver
