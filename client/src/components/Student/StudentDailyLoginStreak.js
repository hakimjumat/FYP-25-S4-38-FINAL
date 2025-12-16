import React, { useState } from "react";
import "../../CSS/StudentDailyLoginStreak.css";

function StudentDailyLoginStreak({ isOpen, close, claim, streak = 0, loggedInDays = [] }) {
  const [ claimed, setClaimed ] = useState(false);   // check if the reward has been claimed
  const [localDays, setLocalDays] = useState(loggedInDays);

  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth(); 
  const year = now.getFullYear();
  const daysInMonth = new Date(year, month +1,0).getDate();
  const monthTitle = now.toLocaleString("en-US", {month:"long",year:"numeric"});
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const streakToday = (localDays, today) => {
    const set = new Set(localDays);
    let s = 0;
    let d = today;

    while (set.has(d)) {
      s++;
      d--;
    }
    return s;
  }

  const streakCount = streakToday(localDays, today);

  const claimReward = () => {
    setClaimed(true);  // if user click on claim reward it will mark it as claimed (true)

    setLocalDays((prev) =>
      prev.includes(today) ? prev : [...prev, today]
    );

    if (typeof claim === "function") claim();

    setTimeout(() => {
      alert("🎉You have claim the reward! Keep the streak going!🎉");
      }, 300);
};

if (!isOpen) return null;  // if modal is closed, dont show anything

return (
  <div className="daily-login-background" onClick={close}>
    <div className="daily-login-modal" onClick={(e) => e.stopPropagation()}>
      <h2 className="daily-login-title">Daily Login</h2>
      <p className="daily-login-word">Stay consistent with learning! 🔥</p>

      <div className="daily-login-streak">
        <div className="daily-login-streak-number">{streakCount}</div>
        <div className="daily-login-streak-text">DAYS IN A ROW</div>
      </div>

      <div className="daily-login-month">{monthTitle}</div>

      <div className="daily-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) =>(
          <div key={day} className="daily-weekday">
            {day}
          </div>  
        ))}
      </div>

      <div className="daily-day"> 
        {Array.from({length: firstDayOfMonth}, (_,i) => (   // blank before day 1
          <div key={`blank-${i}`} className="daily-cell-blank"></div>
        ))}

        {Array.from({ length: daysInMonth }, (_,i) => {   // actual days
          const dayNum = i + 1;
          const isLoggedIn = localDays.includes(dayNum);
          const isToday = dayNum === today & !isLoggedIn;

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

      <button className="daily-login-claim-button" onClick={claimReward} disabled={claimed}>
        {claimed ? "Claimed": "Claim today bonus!"}
      </button>
    </div>
  </div>
);
}

export default StudentDailyLoginStreak;