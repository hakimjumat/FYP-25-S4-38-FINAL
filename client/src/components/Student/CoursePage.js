import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import "../../CSS/CourseEditorPage.css"; // Reusing grid styles

function CoursePage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setSelectedCourse(course);
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
    <div style={{ padding: "20px" }}>
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

      {/* COURSE DETAILS MODAL */}
      {isModalOpen && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "600px" }}>
            <h2>{selectedCourse.title}</h2>
            <p>
              <strong>Instructor:</strong> {selectedCourse.instructorName}
            </p>
            <p style={{ margin: "15px 0", lineHeight: "1.6" }}>
              {selectedCourse.description}
            </p>

            <hr />

            <h3>Reviews</h3>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                marginBottom: "20px",
              }}
            >
              {selectedCourse.reviews && selectedCourse.reviews.length > 0 ? (
                selectedCourse.reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#f9f9f9",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    <strong>{rev.rating} ⭐</strong> - {rev.comment}
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {new Date(rev.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontStyle: "italic", color: "#888" }}>
                  No reviews yet.
                </p>
              )}
            </div>
              
            {selectedCourse.enrolledStudents?.includes(user.uid) && (  // selectedCourse.enrolledStudents = array of studentID, user.uid = current logged in student, .includes(user.uid) = check whether student is enrolled 
              <> 
              <hr/>
              
              <h3>Course Materials</h3>
              
              {selectedCourse.content && selectedCourse.content.length > 0 ? (  // prevent from crashing when there is no file inside
                <div className="file-list student-file-list">
                  {selectedCourse.content.map((file) => (   // uploaded files become visible
                    <div key={file.id} className="file-item">
                      <a href={file.fileUrl} target="_blank" rel="noreferrer">
                        {file.title}
                      </a>
                    </div>
                  ))}
                </div>
              ):(
                <p className="empty-text">No materials uploaded.</p>
              )}
              </>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
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
