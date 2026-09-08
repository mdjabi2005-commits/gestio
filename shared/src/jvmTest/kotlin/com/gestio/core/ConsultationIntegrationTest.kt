package com.gestio.core

import com.gestio.core.accounts.AccountRole
import com.gestio.core.budget.BudgetFreeStatus
import com.gestio.core.budget.PlannedExpense
import com.gestio.core.budget.PlannedExpenseNature
import com.gestio.core.categorization.CategoryAssignmentOrigin
import com.gestio.core.enablebanking.AccountBalanceReading
import com.gestio.core.enablebanking.EnableBankingMappingException
import com.gestio.core.enablebanking.mapEnableBankingBalances
import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.model.SourceMetadata
import com.gestio.core.model.TransactionFrequency
import com.gestio.core.model.TransactionSourceType
import com.gestio.core.services.consultation.LectureReleves
import com.gestio.core.storage.GestioStore
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ConsultationIntegrationTest {
    private fun row(id: String, amount: Long, balance: Long? = null, account: String = "checking") =
        NormalizedTransaction(id = id, accountId = account, bookingDate = "2026-08-28",
            amountCents = amount, balanceAfterCents = balance, rawDescription = id, cleanDescription = id,
            frequency = if (amount > 0) TransactionFrequency.MONTHLY else null,
            source = SourceMetadata(TransactionSourceType.MANUAL, "test"))

    @Test
    fun dated_booked_api_balances_override_older_statements_and_missing_accounts_stay_unknown() {
        GestioStore("consultation-balances").use { store ->
            store.declareAccount("checking", "Courant", role = AccountRole.CHECKING)
            store.declareAccount("savings", "Épargne", role = AccountRole.SAVINGS)
            store.ingestJson(Json.encodeToString(listOf(row("salary", 100_000, 50_000))))
            val raw = Json.parseToJsonElement("""{"balances":[
                {"balance_type":"CLBD","balance_amount":{"amount":"321.09","currency":"EUR"},"reference_date":"2026-09-05"},
                {"balance_type":"ITAV","balance_amount":{"amount":"250.00","currency":"EUR"},"reference_date":"2026-09-05"}]}
            """).jsonObject
            store.recordAccountBalances(mapEnableBankingBalances(raw, "checking", "2026-09-06T12:00:00Z"))
            assertEquals(32_109, store.budgetLibre("2026-09-06").currentBalanceCents)
            assertEquals("2026-09-05", store.budgetLibre("2026-09-06").accountSnapshots.single().asOf)
            assertNull(store.savingsBalance().cents)
            store.recordAccountBalances(listOf(AccountBalanceReading("savings", 12_345, "2026-09-05", "enable-banking", "2026-09-06", "CLBD")))
            assertEquals(12_345, store.savingsBalance().cents)
            store.declareAccount("checking-2", "Autre courant", role = AccountRole.CHECKING)
            assertEquals(BudgetFreeStatus.NO_BALANCE, store.budgetLibre("2026-09-06").status)
        }
    }

    @Test
    fun balance_parser_does_not_invent_dates_or_convert_foreign_currency_or_overflow() {
        fun payload(amount: String, currency: String = "EUR", date: String = ",\"reference_date\":\"2026-09-05\"") =
            Json.parseToJsonElement("""{"balances":[{"balance_type":"CLBD","balance_amount":{"amount":"$amount","currency":"$currency"}$date}]}""").jsonObject
        assertEquals(-123, mapEnableBankingBalances(payload("-1.23"), "checking", "2026-09-06").single().cents)
        assertTrue(mapEnableBankingBalances(payload("12", date = ""), "checking", "2026-09-06").isEmpty())
        assertFailsWith<EnableBankingMappingException> { mapEnableBankingBalances(payload("1.00", "USD"), "checking", "2026-09-06") }
        assertFailsWith<EnableBankingMappingException> { mapEnableBankingBalances(payload("92233720368547758.08"), "checking", "2026-09-06") }
    }

    @Test
    fun imports_preserve_human_categories_and_alert_reads_do_not_acknowledge_delivery() {
        GestioStore("consultation-category-alert").use { store ->
            store.declareAccount("checking", "Courant", role = AccountRole.CHECKING)
            LectureReleves(store).importerJson(Json.encodeToString(listOf(row("salary", 100_000, 100))))
            store.reclassifyTransaction("salary", "Mon choix")
            store.categorize("### Revenus\n| salary | Salaire |")
            assertEquals("Mon choix", store.categoryAssignments().single().category)
            assertEquals(CategoryAssignmentOrigin.HUMAN, store.categoryAssignments().single().origin)
            store.createPlannedExpense(PlannedExpense("rent", 10_000, "2026-09-07", "checking", null, PlannedExpenseNature.EXCEPTIONAL))
            val alerts = store.liquidityAlerts("2026-09-06")
            assertEquals(1, alerts.size)
            assertEquals(alerts, store.liquidityAlerts("2026-09-06"))
            assertEquals(alerts, store.emitLiquidityAlerts("2026-09-06", "2026-09-06"))
            assertTrue(store.emitLiquidityAlerts("2026-09-06", "2026-09-06").isEmpty())
            assertEquals(alerts, store.liquidityAlerts("2026-09-06"))
        }
    }

    @Test
    fun realization_requires_a_real_debit_and_cannot_consume_it_twice() {
        GestioStore("consultation-realization").use { store ->
            store.declareAccount("checking", "Courant", role = AccountRole.CHECKING)
            store.ingestJson(Json.encodeToString(listOf(row("debit", -900))))
            val planned = PlannedExpense("one", 1_000, "2026-08-28", "checking", null, PlannedExpenseNature.EXCEPTIONAL)
            store.createPlannedExpense(planned)
            store.createPlannedExpense(planned.copy(id = "two"))
            assertFailsWith<IllegalArgumentException> { store.realizePlannedExpense("one", "missing", 900) }
            assertFailsWith<IllegalArgumentException> { store.realizePlannedExpense("one", "debit", 1_000) }
            assertEquals(900, store.realizePlannedExpense("one", "debit", 900).actualAmountCents)
            assertFailsWith<IllegalArgumentException> { store.realizePlannedExpense("two", "debit", 900) }
        }
    }
}
