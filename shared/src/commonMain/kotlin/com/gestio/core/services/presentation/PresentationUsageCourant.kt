package com.gestio.core.services.presentation

import com.gestio.core.accounts.AccountRole
import com.gestio.core.budget.PlannedExpense
import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.services.calcul.*
import com.gestio.core.services.consultation.LectureDonneesLocales
import com.gestio.core.ui.MonthExpensesScreenState
import com.gestio.core.ui.PlannedExpenseDraft
import com.gestio.core.ui.usageCourantState

class PresentationUsageCourant(private val donnees: LectureDonneesLocales) {
    fun charger(today: String) = donnees.utiliser { store ->
        val capacity = SeuilsEtCapacites(store).capacites().months.firstOrNull { it.month == today.take(7) }?.cents ?: 0L
        val budget = BudgetLibre(store).calculer(today, capacity)
        val arbitration = AnalyseTransactions(store).arbitrages()
        usageCourantState(budget, budget.engagements,
            store.transactions().sortedWith(compareByDescending<NormalizedTransaction> { it.bookingDate }.thenByDescending { it.id }),
            arbitration.recurrenceCandidates.size + arbitration.unrecognizedTransactionIds.size,
            store.liquidityAlerts(today))
    }
    fun depenses(today: String): MonthExpensesScreenState? = donnees.utiliser { store ->
        val engagements = BudgetLibre(store).calculer(today).engagements
        val curves = DepensesDuMois(store).courbes(today.take(7), SeuilsEtCapacites(store).vie().cents, engagements) ?: return@utiliser null
        MonthExpensesScreenState(curves, store.transactions().filter { it.bookingDate.take(7) == today.take(7) }, engagements)
    }
    fun comptes() = donnees.utiliser { it.accounts().filter { account -> account.role == AccountRole.CHECKING } }
    fun poches() = donnees.utiliser { it.pocketRecords() }
    fun planifier(id: String, draft: PlannedExpenseDraft) = donnees.utiliser {
        require(draft.canSave) { "Vérifie le montant, la date, le compte et la poche." }
        it.createPlannedExpense(PlannedExpense(id, checkNotNull(draft.amountCents), draft.dueDate, draft.accountId, draft.categoryId, draft.nature))
    }
    fun depensesPrevues() = donnees.utiliser { it.plannedExpenses() }
    fun realiser(id: String, transactionId: String, cents: Long) = donnees.utiliser { it.realizePlannedExpense(id, transactionId, cents) }
}
