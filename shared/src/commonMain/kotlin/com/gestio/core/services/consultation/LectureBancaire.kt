package com.gestio.core.services.consultation

import com.gestio.core.enablebanking.EnableBankingClient
import com.gestio.core.enablebanking.fetchAccountBalances
import com.gestio.core.enablebanking.fetchAllTransactions
import com.gestio.core.enablebanking.mapEnableBankingBalances
import com.gestio.core.storage.GestioStore

class LectureBancaire(private val store: GestioStore) {
    suspend fun synchroniser(
        client: EnableBankingClient,
        accountUid: String,
        accountId: String,
        firstSync: Boolean,
        fetchedAt: String,
        rulesDocument: String? = null,
    ) = run {
        val transactions = client.fetchAllTransactions(accountUid, firstSync)
        val balances = mapEnableBankingBalances(client.fetchAccountBalances(accountUid), accountId, fetchedAt)
        val result = store.ingestEnableBankingTransactions(transactions, accountId)
        store.recordAccountBalances(balances)
        if (rulesDocument != null) store.categorize(rulesDocument)
        result
    }
}
