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
    const [questionList, setQuestions] = useState([]);
    const [wholeAssignment, setWholeAssignment] = useState(null);

    let totaltime = 0;
    let remainingtime = totaltime;
    let timerInterval = null;

    let questionIndex = 0;

    let userAnswerArray = [];

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

    function startTimer() {
        totaltime = wholeAssignment.timeLimit * 60; //convert to seconds
        remainingtime = totaltime;
        timerInterval = setInterval(timerLogic, 1000);
    }

    function timerLogic(){
        if(remainingtime > 0){
            remainingtime--;
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
        document.getElementById("timerdisplay").innerHTML = "Remaining Time: " + `${hrs}:${mins}:${secs}`;
    }

    function IncrementQuestion(){
        let x = userAnswerArray.length;
        if(x === questionIndex){
            //no answer for latest question
            userAnswerArray.push(getAnswer());
        }
        questionIndex++;
    }

    function submitAss(){
        let x = userAnswerArray.length;
        if(x === questionIndex){
            //no answer for latest question
            userAnswerArray.push(getAnswer());
            setSelectedValue("");
        }
        if(wholeAssignment.type === "quiz")
        {
            //mark now
            markAssessment();
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
            if(userAnswerArray[i] === (questionList[i].correct).toString())
            {
                console.log("Q" + i + " is correct.");
            }
            else{
                console.log("Q" + i + " is wrong.");
            }
        }
    }

    if (loading) return <div>Loading assessment...</div>;

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