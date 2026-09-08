package com.gestio.core.services.calcul

import com.gestio.core.accounts.SavingsValue
import com.gestio.core.objectives.Objective
import com.gestio.core.pockets.PocketRecord
import com.gestio.core.simulation.CapacityProfile
import com.gestio.core.trajectory.ContributionKind
import com.gestio.core.trajectory.GapAttribution
import com.gestio.core.trajectory.GapContribution
import com.gestio.core.trajectory.GapStatus
import com.gestio.core.trajectory.SavingsGap
import com.gestio.core.trajectory.attributeGap
import com.gestio.core.trajectory.calculateSavingsGap
import com.gestio.core.trajectory.pocketGapContributions

class EcartTrajectoire {
    fun calculer(objective: Objective, profile: CapacityProfile, savings: SavingsValue, today: String) =
        calculateSavingsGap(objective, profile.months, savings, today)

    fun contributionsPoches(pockets: List<PocketRecord>, spentByPocketCents: Map<String, Long?>, periodFraction: Double = 1.0) =
        pocketGapContributions(pockets, pockets.associate { it.id to spentByPocketCents[it.id] }, periodFraction)

    fun attribuer(gap: SavingsGap, contributions: List<GapContribution>): GapAttribution {
        val total = gap.gapCents
        if (gap.status != GapStatus.AVAILABLE || total == null) return GapAttribution(GapStatus.UNVERIFIABLE, reason = gap.reason)
        val remainder = total - contributions.sumOf { it.amountCents }
        return attributeGap(total, contributions + if (remainder == 0L) emptyList() else
            listOf(GapContribution("Écart non attribué", remainder, ContributionKind.REST)))
    }
}
