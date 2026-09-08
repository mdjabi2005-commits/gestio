package com.gestio.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
enum class TransactionStatus { BOOKED, PENDING }

@Serializable
enum class TransactionSourceType { PDF, API, MANUAL }

@Serializable
data class SourceMetadata(
    @SerialName("source_type") val sourceType: TransactionSourceType,
    val provider: String,
    @SerialName("file_name") val fileName: String? = null,
    @SerialName("page_number") val pageNumber: Int? = null,
    @SerialName("raw_payload") val rawPayload: JsonObject? = null,
)

data class MoneyCents(val cents: Long)

@Serializable
data class NormalizedTransaction(
    val id: String,
    @SerialName("account_id") val accountId: String,
    @SerialName("external_reference") val externalReference: String? = null,
    @SerialName("booking_date") val bookingDate: String,
    @SerialName("transaction_date") val transactionDate: String? = null,
    @SerialName("amount_cents") val amountCents: Long,
    val currency: String = "EUR",
    @SerialName("balance_after_cents") val balanceAfterCents: Long? = null,
    @SerialName("raw_description") val rawDescription: String,
    @SerialName("clean_description") val cleanDescription: String,
    @SerialName("counterparty_name") val counterpartyName: String? = null,
    @SerialName("counterparty_iban") val counterpartyIban: String? = null,
    val status: TransactionStatus = TransactionStatus.BOOKED,
    val source: SourceMetadata,
    @SerialName("reconciliation_id") val reconciliationId: String? = null,
) {
    init {
        require(accountId.isNotEmpty()) { "account_id must not be empty" }
        require(rawDescription.isNotEmpty()) { "raw_description must not be empty" }
        require(cleanDescription.isNotEmpty()) { "clean_description must not be empty" }
        parseIsoDate(bookingDate)
        transactionDate?.let(::parseIsoDate)
    }

    // Derived values stay out of the serialized contract and never become floating point.
    val amount: MoneyCents get() = MoneyCents(amountCents)
    val balanceAfter: MoneyCents? get() = balanceAfterCents?.let(::MoneyCents)
}
