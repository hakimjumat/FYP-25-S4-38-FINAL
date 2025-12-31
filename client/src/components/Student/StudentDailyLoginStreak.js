import React, { useState } from "react";
import "../../CSS/StudentDailyLoginStreak.css";

// component now takes data in (streak, loggedInDays) from parent component

// update 2L add isClaimed  prop to track if reward has been claimed
function StudentDailyLoginStreak({
  isOpen,
  close,
  isClaimed = false,
  streak = 0,
  loggedInDays = [],
  claim,
}) {
  const [claimed, setClaimed] = useState(false); // check if the reward has been claimed
  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthTitle = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handleClaimClick = () => {
    setClaimed(true); // if user click on claim reward it will mark it as claimed (true)

    //execute backend action passed from parent component
    if (typeof claim === "function") {
      claim();
    }
    setTimeout(() => {
      alert("🎉You have claim the reward! Keep the streak going!🎉");
    }, 300);
  };

  if (!isOpen) return null; // if modal is closed, dont show anything

  return (
    <div className="daily-login-background" onClick={close}>
      <div className="daily-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="daily-login-close" onClick={close}>
          X
        </button>
        
        <h2 className="daily-login-title">Daily Login</h2>
        <p className="daily-login-word">Stay consistent with learning! 🔥</p>

        <div className="daily-login-streak">
          <div className="daily-login-streak-number">{streak}</div>
          <div className="daily-login-streak-text">DAYS IN A ROW</div>
        </div>

        <div className="daily-login-month">{monthTitle}</div>

        <div className="daily-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="daily-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="daily-day">
          {Array.from(
            { length: firstDayOfMonth },
            (
              _,
              i // blank before day 1
            ) => (
              <div key={`blank-${i}`} className="daily-cell-blank"></div>
            )
          )}

          {Array.from({ length: daysInMonth }, (_, i) => {
            // actual days
            const dayNum = i + 1;
            const isLoggedIn = loggedInDays.includes(dayNum);
            const isToday = dayNum === today && !isLoggedIn;

            const className = [
              "daily-cell",
              isLoggedIn ? "logged" : "",
              isToday ? "today" : "",
            ].join(" ");

            return (
              <div key={dayNum} className={className}>
                {dayNum}
              </div>
            );
          })}
        </div>

        <button
          className="daily-login-claim-button"
          onClick={handleClaimClick}
          disabled={isClaimed || claimed}
        >
          {isClaimed || claimed ? "Claimed" : "Claim today bonus!"}
        </button>
      </div>
    </div>
  );
}

export default StudentDailyLoginStreak;
