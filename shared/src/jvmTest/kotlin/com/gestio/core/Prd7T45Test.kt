package com.gestio.core

import com.gestio.core.objectives.Objective
import com.gestio.core.objectives.ObjectiveProjection
import com.gestio.core.objectives.ObjectiveQueue
import com.gestio.core.objectives.ProjectionStatus
import com.gestio.core.ui.objectiveScreenState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class Prd7T45Test {
    @Test
    fun screen_renders_duration_and_emergency_first_without_judging() {
        val objective = Objective("computer", "Ordinateur", 120_000, "2027-08", null, 10_000, "2026-08-01")
        val emergency = objective.copy(id = "emergency-fund", name = "Fonds d'urgence", targetCents = 300_000, isEmergency = true, priority = Int.MIN_VALUE)
        val state = objectiveScreenState(
            objective,
            ObjectiveProjection(ProjectionStatus.AVAILABLE, "computer", "2027-08", 12, List(12) { "2026-${(it + 1).toString().padStart(2, '0')}" }),
            ObjectiveQueue(listOf(emergency, objective)),
        )

        assertEquals(120_000L, state.objective.targetCents)
        assertEquals(12, state.projection.monthsUsed)
        assertTrue(state.queue.entries.first().isEmergency)
        assertTrue(state.objective.name !in listOf("impossible", "irréaliste"))
    }
}
