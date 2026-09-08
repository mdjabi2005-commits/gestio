package com.gestio.core.coverage

import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.model.monthKey
import com.gestio.core.model.nextMonth
import com.gestio.core.model.previousMonth

enum class CoverageStatus { COMPLETE, INCOMPLETE, UNVERIFIABLE }

data class MonthCoverage(
    val month: String,
    val firstBookingDate: String,
    val lastBookingDate: String,
    val status: CoverageStatus,
    val breakPosition: Int? = null,
    val breakAmountCents: Long? = null,
) {
    val isComplete: Boolean get() = status == CoverageStatus.COMPLETE
    val complete: Boolean get() = isComplete
}

data class MissingInterval(val startMonth: String, val endMonth: String) {
    val months: List<String>
        get() {
            val result = mutableListOf<String>()
            var current = startMonth
            while (current <= endMonth) {
                result += current
                current = nextMonth(current)
            }
            return result
        }
}

data class CoverageReport(val months: List<MonthCoverage>, val missingIntervals: List<MissingInterval>) {
    val coveredMonths: List<String> get() = months.map { it.month }
    val isContinuous: Boolean get() = missingIntervals.isEmpty()
}

fun getCoverage(transactions: List<NormalizedTransaction>): CoverageReport {
    val rowsByMonth = transactions
        .sortedWith(compareBy<NormalizedTransaction> { it.bookingDate }.thenBy { it.accountId }.thenBy { it.id })
        .groupBy { monthKey(it.bookingDate) }
    val months = rowsByMonth.toSortedMap().map { (month, rows) -> monthCoverage(month, rows) }
    val missing = months.zipWithNext().mapNotNull { (previous, current) ->
        val expected = nextMonth(previous.month)
        if (expected < current.month) MissingInterval(expected, previousMonth(current.month)) else null
    }
    return CoverageReport(months, missing)
}

private fun monthCoverage(month: String, rows: List<NormalizedTransaction>): MonthCoverage {
    val first = rows.minOf { it.bookingDate }
    val last = rows.maxOf { it.bookingDate }
    if (rows.any { it.balanceAfterCents == null }) {
        return MonthCoverage(month, first, last, CoverageStatus.UNVERIFIABLE)
    }

    val previousByAccount = mutableMapOf<String, Long>()
    rows.forEachIndexed { index, transaction ->
        val balance = transaction.balanceAfterCents!!
        val previous = previousByAccount[transaction.accountId]
        if (previous == null) {
            previousByAccount[transaction.accountId] = balance
        } else {
            val expected = previous + transaction.amountCents
            if (balance != expected) {
                return MonthCoverage(
                    month,
                    first,
                    last,
                    CoverageStatus.INCOMPLETE,
                    breakPosition = index + 1,
                    breakAmountCents = balance - previous - transaction.amountCents,
                )
            }
            previousByAccount[transaction.accountId] = balance
        }
    }
    return MonthCoverage(month, first, last, CoverageStatus.COMPLETE)
}
