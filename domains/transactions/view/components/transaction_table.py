"""
Transaction Table Component - Version Minimaliste
Inspiré du POC data_editor.py
"""

import logging

import streamlit as st

from domains.transactions.database import TRANSACTION_TYPES
from shared.ui.toast_components import toast_success, toast_error


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
            "category": st.column_config.TextColumn(
                "Catégorie",
                required=True,
                help="Catégorie de la transaction"
            ),
            "subcategory": st.column_config.TextColumn("Sous-catégorie"),
            "amount": st.column_config.NumberColumn(
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

        column_order=["Supprimer", "date", "type", "category", "subcategory", "amount", "description",
                      "Pieces Jointes"],
        hide_index=True,
        num_rows="dynamic",  # Permet l'ajout de lignes
        key="transaction_editor",
        use_container_width=True
    )

    # ========== GESTION DES ATTACHMENTS (EXPANDER) ==========
    # Logique Réactive : On affiche l'expander pour la dernière ligne dont la case est cochée

    selected_tx_id = None
    edited_rows = st.session_state.get("transaction_editor", {}).get("edited_rows", {})

    # Parcourir les modifications pour trouver si une case est cochée
    # On prend la dernière modification trouvée (ou la première, peu importe)
    for idx, changes in edited_rows.items():
        if changes.get("Pieces Jointes") is True:
            if idx < len(df):
                tx_id = df.iloc[idx]["id"]
                if tx_id:
                    selected_tx_id = tx_id
            # On ne break pas forcément, ou si on veut juste le premier.
            # Pas de st.rerun() ici pour éviter la boucle infinie !

    # Affichage de l'expander si une transaction est sélectionnée
    if selected_tx_id:
        st.write("---")
        # On utilise un key dynamique pour que ça se refresh si on change de transaction
        with st.expander(f"📂 Pièces jointes (Transaction {selected_tx_id})", expanded=True):
            st.info("💡 Décochez la case dans le tableau pour fermer ce panneau.")

            # Réutilisation de la logique du dialog mais inline
            from domains.transactions.services.attachment_service import attachment_service

            # 1. Upload
            uploaded_files = st.file_uploader(
                "Ajouter des fichiers",
                accept_multiple_files=True,
                type=["png", "jpg", "jpeg", "pdf"],
                key=f"uploader_{selected_tx_id}"
            )

            if uploaded_files:
                if st.button("Envoyer", type="primary", key=f"send_{selected_tx_id}"):
                    success_count = 0
                    for f in uploaded_files:
                        from streamlit.runtime.uploaded_file_manager import UploadedFile as _UF
                        uf: _UF = f  # type: ignore[assignment]
                        if attachment_service.add_attachment(selected_tx_id, uf, uf.name):
                            success_count += 1

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

    # Utiliser st.session_state pour détecter les modifications
    edited_rows = st.session_state.get("transaction_editor", {}).get("edited_rows", {})
    added_rows = st.session_state.get("transaction_editor", {}).get("added_rows", [])

    # Filtrer les modifications pour ignorer celles qui ne concernent que "Supprimer"
    real_edits = 0
    for row_idx, changes in edited_rows.items():
        # Vérifier si les changements contiennent d'autres colonnes que "Supprimer" ou "Pieces Jointes"
        other_columns = [col for col in changes.keys() if col not in ["Supprimer", "Pieces Jointes"]]
        if other_columns:
            real_edits += 1

    has_modifications = real_edits > 0 or len(added_rows) > 0

    # ========== AFFICHAGE ET ACTIONS ==========
    if to_delete > 0 or has_modifications:
        st.info(
            f"🔄 Changements détectés: {int(to_delete)} suppression(s), {real_edits} modification(s), {len(added_rows)} ajout(s)")

        col1, col2 = st.columns(2)

        with col1:
            if st.button("💾 Sauvegarder", type="primary", use_container_width=True):
                try:
                    # Initialiser les logs de debug et system logger
                    debug_logs = []
                    logger = logging.getLogger(__name__)
                    logger.info("Début sauvegarde modifications tableau transactions")

                    # 1. Calculer les suppressions d'abord
                    deleted_ids = result[result["Supprimer"] == True]["id"].tolist()

                    debug_logs.append("🔍 DEBUG - Début sauvegarde")
                    # Suppression des transactions
                    if deleted_ids:
                        logger.info(f"Suppression de {len(deleted_ids)} transaction(s): {deleted_ids}")

                        # Supprimer les attachments associés
                        from domains.transactions.services.attachment_service import attachment_service
                        for tid in deleted_ids:
                            attachments = attachment_service.get_attachments(tid)
                            for att in attachments:
                                attachment_service.delete_attachment(att.id)

                        # Supprimer les transactions
                        if transaction_repository.delete(deleted_ids):
                            toast_success(f"{len(deleted_ids)} transaction(s) supprimée(s)")
                        else:
                            toast_error(f"Erreur lors de la suppression: {deleted_ids}")

                    # 2. Mettre à jour les lignes modifiées
                    for row_idx, changes in edited_rows.items():
                        # Récupérer la ligne complète avec les modifications depuis result
                        updated_row = result.iloc[row_idx].drop("Supprimer").to_dict()

                        debug_logs.append(f"📝 Modification ligne {row_idx}: {updated_row}")

                        # L'ID est déjà dans updated_row
                        if updated_row.get('id'):
                            # Convertir les valeurs vides en None pour category et subcategory
                            if 'category' in updated_row and updated_row['category'] == '':
                                updated_row['category'] = None
                            if 'subcategory' in updated_row and updated_row['subcategory'] == '':
                                updated_row['subcategory'] = None

                            success = transaction_repository.update(updated_row)
                            debug_logs.append(f"  → Résultat: {'✅ OK' if success else '❌ ERREUR'}")
                            if not success:
                                logger.error(f"Echec update transaction {updated_row.get('id')}")

                    # 3. Ajouter les nouvelles lignes
                    for new_row in added_rows:
                        debug_logs.append(f"➕ Ajout: {new_row}")
                        # Convertir en dict et ajouter
                        transaction_dict = new_row
                        success = transaction_repository.add(transaction_dict)
                        debug_logs.append(f"  → Résultat: {'✅ OK' if success else '❌ ERREUR'}")
                        if not success:
                            logger.error("Echec ajout nouvelle transaction depuis tableau")

                    # Stocker les logs dans session_state
                    st.session_state['last_save_logs'] = debug_logs

                    logger.info("Fin sauvegarde modifications tableau")

                    # Construire un message détaillé
                    success_msgs = []
                    if deleted_ids:
                        success_msgs.append(f"🗑️ {len(deleted_ids)} supprimée(s)")
                    if added_rows:
                        success_msgs.append(f"➕ {len(added_rows)} ajoutée(s)")
                    if edited_rows:
                        success_msgs.append(f"✏️ {len(edited_rows)} modifiée(s)")

                    toast_message = " | ".join(success_msgs) if success_msgs else "Modifications sauvegardées !"
                    toast_success(toast_message, duration=4000)
                    st.balloons()
                    st.rerun()

                except Exception as e:
                    from config.logging_config import log_error
                    trace_id = log_error(e, "Erreur sauvegarde tableau transactions")
                    st.error(f"Erreur lors de la sauvegarde (TraceID: {trace_id})")

        # Afficher les logs de la dernière sauvegarde
        if 'last_save_logs' in st.session_state and st.session_state['last_save_logs']:
            with st.expander("📋 Logs de la dernière sauvegarde", expanded=True):
                for log in st.session_state['last_save_logs']:
                    st.write(log)
                if st.button("🗑️ Effacer les logs"):
                    st.session_state['last_save_logs'] = []
                    st.rerun()

        with col2:
            if st.button("↩️ Annuler", use_container_width=True):
                st.rerun()
