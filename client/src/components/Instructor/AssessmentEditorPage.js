import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";
import "../../CSS/CourseEditorPage.css"; // Reusing existing styles or create new one

function AssessmentEditorPage() {
  const { courseId } = useParams(); // Get courseId from URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [weightage, setWeightage] = useState(100);
  const [assessmentType, setAssessmentType] = useState("quiz"); // New state for assessment type

  // helper function to go back correctly instead of routing to CourseEditorPage directly by passing courseId in state
  const goBackToCourse = () => {
    navigate("/CourseEditorPage", { state: { courseIdToOpen: courseId } });
  };
  // added type to default question state
  const [currentQ, setCurrentQ] = useState({
    type: "mcq", // <--- NEW
    text: "",
    options: ["", "", "", ""],
    correct: 0, // Index for MCQ
    modelAnswer: "", // <--- NEW (For Short Answer)
  });

  const addQuestion = () => {
    if (!currentQ.text) return alert("Question text required");

    // Add the question with its specific type
    setQuestions([...questions, { ...currentQ }]);

    // Reset form (Keep the last used type for convenience)
    setCurrentQ({
      type: currentQ.type,
      text: "",
      options: ["", "", "", ""],
      correct: 0,
      modelAnswer: "",
    });
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title || questions.length === 0)
      return alert("Title and Questions required");

    let finalWeightage = 0;

    if (assessmentType === "test") {
      finalWeightage = parseFloat(weightage);
      if (isNaN(finalWeightage) || finalWeightage <= 0) {
        return alert(
          "Please provide a valid weightage for the graded test: 0.01% to 100.00%"
        );
      }
    } else {
      finalWeightage = 0; // Quizzes are ungraded
    }

    try {
      await authFetch(
        "http://localhost:5000/api/instructors/add-assessment",
        {
          method: "POST",
          body: JSON.stringify({
            courseId,
            title,
            type: assessmentType, // <--- NOW DYNAMIC (uses state)
            timeLimit: parseInt(timeLimit),
            weightage: finalWeightage,
            totalPoints: questions.length * 10,
            questions,
          }),
        },
        user
      );

      alert("Assessment Created!");
      navigate(-1); // Go back to the previous page (Course Editor)
    } catch (err) {
      console.error(err);
      alert("Failed to create assessment");
    }
  };

  return (
    <div
      className="editor-container"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <button className="back-link" onClick={goBackToCourse}>
        ← Back to Course
      </button>

      <h1>Create New Assessment</h1>

      <div className="form-group" style={{ marginBottom: "20px" }}>
        <label>Assessment Title:</label>
        <input
          className="modal-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Midterm Exam"
        />
      </div>

      <div className="form-group" style={{ marginBottom: "20px" }}>
        <label>Assessment Type:</label>
        <select
          className="modal-input"
          value={assessmentType}
          onChange={(e) => setAssessmentType(e.target.value)}
        >
          <option value="test">Graded Test (Exam)</option>
          <option value="quiz">Practice Quiz (Ungraded)</option>
        </select>
      </div>

      {/* [UPDATE] CONDITIONAL RENDERING & INPUT LIMITS */}
      {assessmentType === "test" && (
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>Weightage (%):</label>
          <input
            className="modal-input"
            type="number"
            min="0.01" // HTML5 Validation hint
            max="100.00" // HTML5 Validation hint
            step="0.01" // Allows decimals like 10.55
            value={weightage}
            onChange={(e) => setWeightage(e.target.value)}
            placeholder="0.01 - 100.00"
          />
          <small style={{ color: "#666" }}>
            Enter a value between 0.01 and 100. Ungraded quizzes are
            automatically 0%.
          </small>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: "20px" }}>
        <label>Time Limit (Minutes):</label>
        <input
          className="modal-input"
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
        />
      </div>

      <hr />

      <h3>Questions ({questions.length})</h3>

      {/* List of Added Questions */}
      <div className="questions-list" style={{ marginBottom: "30px" }}>
        {questions.map((q, idx) => (
          <div
            key={idx}
            style={{
              background: "#f9f9f9",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>
                {idx + 1}. {q.text}
              </strong>
              <button
                onClick={() => removeQuestion(idx)}
                style={{
                  color: "red",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                ✖
              </button>
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              Answer: {q.options[q.correct]}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Question Form */}
      <div
        style={{ background: "#eef2f7", padding: "20px", borderRadius: "10px" }}
      >
        <h4>Add New Question</h4>

        {/* 1. QUESTION TYPE SELECTOR */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>
            Question Type:
          </label>
          <select
            className="modal-input"
            style={{ width: "250px" }}
            value={currentQ.type}
            onChange={(e) => setCurrentQ({ ...currentQ, type: e.target.value })}
          >
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="short_answer">Short Answer</option>
          </select>
        </div>

        {/* 2. QUESTION TEXT */}
        <input
          className="modal-input"
          placeholder="Enter the question here..."
          value={currentQ.text}
          onChange={(e) => setCurrentQ({ ...currentQ, text: e.target.value })}
        />

        {/* === OPTION A: IF MCQ === */}
        {currentQ.type === "mcq" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              {currentQ.options.map((opt, i) => (
                <input
                  key={i}
                  className="modal-input"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...currentQ.options];
                    newOpts[i] = e.target.value;
                    setCurrentQ({ ...currentQ, options: newOpts });
                  }}
                />
              ))}
            </div>

            <label>Correct Option:</label>
            <select
              className="modal-input"
              value={currentQ.correct}
              onChange={(e) =>
                setCurrentQ({ ...currentQ, correct: parseInt(e.target.value) })
              }
            >
              {currentQ.options.map((_, i) => (
                <option key={i} value={i}>
                  Option {i + 1}
                </option>
              ))}
            </select>
          </>
        )}

        {/* === OPTION B: IF SHORT ANSWER === */}
        {currentQ.type === "short_answer" && (
          <div style={{ marginTop: "10px" }}>
            <label>Model Answer / Grading Keywords:</label>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "0" }}>
              (Used for instructor reference during manual grading)
            </p>
            <textarea
              className="modal-input"
              rows="3"
              placeholder="e.g. The answer should mention 'Newton's Third Law'..."
              value={currentQ.modelAnswer}
              onChange={(e) =>
                setCurrentQ({ ...currentQ, modelAnswer: e.target.value })
              }
            />
          </div>
        )}

        <button
          className="modal-btn"
          onClick={addQuestion}
          style={{ marginTop: "15px" }}
        >
          + Add Question
        </button>
      </div>

      <div style={{ marginTop: "30px", textAlign: "right" }}>
        <button
          className="modal-btn"
          onClick={handleSave}
          style={{ backgroundColor: "#27ae60" }}
        >
          Save Assessment
        </button>
      </div>
    </div>
  );
}

export default AssessmentEditorPage;
