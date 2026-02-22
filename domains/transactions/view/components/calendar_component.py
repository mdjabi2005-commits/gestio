"""
Calendar Component - Calendrier interactif

Composant calendrier pour filtrer les transactions par date.
Affiche une vue mensuelle avec les jours ayant des transactions marqués.
"""

import calendar
from datetime import date, timedelta
from typing import Optional, Dict

import pandas as pd
import streamlit as st


def render_calendar(
        df: pd.DataFrame,
        key: str = "calendar",
        selected_month: Optional[date] = None
) -> Optional[date]:
    """
    Affiche un calendrier interactif mensuel.

    Args:
        df: DataFrame avec colonne 'date' et 'type'
        key: Clé unique pour les widgets Streamlit
        selected_month: Mois à afficher (défaut: mois en cours)

    Returns:
        Date sélectionnée ou None si aucune sélection
    """
    # Initialiser le mois affiché
    if f"{key}_month" not in st.session_state:
        st.session_state[f"{key}_month"] = selected_month or date.today().replace(day=1)

    # Liste de dates sélectionnées (au lieu d'une seule)
    if f"{key}_selected_dates" not in st.session_state:
        st.session_state[f"{key}_selected_dates"] = []

    current_month = st.session_state[f"{key}_month"]

    # Navigation mois - Version simplifiée sans rerun pour éviter les lags
    col_prev, col_title, col_next = st.columns([1, 3, 1])

    with col_prev:
        if st.button("◀", key=f"{key}_prev", help="Mois précédent", use_container_width=True):
            # Aller au mois précédent - sans rerun pour éviter le lag
            if current_month.month == 1:
                new_month = current_month.replace(year=current_month.year - 1, month=12)
            else:
                new_month = current_month.replace(month=current_month.month - 1)
            st.session_state[f"{key}_month"] = new_month
            st.session_state[f"{key}_selected_dates"] = []

    with col_title:
        mois_noms = [
            "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ]
        st.markdown(
            f"<h3 style='text-align: center; margin: 0;'>{mois_noms[current_month.month]} {current_month.year}</h3>",
            unsafe_allow_html=True
        )

    with col_next:
        if st.button("▶", key=f"{key}_next", help="Mois suivant", use_container_width=True):
            # Aller au mois suivant - sans rerun
            if current_month.month == 12:
                new_month = current_month.replace(year=current_month.year + 1, month=1)
            else:
                new_month = current_month.replace(month=current_month.month + 1)
            st.session_state[f"{key}_month"] = new_month
            st.session_state[f"{key}_selected_dates"] = []

    # Calculer les jours avec transactions
    days_with_transactions = _get_days_with_transactions(df, current_month)

    # Afficher la grille du calendrier
    _render_calendar_grid(current_month, days_with_transactions, key)

    # Sélection de plage de dates - version simplifiée
    st.caption("📅 Sélection de plage (optionnel)")
    col_start, col_end = st.columns(2)

    with col_start:
        st.date_input(
            "Début",
            value=None,
            key=f"{key}_date_start",
            help="Laisser vide pour afficher toutes les transactions",
            on_change=None
        )

    with col_end:
        st.date_input(
            "Fin",
            value=None,
            key=f"{key}_date_end",
            help="Laisser vide pour afficher toutes les transactions",
            on_change=None
        )

    # Bouton reset - sans use_container_width pour éviter les problèmes
    # Afficher indicateur de sélection
    selected_dates = st.session_state.get(f"{key}_selected_dates", [])
    if selected_dates:
        if len(selected_dates) == 1:
            st.info(f"📅 {selected_dates[0].strftime('%d/%m/%Y')}")
        else:
            dates_str = ", ".join([d.strftime('%d/%m') for d in sorted(selected_dates)])
            st.info(f"📅 {len(selected_dates)} jours sélectionnés: {dates_str}")

    # Bouton reset
    if selected_dates or st.session_state.get(f"{key}_date_start") or st.session_state.get(f"{key}_date_end"):
        if st.button("🔄 Réinitialiser", key=f"{key}_reset"):
            st.session_state[f"{key}_selected_dates"] = []

    return selected_dates


def _get_days_with_transactions(df: pd.DataFrame, month: date) -> Dict[int, Dict]:
    """
    Récupère les jours du mois ayant des transactions.
    
    Returns:
        Dict[jour] = {'has_revenue': bool, 'has_expense': bool, 'count': int}
    """
    if df.empty:
        return {}

    df_copy = df.copy()
    df_copy["date"] = pd.to_datetime(df_copy["date"])

    # Filtrer sur le mois
    mask = (
            (df_copy["date"].dt.year == month.year) &
            (df_copy["date"].dt.month == month.month)
    )
    df_month = df_copy[mask]

    if df_month.empty:
        return {}

    days_info = {}
    for _, row in df_month.iterrows():
        day = row["date"].day
        if day not in days_info:
            days_info[day] = {"has_revenue": False, "has_expense": False, "count": 0}

        days_info[day]["count"] += 1
        type_str = str(row["type"]).lower()
        if type_str == "revenu":
            days_info[day]["has_revenue"] = True
        else:
            days_info[day]["has_expense"] = True

    return days_info


def _render_calendar_grid(month: date, days_info: Dict[int, Dict], key: str) -> None:
    """Affiche la grille du calendrier."""

    # En-têtes des jours
    jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    cols = st.columns(7)
    for i, jour in enumerate(jours):
        with cols[i]:
            st.markdown(
                f"<div style='text-align: center; font-weight: bold; color: #888; font-size: 12px; padding: 4px; margin-bottom: 4px;'>{jour}</div>",
                unsafe_allow_html=True
            )

    # Obtenir le calendrier du mois
    cal = calendar.monthcalendar(month.year, month.month)

    # Liste des dates sélectionnées
    selected_dates = st.session_state.get(f"{key}_selected_dates", [])

    # Afficher les semaines
    for week_idx, week in enumerate(cal):
        cols = st.columns(7)
        for i, day in enumerate(week):
            with cols[i]:
                if day == 0:
                    # Cellule vide avec hauteur cohérente
                    st.markdown("<div style='height: 40px; min-height: 40px;'></div>", unsafe_allow_html=True)
                else:
                    _render_day_cell(day, days_info.get(day), selected_dates, month, key)

        # Ajouter un petit espace entre les semaines pour éviter les chevauchements
        if week_idx < len(cal) - 1:
            st.markdown("<div style='height: 4px;'></div>", unsafe_allow_html=True)


def _render_day_cell(
        day: int,
        day_info: Optional[Dict],
        selected_dates: list,
        month: date,
        key: str
) -> None:
    """Affiche une cellule de jour avec interaction toggle."""

    # Vérifier si ce jour est sélectionné
    current_date = month.replace(day=day)
    is_selected = current_date in selected_dates
    has_transactions = day_info is not None

    # Déterminer le badge
    if has_transactions:
        if day_info["has_revenue"] and day_info["has_expense"]:
            badge = "🟡"
        elif day_info["has_revenue"]:
            badge = "🟢"
        else:
            badge = "🔴"
    else:
        badge = ""

    # Créer le label du bouton
    label = f"{day} {badge}" if badge else str(day)

    # Type de bouton selon l'état
    if has_transactions:
        button_type = "primary" if is_selected else "secondary"

        # Bouton cliquable pour les jours avec transactions
        if st.button(
                label,
                key=f"{key}_day_{day}",
                type=button_type,
                use_container_width=True,
                help=f"{day_info['count']} transaction(s)" if has_transactions else None
        ):
            # Toggle: ajouter ou retirer de la liste
            selected_dates_list = st.session_state[f"{key}_selected_dates"].copy()

            if current_date in selected_dates_list:
                selected_dates_list.remove(current_date)  # Retirer
            else:
                selected_dates_list.append(current_date)  # Ajouter

            st.session_state[f"{key}_selected_dates"] = selected_dates_list
            st.rerun()
    else:
        # Affichage simple pour les jours sans transactions
        st.markdown(
            f"<div style='text-align: center; padding: 8px; color: #666; font-size: 13px;'>{day}</div>",
            unsafe_allow_html=True
        )


def get_calendar_selected_dates(key: str = "calendar") -> list:
    """
    Retourne la liste des dates sélectionnées pour le filtrage.
    
    Returns:
        Liste de dates sélectionnées, ou liste vide si aucune sélection (affiche tout)
    """
    # Priorité 1: plage de dates personnalisée
    date_start = st.session_state.get(f"{key}_date_start")
    date_end = st.session_state.get(f"{key}_date_end")

    if date_start and date_end:
        # Générer toutes les dates dans la plage
        dates = []
        current = date_start
        while current <= date_end:
            dates.append(current)
            current += timedelta(days=1)
        return dates
    elif date_start:
        # Seulement date de début: afficher depuis cette date jusqu'à aujourd'hui
        dates = []
        current = date_start
        today = date.today()
        while current <= today:
            dates.append(current)
            current += timedelta(days=1)
        return dates
    elif date_end:
        # Seulement date de fin: retourner juste cette date
        return [date_end]

    # Priorité 2: dates cliquées sur le calendrier
    selected_dates = st.session_state.get(f"{key}_selected_dates", [])
    if selected_dates:
        return selected_dates

    # Par défaut: liste vide = afficher toutes les transactions
    return []
