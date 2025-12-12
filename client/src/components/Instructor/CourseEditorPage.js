import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../CSS/CourseEditorPage.css";

function CourseEditorPage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Steps: 'step1_details', 'step2_upload', 'step3_success'
  const [creationStep, setCreationStep] = useState("step1_details");

  // Form Data State
  const [newCourseData, setNewCourseData] = useState({
    title: "",
    description: "",
  });
  const [createdCourseId, setCreatedCourseId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const fileInputRef = useRef(null); // Hidden file input ref

  // --- 1. FETCH EXISTING COURSES ---
  const fetchCourses = async () => {
    try {
      const res = await authFetch(
        "http://localhost:5000/api/instructors/my-courses",
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
    if (user) {
      fetchCourses();
    }
  }, [user]);

  // --- MODAL ACTIONS ---

  const handleOpenModal = () => {
    // Reset state when opening
    setCreationStep("step1_details");
    setNewCourseData({ title: "", description: "" });
    setUploadFile(null);
    setCreatedCourseId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- STEP 1: CREATE COURSE DOCUMENT ---
  const handleCreateDetails = async (e) => {
    e.preventDefault();
    if (!newCourseData.title || !newCourseData.description)
      return alert("Fill all fields");

    setModalLoading(true);
    try {
      // Call backend to create course entry
      const createRes = await authFetch(
        "http://localhost:5000/api/instructors/create-course",
        {
          method: "POST",
          body: JSON.stringify(newCourseData),
        },
        user
      );

      if (createRes.success) {
        // Save ID and move to next step
        setCreatedCourseId(createRes.data.id);
        setCreationStep("step2_upload");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create course details");
    } finally {
      setModalLoading(false);
    }
  };

  // --- STEP 2: HANDLE FILE SELECTION ---

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };
  // === NEW: DRAG & DROP HANDLERS ===
  const handleDragOver = (e) => {
    e.preventDefault(); // <--- CRITICAL: Stops browser from opening file
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault(); // <--- CRITICAL: Stops browser from opening file
    e.stopPropagation();

    // Capture the file from the drop event
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  // --- STEP 2: UPLOAD FILE & LINK CONTENT ---
  const handleUploadContent = async () => {
    if (!uploadFile || !createdCourseId)
      return alert("Please select a file first");

    setModalLoading(true);
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(
        storage,
        `courses/${createdCourseId}/${uploadFile.name}`
      );
      await uploadBytes(storageRef, uploadFile);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Tell Backend to link file to course
      const contentRes = await authFetch(
        "http://localhost:5000/api/instructors/add-content",
        {
          method: "POST",
          body: JSON.stringify({
            courseId: createdCourseId,
            title: "Initial Course Content", // You could add an input for this too
            fileUrl: downloadUrl,
            type: uploadFile.type,
          }),
        },
        user
      );

      if (contentRes.success) {
        setCreationStep("step3_success");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload content");
    } finally {
      setModalLoading(false);
    }
  };

  // --- STEP 3: FINISH & REFRESH ---
  const handleFinish = () => {
    handleCloseModal();
    setLoading(true);
    // RE-FETCH courses so the new one appears immediately
    fetchCourses();
  };

  // ================= RENDER =================

  if (loading && courses.length === 0)
    return <div style={{ padding: "30px" }}>Loading courses...</div>;

  return (
    <div className="editor-container">
      <h1>Courses</h1>
      <p>Manage your existing courses or create new ones.</p>

      {/* GRID OF EXISTING COURSES */}
      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              {/* Placeholder image - you can add image upload to Step 1 later */}
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
                  style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}
                >
                  {course.content?.length || 0} Items /{" "}
                  {course.enrolledStudents?.length || 0} Students
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>You haven't created any courses yet.</p>
        )}
      </div>

      {/* THE BLACK FLOATING BUTTON */}
      <button
        className="fab-btn"
        onClick={handleOpenModal}
        title="Create New Course"
      >
        + Create Course
      </button>

      {/* === THE MODAL OVERLAY === */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* === MODAL STEP 1: DETAILS FORM === */}
            {creationStep === "step1_details" && (
              <form onSubmit={handleCreateDetails}>
                <h2>Create New Course</h2>
                <p style={{ marginBottom: "20px", color: "#666" }}>
                  Step 1 of 2: Course Details
                </p>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Course Title"
                  value={newCourseData.title}
                  onChange={(e) =>
                    setNewCourseData({
                      ...newCourseData,
                      title: e.target.value,
                    })
                  }
                  required
                  autoFocus
                />
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="Course Description (Bigger box)"
                  value={newCourseData.description}
                  onChange={(e) =>
                    setNewCourseData({
                      ...newCourseData,
                      description: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="submit"
                  className="modal-btn"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Creating..." : "Create Course"}
                </button>
                {!modalLoading && (
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      background: "transparent",
                      color: "#999",
                      border: "none",
                      marginTop: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            )}

            {/* === MODAL STEP 2: UPLOAD CONTENT === */}
            {creationStep === "step2_upload" && (
              <div>
                <h2>Upload Content</h2>
                <p style={{ marginBottom: "20px", color: "#666" }}>
                  Step 2 of 2: Add Material
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                {/* UPDATED DROPZONE WITH HANDLERS */}
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver} // <--- ADDED
                  onDrop={handleDrop} // <--- ADDED
                >
                  <div className="upload-icon">📁</div>
                  <p>
                    {uploadFile
                      ? `Selected: ${uploadFile.name}`
                      : "Drag content here or click to upload"}
                  </p>
                </div>

                <button
                  onClick={handleUploadContent}
                  className="modal-btn"
                  disabled={modalLoading || !uploadFile}
                >
                  {modalLoading ? "Uploading & Linking..." : "Upload Content"}
                </button>
              </div>
            )}

            {/* === MODAL STEP 3: SUCCESS === */}
            {creationStep === "step3_success" && (
              <div>
                <div className="success-icon">✅</div>
                <h2>Success!</h2>
                <p
                  style={{
                    margin: "20px 0",
                    fontSize: "18px",
                    lineHeight: "1.5",
                  }}
                >
                  Successfully created course and uploaded course content.
                </p>
                <button onClick={handleFinish} className="modal-btn">
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseEditorPage;
