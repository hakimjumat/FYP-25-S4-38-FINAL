import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import { auth, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../CSS/CourseEditorPage.css";

import { Link, resolvePath, useNavigate, useLocation } from "react-router-dom";

// CHECK THIS PATH: Ensure badgeConfig.js is actually in the 'services' folder.
// If it is in 'config', change this to: "../../config/badgeConfig"
import BADGE_LIBRARY from "../../services/badgeConfig.js";

import CourseReport from "./CourseReport";

const courseColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FFB347"];

function CourseEditorPage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  // --- VIEW STATE ---
  const [selectedCourse, setSelectedCourse] = useState(null);
  // [NEW] state for assessment viewing
  const [viewingAssessment, setViewingAssessment] = useState(null);
  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalStep, setModalStep] = useState(1);

  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "IT", //default
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- STUDENT VIEW STATE ---
  const [viewStudentsModalOpen, setViewStudentsModalOpen] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudentForBadge, setSelectedStudentForBadge] = useState(null);

  const [selectedCourseQuiz, setCourseQuiz] = useState(null);

  const navigate = useNavigate();

  const [announcementContent, setAnnouncementContent] = useState("");

  const [testGradeArray, setTestGradeArray] = useState([]);

  // Reviews
  const [reviews, setReviews] = useState([]);

  // Analysis state
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // === DATA FETCHING ===
  const fetchCourses = async () => {
    try {
      const res = await authFetch(
        "http://localhost:5000/api/instructors/my-courses",
        {},
        user,
      );
      if (res.success) setCourses(res.data);

      if (selectedCourse) {
        const updated = res.data.find((c) => c.id === selectedCourse.id);
        if (updated) setSelectedCourse(updated);
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

  useEffect(() => {
    if (courses.length > 0 && location.state?.courseIdToOpen) {
      const foundCourse = courses.find(
        (c) => c.id === location.state.courseIdToOpen,
      );
      if (foundCourse) {
        setSelectedCourse(foundCourse);

        // To prevent re-opening on future navigations
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [courses, location.state, navigate]);

  // [NEW] INSTRUCTOR HANDLERS
  const handleViewAssessment = async (assessmentId) => {
    setModalLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:5000/api/instructors/assessment/${assessmentId}`,
        {},
        user,
      );
      if (res.success) {
        setViewingAssessment(res.data);
        setModalType("view_assessment_details"); // Switch modal view
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load assessment details");
    } finally {
      setModalLoading(false);
    }
  };
  // === ACTION HANDLERS ===

  const openCreateModal = () => {
    setModalType("create_course");
    setFormData({
      title: "",
      description: "",
      category: "IT",
      subjectLevel: "H1",
    });
    setModalStep(1);
    setIsModalOpen(true);
  };

  const openUploadModal = () => {
    setModalType("upload_content");
    setUploadFile(null);
    setModalStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    setModalType("edit_details");
    setFormData({
      title: selectedCourse.title,
      description: selectedCourse.description,
      category: selectedCourse.category || "IT",
      subjectLevel: selectedCourse.subjectLevel || "H1",
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = () => {
    setModalType("delete_course");
    setIsModalOpen(true);
  };

  const openAnnouncementModal = () => {
    setModalType("course_announcement");
    PullStudentsForAnnouncement();
    setIsModalOpen(true);
  };

  const openReviewsModal = async () => {
    if(!selectedCourse) return;
    setModalLoading(true);
    try{
      const res = await authFetch(`http://localhost:5000/api/instructors/courses/${selectedCourse.id}/reviews`,
      {},
      user);
      if(res.success) {
        setReviews(res.data);
        setModalType("course_reviews");
        setIsModalOpen(true);
      }
    } catch(err) {
      console.error("Error fetching reviews:", err);
      alert("Failed to fetch reviews");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalLoading(false);
  };

  function handleGradeTests() {
    //setModalType("testlist");
    PullStudentsForAnnouncement();
    PullTestAttemptData();
    setIsModalOpen(true);
  }

  function checkstring(x, y) {
    if (x === y) {
      console.log("Equal");
      return true;
    } else {
      console.log("Not Equal");
      return false;
    }
  }

  const handleAnnouncementTextChange = (event) => {
    setAnnouncementContent(event.target.value);
  };

  // --- STUDENT HANDLERS ---
  const handleViewStudents = async () => {
    if (!selectedCourse) return;
    setModalLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:5000/api/instructors/students/${selectedCourse.id}`,
        {},
        user,
      );
      if (res.success) {
        setEnrolledStudents(res.data);
        setViewStudentsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch students");
    } finally {
      setModalLoading(false);
    }
  };

  const PullStudentsForAnnouncement = async () => {
    if (!selectedCourse) return;
    //setModalLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:5000/api/instructors/students/${selectedCourse.id}`,
        {},
        user,
      );
      if (res.success) {
        setEnrolledStudents(res.data);
        //setViewStudentsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch students");
    } finally {
      //setModalLoading(false);
    }
  };

  const PullTestAttemptData = async () => {
    if (!selectedCourse) return;
    try {
      const res = await authFetch(
        "http://localhost:5000/api/instructors/getalltestattempts",
        {},
        user,
      );
      setTestGradeArray(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch data");
    } finally {
      setModalType("testlist");
    }
  };

  const handleAwardBadge = async (badgeName) => {
    if (!selectedStudentForBadge) return;
    try {
      await authFetch(
        "http://localhost:5000/api/instructors/award-badge",
        {
          method: "POST",
          body: JSON.stringify({
            studentId: selectedStudentForBadge.uid,
            badgeName: badgeName,
          }),
        },
        user,
      );
      alert(`Badge '${badgeName}' awarded!`);
      setSelectedStudentForBadge(null);
    } catch (error) {
      console.error(error);
      alert("Failed to award badge");
    }
  };

  // === SUBMIT HANDLERS ===

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await authFetch(
        "http://localhost:5000/api/instructors/create-course",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        user,
      );

      if (res.success) {
        closeModal();
        await fetchCourses();
        alert("Course Created!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setModalLoading(true);
    try {
      const storageRef = ref(
        storage,
        `courses/${selectedCourse.id}/${uploadFile.name}`,
      );
      await uploadBytes(storageRef, uploadFile);
      const url = await getDownloadURL(storageRef);

      await authFetch(
        "http://localhost:5000/api/instructors/add-content",
        {
          method: "POST",
          body: JSON.stringify({
            courseId: selectedCourse.id,
            title: uploadFile.name,
            fileUrl: url,
            type: uploadFile.type,
          }),
        },
        user,
      );

      setModalStep(2);
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setModalLoading(false);
    }
  };

  const handleNewQuizPageLoad = async (e) => {
    navigate("/QuizEditorPage");
    setCourseQuiz(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await authFetch(
        "http://localhost:5000/api/instructors/update-course",
        {
          method: "PUT",
          body: JSON.stringify({ ...formData, courseId: selectedCourse.id }),
        },
        user,
      );
      closeModal();
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setModalLoading(true);
    try {
      await authFetch(
        `http://localhost:5000/api/instructors/delete-course/${selectedCourse.id}`,
        { method: "DELETE" },
        user,
      );
      setSelectedCourse(null);
      closeModal();
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteFile = async (contentId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await authFetch(
        `http://localhost:5000/api/instructors/remove-content/${selectedCourse.id}/${contentId}`,
        { method: "DELETE" },
        user,
      );
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("File delete failed");
    }
  };

  function forloopAnnouncement() {
    enrolledStudents.forEach((element) => {
      handleSendAnnouncement(element.uid);
    });
  }

  const handleSendAnnouncement = async (msgTarget) => {
    let y = new Date();
    let subject = selectedCourse.title + " Announcement";
    let x = {
      sender_user_id: "SYSTEM_ANNOUNCEMENT",
      reciver_user_id: msgTarget,
      s_name: user.displayName,
      subject: subject,
      text: announcementContent,
      sent_on: y,
    };

    try {
      await authFetch(
        "http://localhost:5000/api/messages/courseannouncement",
        { method: "POST", body: JSON.stringify({ x }) },
        user,
      );
    } catch (err) {
      console.error(err);
      alert("Send Announcement failed");
    } finally {
      closeModal();
    }
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      setUploadFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]);
  };

  // ================= RENDER =================

  return (
    <div className="editor-container">
      {/* VIEW 1: COURSE GRID */}
      {!selectedCourse && (
        <>
          <h1>Courses Editor (Instructor)</h1>
          <p>Manage your existing courses or create new ones.</p>
          <div className="courses-grid">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => setSelectedCourse(course)}
              >
                <div
                  className="course-card-image"
                  style={{
                    background: courseColors[index % courseColors.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "72px",
                    fontWeight: "800",
                    color: "white",
                  }}
                >
                  {course.title.charAt(0).toUpperCase()}
                </div>
                <div className="course-card-content">
                  <h3>{course.title}</h3>
                  <p>{course.description.substring(0, 100)}...</p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "10px",
                    }}
                  >
                    {course.content?.length || 0} Files
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="fab-btn" onClick={openCreateModal}>
            + Create Course
          </button>
        </>
      )}

      {/* VIEW 2: SINGLE COURSE DASHBOARD */}
      {selectedCourse && (
        <div className="course-dashboard">
          <button className="back-link" onClick={() => setSelectedCourse(null)}>
            ← Back to All Courses
          </button>

          <div className="dashboard-header">
            <h1>{selectedCourse.title}</h1>
            <p>{selectedCourse.description}</p>
          </div>

          <div className="dashboard-grid">
            <button className="dash-btn" onClick={openUploadModal}>
              📤 Upload Content
            </button>
            <button
              className="dash-btn"
              onClick={() =>
                navigate(`/instructor/course/${selectedCourse.id}/assessment`)
              }
            >
              📝 Create Quiz / Test
            </button>
            <button className="dash-btn" onClick={openEditModal}>
              ✏️ Edit Content / View Files
            </button>
            <button className="dash-btn btn-red" onClick={openDeleteModal}>
              🗑️ Delete Content / Course
            </button>
            <button className="dash-btn">🌐 Enable Translation</button>
            <button className="dash-btn">🎁 Course Incentivization</button>
            <button className="dash-btn" onClick={handleViewStudents}>
              👥 View Students
            </button>
            <button className="dash-btn" onClick={() => setIsAnalysisModalOpen(true)}>📊 Analyze Data</button>
            <button className="dash-btn" onClick={handleGradeTests}>
              📊 Grade Tests
            </button>
            <button className="dash-btn" onClick={openReviewsModal}>
              ⭐ View Course Reviews
            </button>
          </div>

          <button
            className="dash-btn btn-announce"
            onClick={openAnnouncementModal}
          >
            📢 Make Announcement
          </button>
        </div>
      )}

      {/* === MODALS === */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* 1. CREATE */}
            {modalType === "create_course" && (
              <form onSubmit={handleCreateSubmit}>
                <h2>Create New Course</h2>
                <input
                  className="modal-input"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                {/* [NEW] Category Dropdown */}
                <div
                  style={{ marginBottom: "15px", display: "flex", gap: "10px" }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Category
                    </label>
                    <select
                      className="modal-input"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="English">English</option>
                      <option value="Math">Math</option>
                      <option value="Science">Science</option>
                      <option value="IT">IT</option>
                      <option value="CareerDevelopment">
                        Career Development
                      </option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Level
                    </label>
                    <select
                      className="modal-input"
                      value={formData.subjectLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectLevel: e.target.value,
                        })
                      }
                    >
                      <option value="H1">H1 - Beginner</option>
                      <option value="H2">H2 - Intermediate</option>
                      <option value="H3">H3 - Advanced</option>
                    </select>
                  </div>
                </div>
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
                <button
                  type="submit"
                  className="modal-btn"
                  disabled={modalLoading}
                >
                  Create
                </button>
                <button type="button" onClick={closeModal} className="text-btn">
                  Cancel
                </button>
              </form>
            )}

            {/* QUIZ EDITOR*/}
            {modalType === "quiz_editor" && (
              <div>
                <h2>Quiz Editor</h2>
                <h3 style={{ marginTop: "20px", textAlign: "left" }}>
                  Course Quizes
                </h3>
                <div className="file-list">
                  {selectedCourse.quizes && selectedCourse.quizes.length > 0 ? (
                    selectedCourse.quizes.map((quiz) => (
                      <div key={quiz.id} className="quiz-item">
                        <span>📄 {quiz.title}</span>
                        <button onClick={setCourseQuiz(quiz)}>Edit</button>
                      </div>
                    ))
                  ) : (
                    <p>No quizes in this course yet.</p>
                  )}
                </div>
                <button onClick={handleNewQuizPageLoad} className="modal-btn">
                  + Create New Quiz
                </button>
                <button onClick={closeModal} className="text-btn">
                  Close
                </button>
              </div>
            )}

            {/* 2. UPLOAD */}
            {modalType === "upload_content" && (
              <div>
                {modalStep === 1 ? (
                  <>
                    <h2>Upload Content</h2>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <div
                      className="upload-dropzone"
                      onClick={() => fileInputRef.current.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="upload-icon">📁</div>
                      <p>
                        {uploadFile
                          ? uploadFile.name
                          : "Click or Drag to Upload"}
                      </p>
                    </div>
                    <button
                      className="modal-btn"
                      onClick={handleUploadSubmit}
                      disabled={!uploadFile || modalLoading}
                    >
                      {modalLoading ? "Uploading..." : "Upload"}
                    </button>
                    <button onClick={closeModal} className="text-btn">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="success-icon">✅</div>
                    <h3>Upload Successful!</h3>
                    <button className="modal-btn" onClick={closeModal}>
                      OK
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 3. EDIT */}
            {modalType === "edit_details" && (
              <div>
                <h2>Edit Course Details</h2>
                <form onSubmit={handleEditSubmit}>
                  <input
                    className="modal-input"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <textarea
                    className="modal-input modal-textarea"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />

                  <select
                    className="modal-input"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="English">English</option>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="IT">IT</option>
                    <option value="CareerDevelopment">
                      Career Development
                    </option>
                  </select>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Level
                    </label>
                    <select
                      className="modal-input"
                      value={formData.subjectLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectLevel: e.target.value,
                        })
                      }
                    >
                      <option value="H1">H1 - Beginner</option>
                      <option value="H2">H2 - Intermediate</option>
                      <option value="H3">H3 - Advanced</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="modal-btn"
                    disabled={modalLoading}
                  >
                    Save Changes
                  </button>
                </form>

                <button onClick={closeModal} className="text-btn">
                  Cancel
                </button>

                <h3 style={{ marginTop: "20px", textAlign: "left" }}>
                  Attached Files
                </h3>
                <div
                  className="file-list"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {selectedCourse.content &&
                  selectedCourse.content.length > 0 ? (
                    selectedCourse.content.map((file) => (
                      <div key={file.id} className="file-item">
                        <span>
                          {file.type === "quiz" || file.type === "test"
                            ? "📝"
                            : "📄"}{" "}
                          {file.title}
                        </span>

                        {/* CONDITIONAL BUTTON: View for Quiz/Test, Download for Files */}
                        {file.type === "quiz" || file.type === "test" ? (
                          <button
                            onClick={() => handleViewAssessment(file.id)}
                            style={{
                              background: "#e1b12c",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            View
                          </button>
                        ) : (
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No files uploaded yet.</p>
                  )}
                </div>
                <button onClick={closeModal} className="text-btn">
                  Close
                </button>
              </div>
            )}

            {modalType === "testlist" && (
            <div>
              <h2 style={{ 
                textAlign: "center", 
                color: "#2c3e50",
                marginBottom: "24px",
                fontSize: "24px",
                fontWeight: "700"
              }}>
                Grade Course Tests
              </h2>
              
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {selectedCourse.content.map((file) => (
                  <div key={file.id}>
                    {file.type === "test" && (
                      <div style={{
                        backgroundColor: "#f8f9fa",
                        padding: "20px",
                        borderRadius: "12px",
                        marginBottom: "16px",
                        border: "2px solid #e0e0e0"
                      }}>
                        <h3 style={{ 
                          margin: "0 0 16px 0",
                          color: "#2c3e50",
                          fontSize: "18px",
                          fontWeight: "600"
                        }}>
                          {file.title}
                        </h3>
                        
                        {testGradeArray.map((docs) => (
                          <div key={docs.id}>
                            {file.id === docs.test_ID && (
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "white",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                marginBottom: "8px",
                                border: "1px solid #e0e0e0"
                              }}>
                                {enrolledStudents.map((student) => (
                                  <div key={student.uid}>
                                    {student.uid === docs.user && (
                                      <span style={{
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        color: "#2c3e50"
                                      }}>
                                        {student.displayName}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                
                                <button
                                  onClick={() => navigate(`/instructor/course/testgrading/${docs.id}`)}
                                  style={{
                                    backgroundColor: "#4cd137",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 20px",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = "#44bd32"}
                                  onMouseOut={(e) => e.target.style.backgroundColor = "#4cd137"}
                                >
                                  Grade
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={closeModal} 
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "12px",
                  backgroundColor: "#2c3e50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          )}          

            {/* 4. NEW: Modal View for Assessment Details */}
            {modalType === "view_assessment_details" && viewingAssessment && (
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h2>{viewingAssessment.title}</h2>
                  <span
                    style={{
                      background: "#eee",
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "12px",
                    }}
                  >
                    {viewingAssessment.type.toUpperCase()}
                  </span>
                </div>

                <div
                  className="file-list"
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    padding: "10px",
                  }}
                >
                  {viewingAssessment.questions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: "20px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      <p>
                        <strong>
                          Q{idx + 1}: {q.text}
                        </strong>
                      </p>

                      {/* Render Options */}
                      {q.type === "mcq" && (
                        <div style={{ marginLeft: "15px" }}>
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              style={{
                                color: i === q.correct ? "#27ae60" : "#333", // Green if correct
                                fontWeight: i === q.correct ? "bold" : "normal",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              {i === q.correct ? "✅" : "⚪"} {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render Model Answer for Short Answer */}
                      {q.type === "short_answer" && (
                        <div
                          style={{
                            background: "#f9f9f9",
                            padding: "8px",
                            marginTop: "5px",
                            borderLeft: "3px solid #27ae60",
                          }}
                        >
                          <strong>Model Answer:</strong>{" "}
                          {q.modelAnswer || "N/A"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className="modal-btn"
                  onClick={() => {
                    setViewingAssessment(null);
                    setModalType("edit_details");
                  }}
                  style={{ marginTop: "15px" }}
                >
                  Back to List
                </button>
              </div>
            )}

            {/* 5. DELETE */}
            {modalType === "delete_course" && (
              <div>
                <h2>Delete Management</h2>
                <div
                  className="file-list"
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    margin: "10px 0",
                  }}
                >
                  {selectedCourse.content?.map((file) => (
                    <div key={file.id} className="file-item">
                      <span>{file.title}</span>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        style={{
                          color: "red",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
                <hr style={{ margin: "20px 0" }} />
                <button
                  className="modal-btn"
                  style={{ backgroundColor: "red" }}
                  onClick={handleDeleteCourse}
                >
                  Delete Entire Course
                </button>
                <button onClick={closeModal} className="text-btn">
                  Cancel
                </button>
              </div>
            )}
            {/* 6. ANNOUNCEMENT*/}
            {modalType === "course_announcement" && (
                <div>
                  <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Make Announcement</h2>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600",
                      fontSize: "14px" 
                    }}>
                      Announcement Message
                    </label>
                    <textarea
                      id="announcementinput"
                      onChange={handleAnnouncementTextChange}
                      placeholder="Type your announcement here..."
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                        minHeight: "120px",
                        resize: "vertical",
                        fontFamily: "inherit",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={forloopAnnouncement}
                      className="modal-btn"
                      style={{ flex: 1 }}
                    >
                      Send
                    </button>
                    <button 
                      onClick={closeModal} 
                      className="text-btn"
                      style={{
                        padding: "12px 24px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
    
          {/* 7. [NEW] REVIEWS MODAL */}
          {modalType === "course_reviews" && (
            <div>
              <h2>Course Reviews</h2>
              <div className="file-list" style={{ maxHeight: "400px", overflowY: "auto", textAlign: "left" }}>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} style={{ 
                      padding: "15px", 
                      borderBottom: "1px solid #eee",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "8px",
                      marginBottom: "10px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <strong>{review.studentName || "Anonymous Student"}</strong>
                        <span style={{ color: "#f1c40f" }}>
                          {"⭐".repeat(review.rating || 5)}
                        </span>
                      </div>
                      <p style={{ fontSize: "14px", margin: "5px 0" }}>{review.description}</p>
                      <small style={{ color: "#888" }}>
                        {review.createdAt?.seconds 
                          ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                          : "Recently"}
                      </small>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", padding: "20px" }}>No reviews yet for this course.</p>
                )}
              </div>
              <button onClick={closeModal} className="modal-btn" style={{ marginTop: "15px" }}>
                Close
              </button>
            </div>
          )}
          </div>
        </div>
      )}

      {/* === VIEW STUDENT MODAL === */}
      {viewStudentsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: "600px" }}>
            <h2>Students Enrolled in {selectedCourse.title}</h2>

            {/* LIST OF STUDENTS */}
            <div
              className="file-list"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {enrolledStudents.length > 0 ? (
                enrolledStudents.map((student) => (
                  <div
                    key={student.uid}
                    className="file-item"
                    style={{ alignItems: "center" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div style={{ fontSize: "24px" }}>
                        {student.avatar || "👨‍🎓"}
                      </div>
                      <div>
                        <strong>
                          {student.firstName} {student.lastName}
                        </strong>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {student.email}
                        </div>
                      </div>
                    </div>

                    {/* AWARD BADGE BUTTON */}
                    <button
                      className="modal-btn"
                      style={{
                        fontSize: "11px",
                        padding: "4px 10px",
                        border: "1px solid black",
                        background: "white",
                        color: "black",
                        width: "auto",
                        marginLeft: "15px",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedStudentForBadge(student)}
                    >
                      🏅 Award Badge
                    </button>
                  </div>
                ))
              ) : (
                <p>No students enrolled yet.</p>
              )}
            </div>
            {/* --- END OF STUDENT LIST --- */}

            {/* --- BADGE SELECTION (Now Outside the List Loop) --- */}
            {selectedStudentForBadge && (
              <div
                style={{
                  marginTop: "20px",
                  background: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                }}
              >
                <h4 style={{ marginBottom: "15px" }}>
                  Award Badge to{" "}
                  <span style={{ color: "#6c5ce7" }}>
                    {selectedStudentForBadge.firstName}
                  </span>
                </h4>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {Object.entries(BADGE_LIBRARY).map(([name, details]) => (
                    <button
                      key={name}
                      onClick={() => handleAwardBadge(name)}
                      className="badge-select-btn"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "10px",
                        cursor: "pointer",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        transition: "transform 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          background: details.color,
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "5px",
                        }}
                      >
                        {details.icon}
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {name}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedStudentForBadge(null)}
                  style={{
                    marginTop: "15px",
                    fontSize: "12px",
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                className="text-btn"
                onClick={() => setViewStudentsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {isAnalysisModalOpen && (
        <CourseReport
          courseId={selectedCourse.id}
          onClose={() => setIsAnalysisModalOpen(false)}
        />
      )}
    </div>
  );
}

export default CourseEditorPage;
