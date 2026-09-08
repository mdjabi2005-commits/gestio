package com.gestio.core.services.calcul

import com.gestio.core.budget.AccountSnapshot
import com.gestio.core.budget.Engagement
import com.gestio.core.budget.liquidityAlerts
import com.gestio.core.storage.GestioStore

class Liquidite(private val store: GestioStore) {
    fun detecter(today: String) = store.liquidityAlerts(today)
    fun detecter(snapshots: List<AccountSnapshot>, engagements: List<Engagement>) =
        liquidityAlerts(snapshots, engagements)
}
