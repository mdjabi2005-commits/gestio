package com.gestio.core

import com.gestio.core.budget.BudgetFreeResult
import com.gestio.core.budget.BudgetFreeStatus
import com.gestio.core.budget.Engagement
import com.gestio.core.budget.EngagementSource
import com.gestio.core.budget.HorizonStatus
import com.gestio.core.budget.IncomeHorizon
import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.model.SourceMetadata
import com.gestio.core.model.TransactionSourceType
import com.gestio.core.ui.PlannedExpenseDraft
import com.gestio.core.ui.usageCourantState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class Prd8T54Test {
    @Test
    fun usage_state_keeps_three_rows_and_exposes_arbitration_only_when_pending() {
        val budget = BudgetFreeResult(
            status = BudgetFreeStatus.AVAILABLE,
            valueCents = -12_000,
            horizon = IncomeHorizon(HorizonStatus.AVAILABLE, "2026-09-01"),
        )
        val engagements = (1..5).map {
            Engagement("engagement-$it", 1_000, "2026-09-0$it", "checking", EngagementSource.PLANNED)
        }
        val transactions = (1..5).map { transaction("tx-$it") }
        assertEquals(3, usageCourantState(budget, engagements, transactions).upcoming.size)
        assertEquals(3, usageCourantState(budget, engagements, transactions).recent.size)
        assertFalse(usageCourantState(budget, engagements, transactions).hasPendingArbitrations)
        assertTrue(usageCourantState(budget, engagements, transactions, 1).hasPendingArbitrations)

        assertFalse(PlannedExpenseDraft().canSave)
        assertTrue(PlannedExpenseDraft(1_000, "2026-09-01", "checking", "courses").canSave)
    }

    private fun transaction(id: String) = NormalizedTransaction(
        id = id,
        accountId = "checking",
        bookingDate = "2026-08-10",
        amountCents = -1_000,
        rawDescription = id,
        cleanDescription = id,
        source = SourceMetadata(TransactionSourceType.MANUAL, "test"),
    )
}
