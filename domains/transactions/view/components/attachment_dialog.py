"""
Composant Modal pour la gestion des pièces jointes.
"""

import streamlit as st
import pandas as pd
from typing import Optional
from domains.transactions.services.attachment_service import attachment_service
from shared.ui.toast_components import toast_success, toast_error

@st.dialog("📎 Gestion des pièces jointes")
def open_attachment_dialog(transaction_id: int):
    """
    Affiche une modale pour gérer les fichiers d'une transaction.
    """
    st.write(f"Transaction ID: **{transaction_id}**")
    
    # 1. Upload Nouveau Fichier
    uploaded_files = st.file_uploader(
        "Ajouter des fichiers", 
        accept_multiple_files=True,
        type=["png", "jpg", "jpeg", "pdf"]
    )
    
    if uploaded_files:
        if st.button("Envoyer", type="primary"):
            success_count = 0
            for f in uploaded_files:
                if attachment_service.add_attachment(transaction_id, f, f.name):
                    success_count += 1
            
            if success_count > 0:
                toast_success(f"{success_count} fichier(s) ajouté(s) !")
                st.rerun()
            else:
                toast_error("Erreur lors de l'envoi")
    
    st.divider()
    
    # 2. Liste des fichiers existants
    attachments = attachment_service.get_attachments(transaction_id)
    
    if not attachments:
        st.info("Aucune pièce jointe.")
    else:
        st.write(f"**{len(attachments)}** document(s) attaché(s) :")
        
        for att in attachments:
            c1, c2, c3 = st.columns([1, 4, 1])
            
            with c1:
                if att.file_type and "pdf" in att.file_type:
                    st.write("📄")
                else:
                    st.write("🖼️")
            
            with c2:
                st.write(f"**{att.file_name}**")
                st.caption(f"Ajouté le {att.upload_date} • {att.size} octets")
            
            with c3:
                # Bouton Supprimer
                if st.button("🗑️", key=f"del_att_{att.id}"):
                    if attachment_service.delete_attachment(att.id):
                        toast_success("Supprimé !")
                        st.rerun()
                    else:
                        toast_error("Erreur suppression")
            
            st.divider()
