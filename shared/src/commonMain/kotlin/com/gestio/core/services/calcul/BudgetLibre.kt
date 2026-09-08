package com.gestio.core.services.calcul

import com.gestio.core.budget.PlannedExpense
import com.gestio.core.storage.GestioStore

class BudgetLibre(private val store: GestioStore) {
    fun calculer(today: String, monthlyCapacityCents: Long = 0L) = store.budgetLibre(today, monthlyCapacityCents)
    fun planifier(expense: PlannedExpense) = store.createPlannedExpense(expense)
    fun realiser(id: String, transactionId: String, actualAmountCents: Long) =
        store.realizePlannedExpense(id, transactionId, actualAmountCents)
}
