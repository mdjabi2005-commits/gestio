package com.gestio.core.services.calcul

import com.gestio.core.pockets.PocketRecord
import com.gestio.core.simulation.CompensationProposal
import com.gestio.core.simulation.SimulatedDistribution
import com.gestio.core.simulation.SimulationBounds
import com.gestio.core.simulation.SimulationStatus
import com.gestio.core.simulation.applyCompensation
import com.gestio.core.simulation.pocketIncreaseEffects
import com.gestio.core.simulation.proposeCompensation
import com.gestio.core.simulation.simulateDistribution
import com.gestio.core.simulation.simulationBounds

data class ResultatRepartition(
    val bounds: SimulationBounds,
    val distribution: SimulatedDistribution,
    val observedByPocket: Map<String, Long>,
    val pocketNames: Map<String, String>,
    val remainingCents: Long?,
) {
    val canValidate: Boolean get() = bounds.isAvailable && distribution.status == SimulationStatus.READY &&
        distribution.positionCents != null && distribution.totalCents == distribution.positionCents &&
        distribution.pocketEnvelopes.keys == pocketNames.keys && distribution.pocketEnvelopes.values.all { it >= 0L }
}

class RepartitionEnveloppes {
    fun simuler(pockets: List<PocketRecord>, positionCents: Long, lowerCents: Long?, upperCents: Long?): ResultatRepartition {
        require(pockets.map { it.id }.distinct().size == pockets.size) { "pocket ids must be unique" }
        return resultat(
            simulateDistribution(positionCents, pockets), lowerCents, upperCents,
            pockets.mapNotNull { p -> p.observedCents?.let { p.id to it } }.toMap(),
            pockets.associate { it.id to it.name },
        )
    }

    /** Editing one retained amount changes the life total; compensation requires explicit donors. */
    fun modifier(current: ResultatRepartition, pocketId: String, cents: Long): ResultatRepartition {
        require(cents >= 0L) { "envelope must not be negative" }
        require(current.distribution.status == SimulationStatus.READY) { "distribution is unavailable" }
        require(pocketId in current.distribution.pocketEnvelopes) { "unknown pocket" }
        val envelopes = current.distribution.pocketEnvelopes + (pocketId to cents)
        val total = envelopes.values.fold(0L) { total, value ->
            require(total <= Long.MAX_VALUE - value) { "life envelope is too large" }
            total + value
        }
        return resultat(
            current.distribution.copy(positionCents = total, pocketEnvelopes = envelopes),
            current.bounds.lowerCents, current.bounds.upperCents, current.observedByPocket, current.pocketNames,
        )
    }

    fun compensation(pockets: List<PocketRecord>, pocketId: String, increaseCents: Long, donorIds: List<String>) =
        proposeCompensation(pocketIncreaseEffects(pockets, pocketId, increaseCents), pockets, donorIds)

    fun compenser(pockets: List<PocketRecord>, proposal: CompensationProposal) = applyCompensation(pockets, proposal)

    private fun resultat(
        distribution: SimulatedDistribution, lowerCents: Long?, upperCents: Long?,
        observed: Map<String, Long>, names: Map<String, String>,
    ) = ResultatRepartition(
        simulationBounds(lowerCents, upperCents, distribution.positionCents), distribution, observed, names,
        distribution.positionCents?.let { position -> upperCents?.minus(position) },
    )
}
