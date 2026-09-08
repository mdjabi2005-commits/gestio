package com.gestio.core.ingestion

import com.gestio.core.model.NormalizedTransaction
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.decodeFromJsonElement

data class Rejection(val index: Int, val reason: String)

data class IngestionReport(
    val inserted: Int,
    val rejected: Int,
    val rejections: List<Rejection>,
)

class InMemoryLedger {
    private val rows = mutableListOf<NormalizedTransaction>()
    private val categories = mutableMapOf<String, String>()

    fun transactions(): List<NormalizedTransaction> = rows.toList()

    fun categoryByTransaction(): Map<String, String> = categories.toMap()

    internal fun contains(id: String): Boolean = rows.any { it.id == id }

    internal fun add(transaction: NormalizedTransaction) {
        rows += transaction
    }

    internal fun setCategory(transactionId: String, category: String) {
        categories[transactionId] = category
    }
}

private val json = Json {
    ignoreUnknownKeys = false
    coerceInputValues = false
}

fun ingestJson(jsonText: String, ledger: InMemoryLedger): IngestionReport {
    val root = json.parseToJsonElement(jsonText)
    if (root !is JsonArray) throw TypeCastException("normalized transaction JSON must contain an array")

    var inserted = 0
    val rejections = mutableListOf<Rejection>()
    root.forEachIndexed { index, item ->
        try {
            val transaction = json.decodeFromJsonElement<NormalizedTransaction>(item)
            if (ledger.contains(transaction.id)) {
                rejections += Rejection(index, "duplicate id")
            } else {
                ledger.add(transaction)
                inserted++
            }
        } catch (error: SerializationException) {
            rejections += Rejection(index, "validation: ${error.message ?: "invalid transaction"}")
        } catch (error: IllegalArgumentException) {
            rejections += Rejection(index, "validation: ${error.message ?: "invalid transaction"}")
        }
    }
    return IngestionReport(inserted, rejections.size, rejections)
}

internal fun decodeTransaction(item: JsonElement): NormalizedTransaction =
    json.decodeFromJsonElement(item)
