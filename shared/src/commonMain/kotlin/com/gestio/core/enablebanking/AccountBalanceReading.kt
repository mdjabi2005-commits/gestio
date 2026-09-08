package com.gestio.core.enablebanking

import com.gestio.core.model.parseIsoDate
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/** A bank observation, never a balance extrapolated from transactions. */
data class AccountBalanceReading(
    val accountId: String,
    val cents: Long,
    val asOf: String,
    val source: String,
    val fetchedAt: String,
    val balanceType: String,
) {
    init {
        require(accountId.isNotBlank() && source.isNotBlank())
        parseIsoDate(asOf)
        parseIsoDate(fetchedAt.take(10))
        require(balanceType in setOf("CLBD", "ITBD", "ITAV", "PDF"))
    }
}

fun mapEnableBankingBalances(raw: JsonObject, accountId: String, fetchedAt: String): List<AccountBalanceReading> {
    val balances = raw["balances"]?.jsonArray
        ?: throw EnableBankingMappingException("balances is required")
    return balances.mapNotNull { item ->
        val balance = item.jsonObject
        val type = balance["balance_type"]?.jsonPrimitive?.contentOrNull
        if (type !in setOf("CLBD", "ITBD", "ITAV")) return@mapNotNull null
        val amount = balance["balance_amount"]?.jsonObject
            ?: throw EnableBankingMappingException("balance_amount is required")
        if (amount["currency"]?.jsonPrimitive?.contentOrNull != "EUR") {
            throw EnableBankingMappingException("only EUR balances can be combined")
        }
        val value = amount["amount"]?.jsonPrimitive?.contentOrNull
            ?: throw EnableBankingMappingException("balance amount is required")
        val cents = decimalCents(value.removePrefix("-")) * if (value.startsWith("-")) -1L else 1L
        // A download date cannot stand in for the bank's balance reference date.
        val date = balance["reference_date"]?.jsonPrimitive?.contentOrNull
            ?: balance["last_change_date_time"]?.jsonPrimitive?.contentOrNull?.take(10)
            ?: return@mapNotNull null
        AccountBalanceReading(accountId, cents, date, "enable-banking", fetchedAt, checkNotNull(type))
    }
}
