package com.gestio.core.services.consultation

import com.gestio.core.storage.GestioStore

/** Owns the encrypted database lifetime for one application operation. */
class LectureDonneesLocales(private val key: String) {
    fun <T> utiliser(block: (GestioStore) -> T): T = GestioStore(key).use(block)
}
