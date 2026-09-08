package com.gestio.core.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gestio.core.model.requireMonthKey
import com.gestio.core.pockets.PocketMark
import com.gestio.core.pockets.PocketRecord

data class ObjectiveDraft(
    val name: String = "",
    val targetCents: Long? = null,
    val targetMonth: String = "",
) {
    val canSave: Boolean get() = name.isNotBlank() && targetCents != null && targetCents > 0L &&
        (targetMonth.isBlank() || runCatching { requireMonthKey(targetMonth) }.isSuccess)
}

data class PocketDraft(
    val name: String = "",
    val mark: PocketMark? = null,
) {
    val canSave: Boolean get() = name.isNotBlank() && mark != null
}

@Composable
fun CreerObjectif(readSavingsCents: Long?, onCreate: (ObjectiveDraft) -> Unit, onClose: () -> Unit) {
    var draft by remember { mutableStateOf(ObjectiveDraft()) }
    var amount by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("MON OBJECTIF", fontWeight = FontWeight.Bold)
        Text("Épargne lue au départ : ${readSavingsCents?.let(::formatCents) ?: "indisponible"}")
        if (readSavingsCents == null || readSavingsCents < 0L) Text("Lis le solde de tes comptes d'épargne avant de créer l'objectif.")
        OutlinedTextField(draft.name, { draft = draft.copy(name = it) }, label = { Text("Nom de l'objectif") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(amount, { amount = it; draft = draft.copy(targetCents = parseCentsInput(it)) }, label = { Text("Montant cible en euros") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(draft.targetMonth, { draft = draft.copy(targetMonth = it) }, label = { Text("Mois visé, facultatif (AAAA-MM)") }, modifier = Modifier.fillMaxWidth())
        if (draft.targetMonth.isNotBlank() && runCatching { requireMonthKey(draft.targetMonth) }.isFailure) Text("Indique un mois valide, par exemple 2027-06.")
        Button(onClick = { onCreate(draft.copy(name = draft.name.trim())) }, enabled = draft.canSave && readSavingsCents != null && readSavingsCents >= 0L) { Text("Créer mon objectif") }
        TextButton(onClick = onClose) { Text("Retour") }
    }
}

@Composable
fun CreerPoche(onCreate: (PocketDraft) -> Unit, onClose: () -> Unit) {
    var draft by remember { mutableStateOf(PocketDraft()) }
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("NOUVELLE POCHE", fontWeight = FontWeight.Bold)
        OutlinedTextField(draft.name, { draft = draft.copy(name = it) }, label = { Text("Nom de la poche") }, modifier = Modifier.fillMaxWidth())
        Text("Cette dépense relève-t-elle du vital ou du plaisir ?")
        TextButton(onClick = { draft = draft.copy(mark = PocketMark.VITAL) }) { Text((if (draft.mark == PocketMark.VITAL) "✓ " else "") + "Vital") }
        TextButton(onClick = { draft = draft.copy(mark = PocketMark.PLEASURE) }) { Text((if (draft.mark == PocketMark.PLEASURE) "✓ " else "") + "Plaisir") }
        Text("L'enveloppe part du constat disponible. Les autres enveloppes sont réajustées pour conserver le total.")
        Button(onClick = { onCreate(draft.copy(name = draft.name.trim())) }, enabled = draft.canSave) { Text("Créer la poche") }
        TextButton(onClick = onClose) { Text("Annuler") }
    }
}

@Composable
fun CompenserPoche(
    pockets: List<PocketRecord>,
    targetPocketId: String,
    onPreview: (Long, List<String>) -> Unit,
    onConfirm: () -> Unit,
    onClose: () -> Unit,
    previewMessage: String? = null,
    canConfirm: Boolean = false,
) {
    var amount by remember(targetPocketId) { mutableStateOf("") }
    var donors by remember(targetPocketId) { mutableStateOf(emptyList<String>()) }
    var previewed by remember(targetPocketId) { mutableStateOf(false) }
    val target = pockets.find { it.id == targetPocketId }
    val increase = parseCentsInput(amount)
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("AJUSTER ${target?.name ?: "LA POCHE"}", fontWeight = FontWeight.Bold)
        OutlinedTextField(amount, { amount = it; previewed = false }, label = { Text("Augmentation en euros") }, modifier = Modifier.fillMaxWidth())
        Text("Choisis les poches qui financeront cette augmentation.")
        pockets.filter { it.id != targetPocketId }.forEach { pocket ->
            TextButton(onClick = {
                donors = if (pocket.id in donors) donors - pocket.id else donors + pocket.id
                previewed = false
            }) { Text((if (pocket.id in donors) "✓ " else "") + "${pocket.name} · ${pocket.envelopeCents?.let(::formatCents) ?: "indisponible"}") }
        }
        Button(onClick = { increase?.let { onPreview(it, donors); previewed = true } }, enabled = target != null && increase != null && increase > 0L && donors.isNotEmpty()) { Text("Voir la compensation") }
        if (previewed) previewMessage?.let { Text(it) }
        Button(onClick = onConfirm, enabled = previewed && canConfirm) { Text("Valider cette compensation") }
        TextButton(onClick = onClose) { Text("Annuler sans modifier") }
    }
}

@Composable
fun PrerequisParcours(message: String, onContinue: () -> Unit, continueLabel: String = "Compléter mes données") {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text(message)
        Button(onClick = onContinue) { Text(continueLabel) }
    }
}
