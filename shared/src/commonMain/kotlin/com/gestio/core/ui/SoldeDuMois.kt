package com.gestio.core.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gestio.core.balance.MonthBalance
import com.gestio.core.coverage.CoverageStatus
import com.gestio.core.coverage.MonthCoverage

data class MonthScreenState(
    val month: String,
    val coverage: MonthCoverage,
    val balance: MonthBalance?,
    val declaredSavingsEstimateCents: Long? = null,
    val readSavingsCents: Long? = null,
)

fun monthScreenState(
    month: String,
    coverage: MonthCoverage?,
    balance: MonthBalance?,
    declaredSavingsEstimateCents: Long? = null,
    readSavingsCents: Long? = null,
): MonthScreenState? = coverage?.let {
    MonthScreenState(
        month,
        it,
        if (it.status == CoverageStatus.COMPLETE) balance else null,
        declaredSavingsEstimateCents,
        readSavingsCents,
    )
}

@Composable
fun SoldeDuMois(state: MonthScreenState?) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("GESTION", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(28.dp))
        if (state == null) {
            Text("Solde du mois", fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(12.dp))
            Text("Importe un relevé pour afficher tes chiffres.")
            return@Column
        }

        Text(state.month, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(12.dp))
        Text(coverageLabel(state.coverage), fontSize = 16.sp)
        state.readSavingsCents?.let { MetricRow("Épargne lue", it) }
        state.declaredSavingsEstimateCents?.let { MetricRow("Estimation déclarée", it) }
        if (state.balance == null) return@Column

        Spacer(Modifier.height(24.dp))
        Text("SOLDE DU MOIS", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Text(formatCents(state.balance.balanceCents), fontSize = 42.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(20.dp))
        MetricRow("Revenus", state.balance.incomeCents)
        MetricRow("Dépenses", state.balance.expenseCents)
        Spacer(Modifier.height(20.dp))
        HorizontalDivider()
        state.balance.categories.forEach { category ->
            MetricRow(category.category, category.amountCents)
        }
    }
}

@Composable
private fun MetricRow(label: String, cents: Long) {
    Row(Modifier.fillMaxWidth().padding(vertical = 7.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label)
        Text(formatCents(cents))
    }
}

private fun coverageLabel(coverage: MonthCoverage): String = when (coverage.status) {
    CoverageStatus.COMPLETE -> "Couverture complète"
    CoverageStatus.INCOMPLETE -> "Couverture incomplète"
    CoverageStatus.UNVERIFIABLE -> "Couverture invérifiable"
}

fun formatCents(cents: Long): String {
    val absolute = kotlin.math.abs(cents)
    val euros = absolute / 100
    val centsPart = (absolute % 100).toString().padStart(2, '0')
    val grouped = euros.toString().reversed().chunked(3).joinToString(" ").reversed()
    return (if (cents < 0) "-" else "") + "$grouped,$centsPart €"
}
