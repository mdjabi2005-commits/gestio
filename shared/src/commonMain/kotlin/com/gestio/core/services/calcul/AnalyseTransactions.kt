package com.gestio.core.services.calcul

import com.gestio.core.model.AmountNature
import com.gestio.core.model.TransactionFrequency
import com.gestio.core.recurrence.RecurrenceCandidate
import com.gestio.core.storage.GestioStore
import com.gestio.core.trajectory.arbitrationQueue

/** Owns classification decisions; ingestion itself remains with the reader. */
class AnalyseTransactions(private val store: GestioStore) {
    fun couverture() = store.coverage()
    fun classer(rulesDocument: String) = store.categorize(rulesDocument)
    fun recurrences() = store.recurrenceCandidates()
    fun confirmer(candidate: RecurrenceCandidate, frequency: TransactionFrequency, nature: AmountNature) =
        store.confirmRecurrence(candidate, frequency, nature)
    fun refuser(candidate: RecurrenceCandidate) = store.rejectRecurrence(candidate)
    fun reclasser(transactionId: String, category: String) = store.reclassifyTransaction(transactionId, category)
    fun arbitrages() = arbitrationQueue(
        recurrences(),
        store.categoryAssignments().filter { it.category == "non catégorisé" }.map { it.transactionId },
    )
}
