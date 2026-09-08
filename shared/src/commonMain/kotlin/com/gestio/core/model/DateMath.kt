package com.gestio.core.model

internal data class ParsedDate(val year: Int, val month: Int, val day: Int)

internal fun parseIsoDate(value: String): ParsedDate {
    require(Regex("\\d{4}-\\d{2}-\\d{2}").matches(value)) { "invalid ISO date: $value" }
    val parsed = ParsedDate(value.substring(0, 4).toInt(), value.substring(5, 7).toInt(), value.substring(8, 10).toInt())
    require(parsed.month in 1..12) { "invalid ISO month: $value" }
    require(parsed.day in 1..daysInMonth(parsed.year, parsed.month)) { "invalid ISO day: $value" }
    return parsed
}

internal fun monthKey(date: String): String {
    parseIsoDate(date)
    return date.substring(0, 7)
}

internal fun compareDates(left: String, right: String): Int = dayNumber(left).compareTo(dayNumber(right))

internal fun absoluteDaysBetween(left: String, right: String): Int = kotlin.math.abs(dayNumber(left) - dayNumber(right))

internal fun nextMonth(month: String): String {
    val parsed = parseIsoDate("$month-01")
    return if (parsed.month == 12) "%04d-01".format(parsed.year + 1)
    else "%04d-%02d".format(parsed.year, parsed.month + 1)
}

internal fun previousMonth(month: String): String {
    val parsed = parseIsoDate("$month-01")
    return if (parsed.month == 1) "%04d-12".format(parsed.year - 1)
    else "%04d-%02d".format(parsed.year, parsed.month - 1)
}

private fun daysInMonth(year: Int, month: Int): Int = when (month) {
    2 -> if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) 29 else 28
    4, 6, 9, 11 -> 30
    else -> 31
}

private fun dayNumber(value: String): Int {
    val date = parseIsoDate(value)
    var year = date.year
    val month = date.month
    year -= if (month <= 2) 1 else 0
    val era = year / 400
    val yearOfEra = year - era * 400
    val monthPrime = month + if (month > 2) -3 else 9
    val dayOfYear = (153 * monthPrime + 2) / 5 + date.day - 1
    val dayOfEra = yearOfEra * 365 + yearOfEra / 4 - yearOfEra / 100 + dayOfYear
    return era * 146097 + dayOfEra
}
