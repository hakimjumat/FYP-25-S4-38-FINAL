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
    "#FF6B6B", 
    "#4ECDC4", 
    "#FFE66D", 
    "#A8E6CF", 
    "#FFB347", 
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

  const StatCard = ({ value, label, index }) => (
    <div className="stat-card" style={{
      backgroundColor: 'white',
      color: '#2c3e50',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'default',
      textAlign: 'center'
    }}>
      <h3 style={{
        fontSize: '36px',
        fontWeight: '700',
        margin: '0 0 8px 0',
        color: '#2c3e50'
      }}>{value}</h3>
      <p style={{
        fontSize: '14px',
        fontWeight: '500',
        margin: 0,
        color: '#7f8c8d'
      }}>{label}</p>
    </div>
  );

  const QuickActionCard = ({ to, title, subtitle }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e8e8e8',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
      className="quick-action-card-hover">
        <h4 style={{
          margin: '0 0 4px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>{title}</h4>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#7f8c8d'
        }}>{subtitle}</p>
      </div>
    </Link>
  );

  return (
    <div className="student-dashboard">
      <style>{`
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
        }
        
        .quick-action-card-hover:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
          border-color: #d0d0d0 !important;
        }
      `}</style>

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
        <StatCard 
          value={currentLevel} 
          label="Current Level" 
          index={0}
        />
        <StatCard 
          value={currentPoints} 
          label="Total Points" 
          index={1}
        />
        <StatCard 
          value={currentStreak} 
          label="Day Streak" 
          index={2}
        />
        <StatCard 
          value={badgesCount} 
          label="Badges Earned" 
          index={3}
        />
        <StatCard 
          value={enrolledCourses.length} 
          label="Courses Enrolled" 
          index={4}
        />
      </div>

      <div className="progress-card" style={{
        backgroundColor: '#7C3AED',
        color: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="progress-card-header" style={{ color: 'white', marginBottom: '24px' }}>
          Your Progress
        </div>
        <div className="progress-main">
          <div className="level-circle" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span className="label">Level</span>
            <span className="number">{currentLevel}</span>
          </div>

          <div className="progress-details">
            <h3>Great Progress! Keep it up!</h3>

            <div className="xp-bar-container" style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="xp-bar-fill" style={{ 
                width: `${currentPoints}%`,
                backgroundColor: 'white'
              }} />
            </div>

            <div className="xp-text">
              <span>{currentPoints} / 100 XP</span>
              <span>Level {currentLevel + 1}</span>
            </div>
          </div>
        </div>

        <div className="streak-badge" style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '12px 20px',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          <span style={{ fontWeight: '600' }}>
            {currentStreak} Day Streak - {currentStreak >= 7 ? "You're on fire!" : "Keep going!"}
          </span>
        </div>
      </div>

      <div className="continue-learning-section">
        <div className="section-header">
          <h2>Continue Learning</h2>
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
                <div key={course.id} className="course-card" style={{
                }}>
                  <div
                    className="course-card-header"
                    style={{
                      backgroundColor: courseColors[index % courseColors.length],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "64px",
                      fontWeight: "bold",
                      color: "white",
                      textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 1 }}>
                      {course.title?.charAt(0) || "C"}
                    </span>
                  </div>

                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p className="course-instructor">
                      Instructor: {course.instructorName || "Unknown"}
                    </p>

                    <div className="course-stats">
                      <span style={{
                        background: '#f0f0f0',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>{materialsCount} Materials</span>
                      <span style={{
                        background: '#f0f0f0',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>{quizzesCount} Quizzes</span>
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
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: '#7C3AED',
              borderRadius: "50%",
              margin: "0 auto 20px",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)'
            }}>📚</div>
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
        <div className="dashboard-card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
        }}>
          <div className="card-header" style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#2c3e50'
          }}>Your Badges</div>

          {gamification?.badges && gamification.badges.length > 0 ? (
            <div className="badges-grid">
              {gamification.badges.map((badgeName, index) => {
                const badgeInfo = BADGE_LIBRARY[badgeName] || {
                  icon: "❓",
                  description: "Unknown badge",
                  color: "#f0f0f0",
                };

                return (
                  <div key={index} className="badge-item" style={{
                  }}>
                    <div
                      className="badge-icon-wrapper"
                      style={{ 
                        backgroundColor: badgeInfo.color,
                        boxShadow: `0 4px 16px ${badgeInfo.color}40`
                      }}
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
              <div style={{
                width: "80px",
                height: "80px",
                backgroundColor: '#F59E0B',
                borderRadius: "50%",
                margin: "0 auto 15px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
              }}>🏅</div>
              <p>No badges yet. Keep learning to earn your first badge!</p>
            </div>
          )}
        </div>

        <div className="dashboard-card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
        }}>
          <div className="card-header" style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#2c3e50'
          }}>Quick Actions</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickActionCard
              to="/CoursePage"
              title="My Courses"
              subtitle="Continue learning"
            />
            <QuickActionCard
              to="/InboxPage"
              title="Inbox"
              subtitle="View messages"
            />
            <QuickActionCard
              to="/InternshipListPage"
              title="Internships"
              subtitle="View opportunities"
            />
            <QuickActionCard
              to="/RewardStorePage"
              title="Rewards"
              subtitle="Redeem points"
            />
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
                <strong>Instructor:</strong>{" "}
                {selectedCourse.instructorName || "Unknown"}
              </div>

              <div className="course-desc">{selectedCourse.description}</div>
            </div>

            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
                onClick={() => setActiveTab("materials")}
              >
                Course Materials
              </button>
              <button
                className={`tab-btn ${
                  activeTab === "assessments" ? "active" : ""
                }`}
                onClick={() => setActiveTab("assessments")}
              >
                Assessments
              </button>
            </div>

            <div className="course-modal-content">
              {activeTab === "materials" && (
                <>
                  <h3>Course Materials</h3>
                  {(() => {
                    const materials = selectedCourse.content?.filter(
                      (file) => file.type !== "quiz" && file.type !== "test"
                    ) || [];
                    
                    return materials.length > 0 ? (
                      <div className="file-list student-file-list">
                        {materials.map((file) => (
                          <div key={file.id} className="file-item">
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {file.title}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="locked-text">No materials uploaded yet.</p>
                    );
                  })()}
                </>
              )}

              {activeTab === "assessments" && (
                <>
                  <h3>Assessments</h3>
                  {(() => {
                    const assessments = selectedCourse.content?.filter(
                      (file) => file.type === "quiz" || file.type === "test"
                    ) || [];
                    
                    return assessments.length > 0 ? (
                      <div className="file-list student-file-list">
                        {assessments.map((assessment) => (
                          <div key={assessment.id} className="file-item" style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 0",
                            borderBottom: "1px solid #eee"
                          }}>
                            <span style={{ fontSize: "14px", color: "#2c3e50" }}>
                              {assessment.title}
                            </span>
                            <button 
                              onClick={() => window.location.href = `/student/course/assessment/${assessment.id}`}
                              style={{
                                padding: "6px 14px",
                                fontSize: "13px",
                                background: "#000",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                              }}
                            >
                              Take Assessment
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="locked-text">No assessments available yet.</p>
                    );
                  })()}
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