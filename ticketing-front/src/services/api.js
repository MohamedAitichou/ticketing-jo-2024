const API_URL =
  (import.meta.env?.VITE_API_URL || "http://localhost:8081").replace(/\/$/, "");

/* ---------- utils ---------- */
async function parseJsonSafe(res) {
  try {
    return await res.clone().json();
  } catch {
    return await res.text();
  }
}
function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ===========================
   AUTH
   =========================== */

export async function register({ email, password, firstName, lastName }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { message: "ok" }
}

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { otpRequired: true }
}

export async function verifyOtp({ email, code }) {
  const res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const raw = await parseJsonSafe(res);
  if (!res.ok) {
    const msg =
      typeof raw === "string"
        ? raw
        : raw?.error || raw?.message || "OTP verify failed";
    throw new Error(msg);
  }

  let token =
    (raw && (raw.token || raw.jwt || raw.accessToken)) ??
    (typeof raw === "string" ? raw : null);

  if (typeof token === "string") token = token.trim().replace(/^"|"$/g, "");
  if (!token) throw new Error("Aucun token reçu du serveur (OTP).");

  return { token };
}

/* ===========================
   ZONE PROTÉGÉE
   =========================== */

export async function fetchMe(token) {
  const res = await fetch(`${API_URL}/api/me`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function fetchOffers(token) {
  const res = await fetch(`${API_URL}/api/offers`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ===========================
   COMMANDES / TICKETS
   =========================== */

export async function checkout(token, items) {
  const res = await fetch(`${API_URL}/api/order/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchMyOrders(token) {
  const res = await fetch(`${API_URL}/api/order/orders`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchOrderTickets(orderId, token) {
  const res = await fetch(`${API_URL}/api/order/${orderId}/tickets`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  const raw = Array.isArray(data) ? data : data?.tickets ?? [];

  return raw.map((t) => ({
    id: t.id ?? t.ticketId ?? null,
    offerId: t.offerId ?? t.offer?.id ?? null,
    finalKey: t.finalKey ?? null,
    consumedAt: t.consumedAt ?? null,
    qrcodeBase64: t.qrcodeBase64 ?? null,
  }));
}

export async function fetchTicketQrBlob(ticketId, token) {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/qr.png`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}

export function ticketPngUrl(ticketId) {
  return `${API_URL}/api/tickets/${ticketId}/qr.png`;
}

export async function verifyTicketKey(token, key) {
  const res = await fetch(
    `${API_URL}/api/tickets/verify?key=${encodeURIComponent(key)}`,
    { headers: { ...authHeader(token) } }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // true/false
}

export async function consumeTicket(finalKey, token) {
  const res = await fetch(`${API_URL}/api/tickets/consume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ finalKey }),
  });
  if (!res.ok) throw new Error(await res.text());
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/* ===========================
   ADMIN — STATS
   =========================== */

export async function fetchAdminSales(token) {
  const res = await fetch(`${API_URL}/api/admin/sales`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { total, byoffer: [...] }
}

/* ===========================
   ADMIN — CRUD OFFERS
   =========================== */

export async function adminListOffers(token) {
  const res = await fetch(`${API_URL}/api/admin/offers`, {
    headers: { ...authHeader(token) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminCreateOffer(token, payload) {
  const res = await fetch(`${API_URL}/api/admin/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(payload), // { code, name, description, priceCents, seats, active }
  });
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    const msg =
      typeof body === "string" ? body : body?.message || body?.error || "Création impossible";
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

export async function adminUpdateOffer(token, id, payload) {
  const res = await fetch(`${API_URL}/api/admin/offers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    const msg =
      typeof body === "string" ? body : body?.message || body?.error || "Mise à jour impossible";
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

export async function adminDeleteOffer(token, id) {
  const res = await fetch(`${API_URL}/api/admin/offers/${id}`, {
    method: "DELETE",
    headers: { ...authHeader(token) },
  });
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    const err = new Error(
      typeof body === "string" ? body : body?.message || body?.error || "Suppression impossible"
    );
    err.status = res.status; 
    err.body = body;
    throw err;
  }
  return true; 
}
