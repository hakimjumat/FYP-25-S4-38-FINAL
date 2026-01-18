import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

import "../../CSS/CoursePage.css";

function AssessmentPage () {
    const { assessmentId } = useParams(); // Get courseId from URL
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
    const [reviewData, setRD] = useState(null);
    const [sendtoDbalr, setsentalr] = useState(false);

    let totaltime = 0;
    let remainingtime = totaltime;
    const [timerInterval, setTimer] = useState(null);

    let questionIndex = 0;

    let userAnswerArray = [];
    let elapsedtime = 0;
    let elapsedtimeTotal = 0;
    let elapsedtimeperQn = [];

    let qngradeData = [];

    const [selectedValue, setSelectedValue] = useState("");

    const handleRadioChange = (value) => {
        setSelectedValue(value);
    };

    const goBackToCourse = () => {
        navigate("/CoursePage");
    };
    const getQuestions = async () => {
        try {
            console.log(JSON.stringify(assessmentId));
            const res = await authFetch("http://localhost:5000/api/students/getcourseassessment",
                {method: "GET"}, user);
            if(res.success){

                for(let i = 0; i < res.data.length; i++){
                    console.log(res.data[i].id);
                    if(res.data[i].id === assessmentId)
                    {
                        setWholeAssignment(res.data[i]);
                        setQuestions(res.data[i].questions);
                        console.log("Successfully load assignmnet data")
                    }
                }
            }
        }
        catch (error){
            console.error("Error fetching courses:", error);
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        //fetch assessment from DB
        
        getQuestions();
      }, [user]);

    function starttheassessment(){
        setStart(true);

        //start timer;
        startTimer();
        console.log("Assessment Started");
    }

    const startTimer = () => {
        totaltime = wholeAssignment.timeLimit * 60; //convert to seconds
        remainingtime = totaltime;
        
        setTimer(setInterval(timerLogic, 1000));
    }

    function timerLogic(){
        if(endassessment === true){
            clearInterval(timerInterval);
        }
        if(remainingtime > 0){
            remainingtime--;
            elapsedtime++;
            setETime(elapsedtime);
            elapsedtimeTotal++;
            setETotalTime(elapsedtimeTotal);
            updateDisplay();
        }
        else{
            clearInterval(timerInterval);
            //end assignment
        }
    }

    function updateDisplay(){
        let x = remainingtime;
        
        const hrs = Math.floor(x / 3600);
        x = (x - (hrs*3600));
        const mins = Math.floor(x/60);
        x = (x - (mins * 60));
        const secs = x;
        if(endassessment === false)
            document.getElementById("timerdisplay").innerHTML = "Remaining Time: " + `${hrs}:${mins}:${secs}`;
    }

    function IncrementQuestion(){
        let x = userAnswerArray.length;
        if(x === questionIndex){
            //no answer for latest question
            userAnswerArray.push(getAnswer());
            elapsedtimeperQn.push(eTime);
            elapsedtime = 0;
        }
        questionIndex++;
    }

    const sendtodb = async () => {
        console.log("You should only see this once.");
        setsentalr(true);
        try {
                console.log(JSON.stringify(attemptData));
                console.log(JSON.stringify(wholeAssignment.courseId));
                console.log(JSON.stringify(assessmentId));
                const res = await authFetch("http://localhost:5000/api/students/submitAssessmentAttempt", {method: "POST",
                                                                                                             body:JSON.stringify({CID: wholeAssignment.courseId, AID: assessmentId, scoreData: attemptData.score, timeData: attemptData.timeTaken, datatobesent: attemptData}),}, user);
                if(res.success){
                    // yay
                    console.log("Sent to DB!");
                }
            }catch(error){
                console.error("Failed to submit attempt to DB:", error);
            }
            finally{
                //Go to review
                //setsentalr(true);
            }
    }

    const submitAss = async () => {
        let x = userAnswerArray.length;
        if(x === questionIndex){
            //no answer for latest question
            userAnswerArray.push(getAnswer());
            elapsedtimeperQn.push(eTime);
            elapsedtime = 0;
            setSelectedValue("");
        }
        if(wholeAssignment.type === "quiz")
        {
            //mark now
            markAssessment();
            clearInterval(timerInterval);
            formatReview();
            setEnd(true);
        }
        else{
            //send to db
        }
    }

    function getAnswer(){
        return selectedValue;
    }

    

    function markAssessment(){
        for(let i = 0; i < userAnswerArray; i++)
        {
            let correct = false;
            if(userAnswerArray[i] === (questionList[i].correct).toString())
            {
                correct = true;
                console.log("Q" + i + " is correct.");
            }
            else{
                correct = false;
                console.log("Q" + i + " is wrong.");
            }
            let singleQnData = {qId: i, isCorrect: correct, timeSpent: elapsedtimeperQn[i], selected: userAnswerArray[i]}
            qngradeData.push(singleQnData);
        }
        setAttemptData({score: 0, timeTaken: eTotalTime, answers: qngradeData})
    }

    function formatReview(){
        let reviewlist = []
        for (let x = 0; x < userAnswerArray; x++){
            reviewlist.push(<li>
                <p>Q{x}: {questionList[x].text}</p>
                <p>You selected: {questionList[x].options[userAnswerArray[x]]}</p>
                {qngradeData[x].isCorrect === true ? (
                    <p>You are correct!</p>
                    ) : (
                    <p>You are wrong. The correct answer is: {questionList[x].correct}</p>
                    )
                }
            </li>);
        }
        setRD(reviewlist);
    }

    if(sendtoDbalr === false && endassessment === true && attemptData){
        sendtodb(true);
    }

    if (loading) return <div>Loading assessment...</div>;

    if(endassessment) return (
        <div>
            <h3>{wholeAssignment.title}</h3>
            <p>Assessment Review</p>
            <div>
                <ul>{reviewData}</ul>
            </div>
            <button className="modal-btn" onClick={goBackToCourse} >← Back to Courses</button>
        </div> 
    )

      return(
        <div>
            {
                startassessment === false && (
                    //Assessment splashpage
                    <div className="course-page">
                        <button className="modal-btn" onClick={goBackToCourse} >← Back to Courses</button>
                        <h3>{wholeAssignment.title}</h3>
                        <p>You will have {wholeAssignment.timeLimit} minutes to finish this assignment.</p>
                        <button className="modal-btn" onClick={starttheassessment} >Start</button>
                    </div>
                )
            }
            {
                startassessment === true && (
                    <div>
                        <h3>{wholeAssignment.title}</h3>
                        <p id= "timerdisplay">Remaining Time:</p>
                        {      
                            <div>
                                {
                                    //mcq
                                    questionList[questionIndex].type === "mcq" && (
                                        <div>
                                            <p>{questionList[questionIndex].text}</p>
                                            <div>
                                                <input type="radio" id="ans1" name="mcq_qn" value="0" checked={selectedValue === "0"} onChange={() => handleRadioChange("0")}/>
                                                <label for="ans1">1) {questionList[questionIndex].options[0]}</label>
                                            </div>
                                            <div>
                                                <input type="radio" id="ans2" name="mcq_qn" value="1" checked={selectedValue === "1"} onChange={() => handleRadioChange("1")}/>
                                                <label for="ans2">2) {questionList[questionIndex].options[1]}</label>
                                            </div>
                                            <div>
                                                <input type="radio" id="ans3" name="mcq_qn" value="2" checked={selectedValue === "2"} onChange={() => handleRadioChange("2")}/>
                                                <label for="ans3">3) {questionList[questionIndex].options[2]}</label>
                                            </div>
                                            <div>
                                                <input type="radio" id="ans4" name="mcq_qn" value="3" checked={selectedValue === "3"} onChange={() => handleRadioChange("3")}/>
                                                <label for="ans4">4) {questionList[questionIndex].options[3]}</label>
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    //short ans
                                    questionList[questionIndex].type === "short_answer" && (
                                        <div>
                                            <p>{questionList[questionIndex].text}</p>
                                            <label>
                                                Answer: <input name="short_ans_qn" />
                                            </label>
                                        </div>
                                    )
                                }
                                <span>
                                    {
                                        //back
                                        questionIndex > 0 && (
                                            <button>Previous Question</button>
                                        )
                                    }
                                    {
                                        (questionIndex+1) === questionList.length ? (
                                            <button onClick={submitAss}>Submit Assessment</button>
                                        ) : (
                                            <button onClick={IncrementQuestion}>Next Question</button>
                                        )
                                    }
                                </span>
                            </div>
                        }
                    </div>
                )
            }
        </div>
      )
}

export default AssessmentPage;