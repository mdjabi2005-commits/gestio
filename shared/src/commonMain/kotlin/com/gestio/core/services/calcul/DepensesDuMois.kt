package com.gestio.core.services.calcul

import com.gestio.core.budget.Engagement
import com.gestio.core.budget.spendingCurves
import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.model.requireMonthKey
import com.gestio.core.storage.GestioStore
import com.gestio.core.transfers.detectInternalTransfers

class DepensesDuMois(private val store: GestioStore) {
    fun courbes(month: String, lifeEnvelopeCents: Long?, engagements: List<Engagement>) =
        lifeEnvelopeCents?.let { spendingCurves(month, it, store.transactions(), engagements) }

    fun transactions(month: String): List<NormalizedTransaction> {
        requireMonthKey(month)
        val rows = store.transactions()
        val internalIds = detectInternalTransfers(rows).flatMap { listOf(it.debitId, it.creditId) }.toSet()
        return rows.filter { it.bookingDate.startsWith("$month-") && it.amountCents < 0 && it.id !in internalIds }
            .sortedWith(compareByDescending<NormalizedTransaction> { it.bookingDate }.thenBy { it.id })
    }

    fun transactionsPoche(pocketId: String, month: String): List<NormalizedTransaction> {
        val pocket = store.pocketRecords().singleOrNull { it.id == pocketId } ?: return emptyList()
        val assignedIds = store.categoryAssignments().filter { it.category == pocket.name }.map { it.transactionId }.toSet()
        return transactions(month).filter { it.id in assignedIds }
    }

    fun depensesParPoche(month: String): Map<String, Long> = store.pocketRecords().associate { pocket ->
        pocket.id to transactionsPoche(pocket.id, month).sumOf { -it.amountCents }
    }
}
