package com.gestio.core

import com.gestio.core.simulation.SimulatedDistribution
import com.gestio.core.simulation.SimulationBounds
import com.gestio.core.simulation.SimulationStatus
import com.gestio.core.ui.simulationScreenState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class Prd6T38Test {
    @Test
    fun screen_exposes_both_bounds_and_has_distinct_objective_state() {
        val under = simulationScreenState(
            SimulationBounds(34_000, 48_000, 30_000, belowLower = true),
            SimulatedDistribution(SimulationStatus.READY, 30_000, mapOf("courses" to 30_000)),
            observedByPocket = mapOf("courses" to 32_000),
            remainingCents = 12_000,
        )
        assertTrue(under.bounds.isAvailable)
        assertTrue(under.bounds.belowLower)
        assertEquals(34_000L, under.bounds.lowerCents)
        assertEquals(48_000L, under.bounds.upperCents)
        assertFalse(under.hasObjective)

        val withObjective = under.copy(objectiveConsequence = "Objectif dans 3 mois")
        assertTrue(withObjective.hasObjective)
    }
}
