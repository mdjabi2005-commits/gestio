package com.gestio.core

import com.gestio.core.pockets.EnvelopeOrigin
import com.gestio.core.pockets.LowThreshold
import com.gestio.core.pockets.PocketMark
import com.gestio.core.pockets.PocketRecord
import com.gestio.core.pockets.pocketMarkingState
import com.gestio.core.pockets.advancePocketMarking
import com.gestio.core.ui.pocketMarkingScreenState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class Prd5T31Test {
    @Test
    fun marking_is_one_pocket_at_a_time_and_hides_threshold_with_missing_mark() {
        val pockets = listOf(
            pocket("courses"),
            pocket("sorties"),
        )
        var marking = pocketMarkingState(pockets)
        val first = pocketMarkingScreenState(
            marking,
            LowThreshold(null, null, emptyList(), listOf("courses", "sorties")),
        )
        assertEquals("courses", first.current?.id)
        assertEquals(null, first.lowThresholdCents)

        marking = advancePocketMarking(marking, PocketMark.VITAL)
        assertEquals("sorties", pocketMarkingScreenState(marking, LowThreshold(null, null, listOf("courses"), listOf("sorties"))).current?.id)
        marking = advancePocketMarking(marking, PocketMark.PLEASURE)
        val done = pocketMarkingScreenState(marking, LowThreshold(12_000, "now", listOf("courses")))
        assertTrue(done.current == null)
        assertEquals(12_000L, done.lowThresholdCents)
    }

    private fun pocket(id: String) = PocketRecord(
        id = id,
        name = id,
        envelopeCents = 10_000,
        envelopeSetAt = "2026-08-01",
        envelopeOrigin = EnvelopeOrigin.OBSERVED,
    )
}
