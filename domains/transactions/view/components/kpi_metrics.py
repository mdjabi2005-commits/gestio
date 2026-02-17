"""
KPI Cards - Affichage des métriques clés
"""

import streamlit as st
import pandas as pd

def render_kpi_cards(df):
    """
    Affiche les KPIs principaux: Revenus, Dépenses, Solde, Nombre de transactions
    
    Args:
        df: DataFrame pandas avec colonnes 'type' et 'montant'
    """
    
    # Gérer le cas où df est vide
    if df is None or (isinstance(df, pd.DataFrame) and df.empty):
        total_revenus = 0.0
        total_depenses = 0.0
        solde = 0.0
        count = 0
    else:
        # Calculs
        # Robustesse casse (Revenu/revenu)
        is_revenu = df['type'].str.lower() == 'revenu'
        is_depense = df['type'].str.lower() == 'dépense'
        
        total_revenus = df[is_revenu]['amount'].sum()
        total_depenses = df[is_depense]['amount'].sum()
        solde = total_revenus - total_depenses
        count = len(df)
    
    # Affichage custom styled
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="📈 Revenus",
            value=f"{total_revenus:,.2f} €".replace(",", " "),
            delta=None
        )
        
    with col2:
        st.metric(
            label="📉 Dépenses",
            value=f"{total_depenses:,.2f} €".replace(",", " "),
            delta=None
        )
        
    with col3:
        st.metric(
            label="💰 Solde",
            value=f"{solde:,.2f} €".replace(",", " "),
            delta=f"{(solde/total_revenus)*100:.1f}%" if total_revenus > 0 else None
        )
        
    with col4:
        st.metric(
            label="🔢 Transactions",
            value=count
        )
    
    
