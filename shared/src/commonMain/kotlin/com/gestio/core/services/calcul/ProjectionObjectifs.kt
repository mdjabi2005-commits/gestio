package com.gestio.core.services.calcul

import com.gestio.core.model.monthKey
import com.gestio.core.model.nextMonth
import com.gestio.core.objectives.Objective
import com.gestio.core.objectives.ObjectiveQueue
import com.gestio.core.objectives.ObjectiveProjection
import com.gestio.core.objectives.ProjectionStatus
import com.gestio.core.objectives.allocateCapacity
import com.gestio.core.objectives.objectiveProposal
import com.gestio.core.objectives.projectObjective
import com.gestio.core.simulation.CapacityProfile
import com.gestio.core.simulation.MonthlyCapacity
import com.gestio.core.trajectory.SavingsCurvePoint
import com.gestio.core.trajectory.SavingsCurves
import com.gestio.core.trajectory.savingsCurves

class ProjectionObjectifs {
    fun projeter(objective: Objective, profile: CapacityProfile) = projectObjective(objective, profile)
    fun proposition(profile: CapacityProfile) = objectiveProposal(profile)
    fun repartir(profile: CapacityProfile, queue: ObjectiveQueue) = allocateCapacity(profile.months, queue)

    /** Constant fallback from gestion-modele section 7; callers label the reference month and estimate. */
    fun projeterDepuis(objective: Objective, profile: CapacityProfile, today: String, savedCents: Long = objective.savedAtStartCents): ObjectiveProjection {
        require(savedCents >= 0 && objective.targetCents >= 0) { "objective amounts must not be negative" }
        val currentMonth = monthKey(today)
        if (savedCents >= objective.targetCents) return ObjectiveProjection(ProjectionStatus.AVAILABLE, objective.id, currentMonth)
        val reference = profile.months.filter { it.month <= currentMonth }.maxByOrNull { it.month }
            ?: return ObjectiveProjection(ProjectionStatus.INSUFFICIENT_PROFILE, objective.id)
        if (reference.cents <= 0L) return ObjectiveProjection(ProjectionStatus.NO_CAPACITY, objective.id)
        val remaining = objective.targetCents - savedCents
        val count = (remaining - 1) / reference.cents + 1
        // ponytail: cap the in-memory monthly horizon at 100 years; a longer forecast needs another representation.
        if (count > 1_200L) return ObjectiveProjection(ProjectionStatus.INSUFFICIENT_PROFILE, objective.id)
        var month = nextMonth(currentMonth)
        val future = List(count.toInt()) {
            MonthlyCapacity(month, reference.cents).also { month = nextMonth(month) }
        }
        return projectObjective(objective.copy(savedAtStartCents = savedCents), future)
    }

    /** Constant reference across the objective period, explicitly estimated by the presentation. */
    fun profilDepuis(profile: CapacityProfile, startDate: String, today: String): CapacityProfile {
        val startMonth = monthKey(startDate)
        val endMonth = monthKey(today)
        if (startMonth > endMonth) return CapacityProfile(emptyList())
        val reference = profile.months.filter { it.month <= endMonth }.maxByOrNull { it.month }
            ?: return CapacityProfile(emptyList(), listOf(startMonth))
        var month = startMonth
        return CapacityProfile(buildList {
            while (month <= endMonth) {
                add(MonthlyCapacity(month, reference.cents))
                month = nextMonth(month)
            }
        })
    }

    /** Observations are already cumulative savings since the objective began. */
    fun courbesObservees(profile: CapacityProfile, cumulativeByMonth: Map<String, Long>, today: String): SavingsCurves {
        val currentMonth = monthKey(today)
        val planned = savingsCurves(profile.months.sortedBy { it.month }, emptyMap(), today, profile.missingMonths.isEmpty())
            .points.associate { it.month to it.plannedCents }
        val months = (planned.keys + cumulativeByMonth.keys).sorted()
        var lastPlanned = 0L
        return SavingsCurves(months.map { month ->
            lastPlanned = planned[month] ?: lastPlanned
            SavingsCurvePoint(month, cumulativeByMonth[month].takeIf { month <= currentMonth }, lastPlanned, month == currentMonth)
        }, profile.months.isNotEmpty() && profile.missingMonths.isEmpty(),
            "Épargne constatée incomplète : les mois absents restent sans valeur.".takeIf { months.any { it <= currentMonth && it !in cumulativeByMonth } })
    }

    /** A missing observation breaks the cumulative actual line, it is never a zero deposit. */
    fun courbes(profile: CapacityProfile, actualByMonthCents: Map<String, Long>, today: String) =
        savingsCurves(profile.months.sortedBy { it.month }, actualByMonthCents, today, profile.missingMonths.isEmpty()).let { curves ->
            var observed = true
            curves.copy(points = curves.points.map { point ->
                if (point.month <= monthKey(today) && point.month !in actualByMonthCents) observed = false
                if (observed) point else point.copy(putAsideCents = null)
            }, note = if (!observed) "Épargne constatée incomplète : aucune valeur manquante n'est remplacée par zéro." else curves.note)
        }
}
