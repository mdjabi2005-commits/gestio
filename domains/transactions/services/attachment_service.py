"""
Service de gestion des pièces jointes (fichiers physiques + métadonnées DB).
"""

import logging
import os
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Optional

from ..database.model_attachment import TransactionAttachment
from ..database.repository_attachment import attachment_repository
from config.paths import SORTED_DIR, REVENUS_TRAITES

logger = logging.getLogger(__name__)

class AttachmentService:
    """
    Service unifié pour gérer les fichiers attachés aux transactions.
    Gère le stockage physique (déplacement/rangement) ET la persistance BDD.
    """

    def add_attachment(self, transaction_id: int, file_obj, filename: str, category: str, subcategory: str, transaction_type: str = "Dépense") -> bool:
        """
        Ajoute un fichier:
        1. Le déplace au bon endroit (Tickets ou Revenus)
        2. L'enregistre en BDD
        """
        try:
            # 1. Gestion du fichier physique
            if not isinstance(file_obj, (str, Path)):
                logger.error("add_attachment requiert un chemin de fichier source (str/Path)")
                return False
                
            source_path = str(file_obj)
            
            # Appel interne pour déplacer
            final_path = self.move_file_to_category_folder(
                source_path=source_path,
                transaction_type=transaction_type,
                category=category,
                subcategory=subcategory,
                filename=filename
            )
            
            if not final_path:
                return False
            
            file_size = Path(final_path).stat().st_size
            
            # 2. Persistance BDD
            attachment = TransactionAttachment(
                transaction_id=transaction_id,
                file_path=str(final_path),
                file_name=filename,
                file_type=Path(filename).suffix.lower(),
                size=file_size
            )
            
            new_id = attachment_repository.add_attachment(attachment)
            
            if new_id:
                logger.info(f"Attachment ajouté: {filename} (ID: {new_id}) -> {final_path}")
                return True
            else:
                logger.error("Echec DB, impossible de lier le fichier (fichier déplacé mais orphelin en DB)")
                return False

        except Exception as e:
            logger.error(f"Erreur add_attachment: {e}")
            return False

    def move_file_to_category_folder(self, source_path: str, transaction_type: str, category: str, subcategory: str, filename: str) -> str:
        """
        Déplace un fichier vers le dossier final organisé par Catégorie/Sous-Catégorie.
        
        Args:
            source_path (str): Chemin actuel du fichier (ex: temp_ocr/...)
            transaction_type (str): 'Revenu' ou autre ('Dépense')
            category (str): Catégorie de la transaction
            subcategory (str): Sous-catégorie (peut être vide/None)
            filename (str): Nom du fichier
            
        Returns:
            str: Le nouveau chemin absolu du fichier
        """
        try:
            # 1. Déterminer la racine
            # Si Type = Revenu -> REVENUS_TRAITES
            # Sinon (Dépense, Virement...) -> SORTED_DIR (tickets_tries)
            if transaction_type and transaction_type.lower() == "revenu":
                root_dir = Path(REVENUS_TRAITES)
            else:
                root_dir = Path(SORTED_DIR)

            # 2. Construire le chemin cible
            # Structure: ROOT/Category[/Subcategory]/filename
            target_dir = root_dir / self._sanitize_path_part(category)
            
            if subcategory and subcategory.strip():
                target_dir = target_dir / self._sanitize_path_part(subcategory)
            
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # 3. Gérer les collisions de nom (Timestamping)
            timestamp = int(datetime.now().timestamp())
            clean_name = self._sanitize_filename(filename)
            unique_name = f"{timestamp}_{clean_name}"
            
            target_path = target_dir / unique_name
            
            # 4. Déplacement
            src = Path(source_path)
            if not src.exists():
                logger.error(f"Fichier source introuvable: {source_path}")
                return None
                
            shutil.move(str(src), str(target_path))
            return str(target_path)

        except Exception as e:
            logger.error(f"Erreur lors du déplacement du fichier {filename}: {e}")
            return None

    @staticmethod
    def _sanitize_path_part(name: str) -> str:
        """Nettoie une partie de chemin."""
        if not name: return "Autre"
        return "".join(c for c in name if c.isalnum() or c in " ._-").strip()

    @staticmethod
    def _sanitize_filename(name: str) -> str:
        """Nettoie un nom de fichier."""
        return "".join(c for c in name if c.isalnum() or c in "._-").strip()

    def delete_attachment(self, attachment_id: int) -> bool:
        """
        Supprime un fichier (DB + Disque).
        """
        try:
            # 1. Récupérer infos via DF
            df = attachment_repository.get_all_attachments()
            attachment_row = df[df['id'] == attachment_id]
            
            if attachment_row.empty:
                return False
            
            file_path = attachment_row.iloc[0]['file_path']
            
            # 2. Suppression DB
            if not attachment_repository.delete_attachment(attachment_id):
                return False
            
            # 3. Suppression Physique
            if file_path:
                path = Path(file_path)
                if path.exists():
                    try:
                        path.unlink()
                        logger.info(f"Fichier physique supprimé: {path}")
                    except Exception as e:
                        logger.warning(f"Impossible de supprimer le fichier physique {path}: {e}")
            
            return True

        except Exception as e:
            logger.error(f"Erreur delete_attachment {attachment_id}: {e}")
            return False

    def get_attachments(self, transaction_id: int) -> List[TransactionAttachment]:
        """Récupère la liste des pièces jointes pour une transaction."""
        df = attachment_repository.get_all_attachments()
        if df.empty:
            return []
            
        filtered_df = df[df['transaction_id'] == transaction_id]
        attachments = []
        for _, row in filtered_df.iterrows():
            attachments.append(self._map_row_to_model(row.to_dict()))
        return attachments

    def get_file_content(self, attachment_id: int) -> Optional[bytes]:
        """Lit le contenu binaire d'une pièce jointe."""
        df = attachment_repository.get_all_attachments()
        if df.empty:
            return None
            
        row = df[df['id'] == attachment_id]
        if row.empty:
            return None
            
        file_path = row.iloc[0]['file_path']
        if not file_path:
            return None
            
        path = Path(file_path)
        if path.exists():
            return path.read_bytes()
        return None

    def _map_row_to_model(self, row: dict) -> TransactionAttachment:
        """Helper mapping DataFrame row -> Model"""
        return TransactionAttachment(
            id=row['id'],
            transaction_id=row['transaction_id'],
            file_path=row['file_path'],
            file_name=row['file_name'],
            file_type=row['file_type'],
            upload_date=row['upload_date'],
            size=row['size']
        )

# Singleton
attachment_service = AttachmentService()
