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
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gestio.core.objectives.Objective
import com.gestio.core.objectives.ObjectiveProjection
import com.gestio.core.objectives.ObjectiveQueue
import com.gestio.core.objectives.ProjectionStatus

data class ObjectiveScreenState(
    val objective: Objective,
    val projection: ObjectiveProjection,
    val queue: ObjectiveQueue,
)

fun objectiveScreenState(
    objective: Objective,
    projection: ObjectiveProjection,
    queue: ObjectiveQueue,
) = ObjectiveScreenState(objective, projection, queue)

@Composable
fun TonObjectif(state: ObjectiveScreenState, onDone: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("OBJECTIF", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        Text(state.objective.name, fontSize = 27.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(12.dp))
        Text("Montant", fontWeight = FontWeight.Bold)
        Text(formatCents(state.objective.targetCents), fontSize = 32.sp)
        state.objective.targetMonth?.let { Text("Visé pour $it") }
        state.objective.deadlineMonth?.let { Text("Date limite : $it") }
        Spacer(Modifier.height(20.dp))
        when (state.projection.status) {
            ProjectionStatus.AVAILABLE -> {
                Text("Tu y es en ${state.projection.monthsUsed} mois.", fontSize = 27.sp, fontWeight = FontWeight.Bold)
                state.projection.projectedMonth?.let { Text("Projection : $it") }
            }
            else -> Text("La durée sera précisée quand le profil de capacité sera disponible.")
        }
        Spacer(Modifier.height(8.dp))
        Text("L'épargne au départ : ${formatCents(state.objective.savedAtStartCents)}")
        Spacer(Modifier.height(20.dp))
        Text("FILE", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        state.queue.entries.forEachIndexed { index, objective ->
            Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("${index + 1}. ${objective.name}", fontWeight = if (index == 0) FontWeight.Bold else FontWeight.Normal)
                Text(formatCents(objective.targetCents))
            }
        }
        Spacer(Modifier.height(20.dp))
        Text("On te dira chaque semaine si tu tiens ce rythme.")
        Spacer(Modifier.height(20.dp))
        Button(onClick = onDone) { Text("C'est parti") }
    }
}
