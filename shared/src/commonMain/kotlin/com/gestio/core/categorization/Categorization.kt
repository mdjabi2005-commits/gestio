package com.gestio.core.categorization

import com.gestio.core.model.NormalizedTransaction
import com.gestio.core.transfers.detectInternalTransfers

data class CategoryRule(val pattern: String, val category: String)

data class CategoryAssignment(val transactionId: String, val category: String)

data class CategorizationReport(
    val assignments: List<CategoryAssignment>,
    val categoryCounts: Map<String, Int>,
) {
    val assigned: Int get() = assignments.size
    val uncategorized: Int get() = categoryCounts["non catégorisé"] ?: 0
}

fun loadCategoryRules(document: String): List<CategoryRule> {
    var section = ""
    return document.lineSequence().flatMap { line ->
        when {
            line.startsWith("### ") -> {
                section = line.removePrefix("### ").trim()
                emptySequence()
            }
            line.startsWith("## ") -> {
                section = ""
                emptySequence()
            }
            section.isEmpty() || !line.trimStart().startsWith("|") -> emptySequence()
            else -> {
                val cells = line.trim().trim('|').split('|').map(String::trim)
                if (cells.size < 2 || cells[0].isEmpty() || cells[0].all { it == '-' || it == ':' } ||
                    cells[0].equals("Pattern libellé", ignoreCase = true) || cells[0] == "Pattern") {
                    emptySequence()
                } else {
                    val category = categoryForSection(section, cells) ?: return@flatMap emptySequence()
                    patterns(cells[0]).asSequence().map { CategoryRule(it, category) }
                }
            }
        }
    }.toList()
}

fun categorizeTransactions(
    transactions: List<NormalizedTransaction>,
    document: String,
): CategorizationReport {
    val rules = loadCategoryRules(document)
    val internalIds = detectInternalTransfers(transactions).flatMap { listOf(it.debitId, it.creditId) }.toSet()
    val assignments = transactions.sortedWith(compareBy<NormalizedTransaction> { it.bookingDate }.thenBy { it.id }).map {
        val category = if (it.id in internalIds) "interne" else matchCategory(rules, it.rawDescription, it.cleanDescription)
        CategoryAssignment(it.id, category)
    }
    return CategorizationReport(assignments, assignments.groupingBy { it.category }.eachCount().toSortedMap())
}

private fun categoryForSection(section: String, cells: List<String>): String? = when {
    section.startsWith("Poche :") -> section.removePrefix("Poche :").trim().trim('*')
    section.startsWith("Charges fixes") || section.startsWith("Virements internes") || section.startsWith("Revenus") -> cleanCell(cells[1])
    else -> null
}

private fun patterns(value: String): List<String> {
    val matches = Regex("`([^`]+)`").findAll(value).map { it.groupValues[1] }.toList()
    return matches.ifEmpty { listOf(cleanCell(value)) }
}

private fun cleanCell(value: String): String = value.trim().trim('`').trim('*').trim()

private fun matchCategory(rules: List<CategoryRule>, raw: String, clean: String): String {
    val text = normalize("$raw $clean")
    return rules.firstOrNull { normalize(it.pattern) in text }?.category ?: "non catégorisé"
}

private fun normalize(value: String): String = value.lowercase().split(Regex("\\s+")).joinToString(" ")
