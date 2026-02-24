"""
Transaction Table Component - Version Minimaliste
Inspiré du POC data_editor.py
"""

import logging

import streamlit as st

from config.logging_config import log_error
from domains.transactions.database import TRANSACTION_TYPES
from domains.transactions.services.attachment_service import attachment_service
from shared.ui.toast_components import toast_success, toast_error, toast_warning

logger = logging.getLogger(__name__)


def render_transaction_table(filtered_df, transaction_repository):
    """
    Affiche le tableau des transactions en mode éditable.
    Utilise st.session_state pour détecter les changements.
    """
    st.subheader("📝 Transactions (Éditable)")

    if filtered_df.empty:
        st.info("Aucune transaction sur cette période/catégorie.")
        return

    # ========== PRÉPARATION DES DONNÉES ==========
    # Trier par date décroissante
    df = filtered_df.sort_values('date', ascending=False).reset_index(drop=True)

    # Ajouter colonne "Supprimer"
    df.insert(0, "Supprimer", False)
    # Ajouter colonne "Pieces Jointes" pour le bouton d'action
    df.insert(1, "Pieces Jointes", False)

    # ========== DATA EDITOR ==========
    result = st.data_editor(
        df,
        column_config={
            "Supprimer": st.column_config.CheckboxColumn(
                "🗑️",
                default=False,
                help="Cocher pour supprimer"
            ),
            "id": st.column_config.TextColumn("ID", disabled=True),
            "date": st.column_config.DateColumn("Date", format="DD/MM/YYYY"),
            "type": st.column_config.SelectboxColumn(
                "Type",
                options=sorted(TRANSACTION_TYPES),
                required=True
            ),
            "categorie": st.column_config.TextColumn(
                "Catégorie",
                required=True,
                help="Catégorie de la transaction"
            ),
            "sous_categorie": st.column_config.TextColumn("Sous-catégorie"),
            "montant": st.column_config.NumberColumn(
                "Montant",
                format="%.2f €",
                min_value=0
            ),
            "description": st.column_config.TextColumn("Description"),
            "Pieces Jointes": st.column_config.CheckboxColumn(
                "📎",
                default=False,
                help="Cocher pour gérer les fichiers"
            )
        },
        column_order=["Supprimer", "date", "type", "categorie", "sous_categorie", "montant", "description",
                      "Pieces Jointes"],
        hide_index=True,
        num_rows="dynamic",  # Permet l'ajout de lignes
        key="transaction_editor",
        use_container_width=True,
        height=390,
    )

    # ========== GESTION DES ATTACHMENTS (EXPANDER) ==========
    selected_tx_id = None
    editor_state = st.session_state.get("transaction_editor", {})
    edited_rows = editor_state.get("edited_rows", {})
    added_rows = editor_state.get("added_rows", [])

    for idx, changes in edited_rows.items():
        if changes.get("Pieces Jointes") is True:
            if idx < len(df):
                tx_id = df.iloc[idx]["id"]
                if tx_id:
                    selected_tx_id = tx_id

    if selected_tx_id:
        st.write("---")
        with st.expander(f"📂 Pièces jointes (Transaction {selected_tx_id})", expanded=True):
            st.info("💡 Décochez la case dans le tableau pour fermer ce panneau.")

            # 1. Upload
            uploaded_files = st.file_uploader(
                "Ajouter des fichiers",
                accept_multiple_files=True,
                type=["png", "jpg", "jpeg", "pdf"],
                key=f"uploader_{selected_tx_id}"
            )

            if uploaded_files:
                if st.button("Envoyer", type="primary", key=f"send_{selected_tx_id}"):
                    success_count = sum(
                        1 for f in uploaded_files
                        if attachment_service.add_attachment(selected_tx_id, f, f.name)  # type: ignore[union-attr]
                    )
                    if success_count > 0:
                        toast_success(f"{success_count} fichier(s) ajouté(s) !")
                        st.rerun()
                    else:
                        toast_error("Erreur lors de l'envoi")

            st.divider()

            # 2. Liste
            attachments = attachment_service.get_attachments(selected_tx_id)
            if not attachments:
                st.info("Aucune pièce jointe.")
            else:
                st.write(f"**{len(attachments)}** document(s) attaché(s) :")
                for att in attachments:
                    c1, c2, c3 = st.columns([1, 4, 1])
                    with c1:
                        st.write("📄" if att.file_type and "pdf" in att.file_type else "🖼️")
                    with c2:
                        st.write(f"**{att.file_name}**")
                        st.caption(f"{att.upload_date}")
                    with c3:
                        if st.button("🗑️", key=f"del_att_{att.id}"):
                            if attachment_service.delete_attachment(att.id):
                                toast_success("Supprimé !")
                                st.rerun()

    # ========== DÉTECTION DES CHANGEMENTS (SAUVEGARDE) ==========
    to_delete = result["Supprimer"].sum()

    real_edits = sum(
        1 for changes in edited_rows.values()
        if any(col not in ("Supprimer", "Pieces Jointes") for col in changes)
    )
    has_modifications = real_edits > 0 or len(added_rows) > 0

    # ========== AFFICHAGE ET ACTIONS ==========
    if to_delete > 0 or has_modifications:
        st.info(
            f"🔄 Changements détectés: {int(to_delete)} suppression(s), "
            f"{real_edits} modification(s), {len(added_rows)} ajout(s)"
        )

        col1, col2 = st.columns(2)

        with col1:
            if st.button("💾 Sauvegarder", type="primary", use_container_width=True):
                try:
                    debug_logs = []
                    logger.info("Début sauvegarde modifications tableau transactions")

                    # 1. Suppressions
                    deleted_ids = result[result["Supprimer"] == True]["id"].tolist()
                    debug_logs.append("🔍 DEBUG - Début sauvegarde")

                    if deleted_ids:
                        logger.info(f"Suppression de {len(deleted_ids)} transaction(s): {deleted_ids}")

                        # Détecter les fichiers physiques associés AVANT suppression DB
                        files_to_ask = []
                        for tid in deleted_ids:
                            atts = attachment_service.get_attachments(int(tid))
                            for att in atts:
                                physical = attachment_service.find_file(att.file_name)
                                if physical and physical.exists():
                                    files_to_ask.append((att.file_name, str(physical)))

                        # Suppression DB (CASCADE retire transaction_attachments automatiquement)
                        if transaction_repository.delete(deleted_ids):
                            toast_success(f"{len(deleted_ids)} transaction(s) supprimée(s) de la base")
                            # Stocker les fichiers à demander en session_state
                            if files_to_ask:
                                st.session_state['pending_physical_delete'] = files_to_ask
                        else:
                            toast_error(f"Erreur lors de la suppression: {deleted_ids}")

                    # 2. Modifications
                    for row_idx, changes in edited_rows.items():
                        updated_row = result.iloc[row_idx].drop("Supprimer").to_dict()
                        debug_logs.append(f"📝 Modification ligne {row_idx}: {updated_row}")

                        if updated_row.get('id'):
                            if updated_row.get('categorie') == '':
                                updated_row['categorie'] = None
                            if updated_row.get('sous_categorie') == '':
                                updated_row['sous_categorie'] = None

                            success = transaction_repository.update(updated_row)
                            debug_logs.append(f"  → Résultat: {'✅ OK' if success else '❌ ERREUR'}")
                            if not success:
                                logger.error(f"Echec update transaction {updated_row.get('id')}")

                    # 3. Ajouts
                    for new_row in added_rows:
                        debug_logs.append(f"➕ Ajout: {new_row}")
                        success = transaction_repository.add(new_row)
                        debug_logs.append(f"  → Résultat: {'✅ OK' if success else '❌ ERREUR'}")
                        if not success:
                            logger.error("Echec ajout nouvelle transaction depuis tableau")

                    st.session_state['last_save_logs'] = debug_logs
                    logger.info("Fin sauvegarde modifications tableau")

                    success_msgs = []
                    if deleted_ids:
                        success_msgs.append(f"🗑️ {len(deleted_ids)} supprimée(s)")
                    if added_rows:
                        success_msgs.append(f"➕ {len(added_rows)} ajoutée(s)")
                    if edited_rows:
                        success_msgs.append(f"✏️ {len(edited_rows)} modifiée(s)")

                    toast_success(" | ".join(success_msgs) if success_msgs else "Modifications sauvegardées !", duration=4000)
                    st.balloons()
                    st.rerun()

                except Exception as e:
                    trace_id = log_error(e, "Erreur sauvegarde tableau transactions")
                    toast_error(f"Erreur lors de la sauvegarde (TraceID: {trace_id})")

        with col2:
            if st.button("↩️ Annuler", use_container_width=True):
                st.rerun()

    # ========== CONFIRMATION SUPPRESSION FICHIERS PHYSIQUES ==========
    pending = st.session_state.get('pending_physical_delete', [])
    if pending:
        toast_warning(
            f"⚠️ {len(pending)} fichier(s) physique(s) associé(s) aux transactions supprimées :"
        )
        for fname, fpath in pending:
            st.caption(f"📄 `{fname}`")

        col_yes, col_no = st.columns(2)
        with col_yes:
            if st.button("🗑️ Supprimer aussi les fichiers", type="primary", use_container_width=True):
                deleted_count = 0
                for fname, fpath in pending:
                    try:
                        from pathlib import Path as _Path
                        p = _Path(fpath)
                        if p.exists():
                            p.unlink()
                            deleted_count += 1
                            logger.info(f"Fichier physique supprimé: {p}")
                    except Exception as e:
                        logger.warning(f"Impossible de supprimer {fpath}: {e}")
                st.session_state.pop('pending_physical_delete', None)
                toast_success(f"{deleted_count} fichier(s) supprimé(s)")
                st.rerun()
        with col_no:
            if st.button("📁 Conserver les fichiers", use_container_width=True):
                st.session_state.pop('pending_physical_delete', None)
                toast_success("Fichiers conservés sur le disque")
                st.rerun()

    if 'last_save_logs' in st.session_state and st.session_state['last_save_logs']:
        with st.expander("📋 Logs de la dernière sauvegarde", expanded=True):
            for log in st.session_state['last_save_logs']:
                st.write(log)
            if st.button("🗑️ Effacer les logs"):
                st.session_state['last_save_logs'] = []
                st.rerun()

