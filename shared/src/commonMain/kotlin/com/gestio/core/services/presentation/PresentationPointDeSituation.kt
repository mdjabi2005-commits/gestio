package com.gestio.core.services.presentation

import com.gestio.core.accounts.AccountRole
import com.gestio.core.objectives.Objective
import com.gestio.core.services.calcul.*
import com.gestio.core.services.consultation.LectureDonneesLocales
import com.gestio.core.storage.GestioStore
import com.gestio.core.trajectory.GapAttribution
import com.gestio.core.trajectory.gapConsequence
import com.gestio.core.ui.*

class PresentationPointDeSituation(private val donnees: LectureDonneesLocales) {
    fun charger(today: String): SituationScreenState? = donnees.utiliser { store ->
        val objective = objectifActif(store) ?: return@utiliser null
        val profile = SeuilsEtCapacites(store).capacites()
        val savings = store.savingsBalance().asValue(today)
        val gap = EcartTrajectoire().calculer(objective, profile, savings, today)
        val projection = ProjectionObjectifs().projeter(objective, profile)
        // Une absence de solde de clôture reste inconnue, y compris entre deux observations.
        val savingsIds = store.accounts().filter { it.role == AccountRole.SAVINGS }.map { it.id }
        val actual = store.transactions().filter { it.accountId in savingsIds && it.balanceAfterCents != null }
            .groupBy { it.bookingDate.take(7) }.mapNotNull { (month, rows) ->
                val balances = savingsIds.map { id -> rows.filter { it.accountId == id }.maxWithOrNull(compareBy({ it.bookingDate }, { it.id }))?.balanceAfterCents }
                if (balances.isEmpty() || balances.any { it == null } || month < objective.savedAt.take(7)) null
                else month to (balances.filterNotNull().sum() - objective.savedAtStartCents)
            }.toMap().toMutableMap()
        savings.cents?.let { actual[today.take(7)] = it - objective.savedAtStartCents }
        SituationScreenState(objective, savings.cents,
            ProjectionObjectifs().courbesObservees(profile, actual, today),
            GapAttribution(gap.status, totalCents = gap.gapCents, reason = gap.reason),
            gap.gapCents?.let { amount -> projection.projectedMonth?.let { projected ->
                gapConsequence(amount, objective.savedAt, objective.name, objective.targetMonth ?: projected, projected,
                    currentMonthlyCents = profile.months.firstOrNull { it.month == today.take(7) }?.cents ?: 0L)
            } }, AnalyseTransactions(store).arbitrages())
    }
    fun enveloppes(today: String) = donnees.utiliser { store ->
        val depenses = DepensesDuMois(store)
        val pockets = store.pocketRecords().sortedBy { it.name }.map { pocket ->
            val spent = depenses.transactionsPoche(pocket.id, today.take(7)).filter { it.amountCents < 0L }.sumOf { -it.amountCents }
            EnvelopePocketState(pocket.id, pocket.name, spent, pocket.envelopeCents)
        }
        LifeEnvelopesScreenState(pockets.sumOf { it.spentCents }, SeuilsEtCapacites(store).vie().cents, pockets)
    }
    fun poche(id: String, today: String): PocketDetailsScreenState? = donnees.utiliser { store ->
        val pocket = store.pocketRecords().singleOrNull { it.id == id } ?: return@utiliser null
        val transactions = DepensesDuMois(store).transactionsPoche(id, today.take(7))
        pocketDetailsScreenState(id, pocket.name, transactions.filter { it.amountCents < 0 }.sumOf { -it.amountCents }, pocket.envelopeCents, transactions)
    }
    fun transactions(id: String, today: String): PocketTransactionsScreenState? = donnees.utiliser { store ->
        val pocket = store.pocketRecords().singleOrNull { it.id == id } ?: return@utiliser null
        PocketTransactionsScreenState(id, pocket.name, DepensesDuMois(store).transactionsPoche(id, today.take(7)))
    }
    fun objectif(): ObjectiveScreenState? = donnees.utiliser { store ->
        val objective = objectifActif(store) ?: return@utiliser null
        objectiveScreenState(objective, ProjectionObjectifs().projeter(objective, SeuilsEtCapacites(store).capacites()),
            store.objectiveQueueForVital(store.lowThreshold().cents ?: 0L))
    }
    private fun objectifActif(store: GestioStore): Objective? = store.objectives()
        .filter { !it.isEmergency }.sortedBy { it.priority }
        .firstOrNull { it.savedAtStartCents < it.targetCents }
}
