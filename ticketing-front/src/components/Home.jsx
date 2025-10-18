import { useEffect, useMemo, useState } from 'react';
import {
  checkout,
  fetchOffers,
  fetchMyOrders,
  fetchOrderTickets,
  ticketPngUrl,
  consumeTicket,
} from '../services/api';

export default function Home({ user, token, onLogout }) {
  const [offers, setOffers] = useState([]);
  const [qtyByOffer, setQtyByOffer] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [ofs, ords] = await Promise.all([
          fetchOffers(token),
          fetchMyOrders(token)
        ]);
        setOffers(ofs);
        setOrders(ords || []);
        if ((ords || []).length && !activeOrderId) {
          setActiveOrderId(ords[0].id);
        }
      } catch (e) {
        setErr((e && e.message) || 'Chargement impossible');
      } finally {
        setLoading(false);
      }
    })();

  }, [token]);

  useEffect(() => {
    if (!activeOrderId) { setTickets([]); return; }
    (async () => {
      try {
        setTicketsLoading(true);
        setErr('');
        const ts = await fetchOrderTickets(activeOrderId, token);
        setTickets(ts);
      } catch (e) {
        setErr((e && e.message) || 'Tickets introuvables');
      } finally {
        setTicketsLoading(false);
      }
    })();
  }, [activeOrderId, token]);

  function onQtyChange(id, v) {
    const n = Math.max(1, parseInt(v || '1', 10) || 1);
    setQtyByOffer(prev => ({ ...prev, [id]: n }));
  }

  async function handleBuy(of) {
    try {
      setLoading(true);
      setMsg('Achat en cours…'); setErr('');
      const qty = qtyByOffer[of.id] ?? 1;
      const res = await checkout(token, [{ offerId: of.id, qty }]);
      setMsg(`Commande #${res.orderId} OK — ${res?.tickets?.length||0} billets générés`);

      const ords = await fetchMyOrders(token);
      setOrders(ords || []);
      if ((ords || []).length) {
        setActiveOrderId(ords[0].id); 
      }
    } catch (e) {
      setErr('Achat impossible : ' + (e.message || 'erreur'));
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 2500);
    }
  }

  async function handleConsume(finalKey) {
    try {
      setErr(''); setMsg('Consommation…');
      await consumeTicket(finalKey, token);
      const ts = await fetchOrderTickets(activeOrderId, token);
      setTickets(ts);
      setMsg('Billet consommé ✅');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      setErr('Consommation impossible : ' + (e.message || 'erreur'));
    }
  }

  const activeOrder = useMemo(
    () => orders.find(o => o.id === activeOrderId) || null,
    [orders, activeOrderId]
  );

  return (
    <div className="container stack">
      <header className="row" style={{ justifyContent:'space-between' }}>
        <h2 style={{margin:0}}>Bienvenue {user?.username ? `— ${user.username}` : ''}</h2>
        <button className="btn-muted" onClick={onLogout}>Se déconnecter</button>
      </header>

      {(msg || err) && (
        <div className="row">
          {msg && <span className="badge badge-ok">{msg}</span>}
          {err && <span className="badge badge-danger">{err}</span>}
        </div>
      )}

      {/* Offres */}
      <section className="card stack">
        <div className="row" style={{justifyContent:'space-between'}}>
          <h3>Offres</h3>
          <button className="btn-muted" onClick={async () => {
            try{
              setLoading(true);
              const ofs = await fetchOffers(token);
              setOffers(ofs);
            }finally{ setLoading(false);}
          }}>Rafraîchir</button>
        </div>

        <div className="grid grid-3">
          {offers.map(of => (
            <div key={of.id} className="card stack" style={{padding:'14px'}}>
              <div className="row" style={{justifyContent:'space-between'}}>
                <strong>{of.name}</strong>
                <span className="badge">{(of.priceCents/100).toFixed(2)} €</span>
              </div>
              <div className="muted">{of.description}</div>
              <div className="hr" />
              <div className="row" style={{justifyContent:'space-between'}}>
                <div className="row">
                  <span className="muted">Quantité</span>
                  <input
                    style={{ width:92 }}
                    type="number" min="1"
                    value={qtyByOffer[of.id] ?? 1}
                    onChange={e => onQtyChange(of.id, e.target.value)}
                  />
                </div>
                <button disabled={loading} onClick={() => handleBuy(of)}>
                  Acheter
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mes commandes + tickets */}
      <section className="stack">
        <div className="card">
          <h3>Mes commandes</h3>
          <div className="grid grid-3">
            {orders.map(o => (
              <button
                key={o.id}
                className="card"
                style={{
                  padding:'10px',
                  borderColor: o.id===activeOrderId ? 'rgba(110,168,254,.5)':'rgba(255,255,255,.06)',
                  boxShadow: o.id===activeOrderId ? '0 0 0 3px rgba(110,168,254,.2)' : undefined
                }}
                onClick={() => setActiveOrderId(o.id)}
              >
                <div className="row" style={{justifyContent:'space-between'}}>
                  <strong>Commande #{o.id}</strong>
                </div>
                <div className="muted">
                  {new Date(o.createdAt || Date.now()).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card stack">
          <div className="row" style={{justifyContent:'space-between'}}>
            <h3>Billets {activeOrder ? `— commande #${activeOrder.id}` : ''}</h3>
            {activeOrderId && (
              <button className="btn-muted" onClick={async ()=>{
                setTicketsLoading(true);
                const ts=await fetchOrderTickets(activeOrderId, token);
                setTickets(ts);
                setTicketsLoading(false);
              }}>Rafraîchir</button>
            )}
          </div>

          {!activeOrderId && <div className="muted">Sélectionne une commande pour voir les billets.</div>}

          {ticketsLoading ? (
            <div className="muted">Chargement des billets…</div>
          ) : (
            <div className="stack">
              {tickets.map(t => (
                <div key={t.id} className="card ticket">
                  <img src={ticketPngUrl(t.id)} alt={`QR ${t.id}`} />
                  <div className="stack">
                    <div className="row" style={{gap:10, flexWrap:'wrap'}}>
                      <strong>ticket #{t.id}</strong>
                      <span className="badge">offerId: {t.offerId}</span>
                      {t.consumedAt
                        ? <span className="badge badge-warn">consommé le {new Date(t.consumedAt).toLocaleString()}</span>
                        : <span className="badge badge-ok">valide</span>
                      }
                    </div>

                    <div className="row" style={{gap:8, flexWrap:'wrap'}}>
                      <span className="muted">finalKey:</span>
                      <span className="mono" style={{ wordBreak:'break-all' }}>{t.finalKey || '—'}</span>
                      {t.finalKey && (
                        <button className="btn-muted" onClick={()=>{
                          navigator.clipboard?.writeText(t.finalKey);
                          setMsg('Clé copiée !'); setTimeout(()=>setMsg(''),1200);
                        }}>Copier</button>
                      )}
                    </div>

                    {!t.consumedAt && t.finalKey && (
                      <div className="row" style={{gap:8}}>
                        <button onClick={() => handleConsume(t.finalKey)}>Consommer</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activeOrderId && tickets.length===0 && (
                <div className="muted">Aucun billet pour cette commande.</div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
