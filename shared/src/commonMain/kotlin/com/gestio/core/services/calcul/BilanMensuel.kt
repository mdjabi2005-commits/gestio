package com.gestio.core.services.calcul

import com.gestio.core.balance.calculateMonthBalance
import com.gestio.core.storage.GestioStore

class BilanMensuel(private val store: GestioStore) {
    fun calculer(month: String) = calculateMonthBalance(
        store.transactions(), month,
        store.categoryAssignments().associate { it.transactionId to it.category },
    )
}
