import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import BADGE_LIBRARY from "../../services/badgeConfig";

import "../../CSS/HomePage.css";
import "../../CSS/CoursePage.css";

export default function StudentDashboard({ profile, gamification }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("materials");

  // stats
  const currentLevel = gamification?.level || 1;
  const currentPoints = gamification?.points || 0;
  const currentStreak = gamification?.streak || 0;
  const badgesCount = gamification?.badges?.length || 0;

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        const response = await authFetch(
          "http://localhost:5000/api/students/courses",
          { method: "GET" },
          user
        );

        if (response.success) {
          const myEnrolled = response.data.filter(
            (course) =>
              course.enrolledStudents && course.enrolledStudents.includes(user.uid)
          );
          setEnrolledCourses(myEnrolled);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const courseColors = [
    "linear-gradient(135deg, rgba(255,0,0,0.5) 0%, rgba(255,0,0,0.25) 100%)",
    "linear-gradient(135deg, rgba(0,255,0,0.45) 0%, rgba(0,255,0,0.2) 100%)",
    "linear-gradient(135deg, rgba(255,255,0,0.5) 0%, rgba(255,255,0,0.25) 100%)",
    "linear-gradient(135deg, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0.25) 100%)",
    "linear-gradient(135deg, rgba(245,165,0,0.5) 0%, rgba(245,165,0,0.25) 100%)",
  ];

  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setActiveTab("materials");
    setIsModalOpen(true);
  };

  const closeCourseModal = () => {
    setSelectedCourse(null);
    setIsModalOpen(false);
  };

  return (
    <div className="student-dashboard">
      <div className="welcome-header">
        <div className="welcome-greeting">
          <div className="welcome-avatar">{profile?.avatar || "👨‍🎓"}</div>
          <div className="welcome-text">
            <h1>Welcome back, {profile?.firstName || "there"}!</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
        </div>

        <div className="quick-actions">
          <Link to="/ProfilePage">
            <button className="btn btn-primary">My Profile</button>
          </Link>
          <Link to="/CoursePage">
            <button className="btn btn-secondary">Browse Courses</button>
          </Link>
          <Link to="/RewardStorePage">
            <button className="btn btn-primary">Rewards Store</button>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-purple">⭐</div>
          <h3>{currentLevel}</h3>
          <p>Current Level</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green">💎</div>
          <h3>{currentPoints}</h3>
          <p>Total Points</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">🔥</div>
          <h3>{currentStreak}</h3>
          <p>Day Streak</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue">🏅</div>
          <h3>{badgesCount}</h3>
          <p>Badges Earned</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-teal">📚</div>
          <h3>{enrolledCourses.length}</h3>
          <p>Courses Enrolled</p>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-card-header">📈 Your Progress</div>
        <div className="progress-main">
          <div className="level-circle">
            <span className="label">Level</span>
            <span className="number">{currentLevel}</span>
          </div>

          <div className="progress-details">
            <h3>Great Progress! Keep it up! 🚀</h3>

            <div className="xp-bar-container">
              <div className="xp-bar-fill" style={{ width: `${currentPoints}%` }} />
            </div>

            <div className="xp-text">
              <span>{currentPoints} / 100 XP</span>
              <span>Level {currentLevel + 1}</span>
            </div>
          </div>
        </div>

        <div className="streak-badge">
          <span>🔥</span>
          <span>
            {currentStreak} Day Streak -{" "}
            {currentStreak >= 7 ? "You're on fire!" : "Keep going!"}
          </span>
        </div>
      </div>

      <div className="continue-learning-section">
        <div className="section-header">
          <h2>📚 Continue Learning</h2>
          <Link to="/CoursePage" className="view-all-link">
            View All →
          </Link>
        </div>

        {coursesLoading ? (
          <p>Loading courses..</p>
        ) : enrolledCourses.length > 0 ? (
          <div className="courses-grid">
            {enrolledCourses.map((course, index) => {
              const content = course.content || [];
              const quizzesCount = content.filter(
                (item) => item.type === "quiz" || item.type === "test"
              ).length;
              const materialsCount = content.length - quizzesCount;

              return (
                <div key={course.id} className="course-card">
                  <div
                    className="course-card-header"
                    style={{
                      background: courseColors[index % courseColors.length],
                    }}
                  >
                    {course.title?.charAt(0) || "C"}
                  </div>

                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p className="course-instructor">
                      🧑‍🏫 Instructor: {course.instructorName || "Unknown"}
                    </p>

                    <div className="course-stats">
                      <span>📖 {materialsCount} Materials</span>
                      <span>📝 {quizzesCount} Quizzes</span>
                    </div>

                    <button
                      className="continue-btn"
                      onClick={() => openCourseModal(course)}
                    >
                      Continue Learning →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-courses">
            <div className="no-courses-icon">📚</div>
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/CoursePage">
              <button className="btn btn-primary" style={{ marginTop: "12px" }}>
                Browse Courses
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">🏅 Your Badges</div>

          {gamification?.badges && gamification.badges.length > 0 ? (
            <div className="badges-grid">
              {gamification.badges.map((badgeName, index) => {
                const badgeInfo = BADGE_LIBRARY[badgeName] || {
                  icon: "❓",
                  description: "Unknown badge",
                  color: "#f0f0f0",
                };

                return (
                  <div key={index} className="badge-item">
                    <div
                      className="badge-icon-wrapper"
                      style={{ backgroundColor: badgeInfo.color }}
                    >
                      {badgeInfo.icon}
                    </div>
                    <h4>{badgeName}</h4>
                    <p>{badgeInfo.description.substring(0, 25)}...</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-badges">
              <div className="no-badges-icon">🏅</div>
              <p>No badges yet. Keep learning to earn your first badge!</p>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">Quick Actions</div>

          <div className="quick-actions-grid">
            <Link to="/CoursePage" className="quick-action-btn">
              <div className="quick-action-icon icon-purple">📚</div>
              <div className="quick-action-text">
                <h4>My Courses</h4>
                <p>Continue learning</p>
              </div>
            </Link>

            <Link to="/InboxPage" className="quick-action-btn">
              <div className="quick-action-icon icon-green">📬</div>
              <div className="quick-action-text">
                <h4>Inbox</h4>
                <p>View messages</p>
              </div>
            </Link>

            <Link to="/InternshipListPage" className="quick-action-btn">
              <div className="quick-action-icon icon-orange">💼</div>
              <div className="quick-action-text">
                <h4>Internships</h4>
                <p>View opportunities</p>
              </div>
            </Link>

            <Link to="/RewardStorePage" className="quick-action-btn">
              <div className="quick-action-icon icon-blue">🎁</div>
              <div className="quick-action-text">
                <h4>Rewards</h4>
                <p>Redeem points</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {isModalOpen && selectedCourse && (
        <div className="modal-overlay" onClick={closeCourseModal}>
          <div className="course-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="course-modal-header">
              <div className="course-title-row">
                <h2>{selectedCourse.title}</h2>
                <span className="enrolled-badge">✓ ENROLLED</span>
              </div>

              <div className="course-instructor">
                <strong>🧑‍🏫 Instructor:</strong>{" "}
                {selectedCourse.instructorName || "Unknown"}
              </div>

              <div className="course-desc">{selectedCourse.description}</div>
            </div>

            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
                onClick={() => setActiveTab("materials")}
              >
                📚 Course Materials
              </button>
              <button
                className={`tab-btn ${
                  activeTab === "assessments" ? "active" : ""
                }`}
                onClick={() => setActiveTab("assessments")}
              >
                📖 Assessments
              </button>
            </div>

            <div className="course-modal-content">
              {activeTab === "materials" && (
                <>
                  <h3>Course Materials</h3>
                  {selectedCourse.content && selectedCourse.content.length > 0 ? (
                    <div className="file-list student-file-list">
                      {selectedCourse.content.map((file) => (
                        <div key={file.id} className="file-item">
                          {file.type === "quiz" ? (
                            <div>
                              <p>{file.title}</p>
                              <button>Take Assessment</button>
                            </div>
                          ) : (
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {file.title}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="locked-text">No materials uploaded yet.</p>
                  )}
                </>
              )}

              {activeTab === "assessments" && (
                <>
                  <h3>Assessments</h3>
                  <p className="locked-text">No assessments yet.</p>
                </>
              )}
            </div>

            <div className="course-modal-footer">
              <button
                className="modal-btn"
                disabled
                style={{ background: "#4cd137", cursor: "default" }}
              >
                Already Enrolled
              </button>
              <button className="text-btn" onClick={closeCourseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
