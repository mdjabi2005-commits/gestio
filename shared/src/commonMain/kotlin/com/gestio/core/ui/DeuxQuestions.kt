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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gestio.core.questions.TwoQuestionsState
import com.gestio.core.questions.TwoQuestionsStep

data class TwoQuestionsScreenState(
    val step: TwoQuestionsStep,
    val answerMessage: String?,
    val canSkip: Boolean = step != TwoQuestionsStep.IMPORT,
)

fun twoQuestionsScreenState(state: TwoQuestionsState): TwoQuestionsScreenState =
    TwoQuestionsScreenState(state.step, state.answer?.message)

fun parseCentsInput(value: String): Long? {
    val normalized = value.trim().replace("€", "").replace(" ", "").replace(',', '.')
    val match = Regex("(-?\\d+)(?:\\.(\\d{1,2}))?").matchEntire(normalized) ?: return null
    val negative = match.groupValues[1].startsWith('-')
    val euros = match.groupValues[1].removePrefix("-").toLongOrNull() ?: return null
    val fraction = match.groupValues[2].padEnd(2, '0').ifEmpty { "00" }.toLong()
    if (euros > (Long.MAX_VALUE - fraction) / 100) return null
    val cents = euros * 100 + fraction
    return if (negative) -cents else cents
}

@Composable
fun DeuxQuestions(
    state: TwoQuestionsState,
    savingsText: String,
    intentionText: String,
    onSavingsTextChanged: (String) -> Unit,
    onIntentionTextChanged: (String) -> Unit,
    onSavingsAnswer: (Long) -> Unit,
    onSavingsSkip: () -> Unit,
    onIntentionAnswer: (String) -> Unit,
    onIntentionSkip: () -> Unit,
    onImport: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("GESTION", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(28.dp))
        when (state.step) {
            TwoQuestionsStep.SAVINGS -> {
                Text("À combien estimes-tu ton épargne ?", fontSize = 27.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = savingsText,
                    onValueChange = onSavingsTextChanged,
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Un montant, ou rien") },
                    singleLine = true,
                )
                state.answer?.message?.let { message ->
                    Spacer(Modifier.height(16.dp))
                    Text(message, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(24.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onSavingsSkip) { Text("Passer") }
                    Button(
                        onClick = { parseCentsInput(savingsText)?.let(onSavingsAnswer) },
                        enabled = parseCentsInput(savingsText) != null,
                    ) { Text("Continuer") }
                }
            }

            TwoQuestionsStep.INTENTION -> {
                state.answer?.message?.let { message ->
                    Text(message, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(24.dp))
                }
                Text("Qu'est-ce que tu aimerais faire de ton argent ?", fontSize = 27.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = intentionText,
                    onValueChange = onIntentionTextChanged,
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Une intention, ou rien") },
                    singleLine = true,
                )
                Spacer(Modifier.height(24.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onIntentionSkip) { Text("Passer") }
                    Button(
                        onClick = { onIntentionAnswer(intentionText) },
                        enabled = intentionText.isNotBlank(),
                    ) { Text("Continuer") }
                }
            }

            TwoQuestionsStep.IMPORT -> {
                Text("Ton relevé", fontSize = 27.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                Text("Tu peux maintenant importer ton relevé.")
                Spacer(Modifier.height(24.dp))
                Button(onClick = onImport) { Text("Importer un relevé") }
            }
        }
    }
}
