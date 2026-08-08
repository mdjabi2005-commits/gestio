import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  groupAccountsByInstitution,
  knownSinceLabel,
  missingUpdatedAtCount,
  oldestUpdatedAt,
  reviewGroups,
  visibleTransactionLabel
} from "../../src/ui-logic.ts";
import "./styles.css";

const cacheKey = "gestio.last-balance";
const authorizationKey = "gestio.authorization-id";
const pdfAccountKeys = [["CCP", "Compte courant (CCP)"], ["LIVRET_A", "Livret A"], ["LIVRET_JEUNE", "Livret Jeune"], ["NICKEL", "Nickel"]];

function App() {
  const [screen, setScreen] = useState({ name: "loading" });
  const [page, setPage] = useState(currentPage);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const auth = await api("/auth/state");
      if (!auth.configured) return setScreen({ name: "setup" });
      let balance;
      try {
        balance = await api("/balance");
      } catch (error) {
        if (error.status === 401) return setScreen({ name: "login" });
        throw error;
      }
      localStorage.setItem(cacheKey, JSON.stringify({ balance, savedAt: new Date().toISOString() }));
      let transactions = [];
      try {
        transactions = await visibleTransactions();
      } catch {
        setNotice("Le solde est disponible, mais les transactions n’ont pas pu être chargées.");
      }
      setScreen({ name: "ready", balance, transactions, offline: false });
    } catch (error) {
      const cached = readCachedBalance();
      setScreen(cached
        ? { name: "ready", balance: cached.balance, transactions: [], offline: true, savedAt: cached.savedAt }
        : { name: "error", message: error.message });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const changed = () => setPage(currentPage());
    addEventListener("hashchange", changed);
    return () => removeEventListener("hashchange", changed);
  }, []);

  if (screen.name === "loading") return <main className="shell"><p>Chargement…</p></main>;
  if (screen.name === "setup") return <AuthForm mode="setup" onSuccess={refresh} />;
  if (screen.name === "login") return <AuthForm mode="login" onSuccess={refresh} />;
  if (screen.name === "error") return <Message title="Gestio est indisponible" message={screen.message} action={refresh} />;

  const { balance, transactions, offline } = screen;
  const accounts = balance.accounts ?? [];
  const freshness = oldestUpdatedAt(accounts);
  const missingFreshnessCount = missingUpdatedAtCount(accounts);
  const offlineDate = freshness ?? screen.savedAt;
  return (
    <main className="shell">
      <header><h1>Gestio</h1>{!offline && <button onClick={() => logout().then(refresh)}>Déconnexion</button>}</header>
      {offline && <p className="warning"><strong>Hors connexion.</strong> Solde connu au {formatDateTime(offlineDate)} — ce chiffre n’est pas actuel.</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      <nav aria-label="Navigation principale">
        {[["combien", "Combien j’ai"], ["ou", "Où"], ["quoi", "Quoi"]].map(([id, label]) =>
          <a key={id} href={`#${id}`} aria-current={page === id ? "page" : undefined}>{label}</a>)}
      </nav>
      {!accounts.length && !offline
        ? <Onboarding onConnected={() => { setNotice("Banque connectée. Le solde est à jour."); refresh(); }} onChanged={message => { setNotice(message); refresh(); }} />
        : page === "ou"
          ? <Accounts accounts={accounts} />
          : page === "quoi"
            ? <Transactions accounts={accounts} transactions={transactions} offline={offline} onChanged={message => { setNotice(message); refresh(); }} />
            : <Balance balance={balance} freshness={freshness} missingFreshnessCount={missingFreshnessCount} offline={offline} onChanged={message => { setNotice(message); refresh(); }} />}
    </main>
  );
}

function AuthForm({ mode, onSuccess }) {
  const [error, setError] = useState("");
  const submit = async event => {
    event.preventDefault();
    setError("");
    try {
      await api(mode === "setup" ? "/auth/setup" : "/auth/login", {
        method: "POST",
        body: JSON.stringify({ password: new FormData(event.currentTarget).get("password") })
      });
      onSuccess();
    } catch (cause) { setError(cause.message); }
  };
  return (
    <main className="shell">
      <h1>Gestio</h1>
      <h2>{mode === "setup" ? "Créer votre accès local" : "Se connecter"}</h2>
      <p>{mode === "setup" ? "Première étape : protégez vos données, puis connectez votre banque." : "Entrez votre mot de passe local pour retrouver votre situation."}</p>
      {error && <p className="error" role="alert">{error}</p>}
      <form className="stack" onSubmit={submit}>
        <label>Mot de passe<input name="password" type="password" minLength="12" required autoComplete={mode === "setup" ? "new-password" : "current-password"} /></label>
        <button type="submit">{mode === "setup" ? "Continuer" : "Voir mon solde"}</button>
      </form>
    </main>
  );
}

function Balance({ balance, freshness, missingFreshnessCount, offline, onChanged }) {
  return (
    <section aria-labelledby="balance-title">
      <h2 id="balance-title">Combien j’ai</h2>
      <p className="total">{money(balance.totalCents)}</p>
      {balance.unknownBalanceCount > 0 && <p className="warning">Total incomplet : {balance.unknownBalanceCount} compte{balance.unknownBalanceCount > 1 ? "s" : ""} sans solde connu.</p>}
      <p className="muted">{freshness ? `À jour au ${formatDateTime(freshness)}${missingFreshnessCount ? ` · ${missingFreshnessCount} compte${missingFreshnessCount > 1 ? "s" : ""} sans date` : ""}` : "Fraîcheur inconnue"}</p>
      {!offline && <div className="actions"><SyncButton onChanged={onChanged} /><details><summary>Connecter ou reconnecter une banque</summary><BankConnect onConnected={() => onChanged("Banque connectée.")} /></details></div>}
    </section>
  );
}

function Accounts({ accounts }) {
  return (
    <section aria-labelledby="accounts-title">
      <h2 id="accounts-title">Où est mon argent</h2>
      {groupAccountsByInstitution(accounts).map(institution => (
        <article className="card" key={institution.id}>
          <div className="row"><h3>{institution.name}</h3><strong>{money(institution.balanceCents)}{institution.unknownBalanceCount > 0 && " (incomplet)"}</strong></div>
          {institution.accounts.map(account => <div className="transaction" key={account.id}>
            <div className="row"><span>{account.name}</span><strong>{account.balanceCents === null ? "Solde inconnu" : money(account.balanceCents)}</strong></div>
            <small className="muted">{knownSinceLabel(account.knownSince) ?? "Horizon connu indisponible"} · {account.updatedAt ? `mis à jour le ${formatDateTime(account.updatedAt)}` : "fraîcheur inconnue"}</small>
          </div>)}
        </article>
      ))}
    </section>
  );
}

function Transactions({ accounts, transactions, offline, onChanged }) {
  const groups = useMemo(() => reviewGroups(transactions), [transactions]);
  const accountNames = new Map(accounts.map(account => [account.id, account.name]));
  return (
    <section aria-labelledby="transactions-title">
      <h2 id="transactions-title">Ce qui a bougé</h2>
      {offline && <p className="warning">Les transactions ne sont pas disponibles hors connexion. Le dernier solde reste affiché.</p>}
      {groups.map(group => <article className="card" key={`${group[0].accountId}-${group[0].transactionDate}-${group[0].amountCents}`}>
        <h3>À départager</h3>
        <p>Ces lignes ont la même date et le même montant. Vérifiez votre relevé.</p>
        {group.map(transaction => <div className="transaction" key={transaction.id}>
          <TransactionLine transaction={transaction} accountName={accountNames.get(transaction.accountId)} />
          <button onClick={() => removeTransaction(transaction.id).then(() => onChanged("Doublon supprimé."), error => onChanged(error.message))}>Supprimer ce doublon</button>
        </div>)}
        <button onClick={() => resolveGroup(group[0].id).then(result => onChanged(`${result.resolved} transactions confirmées comme distinctes.`), error => onChanged(error.message))}>Ce sont des dépenses distinctes</button>
      </article>)}
      {!offline && accounts.length > 0 && <TransactionActions accounts={accounts} onChanged={onChanged} />}
      <div className="card">
        {transactions.length ? transactions.map(transaction => <TransactionLine key={transaction.id} transaction={transaction} accountName={accountNames.get(transaction.accountId)} />) : <p>Aucune transaction à afficher.</p>}
      </div>
    </section>
  );
}

function TransactionLine({ transaction, accountName }) {
  return <div className="transaction"><div className="row"><span>{visibleTransactionLabel(transaction)}</span><strong className={transaction.amountCents >= 0 ? "positive" : "negative"}>{money(transaction.amountCents)}</strong></div><small className="muted">{formatDate(transaction.transactionDate)} · {accountName ?? "Compte inconnu"}</small></div>;
}

function TransactionActions({ accounts, onChanged }) {
  const [error, setError] = useState("");
  const manual = async event => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const amountCents = Math.round(Number(String(data.get("amount")).replace(",", ".")) * 100);
    try {
      await api("/transactions", { method: "POST", body: JSON.stringify({ accountId: Number(data.get("accountId")), transactionDate: data.get("date"), label: data.get("label"), amountCents }) });
      form.reset();
      onChanged("Transaction ajoutée.");
    } catch (cause) { setError(cause.message); }
  };
  return <details className="card"><summary>Ajouter ou importer</summary><p className="muted">Pour un compte synchronisé, le solde publié par la banque fait foi : corriger une transaction ne modifie pas ce solde.</p>{error && <p className="error" role="alert">{error}</p>}<form className="stack" onSubmit={manual}><h3>Saisie manuelle</h3><AccountSelect accounts={accounts} /><label>Date<input name="date" type="date" required /></label><label>Libellé<input name="label" required /></label><label>Montant en euros<input name="amount" inputMode="decimal" required /></label><button>Ajouter</button></form><hr /><ManualSetup accounts={accounts} onChanged={onChanged} /></details>;
}

function AccountSelect({ accounts }) {
  return <label>Compte<select name="accountId">{accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>;
}

function ManualSetup({ accounts, onChanged }) {
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { api("/institutions").then(setInstitutions, cause => setError(cause.message)); }, []);

  const createInstitution = async event => {
    event.preventDefault();
    setError("");
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const institution = await api("/institutions", { method: "POST", body: JSON.stringify({ name: data.get("name"), country: data.get("country") }) });
      setInstitutions(current => [...current.filter(item => item.id !== institution.id), institution]);
      form.reset();
      setStatus("Établissement ajouté.");
    } catch (cause) { setError(cause.message); }
  };

  const createAccount = async event => {
    event.preventDefault();
    setError("");
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const institutionId = Number(data.get("institutionId")) || undefined;
    try {
      await api("/accounts", { method: "POST", body: JSON.stringify({ name: data.get("name"), type: data.get("type"), ...(institutionId ? { institutionId } : {}) }) });
      form.reset();
      onChanged("Compte ajouté.");
    } catch (cause) { setError(cause.message); }
  };

  const importPdf = async event => {
    event.preventDefault();
    setError("");
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("pdf");
    if (!(file instanceof File) || !file.size) return setError("Choisissez un relevé PDF.");
    const accountIds = {};
    for (const [key] of pdfAccountKeys) {
      const id = Number(data.get(key));
      if (id) accountIds[key] = id;
    }
    try {
      const result = await api("/imports/pdf", { method: "POST", body: JSON.stringify({ pdfBase64: await fileBase64(file), accountIds }) });
      form.reset();
      onChanged(`Relevé importé : ${result.imported} transaction${result.imported === 1 ? "" : "s"} ajoutée${result.imported === 1 ? "" : "s"}.`);
    } catch (cause) { setError(cause.message); }
  };

  return <><h3>Ajouter un établissement</h3>{error && <p className="error" role="alert">{error}</p>}{status && <p className="notice" role="status">{status}</p>}<form className="stack" onSubmit={createInstitution}><label>Nom<input name="name" required /></label><label>Pays<input name="country" defaultValue="FR" minLength="2" maxLength="2" required /></label><button>Ajouter l’établissement</button></form><hr /><form className="stack" onSubmit={createAccount}><h3>Ajouter un compte</h3><label>Nom<input name="name" required /></label><label>Type<select name="type"><option value="BANK">Compte bancaire</option><option value="LIVRET_A">Livret A</option><option value="OTHER">Autre</option></select></label><label>Établissement<select name="institutionId"><option value="">Comptes manuels (automatique)</option>{institutions.map(institution => <option key={institution.id} value={institution.id}>{institution.name}</option>)}</select></label><button>Ajouter le compte</button></form>{accounts.length > 0 && <><hr /><form className="stack" onSubmit={importPdf}><h3>Importer un relevé PDF</h3><p className="muted">Associez chaque compte présent sur le relevé. Une correspondance manquante ou réutilisée sera refusée.</p><label>Relevé PDF<input name="pdf" type="file" accept="application/pdf,.pdf" required /></label>{pdfAccountKeys.map(([key, label]) => <label key={key}>{label}<select name={key} defaultValue=""><option value="">Non présent sur ce relevé</option>{accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>)}<button>Importer le relevé</button></form></>}</>;
}

function Onboarding({ onConnected, onChanged }) {
  return <section><h2>Connecter votre première banque</h2><p>La connexion bancaire mène directement à votre premier solde. En MVP, terminez l’authentification sur l’ordinateur serveur.</p><BankConnect onConnected={onConnected} /><hr /><h2>Ou ajouter un compte manuel</h2><p>Créez d’abord son établissement, puis le compte, sans passer par une banque compatible.</p><ManualSetup accounts={[]} onChanged={onChanged} /></section>;
}

function BankConnect({ onConnected }) {
  const [status, setStatus] = useState("");
  const submit = async event => {
    event.preventDefault();
    setStatus("Création de la connexion…");
    try {
      const data = new FormData(event.currentTarget);
      const connection = await api("/enable-banking/connect", { method: "POST", body: JSON.stringify({ name: data.get("name"), country: data.get("country") }) });
      localStorage.setItem(authorizationKey, connection.authorizationId);
      open(connection.url, "_blank", "noopener");
      setStatus("Authentification bancaire ouverte. En attente du retour…");
      for (let attempt = 0; attempt < 150; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result = await api(`/enable-banking/status/${connection.authorizationId}`);
        if (result.status === "AUTHORIZED") return onConnected();
        if (["EXPIRED", "FAILED"].includes(result.status)) throw new Error("La connexion bancaire n’a pas abouti.");
      }
      throw new Error("La connexion bancaire prend trop de temps. Vous pourrez réessayer.");
    } catch (error) { setStatus(error.message); }
  };
  return <form className="stack" onSubmit={submit}><label>Banque<input name="name" defaultValue="La Banque Postale" required /></label><label>Pays<input name="country" defaultValue="FR" minLength="2" maxLength="2" required /></label><button>Connecter la banque</button>{status && <p role="status">{status}</p>}</form>;
}

function SyncButton({ onChanged }) {
  const authorizationId = localStorage.getItem(authorizationKey);
  if (!authorizationId) return null;
  return <button onClick={() => api(`/enable-banking/sync/${authorizationId}`, { method: "POST" }).then(() => onChanged("Solde mis à jour."), error => onChanged(error.message))}>Synchroniser</button>;
}

function Message({ title, message, action }) {
  return <main className="shell"><h1>{title}</h1><p className="error">{message}</p><button onClick={action}>Réessayer</button></main>;
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "content-type": "application/json", ...options.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message ?? body.error ?? `Erreur ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

function fileBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result).split(",", 2)[1]));
    reader.addEventListener("error", () => reject(new Error("Le relevé PDF n’a pas pu être lu.")));
    reader.readAsDataURL(file);
  });
}

function logout() { return api("/auth/logout", { method: "POST" }); }
function resolveGroup(transactionId) { return api("/transactions/resolve", { method: "POST", body: JSON.stringify({ transactionId }) }); }
function removeTransaction(id) { return api(`/transactions/${id}`, { method: "DELETE" }); }
async function visibleTransactions() {
  const latest = (await api("/transactions")).transactions;
  const byId = new Map(latest.map(transaction => [transaction.id, transaction]));
  for (let offset = 0; ; offset += 100) {
    const review = (await api(`/transactions?needsReview=true&limit=100&offset=${offset}`)).transactions;
    review.forEach(transaction => byId.set(transaction.id, transaction));
    if (review.length < 100) return [...byId.values()];
  }
}
function currentPage() { return ["ou", "quoi"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "combien"; }
function money(cents) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100); }
function formatDate(date) { return new Intl.DateTimeFormat("fr-FR").format(new Date(`${date}T00:00:00`)); }
function formatDateTime(date) { return date ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date.includes("T") ? date : `${date.replace(" ", "T")}Z`)) : "date inconnue"; }
function readCachedBalance() { try { const cached = JSON.parse(localStorage.getItem(cacheKey)); return cached?.balance && Array.isArray(cached.balance.accounts) ? cached : null; } catch { return null; } }
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(console.warn));
createRoot(document.getElementById("root")).render(<App />);
