import React from 'react';

/**
 * Tab de Mercado — canjear puntos por recompensas
 */
export default function RewardsTab({ rewards, totalPoints, onBuyReward, purchaseHistory = [] }) {
  return (
    <div className="tab-content fade-in">
      <div>
        <h2 className="tab-title">Mercado</h2>
      </div>

      <div className="rewards-grid">
        {rewards.map((reward) => {
          const canAfford = totalPoints >= reward.cost;
          return (
            <div key={reward.id} className="reward-card">
              <div className="reward-icon">{reward.icon}</div>
              <div className="reward-info">
                <h3 className="reward-name">{reward.name}</h3>
                <p className="reward-cost">{reward.cost} pts</p>
              </div>
              <button
                onClick={() => onBuyReward(reward)}
                disabled={!canAfford}
                className={`reward-buy-btn ${canAfford ? 'can-afford' : 'cannot-afford'}`}
              >
                Comprar
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2 className="tab-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Inventario / Historial</h2>
        {purchaseHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Aún no has comprado recompensas.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {purchaseHistory.map(purchase => (
              <div key={purchase.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '24px', marginRight: '16px' }}>{purchase.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>{purchase.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{purchase.date}</p>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 'bold' }}>
                  -{purchase.cost} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
