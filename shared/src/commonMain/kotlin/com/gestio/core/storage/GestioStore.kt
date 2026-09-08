package com.gestio.core.storage

import com.gestio.core.balance.MonthBalance
import com.gestio.core.balance.calculateMonthBalance
import com.gestio.core.categorization.CategorizationReport
import com.gestio.core.categorization.categorizeTransactions
import com.gestio.core.coverage.CoverageReport
import com.gestio.core.coverage.getCoverage
import com.gestio.core.db.GestioDatabase
import com.gestio.core.ingestion.IngestionReport
import com.gestio.core.ingestion.Rejection
import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.model.SourceMetadata
import com.gestio.core.model.TransactionSourceType
import com.gestio.core.model.TransactionStatus
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.decodeFromJsonElement

class GestioStore(key: String) : AutoCloseable {
    private val driver = createDatabaseDriver(key)
    private val database = GestioDatabase(driver)
    private val json = Json { ignoreUnknownKeys = false; coerceInputValues = false }

    fun transactions(): List<NormalizedTransaction> = database.gestioDatabaseQueries.selectAll().executeAsList().map { row ->
        NormalizedTransaction(
            id = row.id,
            accountId = row.account_id,
            externalReference = row.external_reference,
            bookingDate = row.booking_date,
            transactionDate = row.transaction_date,
            amountCents = row.amount_cents,
            currency = row.currency,
            balanceAfterCents = row.balance_after_cents,
            rawDescription = row.raw_description,
            cleanDescription = row.clean_description,
            counterpartyName = row.counterparty_name,
            counterpartyIban = row.counterparty_iban,
            status = TransactionStatus.valueOf(row.status),
            source = SourceMetadata(
                sourceType = TransactionSourceType.valueOf(row.source_type),
                provider = row.source_provider,
                fileName = row.source_file_name,
                pageNumber = row.source_page_number?.toInt(),
                rawPayload = row.source_raw_payload?.let { json.decodeFromString(it) },
            ),
            reconciliationId = row.reconciliation_id,
        )
    }

    fun ingestJson(jsonText: String): IngestionReport {
        val root = json.parseToJsonElement(jsonText)
        if (root !is JsonArray) throw TypeCastException("normalized transaction JSON must contain an array")
        var inserted = 0
        val rejections = mutableListOf<Rejection>()
        root.forEachIndexed { index, item ->
            try {
                val transaction = json.decodeFromJsonElement<NormalizedTransaction>(item)
                if (database.gestioDatabaseQueries.findById(transaction.id).executeAsOneOrNull() != null) {
                    rejections += Rejection(index, "duplicate id")
                } else {
                    database.transaction {
                        database.gestioDatabaseQueries.insertAccount(transaction.accountId, transaction.accountId)
                        database.gestioDatabaseQueries.insertTransaction(
                            transaction.id,
                            transaction.accountId,
                            transaction.externalReference,
                            transaction.bookingDate,
                            transaction.transactionDate,
                            transaction.amountCents,
                            transaction.currency,
                            transaction.balanceAfterCents,
                            transaction.rawDescription,
                            transaction.cleanDescription,
                            transaction.counterpartyName,
                            transaction.counterpartyIban,
                            transaction.status.name,
                            transaction.source.sourceType.name,
                            transaction.source.provider,
                            transaction.source.fileName,
                            transaction.source.pageNumber?.toLong(),
                            transaction.source.rawPayload?.let { json.encodeToString(it) },
                            transaction.reconciliationId,
                        )
                    }
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

    fun coverage(): CoverageReport = getCoverage(transactions())

    fun categorize(rulesDocument: String): CategorizationReport {
        val rows = transactions()
        val report = categorizeTransactions(rows, rulesDocument)
        database.transaction {
            report.assignments.forEach { assignment ->
                val categoryId = assignment.category.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')
                database.gestioDatabaseQueries.insertCategory(categoryId, assignment.category)
                database.gestioDatabaseQueries.updateCategory(categoryId, assignment.transactionId)
            }
        }
        return report
    }

    fun monthBalance(month: String): MonthBalance {
        val categories = database.gestioDatabaseQueries.selectCategories().executeAsList()
            .associate { row -> row.id to (row.name ?: "non catégorisé") }
        return calculateMonthBalance(transactions(), month, categories)
    }

    override fun close() = driver.close()
}
