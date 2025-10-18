import { useEffect, useMemo, useState } from "react";
import { fetchMyOrders } from "../services/api";

export default function Orders({ onOpenTickets }) {
  const token = useMemo(() => localStorage.getItem("jwt") || "", []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchMyOrders(token);
        setOrders(list);
      } catch (e) {
        setErr(e.message || "Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", color: "#eee" }}>
      <h2>Mes commandes</h2>
      {loading && <p>Chargement…</p>}
      {err && <p style={{ color: "#ff6b6b" }}>{err}</p>}
      {!loading && orders.length === 0 && <p>Aucune commande pour l’instant.</p>}

      {orders.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#1f1f1f" }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Créée le</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={td}>{o.id}</td>
                <td style={td}>{new Date(o.createdAt).toLocaleString()}</td>
                <td style={td}>
                  <button onClick={() => onOpenTickets(o.id)}>Voir les tickets</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #333", padding: "8px" };
const td = { borderBottom: "1px solid #333", padding: "8px" };
