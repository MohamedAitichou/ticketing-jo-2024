
import { useEffect, useMemo, useState } from "react";
import {
  fetchMe,
  fetchOffers,
  fetchMyOrders,
  checkout,
  fetchOrderTickets,
  ticketPngUrl,
  login as apiLogin,
  verifyOtp,
  register as apiRegister,
  fetchAdminSales,
  adminListOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
  verifyTicketKey,
  consumeTicket,
} from "./services/api";
import "./styles.css";

const BRAND = "JO Paris 2024";

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);

  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(false);

  // ---- États mini-auth (login -> otp) ----
  const [authStep, setAuthStep] = useState("login"); // 'login' | 'otp'
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("Azerty!123");
  const [authFirstName, setAuthFirstName] = useState("Jean");
  const [authLastName, setAuthLastName] = useState("Dupont");
  const [otpCode, setOtpCode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState("");

  // ---- Roles / Admin / Agent ----
  const roles = useMemo(() => {
    const r = me?.roles ?? me?.authorities ?? [];
    if (!Array.isArray(r)) return [];
    return r
      .map((x) => (typeof x === "string" ? x : x?.authority || x?.role || ""))
      .filter(Boolean);
  }, [me]);

  const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");
  const isAgent = roles.includes("ROLE_AGENT") || roles.includes("AGENT");
  const isAuth = !!token;

  // ---- Admin: stats ----
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminErr, setAdminErr] = useState("");
  const [adminData, setAdminData] = useState({ total: 0, byoffer: [] });

  // ---- Admin: CRUD offres ----
  const [adminOffers, setAdminOffers] = useState([]);
  const [offerForm, setOfferForm] = useState({
    id: null,
    code: "",
    name: "",
    description: "",
    priceCents: 2500,
    seats: 1,
    active: true,
  });
  const isEditing = offerForm.id != null;

  // ---- Agent: vérif / conso ----
  const [scanKey, setScanKey] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanErr, setScanErr] = useState("");

  // ---- Filtres/tri offres (présentation) ----
  const [q, setQ] = useState("");
  const [seatsFilter, setSeatsFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default | priceAsc | priceDesc | seats

  const filteredOffers = useMemo(() => {
    const arr = offers.filter((o) => {
      const matchText = (o.name + " " + o.description + " " + o.code)
        .toLowerCase()
        .includes(q.toLowerCase());
      const matchSeats =
        seatsFilter === "all" ? true : String(o.seats) === seatsFilter;
      const matchPrice = maxPrice ? o.priceCents / 100 <= Number(maxPrice) : true;
      return matchText && matchSeats && matchPrice;
    });

    switch (sortBy) {
      case "priceAsc":
        return [...arr].sort((a, b) => a.priceCents - b.priceCents);
      case "priceDesc":
        return [...arr].sort((a, b) => b.priceCents - a.priceCents);
      case "seats":
        return [...arr].sort((a, b) => a.seats - b.seats);
      default:
        return arr;
    }
  }, [offers, q, seatsFilter, maxPrice, sortBy]);

  // ===== Chargements =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ofs = await fetchOffers(token);
        if (alive) setOffers(ofs);
      } catch (e) {
        console.warn("Chargement offres:", e);
      }

      if (!token) return;

      try {
        const u = await fetchMe(token);
        if (alive) setMe(u);
      } catch (e) {
        console.warn("[/api/me] KO:", e?.message || e);
        if (alive) setMe(null);
      }

      try {
        const od = await fetchMyOrders(token);
        if (alive) setOrders(od);
      } catch (e) {
        console.warn("[/api/order/orders] KO:", e?.message || e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  // Stats admin
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token || !isAdmin) return;
      try {
        setAdminLoading(true);
        setAdminErr("");
        const d = await fetchAdminSales(token);
        if (alive) setAdminData(d);
      } catch (e) {
        if (alive) setAdminErr(e?.message || "Erreur");
      } finally {
        if (alive) setAdminLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, isAdmin]);

  // Admin CRUD — liste des offres
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token || !isAdmin) return;
      try {
        const list = await adminListOffers(token);
        if (alive) setAdminOffers(list);
      } catch (e) {
        console.warn("Admin list offers:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, isAdmin]);

  // ===== Actions =====
  async function handleCheckout(offerId, qty = 1) {
    if (!token) {
      scrollToId("auth");
      return;
    }
    try {
      setLoading(true);
      await checkout(token, [{ offerId, quantity: Math.max(1, qty || 1) }]);
      const od = await fetchMyOrders(token);
      setOrders(od);
      if (od?.length) setSelectedOrderId(od[0].id);
      scrollToId("orders");
    } catch (e) {
      alert("Achat impossible. " + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function openOrder(orderId) {
    if (!token) {
      alert("Session manquante. Merci de vous reconnecter.");
      scrollToId("auth");
      return;
    }
    setSelectedOrderId(orderId);
    try {
      const t = await fetchOrderTickets(orderId, token);
      setTickets(t);
      scrollToId("tickets");
    } catch (e) {
      alert("Chargement des billets impossible.");
    }
  }

  function signout() {
    localStorage.removeItem("token");
    setToken("");
    setMe(null);
    setOffers([]);
    setOrders([]);
    setTickets([]);
    setSelectedOrderId(null);
    setAuthStep("login");
    setOtpCode("");
    setAuthMsg("");

    setAdminData({ total: 0, byoffer: [] });
    setAdminErr("");
    setAdminLoading(false);

    setAdminOffers([]);
  }

  // --------- Mini-auth actions ----------
  async function handleLogin(e) {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setAuthMsg("");
      await apiLogin({ email: authEmail, password: authPassword }); // { otpRequired: true }
      setAuthStep("otp");
      setAuthMsg(
        "Un code OTP vient d’être généré (visible dans les logs du back durant la démo)."
      );
      scrollToId("auth");
    } catch {
      setAuthMsg("Identifiants invalides.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setAuthMsg("");
      await apiRegister({
        email: authEmail,
        password: authPassword,
        firstName: authFirstName,
        lastName: authLastName,
      });
      await apiLogin({ email: authEmail, password: authPassword });
      setAuthStep("otp");
      setAuthMode("login");
      setAuthMsg("Compte créé ! Saisis le code OTP (voir logs du back).");
      scrollToId("auth");
    } catch {
      setAuthMsg("Inscription impossible (email déjà utilisé ?).");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setAuthMsg("");
      const { token: tkn } = await verifyOtp({ email: authEmail, code: otpCode });

      localStorage.setItem("token", tkn);
      setToken(tkn);

      setAuthStep("login");
      setOtpCode("");
      setAuthMsg("");
    } catch (err) {
      setAuthMsg("Code OTP invalide ou réponse inattendue du serveur.");
    } finally {
      setAuthLoading(false);
    }
  }

  // ===== Admin CRUD handlers =====
  function editOffer(o) {
    setOfferForm({
      id: o.id,
      code: o.code || "",
      name: o.name || "",
      description: o.description || "",
      priceCents: o.priceCents ?? 0,
      seats: o.seats ?? 1,
      active: !!o.active,
    });
  }
  function resetForm() {
    setOfferForm({
      id: null,
      code: "",
      name: "",
      description: "",
      priceCents: 2500,
      seats: 1,
      active: true,
    });
  }

  async function submitOffer(e) {
    e.preventDefault();
    try {
      const payload = {
        code: offerForm.code.trim(),
        name: offerForm.name.trim(),
        description: offerForm.description.trim(),
        priceCents: Number(offerForm.priceCents) || 0,
        seats: Number(offerForm.seats) || 1,
        active: !!offerForm.active,
      };
      if (isEditing) {
        await adminUpdateOffer(token, offerForm.id, payload);
      } else {
        await adminCreateOffer(token, payload);
      }
      const list = await adminListOffers(token);
      setAdminOffers(list);
      resetForm();
    } catch (e) {
      alert("Échec enregistrement offre : " + (e?.message || e));
    }
  }

  async function removeOffer(id) {
    if (!confirm("Supprimer définitivement cette offre ?")) return;
    try {
      await adminDeleteOffer(token, id);
      const list = await adminListOffers(token);
      setAdminOffers(list);
    } catch (e) {
      alert("Suppression impossible : " + (e?.message || e));
    }
  }

  // ===== Agent handlers =====
  async function agentVerify() {
    try {
      setScanErr("");
      const ok = await verifyTicketKey(token, scanKey.trim());
      setScanResult({ verified: ok, consumed: false });
    } catch (e) {
      setScanErr(e?.message || "Erreur vérification");
      setScanResult(null);
    }
  }

  async function agentConsume() {
    try {
      setScanErr("");
      await consumeTicket(scanKey.trim(), token);
      setScanResult({ verified: true, consumed: true });
    } catch (e) {
      setScanErr(e?.message || "Erreur consommation");
    }
  }

  return (
    <>
      {/* ===== Topbar ===== */}
      <div className="topbar">
        <div className="container nav">
          <div
            className="brand"
            onClick={() => scrollToId("hero")}
            style={{ cursor: "pointer" }}
          >
            <span className="brand__icon">🏅</span>
            <span className="brand__name">{BRAND}</span>
            <span className="badge">Billetterie</span>
          </div>

          <div className="nav__right">
            <button className="btn btn--ghost" onClick={() => scrollToId("about")}>
              À propos
            </button>
            <button className="btn btn--ghost" onClick={() => scrollToId("offers")}>
              Offres
            </button>
            {(isAdmin || isAgent) && (
              <button className="btn btn--ghost" onClick={() => scrollToId("agent")}>
                Contrôle
              </button>
            )}
            {isAdmin && (
              <button className="btn btn--ghost" onClick={() => scrollToId("admin")}>
                Admin
              </button>
            )}
            {isAuth ? (
              <>
                <span
                  className="muted hide-sm"
                  style={{ marginLeft: 6, marginRight: 8 }}
                >
                  {me ? <>Bienvenue — {me?.username || me?.email}</> : <>Connecté</>}
                </span>
                <button className="btn btn--primary" onClick={signout}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <button
                className="btn btn--primary"
                onClick={() => scrollToId("auth")}
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== Hero ===== */}
      <header id="hero" className="hero">
        <div className="hero__inner container">
          <div className="hero__kicker">Billets officiels</div>
          <h1>
            Vivez l’émotion des <strong>Jeux Olympiques de Paris 2024</strong>
          </h1>
          <p className="muted center" style={{ maxWidth: 760, margin: "0 auto" }}>
            Réservez vos billets pour les épreuves phares et participez à l’histoire.
          </p>
          <div className="hero__cta">
            <button className="btn btn--gold" onClick={() => scrollToId("offers")}>
              🎟️ Voir les billets
            </button>
            <button className="btn btn--ghost" onClick={() => scrollToId("orders")}>
              Mes commandes
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* ===== Présentation ===== */}
        <section id="about" className="section">
          <h2 className="section__title">Présentation des Jeux</h2>
          <div className="features">
            <div className="feature">
              <div className="feature__title">Dates</div>
              <div className="feature__text">26 juillet → 11 août 2024</div>
            </div>
            <div className="feature">
              <div className="feature__title">Sites</div>
              <div className="feature__text">
                Stade de France, Bercy, La Défense Arena…
              </div>
            </div>
            <div className="feature">
              <div className="feature__title">Ambiance</div>
              <div className="feature__text">
                Des milliers de supporters & une fête populaire
              </div>
            </div>
          </div>
        </section>

        {/* ===== Bloc Auth ===== */}
        {!isAuth && (
          <section id="auth" className="section">
            <div className="panel" style={{ padding: "1rem" }}>
              <h3 className="block-title">Espace membre</h3>

              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === "login" ? "is-active" : ""}`}
                  onClick={() => {
                    setAuthMode("login");
                    setAuthStep("login");
                    setAuthMsg("");
                  }}
                >
                  Connexion
                </button>
                <button
                  className={`auth-tab ${
                    authMode === "register" ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setAuthMode("register");
                    setAuthStep("login");
                    setAuthMsg("");
                  }}
                >
                  Créer un compte
                </button>
              </div>

              {authMode === "login" && authStep === "login" && (
                <form
                  onSubmit={handleLogin}
                  style={{ display: "grid", gap: 8, maxWidth: 420 }}
                >
                  <input
                    placeholder="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="mot de passe"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                  <button type="submit" className="btn btn--primary" disabled={authLoading}>
                    {authLoading ? "..." : "Se connecter"}
                  </button>
                  {authMsg && <div className="muted">{authMsg}</div>}
                </form>
              )}

              {authMode === "register" && authStep === "login" && (
                <form
                  onSubmit={handleRegister}
                  style={{ display: "grid", gap: 8, maxWidth: 420 }}
                >
                  <div className="row" style={{ gap: 8 }}>
                    <input
                      placeholder="Prénom"
                      value={authFirstName}
                      onChange={(e) => setAuthFirstName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      placeholder="Nom"
                      value={authLastName}
                      onChange={(e) => setAuthLastName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                  <input
                    placeholder="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="mot de passe (min. 8 caractères)"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                  <button type="submit" className="btn btn--primary" disabled={authLoading}>
                    {authLoading ? "..." : "Créer mon compte"}
                  </button>
                  {authMsg && <div className="muted">{authMsg}</div>}
                </form>
              )}

              {authStep === "otp" && (
                <form
                  onSubmit={handleVerifyOtp}
                  style={{ display: "grid", gap: 8, maxWidth: 420 }}
                >
                  <input
                    placeholder="Code OTP (6 chiffres)"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={authLoading || otpCode.length !== 6}
                  >
                    {authLoading ? "..." : "Vérifier le code"}
                  </button>
                  {authMsg && <div className="muted">{authMsg}</div>}
                </form>
              )}
            </div>
          </section>
        )}

        {/* ===== Offres ===== */}
        <section id="offers" className="section">
          <h2 className="section__title">Épreuves à venir</h2>

          {/* Filtres & tri */}
          <div
            className="row"
            style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}
          >
            <input
              placeholder="Rechercher une épreuve…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: "1 1 260px" }}
            />
            <select
              value={seatsFilter}
              onChange={(e) => setSeatsFilter(e.target.value)}
              title="Places"
            >
              <option value="all">Toutes</option>
              <option value="1">Solo (1 place)</option>
              <option value="2">Duo (2 places)</option>
              <option value="4">Familial (4 places)</option>
            </select>
            <input
              type="number"
              min="0"
              placeholder="Prix max (€)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: 140 }}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Tri par défaut</option>
              <option value="priceAsc">Prix ↑</option>
              <option value="priceDesc">Prix ↓</option>
              <option value="seats">Places ↑</option>
            </select>
          </div>

          <div className="grid">
            {filteredOffers?.map((offer) => (
              <article key={offer.id} className="panel card col-4">
                <img
                  className="card__img"
                  src={
                    offer.code?.toLowerCase().includes("solo")
                      ? "https://images.unsplash.com/photo-1568043210943-0f2cc3f0b4f5?q=80&w=1400&auto=format&fit=crop"
                      : offer.code?.toLowerCase().includes("duo")
                      ? "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400&auto=format&fit=crop"
                      : "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1400&auto=format&fit=crop"
                  }
                  alt=""
                />
                <div className="card__body">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <h3 className="card__title">{offer.name}</h3>
                    <span className="badge">
                      {offer.code?.toUpperCase() || "OFFRE"}
                    </span>
                  </div>
                  <div className="card__meta">{offer.description}</div>
                  <div className="row muted" style={{ marginBottom: 8 }}>
                    <span>
                      Places&nbsp;: <strong>{offer.seats}</strong>
                    </span>
                    <span style={{ marginInline: 6 }}>•</span>
                    <span>
                      Prix&nbsp;:{" "}
                      <strong>{(offer.priceCents / 100).toFixed(2)} €</strong>
                    </span>
                  </div>
                  <div className="card__actions">
                    <button
                      className="btn btn--primary"
                      disabled={!isAuth || loading || offer.active === false}
                      onClick={() => handleCheckout(offer.id, 1)}
                      title={!isAuth ? "Connectez-vous pour acheter" : "Acheter"}
                    >
                      {offer.active === false ? "Indispo" : loading ? "..." : "Réserver"}
                    </button>
                    {!isAuth && (
                      <span className="muted" style={{ fontSize: 12 }}>
                        Connectez-vous pour réserver
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== Mes commandes ===== */}
        <section id="orders" className="section">
          <div className="panel" style={{ padding: "1rem" }}>
            <h3 className="block-title">Mes commandes</h3>
            {!isAuth && (
              <p className="muted">Connectez-vous pour voir vos commandes.</p>
            )}
            {isAuth && !orders?.length && (
              <p className="muted">Aucune commande pour le moment.</p>
            )}

            <div className="stack">
              {orders?.map((o) => (
                <div
                  key={o.id}
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div>
                    Commande <strong>#{o.id}</strong>
                  </div>
                  <div className="row">
                    <button className="btn btn--ghost" onClick={() => openOrder(o.id)}>
                      Voir les billets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Billets ===== */}
        <section id="tickets" className="section">
          <div className="panel" style={{ padding: "1rem" }}>
            <h3 className="block-title">Billets</h3>
            {!selectedOrderId && (
              <p className="muted">Sélectionnez une commande pour voir les billets.</p>
            )}
            {!!tickets.length && (
              <div className="grid">
                {tickets.map((t) => (
                  <div key={t.id} className="panel col-4" style={{ padding: 12 }}>
                    <div className="muted" style={{ marginBottom: 6 }}>
                      ticketId: <strong>{t.id}</strong> — offerId:{" "}
                      <strong>{t.offerId}</strong>
                      <br />
                      finalKey:{" "}
                      <span className="muted" style={{ fontSize: 12 }}>
                        {t.finalKey || "—"}
                      </span>
                      <br />
                      consommé:&nbsp;
                      <strong>{t.consumedAt ? "Oui" : "Non"}</strong>
                    </div>
                    <img
                      alt="QR"
                      src={ticketPngUrl(t.id)}
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,.06)",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== Bloc Agent (ou Admin) : vérification / consommation ===== */}
        {(isAgent || isAdmin) && (
          <section id="agent" className="section">
            <div className="panel" style={{ padding: "1rem" }}>
              <h3 className="block-title">Contrôle d’accès — Agent</h3>
              <div className="row" style={{ gap: 8 }}>
                <input
                  placeholder="finalKey (coller / scanner)"
                  value={scanKey}
                  onChange={(e) => setScanKey(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn--ghost" onClick={agentVerify} disabled={!scanKey}>
                  Vérifier
                </button>
                <button className="btn btn--primary" onClick={agentConsume} disabled={!scanKey}>
                  Consommer
                </button>
              </div>
              {scanErr && (
                <div className="panel" style={{ padding: 12, border: "1px solid #f66", marginTop: 8 }}>
                  <strong>Erreur :</strong> {scanErr}
                </div>
              )}
              {scanResult && (
                <div className="panel" style={{ padding: 12, marginTop: 8 }}>
                  <div>Vérifié : <strong>{scanResult.verified ? "Oui" : "Non"}</strong></div>
                  <div>Consommé : <strong>{scanResult.consumed ? "Oui" : "Non"}</strong></div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===== Admin (stats + CRUD offres) ===== */}
        {isAdmin && (
          <section id="admin" className="section">
            <div className="panel" style={{ padding: "1rem" }}>
              <h3 className="block-title">Tableau de bord — Admin</h3>
              {adminLoading && <p className="muted">Chargement…</p>}
              {adminErr && (
                <div className="panel" style={{ padding: 12, border: "1px solid #f66" }}>
                  <strong>Erreur :</strong> {adminErr}
                </div>
              )}
              {!adminLoading && !adminErr && (
                <>
                  <div className="panel" style={{ padding: 12, marginBottom: 12 }}>
                    <strong>Total de tickets vendus :</strong> {adminData.total}
                  </div>

                  <div className="panel" style={{ padding: 0, overflowX: "auto", marginBottom: 16 }}>
                    <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #ddd" }}>
                            Offer ID
                          </th>
                          <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #ddd" }}>
                            Nom de l’offre
                          </th>
                          <th style={{ textAlign: "right", padding: 12, borderBottom: "1px solid #ddd" }}>
                            Tickets vendus
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData.byoffer?.map((row) => (
                          <tr key={row.offerId}>
                            <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{row.offerId}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{row.offerName}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>
                              {row.ticketsSold}
                            </td>
                          </tr>
                        ))}
                        {(!adminData.byoffer || adminData.byoffer.length === 0) && (
                          <tr>
                            <td colSpan={3} style={{ padding: 12 }}>
                              Aucune vente pour l’instant.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* CRUD OFFERS */}
                  <div className="panel" style={{ padding: "1rem" }}>
                    <h4 style={{ marginTop: 0 }}>Gestion des offres</h4>

                    {/* Formulaire */}
                    <form onSubmit={submitOffer} className="grid" style={{ gap: 8 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <input
                          placeholder="Code (ex: SOLO / DUO / FAMILY)"
                          value={offerForm.code}
                          onChange={(e) =>
                            setOfferForm((s) => ({ ...s, code: e.target.value }))
                          }
                          style={{ flex: 1 }}
                          required
                        />
                        <input
                          placeholder="Nom"
                          value={offerForm.name}
                          onChange={(e) =>
                            setOfferForm((s) => ({ ...s, name: e.target.value }))
                          }
                          style={{ flex: 2 }}
                          required
                        />
                      </div>
                      <textarea
                        placeholder="Description"
                        value={offerForm.description}
                        onChange={(e) =>
                          setOfferForm((s) => ({ ...s, description: e.target.value }))
                        }
                      />
                      <div className="row" style={{ gap: 8 }}>
                        <input
                          type="number"
                          min="0"
                          placeholder="Prix (centimes)"
                          value={offerForm.priceCents}
                          onChange={(e) =>
                            setOfferForm((s) => ({ ...s, priceCents: e.target.value }))
                          }
                          style={{ width: 180 }}
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Places"
                          value={offerForm.seats}
                          onChange={(e) =>
                            setOfferForm((s) => ({ ...s, seats: e.target.value }))
                          }
                          style={{ width: 140 }}
                          required
                        />
                        <label className="row" style={{ alignItems: "center", gap: 6 }}>
                          <input
                            type="checkbox"
                            checked={offerForm.active}
                            onChange={(e) =>
                              setOfferForm((s) => ({ ...s, active: e.target.checked }))
                            }
                          />
                          Active
                        </label>

                        <button className="btn btn--primary" type="submit">
                          {isEditing ? "Mettre à jour" : "Créer l’offre"}
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={resetForm}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Tableau des offres */}
                    <div className="panel" style={{ padding: 0, overflowX: "auto", marginTop: 12 }}>
                      <table className="table" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>Nom</th>
                            <th>Prix (€)</th>
                            <th>Places</th>
                            <th>Active</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminOffers.map((o) => (
                            <tr key={o.id}>
                              <td>{o.id}</td>
                              <td>{o.code}</td>
                              <td>{o.name}</td>
                              <td>{(o.priceCents / 100).toFixed(2)}</td>
                              <td>{o.seats}</td>
                              <td>{o.active ? "Oui" : "Non"}</td>
                              <td className="row" style={{ gap: 6 }}>
                                <button className="btn btn--ghost" onClick={() => editOffer(o)}>
                                  Éditer
                                </button>
                                <button className="btn btn--ghost" onClick={() => removeOffer(o.id)}>
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                          {adminOffers.length === 0 && (
                            <tr>
                              <td colSpan={7} style={{ padding: 12 }}>
                                Aucune offre.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ===== DEBUG ===== */}
        <section className="section">
          <div
            className="panel"
            style={{
              padding: 8,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <strong>DEBUG</strong>
            <span>
              state token:{" "}
              <em>{token ? token.slice(0, 16) + "…" : "(vide)"}</em>
            </span>
            <span>
              localStorage token{" "}
              <em>{localStorage.getItem("token") ? "(présent)" : "(vide)"}</em>
            </span>
            <span>isAuth: {String(isAuth)}</span>
            <span>
              me: <em>{me ? me.email || me.username || "ok" : "(null)"}</em>
            </span>
            <button
              className="btn btn--ghost"
              onClick={() => setToken(localStorage.getItem("token") || "")}
            >
              Forcer re-chargement
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                localStorage.removeItem("token");
                setToken("");
              }}
            >
              Purger token
            </button>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="section" style={{ paddingBottom: "3rem" }}>
        <div className="container muted" style={{ fontSize: 14 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              🏅 <strong>{BRAND}</strong> — Billetterie officielle (démo)
            </div>
            <div>© {new Date().getFullYear()} — Projet d’étude</div>
          </div>
        </div>
      </footer>
    </>
  );
}
