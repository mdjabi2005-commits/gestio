package com.gestio.core

import com.gestio.core.model.AmountNature
import com.gestio.core.model.TransactionFrequency
import com.gestio.core.recurrence.RecurrenceCandidate
import com.gestio.core.ui.RecurrenceConfirmationScreenState
import com.gestio.core.ui.RecurrenceConfirmationStep
import com.gestio.core.ui.answerRecurrenceAmount
import com.gestio.core.ui.answerRecurrenceFrequency
import kotlin.test.Test
import kotlin.test.assertEquals

class Prd4T64Test {
    @Test
    fun two_answers_are_ordered_and_skip_keeps_candidate_pending() {
        val candidate = RecurrenceCandidate(
            key = "rent",
            accountId = "checking",
            currency = "EUR",
            description = "Loyer",
            months = listOf("2026-08", "2026-09"),
            transactionIds = listOf("rent-1", "rent-2"),
            amountCents = listOf(-38_000, -38_000),
        )
        val initial = RecurrenceConfirmationScreenState(candidate)
        val afterFrequency = answerRecurrenceFrequency(initial, true)
        val afterAmount = answerRecurrenceAmount(afterFrequency, false)

        assertEquals(RecurrenceConfirmationStep.FREQUENCY, initial.step)
        assertEquals(TransactionFrequency.MONTHLY, afterFrequency.frequency)
        assertEquals(RecurrenceConfirmationStep.AMOUNT, afterFrequency.step)
        assertEquals(AmountNature.OWNED, afterAmount.amountNature)
        assertEquals(RecurrenceConfirmationStep.DONE, afterAmount.step)
        assertEquals(initial, RecurrenceConfirmationScreenState(candidate))
    }
}
