package com.gestio.core.services.consultation

import com.gestio.core.storage.GestioStore
import com.gestio.core.storage.ImportedStatement

/** Reads the normalized contract produced by the PC's PDF extractor. */
class LectureReleves(private val store: GestioStore) {
    fun importerJson(payload: String, rulesDocument: String? = null) = store.ingestJson(payload).also {
        if (it.inserted > 0 && rulesDocument != null) store.categorize(rulesDocument)
    }

    fun importerReleve(payload: String, statement: ImportedStatement, rulesDocument: String? = null) =
        store.ingestStatement(payload, statement).also {
            if (it.ingestion?.inserted?.let { count -> count > 0 } == true && rulesDocument != null) {
                store.categorize(rulesDocument)
            }
        }
}
