import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../CSS/CourseEditorPage.css";

// CHECK THIS PATH: Ensure badgeConfig.js is actually in the 'services' folder.
// If it is in 'config', change this to: "../../config/badgeConfig"
import BADGE_LIBRARY from "../../services/badgeConfig";

function CourseEditorPage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- VIEW STATE ---
  const [selectedCourse, setSelectedCourse] = useState(null);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalStep, setModalStep] = useState(1);

  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [uploadFile, setUploadFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- STUDENT VIEW STATE ---
  const [viewStudentsModalOpen, setViewStudentsModalOpen] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudentForBadge, setSelectedStudentForBadge] = useState(null);

  // === DATA FETCHING ===
  const fetchCourses = async () => {
    try {
      const res = await authFetch(
        "http://localhost:5000/api/instructors/my-courses",
        {},
        user
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

  // === ACTION HANDLERS ===

  const openCreateModal = () => {
    setModalType("create_course");
    setFormData({ title: "", description: "" });
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
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = () => {
    setModalType("delete_course");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalLoading(false);
  };

  // --- STUDENT HANDLERS ---
  const handleViewStudents = async () => {
    if (!selectedCourse) return;
    setModalLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:5000/api/instructors/students/${selectedCourse.id}`,
        {},
        user
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
        user
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
        user
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
        `courses/${selectedCourse.id}/${uploadFile.name}`
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
        user
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
        user
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
        user
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
        user
      );
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert("File delete failed");
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
            {courses.map((course) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => setSelectedCourse(course)}
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
            <button className="dash-btn">📊 Analyze Data</button>
          </div>

          <button className="dash-btn btn-announce">
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
                  <button
                    type="submit"
                    className="modal-btn"
                    disabled={modalLoading}
                  >
                    Save Changes
                  </button>
                </form>

                <h3 style={{ marginTop: "20px", textAlign: "left" }}>
                  Attached Files
                </h3>
                <div className="file-list">
                  {selectedCourse.content &&
                  selectedCourse.content.length > 0 ? (
                    selectedCourse.content.map((file) => (
                      <div key={file.id} className="file-item">
                        <span>📄 {file.title}</span>
                        <a href={file.fileUrl} target="_blank" rel="noreferrer">
                          Download
                        </a>
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

            {/* 4. DELETE */}
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
    </div>
  );
}

export default CourseEditorPage;
