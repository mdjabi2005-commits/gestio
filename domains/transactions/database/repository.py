"""
Transaction Repository
Gestion des données pour le domaine Transactions.
"""

import logging
import sqlite3
from datetime import date
from typing import List, Optional, Dict

import pandas as pd

from shared.database.connection import get_db_connection, close_connection
from .model import Transaction

logger = logging.getLogger(__name__)

# =========================================================
# CONSTANTES
# =========================================================

TYPE_DÉPENSE = "Dépense"
TYPE_REVENU = "Revenu"
TYPE_TRANSFERT_PLUS = "Transfert+"
TYPE_TRANSFERT_MOINS = "Transfert-"

TYPES_TRANSACTION = [TYPE_DÉPENSE, TYPE_REVENU, TYPE_TRANSFERT_PLUS, TYPE_TRANSFERT_MOINS]

CATÉGORIES = [
    "Alimentation", "Voiture", "Logement", "Loisirs",
    "Santé", "Shopping", "Services", "Autre"
]

SOURCE_DÉFAUT = "manual"

# Mapping clés EN → FR (pour compatibilité)
KEYS_MAP = {
    "category": "categorie",
    "subcategory": "sous_categorie",
    "amount": "montant",
    "end_date": "date_fin",
    "account_iban": "compte_iban"
}


class TransactionRepository:
    """Repository pour gérer les transactions en base de données."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path

    @staticmethod
    def _normaliser_dict(data: Dict) -> Dict:
        """Convertit les clés EN en FR pour uniformité."""
        result = {}
        for key, value in data.items():
            new_key = KEYS_MAP.get(key, key)
            result[new_key] = value
        return result

    @staticmethod
    def _map_db_to_dict(row: dict) -> dict:
        """Mapping ligne DB vers dict (clés FR)."""
        return {
            "id": row["id"],
            "type": row["type"],
            "categorie": row["categorie"],
            "sous_categorie": row.get("sous_categorie"),
            "description": row.get("description"),
            "montant": float(row["montant"]),
            "date": row["date"],
            "source": row.get("source", SOURCE_DÉFAUT),
            "recurrence": row.get("recurrence"),
            "date_fin": row.get("date_fin"),
            "compte_iban": row.get("compte_iban"),
            "external_id": row.get("external_id")
        }

    def get_all(self) -> pd.DataFrame:
        """Récupère toutes les transactions."""
        conn = None
        try:
            conn = get_db_connection(db_path=self.db_path)
            query = "SELECT * FROM transactions ORDER BY date DESC"
            df = pd.read_sql_query(query, conn)

            if df.empty:
                return self._get_empty_df()

            # Conversion des types
            df["date"] = pd.to_datetime(df["date"]).dt.date
            df["montant"] = df["montant"].astype(float)
            df["id"] = df["id"].astype(int)

            return df

        except sqlite3.Error as e:
            logger.error(f"Erreur SQL: {e}")
            return self._get_empty_df()
        finally:
            close_connection(conn)

    @staticmethod
    def _get_empty_df() -> pd.DataFrame:
        return pd.DataFrame(columns=[
            "id", "type", "categorie", "sous_categorie", "description",
            "montant", "date", "source", "recurrence", "date_fin",
            "compte_iban", "external_id"
        ])

    @staticmethod
    def _valider(transaction: Dict) -> None:
        """Valide les champs obligatoires."""
        errors = []

        if not transaction.get("type") or transaction["type"] not in TYPES_TRANSACTION:
            errors.append(f"Type invalide: {transaction.get('type')}")

        if not transaction.get("categorie"):
            errors.append("Catégorie requise")

        try:
            montant = float(transaction.get("montant", 0))
            if montant <= 0:
                errors.append("Montant doit être > 0")
        except (ValueError, TypeError):
            errors.append("Montant invalide")

        if errors:
            raise ValueError(f"Validation échouée: {'; '.join(errors)}")

    @staticmethod
    def _préparer(transaction: Dict) -> Dict:
        """Prepare les données pour la DB."""
        # Type
        type_val = transaction.get("type", TYPE_DÉPENSE)
        if type_val.lower() in ["revenu", "income"]:
            type_val = TYPE_REVENU
        elif type_val.lower() in ["dépense", "expense", "depense"]:
            type_val = TYPE_DÉPENSE

        # Montant (toujours positif)
        montant = abs(float(transaction.get("montant", 0)))

        # Catégorie
        categorie = transaction.get("categorie", "Autre")
        if categorie:
            categorie = categorie.strip().title()
        else:
            categorie = "Autre"

        # Champs optionnels
        sous_categorie = transaction.get("sous_categorie")
        if sous_categorie and str(sous_categorie).strip():
            sous_categorie = sous_categorie.strip().title()
        else:
            sous_categorie = None

        description = transaction.get("description")
        if description and str(description).strip():
            description = description.strip()
        else:
            description = None

        # Date
        date_val = transaction.get("date")
        if hasattr(date_val, "isoformat"):
            date_str = date_val.isoformat()
        else:
            date_str = str(date_val)

        # Source
        source = transaction.get("source") or SOURCE_DÉFAUT

        return {
            "type": type_val,
            "categorie": categorie,
            "sous_categorie": sous_categorie,
            "description": description,
            "montant": montant,
            "date": date_str,
            "source": source,
            "recurrence": transaction.get("recurrence"),
            "date_fin": transaction.get("date_fin"),
            "compte_iban": transaction.get("compte_iban"),
            "external_id": transaction.get("external_id")
        }

    def add(self, transaction) -> Optional[int]:
        """
        Ajoute une transaction.
        Accepte dict ou Transaction.
        """
        conn = None
        try:
            # Normaliser en dict avec clés FR
            if isinstance(transaction, Transaction):
                tx_dict = {
                    "type": transaction.type,
                    "categorie": transaction.categorie,
                    "sous_categorie": transaction.sous_categorie,
                    "description": transaction.description,
                    "montant": transaction.montant,
                    "date": transaction.date,
                    "source": transaction.source,
                    "recurrence": transaction.recurrence,
                    "date_fin": transaction.date_fin,
                    "compte_iban": transaction.compte_iban,
                    "external_id": transaction.external_id
                }
            else:
                tx_dict = self._normaliser_dict(transaction)

            # Validation
            self._valider(tx_dict)

            # Préparation
            data = self._préparer(tx_dict)

            # Doublon par external_id
            if data.get("external_id"):
                conn = get_db_connection(db_path=self.db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM transactions WHERE external_id = ?", (data["external_id"],))
                if cursor.fetchone():
                    logger.info(f"Doublon ignoré: {data['external_id']}")
                    return None

            # Insertion
            conn = get_db_connection(db_path=self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                           INSERT INTO transactions (type, categorie, sous_categorie, description, montant, date,
                                                     source, recurrence, date_fin, compte_iban, external_id)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                           """, (
                               data["type"], data["categorie"], data["sous_categorie"],
                               data["description"], data["montant"], data["date"],
                               data["source"], data["recurrence"], data["date_fin"],
                               data["compte_iban"], data["external_id"]
                           ))

            new_id = cursor.lastrowid
            conn.commit()
            logger.info(f"Transaction ajoutée: ID {new_id}")
            return new_id

        except ValueError as e:
            logger.error(f"Validation échouée: {e}")
            return None
        except sqlite3.Error as e:
            logger.error(f"Erreur SQL: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            close_connection(conn)

    def update(self, transaction: Dict) -> bool:
        """Met à jour une transaction."""
        tx_id = transaction.get("id")
        if not tx_id:
            logger.error("ID manquant")
            return False

        conn = None
        try:
            tx_dict = self._normaliser_dict(transaction)
            self._valider(tx_dict)
            data = self._préparer(tx_dict)

            conn = get_db_connection(db_path=self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                           UPDATE transactions
                           SET type           = ?,
                               categorie      = ?,
                               sous_categorie = ?,
                               description    = ?,
                               montant        = ?,
                               date           = ?,
                               source         = ?,
                               recurrence     = ?,
                               date_fin       = ?,
                               compte_iban    = ?,
                               external_id    = ?
                           WHERE id = ?
                           """, (
                               data["type"], data["categorie"], data["sous_categorie"],
                               data["description"], data["montant"], data["date"],
                               data["source"], data["recurrence"], data["date_fin"],
                               data["compte_iban"], data["external_id"], tx_id
                           ))

            conn.commit()
            return cursor.rowcount > 0

        except Exception as e:
            logger.error(f"Erreur update: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            close_connection(conn)

    def get_by_id(self, tx_id: int) -> Optional[dict]:
        """Récupère une transaction par son ID."""
        conn = None
        try:
            conn = get_db_connection(db_path=self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,))
            row = cursor.fetchone()

            if row:
                return dict(row)
            return None
        except sqlite3.Error as e:
            logger.error(f"Erreur get_by_id: {e}")
            return None
        finally:
            close_connection(conn)

    def get_filtered(self, start_date: Optional[date] = None, end_date: Optional[date] = None,
                     category: Optional[str] = None) -> pd.DataFrame:
        """Récupère les transactions filtrées."""
        conn = None
        try:
            conn = get_db_connection(db_path=self.db_path)

            query = "SELECT * FROM transactions WHERE 1=1"
            params = []

            if start_date:
                query += " AND date >= ?"
                params.append(start_date.isoformat())

            if end_date:
                query += " AND date <= ?"
                params.append(end_date.isoformat())

            if category:
                query += " AND categorie = ?"
                params.append(category)

            query += " ORDER BY date DESC"

            df = pd.read_sql_query(query, conn, params=params)

            if df.empty:
                return self._get_empty_df()

            # Conversion des types
            df["date"] = pd.to_datetime(df["date"]).dt.date
            df["montant"] = df["montant"].astype(float)
            df["id"] = df["id"].astype(int)

            return df

        except sqlite3.Error as e:
            logger.error(f"Erreur get_filtered: {e}")
            return self._get_empty_df()
        finally:
            close_connection(conn)

    def delete(self, transaction_id: int | List[int]) -> bool:
        """
        Supprime une ou plusieurs transactions.
        
        Args:
            transaction_id: Un seul ID (int) ou une liste d'IDs (List[int])
        
        Returns:
            True si succès, False sinon
            
        Examples:
            >>> delete(42)  # Supprime la transaction 42
            >>> delete([42, 43, 44])  # Supprime les transactions 42, 43, 44
        """
        conn = None
        try:
            # Normaliser en liste
            if isinstance(transaction_id, int):
                ids = [transaction_id]
            else:
                ids = transaction_id

            if not ids:
                return True

            conn = get_db_connection(db_path=self.db_path)
            cursor = conn.cursor()

            # Utiliser IN clause (fonctionne pour 1 ou N IDs)
            placeholders = ','.join('?' * len(ids))
            query = f"DELETE FROM transactions WHERE id IN ({placeholders})"
            cursor.execute(query, ids)

            conn.commit()
            deleted_count = cursor.rowcount
            logger.info(f"{deleted_count} transaction(s) supprimée(s)")
            return True

        except sqlite3.Error as e:
            logger.error(f"Erreur delete: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            close_connection(conn)


# Instance unique
transaction_repository = TransactionRepository()
