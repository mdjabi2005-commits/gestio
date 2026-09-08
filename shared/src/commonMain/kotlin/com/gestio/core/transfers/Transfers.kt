package com.gestio.core.transfers

import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.model.absoluteDaysBetween

data class InternalTransfer(
    val debitId: String,
    val creditId: String,
    val amountCents: Long,
    val debitAccountId: String,
    val creditAccountId: String,
    val debitDate: String,
    val creditDate: String,
)

data class MonthTotals(val month: String, val incomeCents: Long, val expenseCents: Long) {
    val revenuesCents: Long get() = incomeCents
    val expensesCents: Long get() = expenseCents
}

fun detectInternalTransfers(transactions: List<NormalizedTransaction>): List<InternalTransfer> {
    val credits = transactions.filter { it.amountCents > 0 }
    val matchedCredits = mutableSetOf<String>()
    val transfers = mutableListOf<InternalTransfer>()
    transactions.filter { it.amountCents < 0 }.forEach { debit ->
        val credit = credits.firstOrNull { candidate ->
            candidate.id !in matchedCredits &&
                candidate.accountId != debit.accountId &&
                candidate.currency == debit.currency &&
                candidate.amountCents == -debit.amountCents &&
                absoluteDaysBetween(candidate.bookingDate, debit.bookingDate) <= 2 &&
                hasTransferIndicator(debit, candidate) &&
                provesOwnedCounterparty(debit, candidate)
        } ?: return@forEach
        matchedCredits += credit.id
        transfers += InternalTransfer(
            debit.id,
            credit.id,
            -debit.amountCents,
            debit.accountId,
            credit.accountId,
            debit.bookingDate,
            credit.bookingDate,
        )
    }
    return transfers
}

fun calculateMonthTotals(transactions: List<NormalizedTransaction>, month: String): MonthTotals {
    val excluded = detectInternalTransfers(transactions).flatMap { listOf(it.debitId, it.creditId) }.toSet()
    var income = 0L
    var expense = 0L
    transactions.filter { it.id !in excluded && it.bookingDate.startsWith("$month-") }.forEach {
        when {
            it.amountCents > 0 -> income += it.amountCents
            it.amountCents < 0 -> expense -= it.amountCents
        }
    }
    return MonthTotals(month, income, expense)
}

private fun hasTransferIndicator(debit: NormalizedTransaction, credit: NormalizedTransaction): Boolean =
    Regex("\\b(?:VIR|VIREMENT|TRANSFER|TRANSFERT)\\b", RegexOption.IGNORE_CASE)
        .containsMatchIn(listOf(debit.rawDescription, debit.cleanDescription, credit.rawDescription, credit.cleanDescription).joinToString(" "))

private fun provesOwnedCounterparty(debit: NormalizedTransaction, credit: NormalizedTransaction): Boolean {
    val debitAccount = normalizeAccount(debit.accountId)
    val creditAccount = normalizeAccount(credit.accountId)
    val debitCounterparty = normalizeAccount(debit.counterpartyIban)
    val creditCounterparty = normalizeAccount(credit.counterpartyIban)
    return (debitCounterparty.isNotEmpty() && debitCounterparty == creditAccount) ||
        (creditCounterparty.isNotEmpty() && creditCounterparty == debitAccount)
}

private fun normalizeAccount(value: String?): String = value.orEmpty().replace(Regex("\\s+"), "").uppercase()
