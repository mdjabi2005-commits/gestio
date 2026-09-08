package com.gestio.core.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gestio.core.balance.MonthBalance
import com.gestio.core.budget.BudgetFreeResult
import com.gestio.core.budget.Engagement
import com.gestio.core.budget.LiquidityAlert
import com.gestio.core.budget.PlannedExpenseNature
import com.gestio.core.model.NormalizedTransaction

data class UsageCourantState(
    val budget: BudgetFreeResult,
    val upcoming: List<Engagement>,
    val recent: List<NormalizedTransaction>,
    val pendingArbitrations: Int = 0,
) {
    val hasPendingArbitrations: Boolean get() = pendingArbitrations > 0
}

fun usageCourantState(
    budget: BudgetFreeResult,
    upcoming: List<Engagement>,
    recent: List<NormalizedTransaction>,
    pendingArbitrations: Int = 0,
) = UsageCourantState(budget, upcoming.take(3), recent.take(3), pendingArbitrations)

data class PlannedExpenseDraft(
    val amountCents: Long? = null,
    val dueDate: String = "",
    val accountId: String = "",
    val categoryId: String? = null,
    val nature: PlannedExpenseNature = PlannedExpenseNature.POCKET,
) {
    val canSave: Boolean get() = amountCents != null && amountCents > 0L && dueDate.isNotBlank() && accountId.isNotBlank()
}

data class LiquidityAlertScreenState(val alert: LiquidityAlert)

data class MonthExpensesScreenState(
    val month: String,
    val balance: MonthBalance,
    val transactions: List<NormalizedTransaction>,
)

@Composable
fun BudgetLibre(
    state: UsageCourantState,
    onPlanExpense: () -> Unit,
    onOpenAlert: () -> Unit,
    onOpenArbitrations: () -> Unit,
    onOpenMonthExpenses: () -> Unit,
    onOpenObjective: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("BUDGET LIBRE", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(24.dp))
        Text(
            state.budget.horizon.date?.let { "Libre jusqu'au $it" } ?: "Budget libre indisponible",
            fontSize = 13.sp,
        )
        Text(state.budget.valueCents?.let(::formatCents) ?: "—", fontSize = 48.sp, fontWeight = FontWeight.Bold)
        state.budget.accountSnapshots.forEach { snapshot ->
            Text("${snapshot.accountId} · ${snapshot.asOf ?: "fraîcheur indisponible"}", fontSize = 12.sp)
        }
        Spacer(Modifier.height(24.dp))
        Text("TRANSACTIONS À VENIR", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        state.upcoming.forEach { engagement ->
            EngagementRow(engagement)
        }
        TextButton(onClick = onPlanExpense) { Text("Planifier une dépense") }
        Spacer(Modifier.height(12.dp))
        Text("TRANSACTIONS RÉCENTES", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        state.recent.forEach { transaction ->
            TransactionRow(transaction)
        }
        TextButton(onClick = onOpenMonthExpenses) { Text("Voir mes dépenses du mois") }
        TextButton(onClick = onOpenObjective) { Text("Voir mon objectif") }
        if (state.hasPendingArbitrations) {
            TextButton(onClick = onOpenArbitrations) { Text("${state.pendingArbitrations} arbitrage(s) à confirmer") }
        }
        state.budget.engagements.firstOrNull()?.let { engagement ->
            TextButton(onClick = onOpenAlert) {
                Text("Voir les alertes de liquidité")
            }
        }
    }
}

@Composable
fun PlanifierDepense(
    draft: PlannedExpenseDraft,
    onDraftChanged: (PlannedExpenseDraft) -> Unit,
    onSave: () -> Unit,
    onClose: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("PLANIFIER UNE DÉPENSE", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(20.dp))
        OutlinedTextField(
            value = draft.amountCents?.toString() ?: "",
            onValueChange = { onDraftChanged(draft.copy(amountCents = it.toLongOrNull())) },
            label = { Text("Montant en centimes") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = draft.dueDate,
            onValueChange = { onDraftChanged(draft.copy(dueDate = it)) },
            label = { Text("Date (AAAA-MM-JJ)") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = draft.categoryId ?: "",
            onValueChange = { onDraftChanged(draft.copy(categoryId = it.ifBlank { null })) },
            label = { Text("Catégorie") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(16.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            TextButton(onClick = onClose) { Text("Annuler") }
            Button(onClick = onSave, enabled = draft.canSave) { Text("Enregistrer") }
        }
    }
}

@Composable
fun AlerteLiquidite(state: LiquidityAlertScreenState, onLater: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("ALERTE DE LIQUIDITÉ", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(20.dp))
        Text("Un engagement dépasse le solde du compte.", fontWeight = FontWeight.Bold)
        Text("Compte : ${state.alert.accountId}")
        Text("Date : ${state.alert.dueDate}")
        Text("Il manque ${formatCents(state.alert.shortfallCents)}")
        Spacer(Modifier.height(20.dp))
        Text("Aucun mouvement d'argent n'est effectué.")
        TextButton(onClick = onLater) { Text("Plus tard") }
    }
}

@Composable
fun DepensesDuMois(state: MonthExpensesScreenState, onClose: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("DÉPENSES DU MOIS", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        Text(state.month, fontSize = 27.sp, fontWeight = FontWeight.Bold)
        Text("Total : ${formatCents(state.balance.expenseCents)}", fontSize = 24.sp)
        Spacer(Modifier.height(16.dp))
        state.balance.categories.forEach { category ->
            Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(category.category)
                Text(formatCents(category.amountCents))
            }
        }
        HorizontalDivider()
        state.transactions.filter { it.amountCents < 0L }.forEach { TransactionRow(it) }
        Spacer(Modifier.height(16.dp))
        Button(onClick = onClose) { Text("Retour") }
    }
}

@Composable
private fun EngagementRow(engagement: Engagement) {
    Row(Modifier.fillMaxWidth().padding(vertical = 7.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Column(Modifier.weight(1f)) {
            Text(engagement.id)
            Text("${engagement.accountId} · ${engagement.dueDate}", fontSize = 12.sp)
        }
        Text(formatCents(engagement.amountCents))
    }
}

@Composable
private fun TransactionRow(transaction: NormalizedTransaction) {
    Row(Modifier.fillMaxWidth().padding(vertical = 7.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Column(Modifier.weight(1f)) {
            Text(transaction.cleanDescription)
            Text("${transaction.accountId} · ${transaction.bookingDate}", fontSize = 12.sp)
        }
        Text(formatCents(transaction.amountCents))
    }
}
