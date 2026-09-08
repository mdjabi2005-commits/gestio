package com.gestio.core

import com.gestio.core.budget.PlannedExpenseNature
import com.gestio.core.pockets.PocketMark
import com.gestio.core.ui.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class JourneyFormsTest {
    @Test
    fun forms_reject_invalid_dates_amounts_and_missing_choices() {
        val expense = PlannedExpenseDraft(1000, "2026-02-28", "checking", "courses")
        assertTrue(expense.canSave)
        assertFalse(expense.copy(dueDate = "2026-02-29").canSave)
        assertFalse(expense.copy(dueDate = "2026-09-31").canSave)
        assertFalse(expense.copy(categoryId = null).canSave)
        assertTrue(expense.copy(categoryId = null, nature = PlannedExpenseNature.EXCEPTIONAL).canSave)
        assertTrue(ObjectiveDraft("Voyage", 100_000, "2027-06").canSave)
        assertFalse(ObjectiveDraft("Voyage", 100_000, "2027-13").canSave)
        assertFalse(ObjectiveDraft("Voyage", 0).canSave)
        assertFalse(PocketDraft("Courses").canSave)
        assertTrue(PocketDraft("Courses", PocketMark.VITAL).canSave)
        assertEquals(-50L, parseCentsInput("-0,50"))
        assertEquals(123450L, parseCentsInput("1 234,50 €"))
        assertNull(parseCentsInput("92233720368547758,08"))
        assertNull(parseCentsInput("12,345"))
    }

    @Test
    fun back_returns_through_the_actual_journey_without_duplicate_routes() {
        val start = initialAppNavigation(false)
        val usage = navigate(start, AppScreen.USAGE_COURANT)
        val expense = navigate(usage, AppScreen.PLAN_EXPENSE)
        assertEquals(expense, navigate(expense, AppScreen.PLAN_EXPENSE))
        assertEquals(usage, navigateBack(expense))
        assertEquals(start, navigateBack(navigateBack(expense)))
        assertEquals(start, navigateBack(start))
    }
}
