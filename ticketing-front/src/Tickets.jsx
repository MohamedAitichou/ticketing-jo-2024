import { useEffect, useMemo, useState } from "react";
import { fetchOrderTickets } from "./services/api";

export default function Tickets() {
  const token = useMemo(() => localStorage.getItem("token") || "", []);
  const [orderId, setOrderId] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleLoadTickets(e) {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    try {
      const list = await fetchOrderTickets(orderId, token);
      setTickets(list);
    } catch (err) {
      alert(err.message || "Erreur lors du chargement des tickets");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", color: "#eee" }}>
      <h1>Tickets — Affichage & QR</h1>

      <form onSubmit={handleLoadTickets} style={{ marginBottom: 20 }}>
        <label>
          ID de la commande :
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="ex: 1"
            style={{ marginLeft: 10, padding: "6px 10px" }}
          />
        </label>
        <button type="submit" style={{ marginLeft: 12, padding: "6px 12px" }}>
          Charger les tickets
        </button>
      </form>

      {loading && <p>Chargement…</p>}
      {!loading && tickets.length === 0 && orderId && (
        <p>Aucun ticket trouvé pour la commande {orderId}.</p>
      )}

      {!loading && tickets.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#1f1f1f",
            }}
          >
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Offre</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.ticketId}>
                  <td style={td}>{t.ticketId}</td>
                  <td style={td}>{t.offerId}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, 220px)",
              gap: 16,
              marginTop: 24,
            }}
          >
            {tickets.map((t) => (
              <div key={t.ticketId} style={{ textAlign: "center" }}>
                <img
                  src={t.qrcodeBase64}
                  alt={`QR ticket ${t.ticketId}`}
                  style={{ width: 220, height: 220, background: "#fff" }}
                />
                <div style={{ fontSize: 12, marginTop: 6 }}>ticket #{t.ticketId}</div>
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = t.qrcodeBase64;
                    a.download = `ticket-${t.ticketId}.png`;
                    a.click();
                  }}
                >
                  Télécharger PNG
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #333", padding: "8px" };
const td = { borderBottom: "1px solid #333", padding: "8px" };
