// to handle points, badges, and achievements related crud database operations e.g create, read, update, delete
const db = require("../config/db");

class GamificationModel {
  constructor() {
    this.collection = db.collection("gamification");
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
        });
      } else {
        // Update existing points
        const currentPoints = doc.data().points || 0;
        await docRef.update({
          points: currentPoints + pointsToAdd,
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

  // daily log in streak update
  async updateStreak(uid) {
    try {
      const docRef = this.collection.doc(uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({
          streak: 1,
          lastLogin: new Date(),
        });
        return { streak: 1 };
      }

      const data = doc.data();
      const lastLogin = data.lastLogin?.toDate();
      const now = new Date();

      // Check if last login was yesterday
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      let newStreak = data.streak || 0;

      if (lastLogin && lastLogin.toDateString() === oneDayAgo.toDateString()) {
        // Consecutive day login
        newStreak += 1;
      } else if (lastLogin && lastLogin.toDateString() !== now.toDateString()) {
        // Streak broken
        newStreak = 1;
      }

      await docRef.update({
        streak: newStreak,
        lastLogin: now,
      });

      return { streak: newStreak };
    } catch (error) {
      throw new Error(`Failed to update streak: ${error.message}`);
    }
  }
}

module.exports = new GamificationModel();
