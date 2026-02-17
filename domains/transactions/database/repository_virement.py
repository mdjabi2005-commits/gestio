"""
Repository pour gérer les virements internes (table 'virements').
"""

import logging
import sqlite3
import pandas as pd
from typing import List, Optional
from datetime import datetime

from .model_virement import Virement
from shared.database.connection import get_db_connection, close_connection

logger = logging.getLogger(__name__)

class VirementRepository:
    """
    Repository pour gérer les virements internes (table 'virements').
    """
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path
        
    def _map_db_to_model(self, row: dict) -> Virement:
        return Virement(
            id=row['id'],
            date=row['date'],
            description=row.get('description'),
            amount=float(row['amount']),
            iban_source=row.get('iban_source'),
            iban_destination=row.get('iban_destination'),
            external_id_source=row.get('external_id_source'),
            external_id_destination=row.get('external_id_destination'),
            type=row.get('type', 'Transfert'),
            source=row.get('source', 'manual')
        )

    def get_all_virements(self) -> pd.DataFrame:
        """
        Récupère tous les virements sous forme de DataFrame.
        """
        conn = None
        try:
            conn = get_db_connection(db_path=self.db_path)
            query = "SELECT * FROM virements ORDER BY date DESC"
            df = pd.read_sql_query(query, conn)
            
            if df.empty:
                return self._get_empty_dataframe()
                
            # Conversion types
            df['date'] = pd.to_datetime(df['date']).dt.date
            df['amount'] = df['amount'].astype(float)
            df['id'] = df['id'].astype(int)
            
            return df
        except sqlite3.Error as e:
            logger.error(f"Erreur SQL get_all_virements: {e}")
            return self._get_empty_dataframe()
        finally:
            close_connection(conn)

    def _get_empty_dataframe(self) -> pd.DataFrame:
        """Retourne un DF vide avec la bonne structure"""
        return pd.DataFrame(columns=[
            'id', 'date', 'description', 'amount', 'iban_source', 
            'iban_destination', 'external_id_source', 'external_id_destination', 'type', 'source'
        ])
    
    # Méthodes d'écriture (ADD, UPDATE, DELETE) conservées telles quelles pour l'instant
    # car elles prennent un objet Virement ou un ID.
    
    def add_virement(self, virement: Virement) -> bool:
        conn = None
        try:
            conn = get_db_connection(db_path=self.db_path)
            cursor = conn.cursor()
            
            # Check doublon si external_id_source existe
            if virement.external_id_source:
                cursor.execute("SELECT id FROM virements WHERE external_id_source = ?", (virement.external_id_source,))
                if cursor.fetchone():
                    logger.info(f"Virement déjà existant (ext_id: {virement.external_id_source}). Ignoré.")
                    return False
            
            cursor.execute("""
                INSERT INTO virements 
                (date, description, amount, iban_source, iban_destination, external_id_source, external_id_destination, type, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                virement.date.isoformat() if hasattr(virement.date, "isoformat") else str(virement.date),
                virement.description, virement.amount, virement.iban_source,
                virement.iban_destination, virement.external_id_source,
                virement.external_id_destination, virement.type, virement.source
            ))
            conn.commit()
            return True
        except sqlite3.Error as e:
            logger.error(f"Erreur add_virement: {e}")
            return False
        finally:
            close_connection(conn)

    def update_virement(self, virement: Virement) -> bool:
        if not virement.id: return False
        conn = None
        try:
            conn = get_db_connection(db_path=self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE virements
                SET date = ?, description = ?, amount = ?, 
                iban_source = ?, iban_destination = ?, 
                external_id_source = ?, external_id_destination = ?,
                type = ?
                WHERE id = ?
            """, (
                virement.date.isoformat() if hasattr(virement.date, "isoformat") else str(virement.date),
                virement.description, virement.amount, virement.iban_source,
                virement.iban_destination, virement.external_id_source,
                virement.external_id_destination, virement.type, virement.id
            ))
            conn.commit()
            return True
        except sqlite3.Error as e:
            logger.error(f"Erreur update_virement: {e}")
            return False
        finally:
            close_connection(conn)

    def delete_virement(self, virement_id: int) -> bool:
        """Supprime un virement par son ID."""
        conn = None
        try:
            conn = get_db_connection(db_path=self.db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM virements WHERE id = ?", (virement_id,))
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting virement {virement_id}: {e}")
            return False
        finally:
            close_connection(conn)

virement_repository = VirementRepository()
