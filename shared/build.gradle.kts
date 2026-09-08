plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    kotlin("native.cocoapods")
    id("com.android.kotlin.multiplatform.library")
    id("org.jetbrains.compose")
    id("org.jetbrains.kotlin.plugin.compose")
    id("app.cash.sqldelight")
}

kotlin {
    jvm()
    android {
        namespace = "com.gestio.core"
        compileSdk = 35
        minSdk = 23
    }
    iosArm64()
    iosSimulatorArm64()

    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.framework {
            baseName = "GestioCore"
            isStatic = true
        }
    }

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
            implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.7.1")
            implementation("app.cash.sqldelight:runtime:2.3.2")
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
        jvmMain.dependencies {
            implementation("app.cash.sqldelight:sqlite-driver:2.3.2")
        }
        androidMain.dependencies {
            implementation("app.cash.sqldelight:android-driver:2.3.2")
            implementation("net.zetetic:sqlcipher-android:4.18.0")
            implementation("androidx.sqlite:sqlite:2.7.0")
        }
        iosMain.dependencies {
            implementation("app.cash.sqldelight:native-driver:2.3.2")
            implementation("co.touchlab:sqliter-driver:1.2.0")
        }
    }

    cocoapods {
        version = "1.0"
        summary = "Gestio local-first transaction core"
        homepage = "https://example.invalid/gestio-core"
        ios.deploymentTarget = "14.0"
        pod("SQLCipher", "~> 4.18")
        framework {
            baseName = "GestioCore"
            isStatic = true
        }
    }
}

sqldelight {
    linkSqlite.set(false)
    databases {
        create("GestioDatabase") {
            packageName.set("com.gestio.core.db")
            dialect("app.cash.sqldelight:sqlite-3-35-dialect:2.3.2")
        }
    }
}
