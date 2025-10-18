import { useEffect, useState } from "react";
import { fetchAdminSales } from "../services/api";

export default function Admin({ token, me }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [data, setData] = useState({ total: 0, byoffer: [] });

  const isAdmin = me?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        setErr(null);
        const d = await fetchAdminSales(token);
        if (alive) setData(d);
      } catch (e) {
        if (alive) setErr(e.message || "Erreur");
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (token && isAdmin) run();
    return () => { alive = false; };
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="panel" style={{ padding: 16 }}>
        <h3>Accès restreint</h3>
        <p>Vous devez être administrateur pour voir ces informations.</p>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="muted">Tableau de bord — Admin</h2>

        {loading && <p>Chargement…</p>}
        {err && (
          <div className="panel" style={{ padding: 12, border: '1px solid #f66' }}>
            <strong>Erreur:</strong> {String(err)}
          </div>
        )}

        {!loading && !err && (
          <>
            <div className="panel" style={{ padding: 16, marginBottom: 16 }}>
              <strong>Total de tickets vendus :</strong> {data.total}
            </div>

            <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #ddd' }}>Offer ID</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #ddd' }}>Nom de l’offre</th>
                    <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #ddd' }}>Tickets vendus</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byoffer?.map((row) => (
                    <tr key={row.offerId}>
                      <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{row.offerId}</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{row.offerName}</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                        {row.ticketsSold}
                      </td>
                    </tr>
                  ))}
                  {(!data.byoffer || data.byoffer.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ padding: 12 }}>Aucune vente pour l’instant.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
