import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import "../CSS/AdminPages.css"; // Reuse the clean admin styles

function InternshipPostingPage() {
  const { user } = useContext(AuthContext);
  const [postings, setPostings] = useState([]);
  const [candidates, setCandidates] = useState([]); // Store matched students
  const [viewingPostingId, setViewingPostingId] = useState(null);

  // Form State
  const [showCreate, setShowCreate] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    minScore: 60,
  });

  // 1. Fetch My Postings
  const fetchPostings = async () => {
    try {
      const res = await authFetch(
        "http://localhost:5000/api/internships/my-postings",
        {},
        user
      );
      if (res.success) setPostings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, [user]);

  // 2. Create Job
  const handleCreate = async () => {
    try {
      await authFetch(
        "http://localhost:5000/api/internships/create",
        {
          method: "POST",
          body: JSON.stringify(newJob),
        },
        user
      );
      setShowCreate(false);
      fetchPostings();
      alert("Job Posted!");
    } catch (e) {
      alert("Error creating job");
    }
  };

  // 3. View Qualified Candidates (The Headhunting Logic)
  const viewCandidates = async (postingId) => {
    setViewingPostingId(postingId);
    try {
      const res = await authFetch(
        `http://localhost:5000/api/internships/${postingId}/candidates`,
        {},
        user
      );
      if (res.success) setCandidates(res.data);
    } catch (e) {
      alert("Error fetching candidates");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* --- HEADER --- */}
        <div className="admin-header">
          <h1>Internship Management</h1>
          <button
            className="admin-btn btn-black"
            onClick={() => setShowCreate(true)}
          >
            + Post New Internship
          </button>
        </div>

        {/* --- JOB LIST --- */}
        <div className="admin-content">
          <div className="courses-grid" style={{ marginBottom: "40px" }}>
            {postings.map((job) => (
              <div
                key={job.id}
                className="course-card"
                style={{ padding: "20px" }}
              >
                <h3>{job.title}</h3>
                <p style={{ color: "#666" }}>
                  <strong>Company:</strong> {job.company}
                </p>
                <p>
                  <strong>Requirement:</strong> Min {job.minScore}% Avg Score
                </p>
                <button
                  className="admin-btn btn-green"
                  style={{ width: "100%", marginTop: "10px" }}
                  onClick={() => viewCandidates(job.id)}
                >
                  View Qualified Students
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- CREATE MODAL --- */}
        {showCreate && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ textAlign: "left" }}>
              <h2>Post New Internship</h2>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  className="admin-input"
                  onChange={(e) =>
                    setNewJob({ ...newJob, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  className="admin-input"
                  onChange={(e) =>
                    setNewJob({ ...newJob, company: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Minimum Average Score Criteria (%)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={newJob.minScore}
                  onChange={(e) =>
                    setNewJob({ ...newJob, minScore: e.target.value })
                  }
                />
              </div>
              <button className="admin-btn btn-green" onClick={handleCreate}>
                Post Job
              </button>
              <button className="text-btn" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* --- CANDIDATES MODAL --- */}
        {viewingPostingId && (
          <div className="modal-overlay">
            <div
              className="modal-box"
              style={{ maxWidth: "800px", width: "90%" }}
            >
              <h2>🎯 Headhunted Candidates</h2>
              <p>These students match your performance criteria.</p>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Avg Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.length > 0 ? (
                    candidates.map((student, idx) => (
                      <tr key={idx}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td style={{ fontWeight: "bold", color: "#4cd137" }}>
                          {student.averageScore}%
                        </td>
                        <td>
                          <span className="badge badge-active">Qualified</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No candidates meet the criteria yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <button
                className="admin-btn btn-black"
                style={{ marginTop: "20px" }}
                onClick={() => setViewingPostingId(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InternshipPostingPage;
