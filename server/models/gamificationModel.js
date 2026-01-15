// to handle points, badges, and achievements related crud database operations e.g create, read, update, delete
const db = require("../config/db");

class GamificationModel {
  constructor() {
    this.collection = db.collection("gamification");
  }

  // helper function to calculate level and points after adding new points
  _calculateLevelProgress(currentLevel, currentPoints, pointsToAdd) {
    let newPoints = currentPoints + pointsToAdd;
    let newlevel = currentLevel;

    // while points are 100 or more, level up and reduce points by 100
    while (newPoints >= 100) {
      newPoints -= 100;
      newlevel += 1;
    }

    return { newlevel, newPoints };
  }

  // Get gamification data for a student
  async getStudentGamification(uid) {
    try {
      const doc = await this.collection.doc(uid).get();

      if (!doc.exists) {
        // Return default gamification data for new users
        return {
          points: 0,
          level: 1,
          badges: [],
          streak: 0,
          lastLogin: null,
          loginHistory: [],
          currency: 0,
        };
      }

      return doc.data();
    } catch (error) {
      throw new Error(`Failed to fetch gamification data: ${error.message}`);
    }
  }

  //updat point for user
  async addPoints(uid, pointsToAdd) {
    try {
      const docRef = this.collection.doc(uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        // Create new gamification profile
        await docRef.set({
          points: pointsToAdd,
          level: 1,
          badges: [],
          streak: 0,
          lastLogin: new Date(),
          loginHistory: [new Date()],
          currency: 0,
        });
      } else {
        // Update existing points
        const data = doc.data();
        const currentPoints = data.points || 0;
        const currentLevel = data.level || 1;

        const { newlevel, newPoints } = this._calculateLevelProgress(
          currentLevel,
          currentPoints,
          pointsToAdd
        );

        await docRef.update({
          points: newPoints,
          level: newlevel,
        });
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to add points: ${error.message}`);
    }
  }

  // Award a badge to the student
  async awardBadge(uid, badgeName) {
    try {
      const docRef = this.collection.doc(uid);
      const doc = await docRef.get();

      const currentBadges = doc.exists ? doc.data().badges || [] : [];

      if (!currentBadges.includes(badgeName)) {
        currentBadges.push(badgeName);
        await docRef.update({ badges: currentBadges });
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to award badge: ${error.message}`);
    }
  }

  async addrecord(uid, rewardID){
    try{
      const docRef = this.collection.doc(uid);
      const doc = await docRef.get();
      const now = new Date();
      const todayDateStr = now.toDateString(); // e.g., "Fri Dec 19 2025"

      const currentincentiverecord = doc.exists ? doc.data().incentiveTransactionHistory || [] : [];
      currentincentiverecord.push({reward: rewardID, dateRedeemed: todayDateStr});
      await docRef.update({incentiveTransactionHistory: currentincentiverecord});

      return { success: true };
    } catch (error){
      throw new Error(`Failed to update Transaction History: ${error.message}`);
    }
  }

  // daily log in streak update + extract day numbers for the current month + update loginHistory
  async updateStreak(uid) {
    try {
      const docRef = this.collection.doc(uid);
      const doc = await docRef.get();
      const now = new Date();
      const todayDateStr = now.toDateString(); // e.g., "Fri Dec 19 2025"

      // Helper: Extract day numbers (1-31) for the current month
      const getDaysForCurrentMonth = (dateList) => {
        return dateList
          .filter(
            (d) =>
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
          )
          .map((d) => d.getDate());
      };

      if (!doc.exists) {
        // Create new gamification profile if it doesn't exist
        await docRef.set({
          points: 0,
          level: 1,
          badges: [],
          streak: 1,
          lastLogin: now,
          loginHistory: [now], // Initialize history with today
          currency: 0,
        });
        return { streak: 1, loggedInDays: [now.getDate()] };
      }

      const data = doc.data();

      //convert firerestore timestamp to js date objects
      // if lastLogin has toDate function, use it to convert, else assume it's already a Date object
      const lastLogin = data.lastLogin?.toDate
        ? data.lastLogin.toDate()
        : new Date(data.lastLogin);

      let rawHistory = data.loginHistory || [];
      // convert each entry in rawHistory to Date object if it has toDate function
      let historyDates = rawHistory.map((entry) =>
        entry.toDate ? entry.toDate() : new Date(entry)
      );

      // check if already logged in today to prevent double counting
      const alreadyLoggedInToday = historyDates.some(
        (d) => d.toDateString() === todayDateStr
      );

      let newStreak = data.streak || 0;
      let finalHistory = historyDates;

      if (!alreadyLoggedInToday) {
        // logic to calculate streak
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        // if last login was yesterday, increment streak. otherwise reset to 1
        if (
          lastLogin &&
          lastLogin.toDateString() === yesterday.toDateString()
        ) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        // add today to history
        finalHistory = [...historyDates, now];

        //update database
        await docRef.update({
          streak: newStreak,
          lastLogin: now,
          loginHistory: finalHistory,
        });
      }

      // return the data neeed to display login calendar
      return {
        streak: newStreak,
        loggedInDays: getDaysForCurrentMonth(finalHistory),
      };
    } catch (error) {
      throw new Error(`Failed to update streak: ${error.message}`);
    }
  }

  async claimDailyReward(uid, pointstoAdd) {
    try {
      const docRef = this.collection.doc(uid);
      const doc = await docRef.get();
      const now = new Date();
      const todayDateStr = now.toDateString(); // e.g., "Fri Dec 19 2025"

      if (!doc.exists) {
        throw new Error("User profile not found");
      }

      const data = doc.data();

      // 1. check if reward already claimed today
      if (data.lastDailyReward) {
        const lastRewardDate = data.lastDailyReward.toDate
          ? data.lastDailyReward.toDate()
          : new Date(data.lastDailyReward);
        if (lastRewardDate.toDateString() === todayDateStr) {
          return { success: false, message: "Reward already claimed today" };
        }
      }

      //2. if success: add points and update lastDailyReward
      const currentPoints = data.points || 0;
      const currentLevel = data.level || 1;

      const { newlevel, newPoints } = this._calculateLevelProgress(
        currentLevel,
        currentPoints,
        pointstoAdd
      );
      await docRef.update({
        points: newPoints,
        level: newlevel,
        lastDailyReward: now,
      });

      return { success: true, points: newPoints, level: newlevel };
    } catch (error) {
      throw new Error(`Failed to claim daily reward: ${error.message}`);
    }
  }

  //changes amount of currency in account
  async changeGamificationCurrency(uid, changeByValue){
    try {
      const docRef = this.collection.doc(uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error("User profile not found");
      } 
      else {
        // Update existing points
        const data = doc.data();
        const currentPoints = data.currency || 0;
        const newCurrencyAmount = currentPoints + changeByValue;
        await docRef.update({
          currency: newCurrencyAmount,
        });
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to change currency value: ${error.message}`);
    }
  }
}

module.exports = new GamificationModel();
