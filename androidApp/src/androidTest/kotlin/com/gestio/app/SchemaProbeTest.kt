package com.gestio.app

import android.content.Context
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import app.cash.sqldelight.db.QueryResult
import com.gestio.core.storage.createDatabaseDriver
import com.gestio.core.storage.initializeAndroidDatabase
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class SchemaProbeTest {
    @Test
    fun reportCategoriesColumns() {
        val context: Context = InstrumentationRegistry.getInstrumentation().targetContext
        initializeAndroidDatabase(context)
        val driver = createDatabaseDriver(databaseKey(context))
        try {
            val columns = driver.executeQuery(null, "PRAGMA table_info(categories)", { cursor ->
                val names = mutableListOf<String>()
                while (cursor.next().value) names += cursor.getString(1)!!
                QueryResult.Value(names)
            }, 0, null).value
            println("SCHEMA_PROBE_COLUMNS=$columns")
        } finally {
            driver.close()
        }
    }
}
