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
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gestio.core.simulation.SimulatedDistribution
import com.gestio.core.simulation.SimulationBounds
import com.gestio.core.simulation.SimulationStatus

data class SimulationScreenState(
    val bounds: SimulationBounds,
    val distribution: SimulatedDistribution,
    val observedByPocket: Map<String, Long> = emptyMap(),
    val remainingCents: Long? = null,
    val objectiveConsequence: String? = null,
) {
    val hasObjective: Boolean get() = objectiveConsequence != null
}

fun simulationScreenState(
    bounds: SimulationBounds,
    distribution: SimulatedDistribution,
    observedByPocket: Map<String, Long> = emptyMap(),
    remainingCents: Long? = null,
    objectiveConsequence: String? = null,
) = SimulationScreenState(bounds, distribution, observedByPocket, remainingCents, objectiveConsequence)

@Composable
fun SimulationBudget(
    state: SimulationScreenState,
    onPositionChanged: (Long) -> Unit,
    onValidate: () -> Unit,
    onClose: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("SIMULATION", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        Text("Ton enveloppe de vie", fontWeight = FontWeight.Bold)
        Text(state.bounds.positionCents?.let(::formatCents) ?: "Aucune position", fontSize = 32.sp)
        if (state.bounds.isAvailable) {
            val lower = state.bounds.lowerCents ?: 0L
            val upper = (state.bounds.upperCents ?: 1L).coerceAtLeast(1L)
            Slider(
                value = (state.bounds.positionCents ?: lower).coerceIn(0L, upper).toFloat(),
                onValueChange = { onPositionChanged(it.toLong()) },
                valueRange = 0f..upper.toFloat(),
            )
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("${formatCents(lower)} · vital")
                Text(formatCents(upper))
            }
            when {
                state.bounds.belowLower -> Text("Sous le vital : valeur acceptée.")
                state.bounds.aboveUpper -> Text("Au-dessus du seuil haut : valeur acceptée.")
            }
        } else {
            Text("Les deux bornes ne sont pas encore établies.")
        }
        Spacer(Modifier.height(20.dp))
        state.remainingCents?.let {
            Text("Ce qui reste chaque mois", fontWeight = FontWeight.Bold)
            Text(formatCents(it))
        }
        state.objectiveConsequence?.let {
            Spacer(Modifier.height(12.dp))
            Text(it)
        }
        Spacer(Modifier.height(20.dp))
        Text("Répartition constatée", fontWeight = FontWeight.Bold)
        state.observedByPocket.toSortedMap().forEach { (pocket, cents) ->
            Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(pocket)
                Text(formatCents(cents))
            }
        }
        HorizontalDivider()
        Spacer(Modifier.height(20.dp))
        if (state.distribution.status != SimulationStatus.READY) {
            Text("La répartition est indisponible pour cette position.")
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            TextButton(onClick = onClose) { Text("Fermer") }
            Button(onClick = onValidate, enabled = state.distribution.status == SimulationStatus.READY) {
                Text("Valider")
            }
        }
    }
}
