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
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gestio.core.pockets.LowThreshold
import com.gestio.core.pockets.PocketMark
import com.gestio.core.pockets.PocketMarkingState
import com.gestio.core.pockets.PocketRecord

data class PocketMarkingScreenState(
    val current: PocketRecord?,
    val completed: Int,
    val total: Int,
    val lowThresholdCents: Long?,
    val missingMarkPocketIds: List<String>,
)

fun pocketMarkingScreenState(
    marking: PocketMarkingState,
    threshold: LowThreshold,
): PocketMarkingScreenState = PocketMarkingScreenState(
    current = marking.current,
    completed = marking.currentIndex.coerceAtMost(marking.pockets.size),
    total = marking.pockets.size,
    lowThresholdCents = threshold.cents,
    missingMarkPocketIds = threshold.missingMarkPocketIds,
)

@Composable
fun MarquagePoches(
    state: PocketMarkingScreenState,
    onMark: (PocketMark) -> Unit,
    onDone: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("POCHES", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        if (state.current != null) {
            Text("${state.completed + 1} sur ${state.total}", fontSize = 13.sp)
            Spacer(Modifier.height(20.dp))
            Text(state.current.name, fontSize = 27.sp, fontWeight = FontWeight.Bold)
            state.current.observedCents?.let { Text("${formatCents(it)} par mois en moyenne") }
            Spacer(Modifier.height(24.dp))
            Text("Tu peux t'en passer ?", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = { onMark(PocketMark.VITAL) }) { Text("C'est vital") }
                TextButton(onClick = { onMark(PocketMark.PLEASURE) }) { Text("C'est du plaisir") }
            }
        } else {
            Text("Le marquage est terminé.", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(16.dp))
            if (state.lowThresholdCents != null && state.missingMarkPocketIds.isEmpty()) {
                Text("Seuil bas", fontWeight = FontWeight.Bold)
                Text(formatCents(state.lowThresholdCents), fontSize = 27.sp)
            } else {
                Text("Le seuil bas est indisponible.")
                Text("Il manque une marque pour ${state.missingMarkPocketIds.joinToString()}.")
            }
            Spacer(Modifier.height(24.dp))
            Button(onClick = onDone) { Text("Continuer") }
        }
    }
}
