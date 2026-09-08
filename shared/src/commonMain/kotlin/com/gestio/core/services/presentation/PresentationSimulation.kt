package com.gestio.core.services.presentation

import com.gestio.core.pockets.PocketMark
import com.gestio.core.services.calcul.*
import com.gestio.core.services.consultation.LectureDonneesLocales
import com.gestio.core.simulation.*
import com.gestio.core.ui.SimulationScreenState

class PresentationSimulation(private val donnees: LectureDonneesLocales) {
    fun charger(today: String): SimulationScreenState? = donnees.utiliser { store ->
        val seuils = SeuilsEtCapacites(store)
        val life = seuils.vie().cents ?: return@utiliser null
        val result = RepartitionEnveloppes().simuler(store.pocketRecords(), life, seuils.bas().cents, seuils.referenceHaute(today.take(7))?.valueCents)
        // Ouvrir une simulation conserve les enveloppes validées, avant tout geste.
        val retained = store.pocketRecords().associate { it.id to checkNotNull(it.envelopeCents) }
        afficher(result.copy(distribution = result.distribution.copy(pocketEnvelopes = retained)), today)
    }
    fun deplacer(state: SimulationScreenState, position: Long, today: String) = donnees.utiliser {
        afficher(RepartitionEnveloppes().simuler(it.pocketRecords(), position, state.bounds.lowerCents, state.bounds.upperCents), today)
    }
    fun modifier(state: SimulationScreenState, id: String, cents: Long, today: String) =
        afficher(RepartitionEnveloppes().modifier(resultat(state), id, cents), today)
    fun valider(state: SimulationScreenState, date: String) = donnees.utiliser {
        require(resultat(state).canValidate) { "La répartition et les deux bornes doivent être disponibles." }
        it.applySimulation(state.distribution, date, checkNotNull(state.bounds.lowerCents), checkNotNull(state.bounds.upperCents))
    }
    fun poches() = donnees.utiliser { it.pocketRecords() }
    fun creerPoche(id: String, name: String, mark: PocketMark?, date: String) = donnees.utiliser {
        require(name.isNotBlank())
        require(it.pocketRecords().none { pocket -> pocket.name.equals(name.trim(), ignoreCase = true) }) { "Cette poche existe déjà." }
        it.createPocket(id, name.trim(), date)
        mark?.let { mark -> it.setPocketMark(id, mark, date) }
    }
    fun compenser(id: String, increase: Long, donors: List<String>, today: String): SimulationScreenState = donnees.utiliser { store ->
        val pockets = store.pocketRecords()
        val service = RepartitionEnveloppes()
        val proposal = service.compensation(pockets, id, increase, donors) ?: error("Les poches choisies ne couvrent pas l'augmentation.")
        val adjusted = service.compenser(pockets, proposal)
        val seuils = SeuilsEtCapacites(store)
        val base = service.simuler(pockets, checkNotNull(seuils.vie().cents), seuils.bas().cents, seuils.referenceHaute(today.take(7))?.valueCents)
        afficher(base.copy(distribution = base.distribution.copy(pocketEnvelopes = adjusted.associate { it.id to checkNotNull(it.envelopeCents) })), today)
    }
    private fun resultat(state: SimulationScreenState) = ResultatRepartition(state.bounds, state.distribution, state.observedByPocket, state.pocketNames, state.remainingCents)
    private fun afficher(result: ResultatRepartition, today: String): SimulationScreenState = donnees.utiliser { store ->
        val reference = SeuilsEtCapacites(store).referenceHaute(today.take(7))
        val note = reference?.let { "Seuil haut observé en ${it.month}." }
        SimulationScreenState(result.bounds, result.distribution, result.observedByPocket, result.remainingCents, note, result.pocketNames)
    }
}
