import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

import "../../CSS/AssessmentPage.css";

function AssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [startassessment, setStart] = useState(false);
  const [endassessment, setEnd] = useState(false);
  const [questionList, setQuestions] = useState([]);
  const [wholeAssignment, setWholeAssignment] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [eTime, setETime] = useState(0);
  const [eTotalTime, setETotalTime] = useState(0);
  const [questionIndex, setquestionIndex] = useState(0);
  const [reviewData, setRD] = useState(null);
  const [sendtoDbalr, setsentalr] = useState(false);

  let totaltime = 0;
  let remainingtime = totaltime;
  const [timerInterval, setTimer] = useState(null);
  const [displayTime, setDisplayTime] = useState("00:00:00");

  const [userAnswerArray, setUserAns] = useState([]);
  let elapsedtime = 0;
  let elapsedtimeTotal = 0;
  const [elapsedtimeperQn, setETQ] = useState([]);

  const qngradeData = [];
  const [dataarr, setDA] = useState([]);

  const [selectedValue, setSelectedValue] = useState("");

  const [markedAlr, setMarkedAlr] = useState(false);
  const [Requiremarking, setRequiremarking] = useState(false);
  const [submitTest, setsubmitTest] = useState(false);

  const [sendtesttodb, setSendTestToDB] = useState(false);

  const [prevAttemptExists, setPAE] = useState(false);

  const handleRadioChange = (value) => {
    setSelectedValue(value);
  };

  const handleTestBoxChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const goBackToCourse = () => {
    navigate("/CoursePage");
  };

  const getQuestions = async () => {
    try {
      const res = await authFetch(
        "http://localhost:5000/api/students/getcourseassessment",
        { method: "GET" },
        user
      );
      if (res.success) {
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].id === assessmentId) {
            setWholeAssignment(res.data[i]);
            setQuestions(res.data[i].questions);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      checkforprevAttempt();
    }
  };

  const checkforprevAttempt = async () => {
    const res = await authFetch(
      "http://localhost:5000/api/students/hasdonegradedtest",
      { method: "POST", body: JSON.stringify({ assID: assessmentId }) },
      user
    );
    if (res.success) {
      if (res.data.outcome === false) {
        setLoading(false);
      } else {
        setPAE(true);
      }
    }
  };

  useEffect(() => {
    getQuestions();
  }, [user]);

  function starttheassessment() {
    setStart(true);
    startTimer();
  }

  const startTimer = () => {
    totaltime = wholeAssignment.timeLimit * 60;
    remainingtime = totaltime;

    const interval = setInterval(() => {
      if (remainingtime > 0) {
        remainingtime--;
        elapsedtime++;
        setETime((prev) => prev + 1);
        elapsedtimeTotal++;
        setETotalTime((prev) => prev + 1);

        const hrs = Math.floor(remainingtime / 3600);
        const mins = Math.floor((remainingtime % 3600) / 60);
        const secs = remainingtime % 60;
        setDisplayTime(
          `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        );
      } else {
        clearInterval(interval);
      }
    }, 1000);

    setTimer(interval);
  };

  function IncrementQuestion() {
    let x = userAnswerArray.length;
    if (x === questionIndex) {
      let z = [];
      if (userAnswerArray.length > 0) z = userAnswerArray;
      z.push(getAnswer());
      setUserAns(z);

      let aa = [];
      let gh = eTime;
      if (elapsedtimeperQn.length > 0) {
        aa = elapsedtimeperQn;
        for (let x = 0; x < elapsedtimeperQn.length; x++) gh -= aa[x];
      }
      aa.push(gh);
      setETQ(aa);
      elapsedtime = 0;
    } else {
      let z = userAnswerArray;
      z[x] = getAnswer();
      setUserAns(z);

      let aa = elapsedtimeperQn;
      aa[x] = aa[x] + eTime;
      setETQ(aa);
      elapsedtime = 0;
    }
    let y = questionIndex + 1;
    setquestionIndex(y);
    setSelectedValue("");
  }

  function DecrementQuestion() {
    let y = questionIndex - 1;
    setquestionIndex(y);
  }

  const sendtodb = async () => {
    setsentalr(true);
    try {
      await authFetch(
        "http://localhost:5000/api/students/submitAssessmentAttempt",
        {
          method: "POST",
          body: JSON.stringify({
            CID: wholeAssignment.courseId,
            AID: assessmentId,
            scoreData: attemptData.score,
            timeData: attemptData.timeTaken,
            datatobesent: attemptData,
          }),
        },
        user
      );
    } catch (error) {
      console.error("Failed to submit attempt to DB:", error);
    }
  };

  const sendtestattempttodb = async () => {
    setSendTestToDB(true);
    try {
      await authFetch(
        "http://localhost:5000/api/students/submittestAttempt",
        {
          method: "POST",
          body: JSON.stringify({
            CID: wholeAssignment.courseId,
            AID: assessmentId,
            timeData: eTotalTime,
            qnData: attemptData,
          }),
        },
        user
      );
    } catch (error) {
      console.error("Failed to submit attempt to DB:", error);
    }
  };

  function submitAss() {
    let x = userAnswerArray.length;
    if (x === questionIndex) {
      let z = [];
      if (userAnswerArray.length > 0) z = userAnswerArray;
      z.push(getAnswer());
      setUserAns(z);

      let aa = [];
      let gh = eTime;
      if (elapsedtimeperQn.length > 0) {
        aa = elapsedtimeperQn;
        for (let x = 0; x < elapsedtimeperQn.length; x++) gh -= aa[x];
      }
      aa.push(gh);
      setETQ(aa);
      elapsedtime = 0;
      setSelectedValue("");
    }
    if (wholeAssignment.type === "quiz") {
        setRequiremarking(true);
        clearInterval(timerInterval);
    } else {
        formatDataForTest();
        setsubmitTest(true);
        clearInterval(timerInterval);
    }
  }

  function getAnswer() {
    return selectedValue;
  }

  function formatDataForTest() {
    for (let i = 0; i < userAnswerArray.length; i++) {
      let singleQnData = {
        qId: i,
        timeSpent: elapsedtimeperQn[i],
        selected: userAnswerArray[i],
      };
      qngradeData.push(singleQnData);
    }
    setAttemptData({assessmentId: assessmentId,score: 0, timeTaken: eTotalTime, answers: qngradeData})
  }

  function markAssessment() {
    for (let i = 0; i < userAnswerArray.length; i++) {
      let correct = false;
      if (userAnswerArray[i] === questionList[i].correct.toString()) {
        correct = true;
      }
      let singleQnData = {
        qId: i,
        isCorrect: correct,
        timeSpent: elapsedtimeperQn[i],
        selected: userAnswerArray[i],
      };
      qngradeData.push(singleQnData);
    }
    setAttemptData({
      assessmentId: assessmentId,
      score: 0,
      timeTaken: eTotalTime,
      answers: qngradeData,
    });
  }

  function formatReview() {
    let reviewlist = [];
    for (let x = 0; x < userAnswerArray.length; x++) {
      reviewlist.push({
        questionText: questionList[x].text,
        userAnswer: questionList[x].options[userAnswerArray[x]],
        isCorrect: qngradeData[x].isCorrect,
        correctAnswer: questionList[x].options[questionList[x].correct],
      });
    }
    setRD(reviewlist);
  }

  if (sendtoDbalr === false && endassessment === true && attemptData && submitTest === false) {
    sendtodb(true);
  }

  if (Requiremarking === true && markedAlr === false) {
    markAssessment();
    formatReview();
    setEnd(true);
    setMarkedAlr(true);
  }

  if (submitTest === true && sendtesttodb === false) {
    sendtestattempttodb();
    setEnd(true);
  }

  const progressPercent =
    questionList.length > 0
      ? ((questionIndex + 1) / questionList.length) * 100
      : 0;

  const isTimeWarning =
    displayTime !== "00:00:00" &&
    parseInt(displayTime.split(":")[0]) === 0 &&
    parseInt(displayTime.split(":")[1]) < 5;

  // LOADING STATE
  if (loading && !prevAttemptExists) {
    return (
      <div className="assessment-page">
        <div className="assessment-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // ALREADY ATTEMPTED STATE
  if (loading && prevAttemptExists) {
    return (
      <div className="assessment-page">
        <button className="assessment-back-btn" onClick={goBackToCourse}>
          <span className="arrow">←</span>
          Back to Courses
        </button>
        <div className="assessment-attempted">
          <div className="attempted-card">
            <div className="attempted-icon">⚠️</div>
            <h2 className="attempted-title">{wholeAssignment?.title}</h2>
            <p className="attempted-text">
              You have already attempted this assessment. Each graded test can
              only be taken once.
            </p>
            <button className="start-btn" onClick={goBackToCourse}>
              Return to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS STATE
    if (endassessment) {
    return (
        <div className="assessment-page">
        <div className="assessment-review">
            <div className="review-header">
            <h1 className="review-title">Assessment Complete!</h1>
            <p className="review-subtitle">{wholeAssignment?.title}</p>
            </div>

            {wholeAssignment?.type === "quiz" && reviewData && (
            <div className="review-card">
                {reviewData.map((item, idx) => (
                <div key={idx} className="review-question">
                    <div className="review-q-header">
                    <span className="review-q-number">{idx + 1}</span>
                    <span className="review-q-text">{item.questionText}</span>
                    </div>

                    <div
                    className={`review-answer ${
                        item.isCorrect ? "correct" : "incorrect"
                    }`}
                    >
                    <span className="review-answer-icon">
                        {item.isCorrect ? "✓" : "✗"}
                    </span>
                    <span className="review-answer-text">
                        Your answer: <strong>{item.userAnswer}</strong>
                    </span>
                    </div>

                    {!item.isCorrect && (
                    <div className="review-correct-answer">
                        Correct answer: <strong>{item.correctAnswer}</strong>
                    </div>
                    )}
                </div>
                ))}
            </div>
            )}

            {wholeAssignment?.type === "test" && (
            <div className="review-card submitted-card">
                <h3 className="submitted-title">Submitted for Grading</h3>
                <p className="submitted-text">
                Your instructor will review your answers.
                </p>
            </div>
            )}

            <div className="review-actions">
            <button className="start-btn" onClick={goBackToCourse}>
                Back to Courses
            </button>
            </div>
        </div>
        </div>
    );
    }
  
  if (!startassessment) {
    return (
      <div className="assessment-page">
        <button className="assessment-back-btn" onClick={goBackToCourse}>
          <span className="arrow">←</span>
          Back to Courses
        </button>

        <div className="assessment-splash">
          <div className="splash-card">

            <h1 className="splash-title">{wholeAssignment?.title}</h1>

            <span
              className={`splash-type-badge ${wholeAssignment?.type || "quiz"}`}
            >
              {wholeAssignment?.type === "test"
                ? "Graded Test"
                : "Practice Quiz"}
            </span>

            <div className="splash-info-grid">
              <div className="splash-info-item">
                <span className="splash-info-label">Time Limit</span>
                <span className="splash-info-value">
                  {wholeAssignment?.timeLimit} min
                </span>
              </div>

              <div className="splash-info-item">
                <span className="splash-info-label">Questions</span>
                <span className="splash-info-value">{questionList.length}</span>
              </div>
            </div>

            <p className="splash-description">
              {wholeAssignment?.type === "test"
                ? "This is a graded assessment. Your score will be recorded."
                : "This is a practice quiz."}
            </p>

            <button className="start-btn" onClick={starttheassessment}>
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <div className="assessment-active">
        {/* Header with Timer */}
        <div className="assessment-header">
          <h2 className="assessment-title-small">{wholeAssignment?.title}</h2>
          <div className={`timer-display ${isTimeWarning ? "warning" : ""}`}>
            <span className="timer-text">{displayTime}</span>
          </div>
        </div>

        <div className="progress-indicator">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {questionIndex + 1} / {questionList.length}
          </span>
        </div>

        <div className="question-card" key={questionIndex}>
          <div className="question-header">
            <div className="question-number">{questionIndex + 1}</div>
            <span className="question-type-label">
              {questionList[questionIndex]?.type === "mcq"
                ? "Multiple Choice"
                : "Short Answer"}
            </span>
          </div>

          <p className="question-text">{questionList[questionIndex]?.text}</p>

          {questionList[questionIndex]?.type === "mcq" && (
            <div className="options-container">
              {questionList[questionIndex].options.map((option, i) => (
                <label
                  key={i}
                  className={`option-item ${
                    selectedValue === i.toString() ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="mcq_qn"
                    value={i}
                    checked={selectedValue === i.toString()}
                    onChange={() => handleRadioChange(i.toString())}
                  />
                  <div className="option-radio"></div>
                  <span className="option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          )}

          {questionList[questionIndex]?.type === "short_answer" && (
            <div className="short-answer-container">
              <label className="short-answer-label">Your Answer:</label>
              <input
                type="text"
                className="short-answer-input"
                placeholder="Type your answer here..."
                value={selectedValue}
                onChange={handleTestBoxChange}
              />
            </div>
          )}

          <div className="question-nav">
            <button
              className="nav-btn secondary"
              onClick={DecrementQuestion}
              disabled={questionIndex === 0}
              style={{
                opacity: questionIndex === 0 ? 0.5 : 1,
                cursor: questionIndex === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Previous
            </button>

            {questionIndex + 1 === questionList.length ? (
              <button className="nav-btn primary submit" onClick={submitAss}>
                Submit Assessment
              </button>
            ) : (
              <button className="nav-btn primary" onClick={IncrementQuestion}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;