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
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gestio.core.model.AmountNature
import com.gestio.core.model.TransactionFrequency
import com.gestio.core.recurrence.RecurrenceCandidate

enum class RecurrenceConfirmationStep { FREQUENCY, AMOUNT, DONE }

data class RecurrenceConfirmationScreenState(
    val candidate: RecurrenceCandidate,
    val step: RecurrenceConfirmationStep = RecurrenceConfirmationStep.FREQUENCY,
    val frequency: TransactionFrequency? = null,
    val amountNature: AmountNature? = null,
    val recalculationMessage: String? = null,
)

fun answerRecurrenceFrequency(
    state: RecurrenceConfirmationScreenState,
    recursMonthly: Boolean,
): RecurrenceConfirmationScreenState = state.copy(
    step = RecurrenceConfirmationStep.AMOUNT,
    frequency = if (recursMonthly) TransactionFrequency.MONTHLY else TransactionFrequency.NONE,
)

fun answerRecurrenceAmount(
    state: RecurrenceConfirmationScreenState,
    sameAmount: Boolean,
): RecurrenceConfirmationScreenState = state.copy(
    step = RecurrenceConfirmationStep.DONE,
    amountNature = if (sameAmount) AmountNature.IMPOSED else AmountNature.OWNED,
)

@Composable
fun ConfirmationRecurrences(
    state: RecurrenceConfirmationScreenState,
    recursMonthly: Boolean?,
    sameAmount: Boolean?,
    onRecursMonthlyChanged: (Boolean) -> Unit,
    onSameAmountChanged: (Boolean) -> Unit,
    onConfirm: (frequency: TransactionFrequency, amountNature: AmountNature?) -> Unit,
    onSkip: () -> Unit,
    onDone: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("RÉCURRENCE", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        Text(state.candidate.description, fontSize = 27.sp, fontWeight = FontWeight.Bold)
        Text(state.candidate.months.joinToString(" · "))
        Spacer(Modifier.height(24.dp))

        when (state.step) {
            RecurrenceConfirmationStep.FREQUENCY -> {
                Text("Ça revient tous les mois ?", fontWeight = FontWeight.Bold)
                ChoiceRow("Oui", recursMonthly == true) { onRecursMonthlyChanged(true) }
                ChoiceRow("Non", recursMonthly == false) { onRecursMonthlyChanged(false) }
                Spacer(Modifier.height(20.dp))
                ActionRow(enabled = recursMonthly != null, onSkip = onSkip) {
                    onRecursMonthlyChanged(recursMonthly ?: false)
                }
            }

            RecurrenceConfirmationStep.AMOUNT -> {
                Text("Et toujours pour le même montant ?", fontWeight = FontWeight.Bold)
                ChoiceRow("Oui", sameAmount == true) { onSameAmountChanged(true) }
                ChoiceRow("Non", sameAmount == false) { onSameAmountChanged(false) }
                Spacer(Modifier.height(20.dp))
                ActionRow(enabled = sameAmount != null, onSkip = onSkip) {
                    val frequency = state.frequency ?: TransactionFrequency.NONE
                    onConfirm(frequency, if (sameAmount == true) AmountNature.IMPOSED else AmountNature.OWNED)
                }
            }

            RecurrenceConfirmationStep.DONE -> {
                state.recalculationMessage?.let {
                    Text(it, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(16.dp))
                }
                Button(onClick = onDone) { Text("Terminer") }
            }
        }
    }
}

@Composable
private fun ChoiceRow(label: String, selected: Boolean, onClick: () -> Unit) {
    TextButton(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
            Text(if (selected) "◆" else "◇")
        }
    }
    HorizontalDivider()
}

@Composable
private fun ActionRow(enabled: Boolean, onSkip: () -> Unit, onNext: () -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
        TextButton(onClick = onSkip) { Text("Passer") }
        Button(onClick = onNext, enabled = enabled) { Text("Suivante") }
    }
}
