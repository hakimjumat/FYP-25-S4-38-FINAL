import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import "../../CSS/CourseEditorPage.css"; // Reusing grid styles
import "../../CSS/CoursePage.css";

function CoursePage() {
  const { user } = useContext(AuthContext); // get logged in use information
  const [courses, setCourses] = useState([]); // stores all courses
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // controls popup visibility
  const [activeTab, setActiveTab] = useState("materials");  // which tab is active in popup

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await authFetch(
        "http://localhost:5000/api/students/courses",
        {},
        user
      );
      if (res.success) {
        setCourses(res.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCourses();
  }, [user]);

  // Safely get the user ID, or use an empty string if user is null
  const userId = user?.uid || "";

  // Sorting: Enrolled courses first
  const sortedCourses = [...courses].sort((a, b) => {
    const isEnrolledA = a.enrolledStudents?.includes(user.uid);
    const isEnrolledB = b.enrolledStudents?.includes(user.uid);
    return isEnrolledB - isEnrolledA; // True (1) comes before False (0)
  });

  const openCourseDetails = (course) => {
    const enrolled = course.enrolledStudents?.includes(user.uid); // check if enrolled
    setSelectedCourse(course);
    setActiveTab(enrolled ? "materials" : "reviews"); // enrolled -> start at materials, not enrolled -> start at reviews
    setIsModalOpen(true);
  };

  const handleEnroll = async () => {
    if (
      !window.confirm(
        `Are you sure you want to enroll in "${selectedCourse.title}"?`
      )
    )
      return;

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
        setIsModalOpen(false);
        fetchCourses(); // Refresh list to update UI
      }
    } catch (error) {
      console.error(error);
      alert("Failed to enroll.");
    }
  };

  if (loading) return <div>Loading courses...</div>;
  if (!user) return <div>Please log in to view courses.</div>;

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

{isModalOpen && selectedCourse && ( // COURSE DETAILS MODAL
  <div className="modal-overlay">
    <div className="course-modal-box">

      {/*HEADER (Course Info)*/}
      <div className="course-modal-header"> 
        <div className="course-title-row">
          <h2>{selectedCourse.title}</h2>

          {selectedCourse.enrolledStudents?.includes(user.uid) && ( 
            <span className="enrolled-badge">✓ ENROLLED</span>
          )}
        </div>

        <div className="course-instructor">
          <strong>🧑‍🏫Instructor:</strong> {selectedCourse.instructorName}
        </div>

        <div className="course-desc">
          {selectedCourse.description}
        </div>
      </div>

      {/*TABS (Switch Between views)*/}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
          onClick={() => setActiveTab("materials")}
        >
          📚Course Materials
        </button>

        <button
          className={`tab-btn ${activeTab === "assessments" ? "active" : ""}`}
          onClick={() => setActiveTab("assessments")}
        >
          📖Assessments
        </button>

        <button
          className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          ⭐Reviews
        </button>
      </div>

      {/*CONTENT*/}
      <div className="course-modal-content">

        {activeTab === "reviews" && ( // REVIEWS TAB
          <>
            <h3>Reviews</h3>

            <div className="reviews-scroll">
              {selectedCourse.reviews && selectedCourse.reviews.length > 0 ? (
                selectedCourse.reviews.map((rev, idx) => (
                  <div key={idx} className="review-card">
                    <strong>{rev.rating} ⭐</strong> – {rev.comment}

                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                      {new Date(rev.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="locked-text">No reviews yet.</p>
              )}
            </div>
          </>
        )}

        {activeTab === "materials" && ( // MATERIALS TAB
          <>
            <h3>Course Materials</h3>

            {selectedCourse.enrolledStudents?.includes(user.uid) ? (
              selectedCourse.content && selectedCourse.content.length > 0 ? (
                <div className="file-list student-file-list">
                  {selectedCourse.content.map((file) => (
                    <div key={file.id} className="file-item">
                      <a href={file.fileUrl} target="_blank" rel="noreferrer">
                        {file.title}
                      </a>
                    </div>
                  ))}
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

        {activeTab === "assessments" && ( // ASSESSMENTS TAB(only for enrolled students)
          <>
            <h3>Assessments</h3>

            {selectedCourse.enrolledStudents?.includes(user.uid) ? (
              <p className="locked-text">No assessments yet.</p>
            ) : (
              <p className="locked-text">
                Enroll to unlock assessments.
              </p>
            )}
          </>
        )}

      </div>

      {/*FOOTER (Actions like Enroll / Close)*/}
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

        <button className="text-btn" onClick={() => setIsModalOpen(false)}>
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
