package com.gestio.core

import com.gestio.core.accounts.AccountRole
import com.gestio.core.model.AmountNature
import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.model.SourceMetadata
import com.gestio.core.model.TransactionFrequency
import com.gestio.core.model.TransactionSourceType
import com.gestio.core.pockets.EnvelopeOrigin
import com.gestio.core.pockets.PocketRecord
import com.gestio.core.services.calcul.AnalyseTransactions
import com.gestio.core.services.calcul.BilanMensuel
import com.gestio.core.services.calcul.DepensesDuMois
import com.gestio.core.services.calcul.EcartTrajectoire
import com.gestio.core.services.calcul.ProjectionObjectifs
import com.gestio.core.services.calcul.RepartitionEnveloppes
import com.gestio.core.simulation.CapacityProfile
import com.gestio.core.simulation.MonthlyCapacity
import com.gestio.core.storage.GestioStore
import com.gestio.core.trajectory.GapStatus
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ServicesCalculTest {
    private fun pocket(id: String, name: String, observed: Long) = PocketRecord(
        id, name, observed, "2026-08-31", EnvelopeOrigin.OBSERVED, observedCents = observed,
    )

    @Test
    fun editing_a_pocket_updates_life_bounds_and_remaining_with_stable_ids() {
        val service = RepartitionEnveloppes()
        val pockets = listOf(pocket("food", "Alimentation", 200), pocket("fun", "Sorties", 100))
        val initial = service.simuler(pockets, 300, 200, 500)
        val edited = service.modifier(initial, "fun", 400)
        assertEquals(setOf("food", "fun"), edited.observedByPocket.keys)
        assertEquals("Sorties", edited.pocketNames["fun"])
        assertEquals(600L, edited.distribution.positionCents)
        assertEquals(600L, edited.bounds.positionCents)
        assertEquals(-100L, edited.remainingCents)
        assertTrue(edited.bounds.aboveUpper)
        assertTrue(edited.canValidate)
        assertEquals(300L, initial.distribution.positionCents)
        assertFailsWith<IllegalArgumentException> { service.modifier(initial, "Sorties", 10) }
        assertFailsWith<IllegalArgumentException> { service.modifier(initial, "fun", -1) }
        assertFalse(service.simuler(pockets, 300, null, 500).canValidate)
    }

    @Test
    fun compensation_only_uses_explicit_donors_and_preserves_life_total() {
        val service = RepartitionEnveloppes()
        val pockets = listOf(pocket("food", "Alimentation", 200), pocket("fun", "Sorties", 100), pocket("other", "Autre", 100))
        val proposal = service.compensation(pockets, "fun", 50, listOf("food"))!!
        val adjusted = service.compenser(pockets, proposal)
        assertEquals(listOf(150L, 150L, 100L), adjusted.map { it.envelopeCents })
        assertEquals(400L, adjusted.sumOf { it.envelopeCents!! })
        assertNull(service.compensation(pockets, "fun", 300, listOf("food")))
    }

    @Test
    fun an_unknown_month_breaks_actual_curve_instead_of_becoming_zero() {
        val profile = CapacityProfile(listOf("2026-06", "2026-07", "2026-08").map { MonthlyCapacity(it, 100) })
        val curves = ProjectionObjectifs().courbes(profile, mapOf("2026-06" to 40L, "2026-08" to 20L), "2026-08-31")
        assertEquals(listOf(40L, null, null), curves.points.map { it.putAsideCents })
        assertEquals(listOf(100L, 200L, 300L), curves.points.map { it.plannedCents })
        assertTrue(curves.note!!.contains("incomplète"))
        val complete = ProjectionObjectifs().courbes(profile, mapOf("2026-06" to 40L, "2026-07" to 0L, "2026-08" to 20L), "2026-08-31")
        assertEquals(listOf(40L, 40L, 60L), complete.points.map { it.putAsideCents })
    }

    @Test
    fun missing_observation_is_not_attributed_to_a_pocket_as_zero_spending() {
        val pockets = listOf(pocket("food", "Alimentation", 200), pocket("fun", "Sorties", 100))
        assertEquals(GapStatus.UNVERIFIABLE, EcartTrajectoire().contributionsPoches(pockets, mapOf("food" to 200L)).status)
    }

    @Test
    fun pocket_details_and_month_balance_use_the_requested_month() {
        GestioStore("services-calcul-period").use { store ->
            store.declareAccount("checking", "Courant", role = AccountRole.CHECKING)
            val rows = (6..8).map { month ->
                NormalizedTransaction(
                    id = "food-$month", accountId = "checking", bookingDate = "2026-0$month-15",
                    amountCents = -100L * month, balanceAfterCents = 10_000,
                    rawDescription = "LIDL", cleanDescription = "LIDL",
                    frequency = TransactionFrequency.MONTHLY, amountNature = AmountNature.OWNED,
                    source = SourceMetadata(TransactionSourceType.MANUAL, "test"),
                )
            }
            store.ingestJson(Json.encodeToString(rows))
            val analysis = AnalyseTransactions(store)
            analysis.classer("### Poche : Alimentation\n| `LIDL` | Alimentation |")
            analysis.confirmer(analysis.recurrences().single(), TransactionFrequency.MONTHLY, AmountNature.OWNED)
            val expenses = DepensesDuMois(store)
            assertEquals(listOf("food-8"), expenses.transactionsPoche("alimentation", "2026-08").map { it.id })
            assertEquals(800L, expenses.depensesParPoche("2026-08")["alimentation"])
            assertEquals(800L, BilanMensuel(store).calculer("2026-08").expensesCents)
            assertNull(expenses.courbes("2026-08", null, emptyList()))
            assertFailsWith<IllegalArgumentException> { expenses.transactions("invalid") }
        }
    }
}
