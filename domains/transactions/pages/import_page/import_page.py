import streamlit as st
import pandas as pd
from datetime import datetime, date

from domains.transactions.database.repository import transaction_repository, CATÉGORIES


# =========================================================
# 1. HELPERS
# =========================================================

def load_data(uploaded_file) -> pd.DataFrame:
    """Charge le fichier CSV/Excel."""
    if uploaded_file.name.lower().endswith('.csv'):
        try:
            df = pd.read_csv(uploaded_file, sep=None, engine='python')
        except Exception:
            uploaded_file.seek(0)
            df = pd.read_csv(uploaded_file, sep=';')
    else:
        df = pd.read_excel(uploaded_file)

    df.columns = df.columns.astype(str).str.strip()
    return df


def parse_amount(value) -> float:
    """Convertit un montant en float."""
    if pd.isna(value) or value == "":
        return 0.0

    s = str(value).strip()
    s = s.replace("€", "").replace("EUR", "").replace("$", "").replace(" ", "").replace("\xa0", "")

    if "," in s and "." not in s:
        s = s.replace(",", ".")
    elif "," in s and "." in s:
        if s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")

    try:
        return float(s)
    except ValueError:
        return 0.0


def detect_columns(df: pd.DataFrame) -> dict:
    """Détecte automatiquement les colonnes."""
    cols = df.columns.tolist()
    mapping = {"date": None, "amount": None, "cat": None}

    keywords = {
        "date": ["date", "time", "jour", "opér"],
        "amount": ["montant", "amount", "solde", "euro", "debit", "credit"],
        "cat": ["caté", "cate", "type", "class"]
    }

    for field, keys in keywords.items():
        for col in cols:
            if any(k in col.lower() for k in keys) and mapping[field] is None:
                mapping[field] = col
                break

    return mapping


# =========================================================
# 2. MAIN PAGE
# =========================================================

def import_transactions_page():
    st.title("📥 Import de Transactions")

    # Guide rapide
    with st.expander("ℹ️ Comment importer vos transactions ?", expanded=True):
        st.markdown("""
        ### Étape 1 : Préparez votre fichier
        Votre fichier CSV ou Excel doit contenir au moins :
        - **Date** de la transaction
        - **Montant** (positif = Revenu, négatif = Dépense)

        ### Étape 2 : Mappez les colonnes
        Après upload, indiquez quelles colonnes correspondent à la date, montant et catégorie.

        ### Étape 3 : Vérifiez et corrigez
        Vous pourrez vérifier chaque ligne et ajuster si nécessaire avant l'import final.

        ### Formats acceptés :
        - CSV (séparateur ; ou ,)
        - Excel (.xlsx)
        """)

    # Init session
    if "import_step" not in st.session_state:
        st.session_state.import_step = "config"
    if "raw_df" not in st.session_state:
        st.session_state.raw_df = None
    if "draft_df" not in st.session_state:
        st.session_state.draft_df = None

    # Upload
    uploaded_file = st.file_uploader("Choisir un fichier (CSV/Excel)", type=["csv", "xlsx"])

    # Nouveau fichier = reset
    if uploaded_file is not None:
        file_id = f"{uploaded_file.name}_{uploaded_file.size}"
        if st.session_state.get("current_file_id") != file_id:
            st.session_state.raw_df = load_data(uploaded_file)
            st.session_state.current_file_id = file_id
            st.session_state.import_step = "config"
            st.session_state.draft_df = None
            st.rerun()
    else:
        st.session_state.raw_df = None
        st.session_state.draft_df = None
        st.session_state.import_step = "config"

    if st.session_state.raw_df is None:
        return

    df = st.session_state.raw_df

    # === ÉTAPE 1: CONFIG ===
    if st.session_state.import_step == "config":
        st.subheader("1️⃣ Mapper les colonnes")
        st.info("Indiquez quelle colonne de votre fichier correspond à chaque champ.")
        st.write(f"**{len(df)} lignes détectées**")
        st.dataframe(df.head(3), use_container_width=True)

        cols = ["Aucune"] + df.columns.tolist()
        detected = detect_columns(df)

        def get_idx(val):
            return cols.index(val) if val in cols else 0

        with st.form("config"):
            c1, c2, c3 = st.columns(3)
            with c1:
                date_col = st.selectbox("📅 Date", cols, index=get_idx(detected["date"]))
            with c2:
                amount_col = st.selectbox("💰 Montant", cols, index=get_idx(detected["amount"]))
            with c3:
                cat_col = st.selectbox("🏷️ Catégorie", cols, index=get_idx(detected["cat"]))

            if st.form_submit_button("Suivant →", type="primary"):
                if date_col == "Aucune" or amount_col == "Aucune":
                    st.error("Date et Montant requis")
                else:
                    rows = []
                    for _, row in df.iterrows():
                        try:
                            d = pd.to_datetime(row[date_col], dayfirst=True, errors='coerce').date()
                            if pd.isna(d):
                                d = date.today()
                        except Exception:
                            d = date.today()

                        amt = parse_amount(row[amount_col])

                        cat = "Autre"
                        if cat_col != "Aucune":
                            raw = str(row[cat_col]).strip().lower()
                            for c in CATÉGORIES:
                                if c.lower() == raw:
                                    cat = c
                                    break

                        rows.append({
                            "date": d,
                            "type": "Revenu" if amt > 0 else "Dépense",
                            "montant": abs(amt),
                            "categorie": cat,
                            "sous_categorie": "",
                            "description": ""
                        })

                    st.session_state.draft_df = pd.DataFrame(rows)
                    st.session_state.import_step = "editor"
                    st.rerun()

    # === ÉTAPE 2: ÉDITION ===
    elif st.session_state.import_step == "editor":
        draft_df = st.session_state.draft_df

        st.subheader("2️⃣ Vérifier et corriger")
        st.info("""
        👆 Vérifiez chaque ligne ci-dessous :
        - **Type** : automatiquement détecté (Revenu si montant > 0, Dépense sinon)
        - **Catégorie** : vous pouvez la modifier
        - Cliquez sur une cellule pour éditer
        - Vous pouvez ajouter ou supprimer des lignes
        """)

        if st.button("← Retour"):
            st.session_state.import_step = "config"
            st.rerun()

        column_cfg = {
            "date": st.column_config.DateColumn("Date", required=True, format="DD/MM/YYYY"),
            "type": st.column_config.SelectboxColumn("Type", options=["Revenu", "Dépense"], required=True),
            "montant": st.column_config.NumberColumn("Montant €", min_value=0.0, format="%.2f"),
            "categorie": st.column_config.SelectboxColumn("Catégorie", options=CATÉGORIES, required=True),
            "sous_categorie": st.column_config.TextColumn("Sous-Catégorie"),
            "description": st.column_config.TextColumn("Description"),
        }

        edited_df = st.data_editor(
            draft_df,
            column_config=column_cfg,
            use_container_width=True,
            num_rows="dynamic",
            height=500
        )

        st.write(f"**{len(edited_df)} transactions prêtes**")

        if st.button("🚀 Importer", type="primary"):
            success, errors = 0, 0
            prog = st.progress(0)

            for i, row in edited_df.iterrows():
                try:
                    tx = {
                        "date": row["Date"].isoformat() if isinstance(row["Date"], (date, datetime)) else str(row["Date"]),
                        "montant": float(row["Montant"]),
                        "type": row["Type"],
                        "categorie": row["Catégorie"],
                        "sous_categorie": str(row.get("Sous-Catégorie", "")),
                        "description": str(row.get("Description", "")),
                        "source": "import_v2",
                        "external_id": None
                    }
                    if transaction_repository.add(tx):
                        success += 1
                    else:
                        errors += 1
                except Exception:
                    errors += 1

                prog.progress((i + 1) / len(edited_df))

            st.success(f"✅ {success} importées | ❌ {errors} erreurs")
            if errors > 0:
                st.warning("Certaines lignes n'ont pas pu être importées.")

            if st.button("Nouvel import"):
                st.session_state.clear()
                st.rerun()


if __name__ == "__main__":
    import_transactions_page()
