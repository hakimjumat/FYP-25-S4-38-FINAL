import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/InstructorDashboard.css";

import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

export default function InstructorDashboard({ profile }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyCourses = async () => {
      try {
        const res = await authFetch(
          "http://localhost:5000/api/instructors/my-courses",
          {},
          user
        );

        if (res.success) setCourses(res.data || []);
      } catch (err) {
        console.error("Failed to load instructor courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;

    const totalStudents = courses.reduce((sum, c) => {
      const count = Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0;
      return sum + count;
    }, 0);

    // rating
    const avgRatingRaw =
      courses.length === 0
        ? 0
        : courses.reduce((sum, c) => sum + (Number(c.averageRating) || 0), 0) / courses.length;

    const avgRating = avgRatingRaw ? avgRatingRaw.toFixed(1) : "—";

    return { totalCourses, totalStudents, avgRating };
  }, [courses]);

  return (
    <div className="instructor-shell">
      <main className="instructor-main">
        <div className="instructor-welcome instructor-welcome-row">
          <div>
          <h1>
            Welcome back, {profile?.firstName || "Instructor"}
          </h1>
          <p>Here’s an overview of your teaching performance.</p>
        </div>

        <div className="welcome-actions">
          <button className="actions-button secondary"
          onClick={() => navigate("/CourseEditorPage")}
          type="button">
            My Courses
          </button>

          <button
            className="actions-button"
            onClick={() => navigate("/ProfilePage")}
            type="button"
          >
            My Account
          </button>

        </div>
      </div>

        <div className="instructor-stats">
          <div className="instructor-stat-card">
            <div className="stat-top">
              <div className="stat-title">Total Students</div>
            </div>

            <p className="stat-value">
              {loading ? "…" : stats.totalStudents}
            </p>
            <p className="stat-desc">Enrolled across all your courses</p>
          </div>

          <div className="instructor-stat-card">
            <div className="stat-top">
              <div className="stat-title">Total Courses</div>
            </div>

            <p className="stat-value">
              {loading ? "…" : stats.totalCourses}
            </p>
            <p className="stat-desc">Courses you created</p>
          </div>

          <div className="instructor-stat-card">
            <div className="stat-top">
              <div className="stat-title">Average Rating</div>
            </div>

            <p className="stat-value">
              {loading ? "…" : stats.avgRating}
            </p>
            <p className="stat-desc">Based on course ratings (if available)</p>
          </div>
        </div>

        <div className="instructor-table-card">
          <h2>Course Statistics</h2>

          <div className="table-wrap">
            <table className="instructor-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Ratings</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">Loading courses…</td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan="5">No courses found yet. Create one in Course Editor.</td>
                  </tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id}>
                      <td className="course-name">{c.title}</td>
                      <td>{c.category || "—"}</td>
                      <td>
                        <span className="rating-badge">
                          {c.averageRating ? Number(c.averageRating).toFixed(1) : "—"}
                        </span>
                      </td>
                      <td>{Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0}</td>
                      <td>
                        <button className="actions-button"
                          type="button"
                          onClick={() =>
                            navigate("/CourseEditorPage", {
                              state: { courseIdToOpen: c.id },
                            })
                          }
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
