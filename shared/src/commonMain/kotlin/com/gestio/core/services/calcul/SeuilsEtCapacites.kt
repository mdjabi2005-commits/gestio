package com.gestio.core.services.calcul

import com.gestio.core.simulation.capacityProfile
import com.gestio.core.model.monthKey
import com.gestio.core.simulation.lifeEnvelope
import com.gestio.core.storage.GestioStore
import com.gestio.core.threshold.HighThresholdProfile
import com.gestio.core.threshold.MonthlyHighThreshold

class SeuilsEtCapacites(private val store: GestioStore) {
    fun haut() = store.highThresholdProfile()
    fun bas(calculatedAt: String? = null) = store.lowThreshold(calculatedAt)
    fun moisBas(calculatedAt: String? = null) = store.lowMonthCheck(calculatedAt)
    fun vie() = lifeEnvelope(store.pocketRecords())
    fun capacites() = capacityProfile(haut(), vie())
    fun capaciteReference(today: String) = capacites().months.filter { it.month <= monthKey(today) }.maxByOrNull { it.month }

    /** The reference month travels with its value; a historical bound is not today's income. */
    fun referenceHaute(month: String, profile: HighThresholdProfile = haut()): MonthlyHighThreshold? =
        profile.months.filter { it.month <= month }.maxByOrNull { it.month }
}
