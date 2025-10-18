import { useEffect, useMemo, useState } from "react";
import {
  fetchOrderTickets,
  fetchTicketQrBlob,
  consumeTicket,
} from "../services/api";

export default function Tickets({ orderId, onBack }) {
  const token = useMemo(() => localStorage.getItem("jwt") || "", []);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrUrlById, setQrUrlById] = useState({});
  const [err, setErr] = useState("");

  useEffect(() => {
    return () => {
      Object.values(qrUrlById).forEach(URL.revokeObjectURL);
    };
  }, [qrUrlById]);

  useEffect(() => {
    (async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const list = await fetchOrderTickets(orderId, token);
        setTickets(list);
        Object.values(qrUrlById).forEach(URL.revokeObjectURL);
        setQrUrlById({});
      } catch (e) {
        setErr(e.message || "Erreur lors du chargement des tickets");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, token]);

  async function handleShowQr(ticketId) {
    try {
      const blob = await fetchTicketQrBlob(ticketId, token);
      const url = URL.createObjectURL(blob);
      setQrUrlById((m) => ({ ...m, [ticketId]: url }));
    } catch (e) {
      alert(e.message || "Impossible de charger le QR");
    }
  }

  async function handleConsume(finalKey) {
    if (!window.confirm("Confirmer la consommation de ce ticket ?")) return;
    try {
      await consumeTicket(finalKey, token);
      const list = await fetchOrderTickets(orderId, token);
      setTickets(list);
      alert("Ticket consommé ✅");
    } catch (e) {
      alert(e.message || "Impossible de consommer le ticket");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", color: "#eee" }}>
      <button onClick={onBack} style={{ marginBottom: 12 }}>← Retour</button>
      <h2>Tickets — Commande #{orderId}</h2>
      {loading && <p>Chargement…</p>}
      {err && <p style={{ color: "#ff6b6b" }}>{err}</p>}

      {!loading && tickets.length === 0 && <p>Aucun ticket pour cette commande.</p>}

      {tickets.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#1f1f1f" }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Offre</th>
              <th style={th}>FinalKey</th>
              <th style={th}>Consommé ?</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td style={td}>{t.id}</td>
                <td style={td}>{t.offerId}</td>
                <td style={{ ...td, maxWidth: 240, wordBreak: "break-all" }}>{t.finalKey}</td>
                <td style={td}>{t.consumedAt ? "Oui" : "Non"}</td>
                <td style={td}>
                  <button onClick={() => handleShowQr(t.id)}>Voir QR</button>
                  {!t.consumedAt && (
                    <button onClick={() => handleConsume(t.finalKey)} style={{ marginLeft: 8 }}>
                      Consommer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 220px)", gap: 16, marginTop: 24 }}>
        {tickets.map((t) =>
          qrUrlById[t.id] ? (
            <div key={t.id} style={{ textAlign: "center" }}>
              <img
                src={qrUrlById[t.id]}
                alt={`QR ticket ${t.id}`}
                style={{ width: 220, height: 220, background: "#fff" }}
              />
              <div style={{ fontSize: 12, marginTop: 6 }}>ticket #{t.id}</div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #333", padding: "8px" };
const td = { borderBottom: "1px solid #333", padding: "8px" };
