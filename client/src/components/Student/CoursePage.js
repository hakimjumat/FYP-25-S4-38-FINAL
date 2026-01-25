import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import "../../CSS/CourseEditorPage.css";
import "../../CSS/CoursePage.css";

function CoursePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // --- Data State ---
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Modal State ---
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("materials");

  // --- [NEW] Progress & Review State ---
  const [progress, setProgress] = useState({
    viewedItems: [],
    isCompleted: false,
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, description: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // 1. Fetch Courses
  const fetchCourses = async () => {
    try {
      const res = await authFetch(
        "http://localhost:5000/api/students/courses",
        {},
        user
      );
      if (res.success) setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCourses();
  }, [user]);

  // 2. Handle URL Query Params (Open course from link)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const openCourseId = searchParams.get("openCourse");

    if (openCourseId && courses.length > 0) {
      const courseToOpen = courses.find((c) => c.id === openCourseId);
      if (courseToOpen) {
        openCourseDetails(courseToOpen);
      }
    }
  }, [location.search, courses]);

  // 3. [NEW] Fetch Progress when Modal Opens
  useEffect(() => {
    if (selectedCourse && isModalOpen && user) {
      const fetchProgress = async () => {
        try {
          // Only fetch if enrolled
          if (selectedCourse.enrolledStudents?.includes(user.uid)) {
            const res = await authFetch(
              `http://localhost:5000/api/students/course-progress/${selectedCourse.id}`,
              {},
              user
            );
            if (res.success) setProgress(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchProgress();
    }
  }, [selectedCourse, isModalOpen, user]);

  // --- Handlers ---

  const openCourseDetails = (course) => {
    const enrolled = course.enrolledStudents?.includes(user?.uid);
    setSelectedCourse(course);
    // If enrolled, go to materials. If not, reviews.
    setActiveTab(enrolled ? "materials" : "reviews");
    setIsModalOpen(true);
    // Reset progress state slightly to avoid flickering old data
    setProgress({ viewedItems: [], isCompleted: false });
  };

  const handleEnroll = async () => {
    if (!window.confirm(`Enroll in "${selectedCourse.title}"?`)) return;

    try {
      const res = await authFetch(
        "http://localhost:5000/api/students/enroll",
        {
          method: "POST",
          body: JSON.stringify({ courseId: selectedCourse.id }),
        },
        user
      );

      if (res.success) {
        alert("🎉 Enrollment Successful!");
        fetchCourses();
        setIsModalOpen(false);
      }
    } catch (error) {
      alert("Failed to enroll.");
    }
  };

  // [NEW] Handle Content Click (Mark as Viewed)
  const handleContentClick = async (contentId, type, url) => {
    // 1. Optimistic UI Update
    if (!progress.viewedItems.includes(contentId)) {
      const newViewed = [...progress.viewedItems, contentId];
      const total = selectedCourse.content?.length || 0;
      const completed = newViewed.length >= total;
      setProgress({
        ...progress,
        viewedItems: newViewed,
        isCompleted: completed,
      });

      // 2. API Call in Background
      try {
        await authFetch(
          "http://localhost:5000/api/students/mark-viewed",
          {
            method: "POST",
            body: JSON.stringify({ courseId: selectedCourse.id, contentId }),
          },
          user
        );
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Actual Action (Open Link or Quiz)
    if (type === "quiz") {
      navigate(`/student/course/assessment/${contentId}`);
    } else {
      window.open(url, "_blank");
    }
  };

  // [NEW] Handle Review Submit
  const handleReviewSubmit = async () => {
    if (!reviewForm.description) return alert("Please write a review.");
    setReviewSubmitting(true);
    try {
      await authFetch(
        "http://localhost:5000/api/students/review",
        {
          method: "POST",
          body: JSON.stringify({
            courseId: selectedCourse.id,
            review_rating: reviewForm.rating,
            review_description: reviewForm.description,
          }),
        },
        user
      );
      alert("Review Submitted!");
      fetchCourses(); // Refresh to see updated reviews
      setReviewForm({ rating: 5, description: "" }); // Reset form
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // --- Sort Courses (Enrolled First) ---
  const sortedCourses = [...courses].sort((a, b) => {
    const isEnrolledA = a.enrolledStudents?.includes(user?.uid) ? 1 : 0;
    const isEnrolledB = b.enrolledStudents?.includes(user?.uid) ? 1 : 0;
    return isEnrolledB - isEnrolledA;
  });

  if (loading) return <div>Loading courses...</div>;
  if (!user) return <div>Please log in.</div>;

  return (
    <div className="course-page">
      <h1>Available Courses</h1>
      <p>Explore and enroll in courses to boost your skills.</p>

      <div className="courses-grid">
        {sortedCourses.map((course) => {
          const isEnrolled = course.enrolledStudents?.includes(user.uid);
          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => openCourseDetails(course)}
              style={{
                border: isEnrolled ? "2px solid #4cd137" : "1px solid #ddd",
              }}
            >
              <div
                className="course-card-image"
                style={{
                  backgroundImage: `url('https://placehold.co/600x400?text=${course.title.charAt(
                    0
                  )}')`,
                }}
              ></div>
              <div className="course-card-content">
                {isEnrolled && (
                  <span
                    style={{
                      backgroundColor: "#4cd137",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ENROLLED
                  </span>
                )}
                <h3>{course.title}</h3>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Instructor: {course.instructorName}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedCourse && (
        <div className="modal-overlay">
          <div className="course-modal-box">
            {/* HEADER */}
            <div className="course-modal-header">
              <div className="course-title-row">
                <h2>{selectedCourse.title}</h2>
                {selectedCourse.enrolledStudents?.includes(user.uid) && (
                  <span
                    className="enrolled-badge"
                    style={{
                      background: progress.isCompleted ? "#f1c40f" : "#4cd137",
                      color: progress.isCompleted ? "black" : "white",
                    }}
                  >
                    {progress.isCompleted ? "✓ COMPLETED" : "✓ ENROLLED"}
                  </span>
                )}
              </div>
              <div className="course-instructor">
                <strong>Instructor:</strong> {selectedCourse.instructorName}
              </div>
              <div className="course-desc">{selectedCourse.description}</div>
            </div>

            {/* TABS */}
            <div className="tab-navigation">
              <button
                className={`tab-btn ${
                  activeTab === "materials" ? "active" : ""
                }`}
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
              <button
                className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </div>

            {/* CONTENT */}
            <div className="course-modal-content">
              {/* === REVIEWS TAB (IMPROVED) === */}
              {activeTab === "reviews" && (
                <>
                  <h3 className="reviews-section-title">Reviews</h3>
                  
                  {/* Reviews List */}
                  <div className="reviews-scroll">
                    {selectedCourse.reviews && selectedCourse.reviews.length > 0 ? (
                      selectedCourse.reviews.map((rev, idx) => (
                        <div key={idx} className="review-card">
                          <div className="review-header">
                            <div className="review-author">
                              <div className="review-avatar">
                                {rev.studentName ? rev.studentName.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span className="review-author-name">{rev.studentName}</span>
                            </div>
                            <div className="review-rating">
                              <span>⭐</span>
                              <span>{rev.rating}</span>
                            </div>
                          </div>
                          <p className="review-text">{rev.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="no-reviews">
                        <p className="no-reviews-text">No reviews yet.</p>
                      </div>
                    )}
                  </div>

                  {selectedCourse.enrolledStudents?.includes(user.uid) && (
                    <>
                      {progress.isCompleted ? (
                        <div className="review-form-container">
                          <h4 className="review-form-title">Write a Review</h4>
                          
                          <div className="review-form-group">
                            <label className="review-form-label">Rating</label>
                            <select
                              className="review-rating-select"
                              value={reviewForm.rating}
                              onChange={(e) =>
                                setReviewForm({
                                  ...reviewForm,
                                  rating: e.target.value,
                                })
                              }
                            >
                              {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                  {n} Star{n > 1 ? "s" : ""} {"⭐".repeat(n)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="review-form-group">
                            <label className="review-form-label">Your Review</label>
                            <textarea
                              className="review-textarea"
                              placeholder="Share your experience with this course..."
                              value={reviewForm.description}
                              onChange={(e) =>
                                setReviewForm({
                                  ...reviewForm,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>

                          <button
                            className="review-submit-btn"
                            onClick={handleReviewSubmit}
                            disabled={reviewSubmitting}
                          >
                            {reviewSubmitting ? "Submitting..." : "Submit Review"}
                          </button>
                        </div>
                      ) : (
                        <div className="review-locked">
                          <div className="review-locked-icon">🔒</div>
                          <p className="review-locked-title">
                            Complete all materials to unlock reviews
                          </p>
                          <p className="review-locked-progress">
                            Progress: {progress.viewedItems.length} / {selectedCourse.content?.length || 0} items completed
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* === MATERIALS TAB === */}
              {activeTab === "materials" && (
                <>
                  <h3>Course Materials</h3>
                  {selectedCourse.enrolledStudents?.includes(user.uid) ? (
                    selectedCourse.content &&
                    selectedCourse.content.length > 0 ? (
                      <div className="file-list student-file-list">
                        {selectedCourse.content.map((file) => {
                          const isViewed = progress.viewedItems.includes(
                            file.id
                          );
                          return (
                            <div
                              key={file.id}
                              className="file-item"
                              style={{
                                borderLeft: isViewed
                                  ? "5px solid #4cd137"
                                  : "1px solid #ddd",
                              }}
                            >
                              {file.type === "quiz" ? (
                                <div>
                                  <p>{file.title} (Quiz)</p>
                                  <button
                                    onClick={() =>
                                      handleContentClick(file.id, "quiz")
                                    }
                                  >
                                    Take Assessment
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() =>
                                    handleContentClick(
                                      file.id,
                                      "file",
                                      file.fileUrl
                                    )
                                  }
                                  style={{
                                    cursor: "pointer",
                                    color: "#0984e3",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {file.title} {isViewed && "✅"}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="locked-text">No materials uploaded yet.</p>
                    )
                  ) : (
                    <p className="locked-text">
                      Enroll to unlock course materials.
                    </p>
                  )}
                </>
              )}

              {/* === ASSESSMENTS TAB === */}
              {activeTab === "assessments" && (
                <>
                  <h3>Assessments</h3>
                  {selectedCourse.enrolledStudents?.includes(user.uid) ? (
                    <div className="file-list student-file-list">
                      {selectedCourse.content
                        ?.filter((f) => f.type === "quiz" || f.type === "test")
                        .map((file) => (
                          <div key={file.id} className="file-item">
                            <p>{file.title}</p>
                            <button
                              onClick={() =>
                                handleContentClick(file.id, "quiz")
                              }
                            >
                              Start
                            </button>
                            {/* 2. NEW: AI Analysis Button */}
                          <button 
                            onClick={() => navigate(`/analytics/${selectedCourse.id}/${file.id}`)}
                            style={{ 
                              backgroundColor: '#6c5ce7', 
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            📊 Analyze Progress
                          </button>
                          </div>
                        ))}
                      {!selectedCourse.content?.some(
                        (f) => f.type === "quiz" || f.type === "test"
                      ) && <p>No assessments in this course.</p>}
                    </div>
                  ) : (
                    <p className="locked-text">Enroll to unlock assessments.</p>
                  )}
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="course-modal-footer">
              {selectedCourse.enrolledStudents?.includes(user.uid) ? (
                <button
                  className="modal-btn"
                  disabled
                  style={{ background: "#4cd137", cursor: "default" }}
                >
                  Already Enrolled
                </button>
              ) : (
                <button className="modal-btn" onClick={handleEnroll}>
                  Enroll Now
                </button>
              )}
              <button
                className="text-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursePage;