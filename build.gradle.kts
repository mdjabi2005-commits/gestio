plugins {
    kotlin("multiplatform") version "2.4.10" apply false
    kotlin("plugin.serialization") version "2.4.10" apply false
    kotlin("native.cocoapods") version "2.4.10" apply false
    id("com.android.kotlin.multiplatform.library") version "9.0.0" apply false
    id("com.android.application") version "9.0.0" apply false
    id("org.jetbrains.compose") version "1.12.0" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.4.10" apply false
    id("app.cash.sqldelight") version "2.3.2" apply false
}
