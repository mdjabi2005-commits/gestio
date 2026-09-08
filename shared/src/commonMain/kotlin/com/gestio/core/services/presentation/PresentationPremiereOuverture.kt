package com.gestio.core.services.presentation

import com.gestio.core.accounts.AccountRole
import com.gestio.core.model.AmountNature
import com.gestio.core.model.TransactionFrequency
import com.gestio.core.model.parseIsoDate
import com.gestio.core.model.requireMonthKey
import com.gestio.core.pockets.PocketMark
import com.gestio.core.pockets.pocketMarkingState
import com.gestio.core.recurrence.RecurrenceCandidate
import com.gestio.core.services.consultation.LectureDonneesLocales
import com.gestio.core.services.consultation.LectureReleves
import com.gestio.core.services.calcul.AnalyseTransactions
import com.gestio.core.ui.*

/** Ordre de première ouverture et décisions utilisateur, indépendants d'Android. */
class PresentationPremiereOuverture(private val donnees: LectureDonneesLocales) {
    fun comptes() = donnees.utiliser { accountConfigurationState(it.accounts(), it.pendingAccountKeys()) }
    fun solde(): MonthScreenState? = donnees.utiliser { store ->
        store.coverage().months.lastOrNull()?.month?.let(store::screenState)
    }
    fun prochaineEtape(questionsTerminees: Boolean): AppScreen = donnees.utiliser { store ->
        when {
            accountConfigurationState(store.accounts(), store.pendingAccountKeys()).requiresAction -> AppScreen.ACCOUNT_CONFIGURATION
            !questionsTerminees -> AppScreen.FIRST_OPENING_QUESTIONS
            store.transactions().isEmpty() -> AppScreen.MONTH_BALANCE
            store.recurrenceCandidates().isNotEmpty() -> AppScreen.ARBITRATIONS
            store.pocketRecords().any { it.mark == null } -> AppScreen.POCKET_MARKING
            store.pocketRecords().isEmpty() -> AppScreen.MONTH_BALANCE
            store.objectives().none { !it.isEmergency } -> AppScreen.SIMULATION_BUDGET
            else -> AppScreen.USAGE_COURANT
        }
    }
    fun importerJson(payload: String, regles: String) = donnees.utiliser { LectureReleves(it).importerJson(payload, regles) }
    fun classer(regles: String) = donnees.utiliser { AnalyseTransactions(it).classer(regles) }
    fun declarerEpargne(cents: Long, date: String) = donnees.utiliser { it.declareSavingsEstimate(cents, date) }
    fun declarerIntention(value: String, date: String) = donnees.utiliser { it.declareIntention(value, date) }
    fun associerCompte(identifier: String, accountId: String) = donnees.utiliser { it.matchPendingAccount(identifier, accountId) }
    fun definirRole(accountId: String, role: AccountRole) = donnees.utiliser { it.setAccountRole(accountId, role) }
    fun creerCompte(identifier: String, name: String, role: AccountRole, id: String) = donnees.utiliser {
        require(name.isNotBlank())
        require(identifier in it.pendingAccountKeys())
        it.declareAccount(id, name.trim(), role = role)
        it.matchPendingAccount(identifier, id)
    }
    fun confirmer(candidate: RecurrenceCandidate, frequency: TransactionFrequency, nature: AmountNature) =
        donnees.utiliser { AnalyseTransactions(it).confirmer(candidate, frequency, nature) }
    fun refuser(candidate: RecurrenceCandidate) = donnees.utiliser { AnalyseTransactions(it).refuser(candidate) }
    fun arbitrages() = donnees.utiliser { AnalyseTransactions(it).arbitrages() }
    fun categorie(category: String) = donnees.utiliser {
        categoryArbitrationState(category, it.transactions(), it.categoryAssignments())
    }
    fun categorieTransaction(id: String) = donnees.utiliser { store ->
        store.transactions().singleOrNull { it.id == id }?.let {
            categoryArbitrationState(store.categoryAssignments().singleOrNull { it.transactionId == id }?.category ?: "non catégorisé", store.transactions(), store.categoryAssignments())
        }
    }
    fun reclasser(id: String, category: String) = donnees.utiliser { AnalyseTransactions(it).reclasser(id, category) }
    fun marquage(date: String) = donnees.utiliser {
        pocketMarkingScreenState(pocketMarkingState(it.pocketRecords()), it.lowThreshold(date), it.lowMonthCheck(date))
    }
    fun marquer(id: String, mark: PocketMark, date: String) = donnees.utiliser { it.setPocketMark(id, mark, date) }
    fun epargneLue() = donnees.utiliser { it.savingsBalance().takeIf { balance -> balance.isVerifiable }?.cents }
    fun creerObjectif(id: String, name: String, target: Long, deadline: String?, today: String) = donnees.utiliser {
        parseIsoDate(today)
        deadline?.let(::requireMonthKey)
        require(target > 0L && name.isNotBlank())
        require(deadline == null || deadline >= today.take(7)) { "L'échéance doit être à venir." }
        it.createObjectiveFromReadSavings(id, name.trim(), target, targetMonth = null, savedAt = today, deadlineMonth = deadline, priority = it.objectives().size)
    }
}
