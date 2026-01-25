import React, { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

import "../../CSS/RewardStorePage.css";

// Image imports
import fairpriceImg from "../../images/Fairprice.jpg";
import microsoftImg from "../../images/microsoft365.jpg";
import qrcode from "../../images/placeholderQRCode.png";

// Rewards data configuration
const REWARDS_DATA = [
  {
    id: "5NTUC",
    name: "$5 FairPrice Voucher",
    description: "$5 NTUC FairPrice Voucher redeemable at FairPrice Supermarkets",
    price: 50,
    brand: "FairPrice",
    brandColor: "#e31837",
    category: "voucher",
    imageUrl: fairpriceImg,
  },
  {
    id: "10NTUC",
    name: "$10 FairPrice Voucher",
    description: "$10 NTUC FairPrice Voucher redeemable at FairPrice Supermarkets",
    price: 100,
    brand: "FairPrice",
    brandColor: "#e31837",
    category: "voucher",
    imageUrl: fairpriceImg,
  },
  {
    id: "1YOffice365",
    name: "1 Year Microsoft 365",
    description:
      "1 year subscription to Microsoft 365 including Word, Excel, PowerPoint and more",
    price: 500,
    brand: "Microsoft",
    brandColor: "#00a4ef",
    category: "subscription",
    imageUrl: microsoftImg,
  },
];

const FILTERS = [
  { key: "all", label: "All Rewards" },
  { key: "voucher", label: "Vouchers" },
  { key: "subscription", label: "Subscriptions" },
];

function RewardStorePage() {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [gamification, setGamification] = useState(null);

  // UI state
  const [activeFilter, setActiveFilter] = useState("all");

  const [selectedReward, setSelectedReward] = useState(null);
  const [modalStep, setModalStep] = useState(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const balance = gamification?.currency ?? 0;

  const canAfford = (price) => balance >= price;

  const resetModalState = () => {
    setSelectedReward(null);
    setModalStep(null);
    setInsufficientFunds(false);
    setRedeeming(false);
  };

  const openRewardDetail = (reward) => {
    setSelectedReward(reward);
    setInsufficientFunds(false);
    setModalStep("detail");
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const identityRes = await authFetch(
        "http://localhost:5000/api/auth/current-user",
        { method: "GET" },
        user
      );

      if (!identityRes?.success) return;

      setProfile(identityRes.data);

      if (identityRes.data.role === "student") {
        const studentRes = await authFetch(
          "http://localhost:5000/api/students/profile",
          { method: "GET" },
          user
        );

        if (studentRes?.success) setGamification(studentRes.data.gamification);
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  // Debug add currency (keep for testing; remove in production)
  const debugAddCurrency = async () => {
    try {
      await authFetch(
        "http://localhost:5000/api/students/changecurrency",
        { method: "POST", body: JSON.stringify({ points: 100 }) },
        user
      );
      await loadData();
    } catch (err) {
      console.error("Debug add currency error:", err);
    }
  };

  const filteredRewards = useMemo(() => {
    return REWARDS_DATA.filter((reward) => {
      if (activeFilter === "all") return true;
      return reward.category === activeFilter;
    });
  }, [activeFilter]);

  const handleRedeemClick = () => {
    if (!selectedReward) return;

    if (!canAfford(selectedReward.price)) {
      setInsufficientFunds(true);
      return;
    }

    setModalStep("confirm");
  };

  const confirmRedemption = async () => {
    if (!selectedReward || redeeming) return;

    try {
      setRedeeming(true);

      // Deduct currency
      await authFetch(
        "http://localhost:5000/api/students/changecurrency",
        { method: "POST", body: JSON.stringify({ points: -selectedReward.price }) },
        user
      );

      // Record transaction
      await authFetch(
        "http://localhost:5000/api/students/updateTransactionHistory",
        { method: "POST", body: JSON.stringify({ rewardID: selectedReward.id }) },
        user
      );

      await loadData();
      setModalStep("result");
    } catch (err) {
      console.error("Redemption error:", err);
      alert("Failed to redeem reward. Please try again.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return <div className="reward-loading">Loading Rewards Store...</div>;
  }

  return (
    <div className="reward-store-page">
      <div className="reward-store-header">
        <div className="reward-header-content">
          <h1>Rewards Store</h1>
          <p>Redeem your hard-earned points for exciting prizes!</p>
        </div>

        <div className="reward-balance-card">
          <div className="balance-icon">💎</div>
          <div className="balance-info">
            <span className="balance-label">Your Balance</span>
            <span className="balance-amount">{balance} Points</span>
          </div>
        </div>
      </div>

      <div className="reward-actions">
        <button className="action-btn history-btn" onClick={() => setModalStep("history")}>
          Transaction History
        </button>

        <button className="action-btn debug-btn" onClick={debugAddCurrency}>
           +100 Points
        </button>
      </div>

      <div className="reward-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${activeFilter === f.key ? "active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.icon ? `${f.icon} ` : ""}
            {f.label}
          </button>
        ))}
      </div>

      <div className="rewards-grid">
        {filteredRewards.map((reward) => {
          const affordable = canAfford(reward.price);

          return (
            <div
              key={reward.id}
              className={`reward-card ${!affordable ? "unaffordable" : ""}`}
              onClick={() => openRewardDetail(reward)}
            >
              <div
                className="reward-brand-banner"
                style={{ backgroundColor: reward.brandColor }}
              >
                <span className="brand-name">{reward.brand}</span>
              </div>

              <div className="reward-image">
                {reward.imageUrl ? (
                  <img 
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="reward-img"
                  />
                ) : (
                  <span className="reward-emoji">{reward.emoji}</span>
                )}
              </div>

              <div className="reward-info">
                <h3 className="reward-name">{reward.name}</h3>

                <div className="reward-price-row">
                  <span className="reward-price">{reward.price} Points</span>
                </div>
              </div>

              <button
                className={`quick-redeem-btn ${!affordable ? "disabled" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  openRewardDetail(reward);
                }}
              >
                {affordable ? "Redeem Now" : "View Details"}
              </button>
            </div>
          );
        })}
      </div>

      {modalStep === "detail" && selectedReward && (
        <div className="modal-overlay" onClick={resetModalState}>
          <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={(e) => { e.stopPropagation(); resetModalState(); }}>
              ✕
            </button>

            <div className="modal-reward-icon-top">
              {selectedReward.imageUrl ? (
                <img 
                  src={selectedReward.imageUrl}
                  alt={selectedReward.name}
                  className="modal-reward-img"
                />
              ) : (
                <span className="modal-emoji">{selectedReward.emoji}</span>
              )}
            </div>

            <div className="modal-content">
              <h2>{selectedReward.name}</h2>
              <p className="modal-description">{selectedReward.description}</p>

              <div className="modal-price-display">
                <span className="price-tag">{selectedReward.price} Points</span>
              </div>

              {insufficientFunds && (
                <div className="insufficient-funds-alert">
                  ⚠️ Insufficient points! You need {selectedReward.price - balance} more
                  points.
                </div>
              )}

              <div className="modal-actions">
                <button
                  className={`redeem-btn ${
                    !canAfford(selectedReward.price) ? "disabled" : ""
                  }`}
                  onClick={handleRedeemClick}
                  disabled={!canAfford(selectedReward.price)}
                >
                  {canAfford(selectedReward.price)
                    ? `Redeem for ${selectedReward.price} Points`
                    : "Not Enough Points"}
                </button>

                <button className="cancel-btn" onClick={resetModalState}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalStep === "confirm" && selectedReward && (
        <div className="modal-overlay" onClick={() => setModalStep("detail")}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Redemption</h2>

            <p>
              Redeem <strong>{selectedReward.name}</strong> for{" "}
              <strong>{selectedReward.price} points</strong>?
            </p>

            <p className="balance-after">
              Balance after: {balance - selectedReward.price} Points
            </p>

            <div className="confirm-actions">
              <button
                className="confirm-yes-btn"
                onClick={confirmRedemption}
                disabled={redeeming}
              >
                {redeeming ? "Redeeming..." : "✓ Yes, Redeem!"}
              </button>

              <button
                className="confirm-no-btn"
                onClick={() => setModalStep("detail")}
                disabled={redeeming}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {modalStep === "result" && selectedReward && (
        <div className="modal-overlay" onClick={resetModalState}>
          <div className="result-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Congratulations!</h2>
            <p>You have successfully redeemed:</p>
            <h3 className="redeemed-item">{selectedReward.name}</h3>

            <div className="qr-code-container">
              <p className="qr-instruction">Scan this QR code to claim your reward:</p>
              <img src={qrcode} alt="Redemption QR Code" className="qr-code-image" />
            </div>

            <button className="done-btn" onClick={resetModalState}>
              Done
            </button>
          </div>
        </div>
      )}

      {modalStep === "history" && (
        <div className="modal-overlay" onClick={resetModalState}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={resetModalState}>
              ✕
            </button>

            <h2>Transaction History</h2>

            <div className="history-list">
              {gamification?.incentiveTransactionHistory?.length > 0 ? (
                gamification.incentiveTransactionHistory.map((entry, index) => {
                  const rewardInfo = REWARDS_DATA.find((r) => r.id === entry.reward);

                  return (
                    <div key={index} className="history-item">

                      <div className="history-details">
                        <span className="history-reward-name">
                          {rewardInfo?.name || entry.reward}
                        </span>
                        <span className="history-date">Redeemed on: {entry.dateRedeemed}</span>
                      </div>

                      <div className="history-points">
                        -{rewardInfo?.price ?? "?"} pts
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-history">
                  <span className="no-history-icon">📭</span>
                  <p>No transactions yet. Start redeeming rewards!</p>
                </div>
              )}
            </div>

            <button className="close-history-btn" onClick={resetModalState}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RewardStorePage;