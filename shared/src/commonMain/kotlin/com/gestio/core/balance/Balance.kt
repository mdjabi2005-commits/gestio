package com.gestio.core.balance

import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.transfers.detectInternalTransfers

data class CategoryTotal(val category: String, val amountCents: Long)

data class MonthBalance(
    val month: String,
    val incomeCents: Long,
    val expenseCents: Long,
    val balanceCents: Long,
    val categories: List<CategoryTotal>,
) {
    val revenuesCents: Long get() = incomeCents
    val expensesCents: Long get() = expenseCents
    val remainingCents: Long get() = balanceCents
}

fun calculateMonthBalance(
    transactions: List<NormalizedTransaction>,
    month: String,
    categoriesByTransaction: Map<String, String> = emptyMap(),
): MonthBalance {
    require(Regex("\\d{4}-\\d{2}").matches(month)) { "month must use YYYY-MM" }
    val internalIds = detectInternalTransfers(transactions).flatMap { listOf(it.debitId, it.creditId) }.toSet()
    var income = 0L
    var expense = 0L
    val totals = mutableMapOf<String, Long>()
    transactions.filter { it.id !in internalIds && it.bookingDate.startsWith("$month-") }.forEach {
        when {
            it.amountCents > 0 -> income += it.amountCents
            it.amountCents < 0 -> {
                val spent = -it.amountCents
                expense += spent
                val category = categoriesByTransaction[it.id] ?: "non catégorisé"
                if (category != "interne") totals[category] = (totals[category] ?: 0L) + spent
            }
        }
    }
    return MonthBalance(month, income, expense, income - expense, totals.toSortedMap().map { CategoryTotal(it.key, it.value) })
}
