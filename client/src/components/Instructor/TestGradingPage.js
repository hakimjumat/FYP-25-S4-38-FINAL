import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

import "../../CSS/CoursePage.css";
import { auth } from "../../firebase";

function TestGradingPage() {
    const { testAttemptId } = useParams(); // Get courseId from URL
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [testqns, setTestQns] = useState(null);
    const [questionList, setQuestions] = useState([]);
    const [testAttemptData, setTestAttemptData] = useState(null);

    const [assID, setAssID] = useState(null);

    const [loading, setLoading] = useState(true);
    const [preparePullQns, setPreparePullQns] = useState(false);
    const [finishPullQns, setfinishPullQns] = useState(false);
    const [finishFormat, setfinishFormat] = useState(false);

    const [preparetosendDB, setPTSDB] = useState(false);
    const [sendingtoDB, setsendingDB] = useState(false);

    const [datathatwillbesent, setDTWBS] = useState(null);

    const [qnCW, setqnCW] = useState(false);

    const [currQnInd, setCurrQnInd] = useState(0);

    useEffect(() => {
        //fetch assessment from DB
        getAttempt();
    }, [user]);

    const handleRadioButtonChange = (value)=> {
        if(value === "correct")
        {
            console.log("Correct");
            setqnCW(true);
        }
        else
        {
            console.log("Wrong");
            setqnCW(false);
        }
    };

    const getAttempt = async () => {
        try{
            console.log(testAttemptId);
            const res = await authFetch("http://localhost:5000/api/instructors/getalltestattempts",
                {method: "GET"}, user
            );
            if (res.success){
                for(let i = 0; i < res.data.length; i++){
                    console.log(res.data[i].id);
                    if(res.data[i].id === testAttemptId)
                    {
                        //setTestQns(res.data[i]);
                        //setQuestions(res.data[i].questions);
                        setTestAttemptData(res.data[i]);
                        setDTWBS(res.data[i].questions);
                        setAssID(res.data[i].test_ID);
                        console.log("Successfully load attempt data");
                    }
                }
            }
        }
        catch(error){
            console.error("Error fetching attempts:", error);
        }
        finally{
            setPreparePullQns(true);
        }
    }

    const getQuestions = async () => {
        try {
            console.log(JSON.stringify(assID));
            const res = await authFetch("http://localhost:5000/api/instructors/getallAssessments",
                {method: "GET"}, user);
            if(res.success){
    
                for(let i = 0; i < res.data.length; i++){
                    console.log(res.data[i].id);
                    if(res.data[i].id === assID)
                    {
                        setTestQns(res.data[i]);
                        setQuestions(res.data[i].questions);
                        console.log("Successfully load assignmnet data");
                    }
                }
            }
        }
        catch (error){
            console.error("Error fetching courses:", error);
        }
        finally{
            setfinishPullQns(true);
        }
    }

    function incrementQn(){
        updatedata();
        let x = currQnInd + 1;
        setCurrQnInd(x);
    }

    function updatedata(){
        let changeddata = datathatwillbesent;
        changeddata.answers[currQnInd].isCorrect = qnCW;
        if(qnCW === true)
            changeddata.score = changeddata.score + 10;
        setDTWBS(changeddata);
    }

    function submitdatatodb() {
        updatedata();
        generateWeightedGrade();
        setPTSDB(true);
    }

    function generateWeightedGrade(){
        let changeddata = datathatwillbesent;
        //first convert grade to 100%
        let convertedgrade = changeddata.score / testqns.totalPoints;
        convertedgrade *= 100;
        convertedgrade *= (testqns.weightage/ 100);
        changeddata.weightedGrade = convertedgrade;
        setDTWBS(changeddata);
    }

    const sendStudentGrade = async () => {
        try{
            await authFetch("http://localhost:5000/api/instructors/uploadstudentgrade", {method: "POST", body:JSON.stringify({
                sid: testAttemptData.user, 
                cid: testAttemptData.course,
                tid: datathatwillbesent.assessmentId,
                newgrade: datathatwillbesent,
            })}, user);
        }
        catch(error){

        }
        finally{
            retreieveStudentOverallGrade();
        }
    }

    const retreieveStudentOverallGrade = async () => {
        let x = null;
        try{
            x = await authFetch("http://localhost:5000/api/instructors/fetchsinglestudentgrade",
                {method: "POST", body:JSON.stringify({
                sid: testAttemptData.user, 
                cid: testAttemptData.course,
            })}, user);
        }
        catch(error){

        }
        finally{
            CalculateGrade(x.data);
        }
    }

    const postnewStudentOverallGrade = async (data) => {
        try{
            await authFetch("http://localhost:5000/api/instructors/updateTotalGrade",
                {method: "POST", body:JSON.stringify({
                sid: testAttemptData.user, 
                cid: testAttemptData.course,
                newTG: data,
            })}, user);
        }
        catch(error){

        }
        finally{
            delgradeditem();
        }
    }

    function CalculateGrade(xxx) {
        let newTotalGrade = 0;
        let smth = xxx.results;
        for (let j = 0; j < smth.length; j++) {
        if (smth[j].weightedGrade !== undefined) {
          newTotalGrade += smth[j].weightedGrade;
        }
      }
        postnewStudentOverallGrade(newTotalGrade);
    }

    const announceNewGrade = async () => {
        try{
            //system announcement to student
            let y = new Date();
            let body = "A new grade for " + testqns.title;
            let subject = "New Grade Released";
            let x = {
                sender_user_id: "SYSTEM_ANNOUNCEMENT", 
                reciver_user_id: testAttemptData.user,
                s_name: "SYSTEM_ANNOUNCEMENT",
                subject: subject,
                text: body,
                sent_on: y,
            }
            
            await authFetch("http://localhost:5000/api/messages/courseannouncement", {method:"POST", body:JSON.stringify({x})}, user)
        }
        catch(error){

        }
        finally{
            //go back to course page
            //note
            navigate("/CourseEditorPage");
        }
    }

    const delgradeditem = async()=>{
        try{
            await authFetch(`http://localhost:5000/api/instructors/delete-gradeditem/${testAttemptId}`, { method: "DELETE" },user)
        } catch(error){

        }
        finally{
            announceNewGrade();
            alert("Redirecting to Course Editor Page")
            navigate("/CourseEditorPage");
        }
    }

    if(preparetosendDB === true && sendingtoDB === false){
        sendStudentGrade();
    }


    if(preparePullQns === true && finishPullQns === false){
        getQuestions();
    }

    if(finishPullQns === true && finishFormat === false){
        //format
        setLoading(false);
        setfinishFormat(true);
    }
    
    if (loading) return(<div>Loading...</div>)

    return(
        <div>
            <h3>Grading Page</h3>
            
            {
                questionList[currQnInd].type === "mcq" && (
                    <div>
                        <p>{questionList[currQnInd].text}</p>
                        <p>Student Answer: {questionList[currQnInd].options[testAttemptData.questions.answers[currQnInd].selected]}</p>
                        <div>
                            <label>Correct</label>
                            <input type="radio" name="grading" onChange={() => handleRadioButtonChange("correct")}/>
                        </div>
                        <div>
                            <label>Wrong</label>
                            <input type="radio" name="grading" onChange={() => handleRadioButtonChange("wrong")}/>
                        </div>
                    </div>
                )
            }
            {
                questionList[currQnInd].type === "short_answer" && (
                    <div>
                        <p>{questionList[currQnInd].text}</p>
                        <p>Student Answer: {testAttemptData.questions.answers[currQnInd].selected}</p>
                        <p>Model Answer: {questionList[currQnInd].modelAnswer}</p>
                        <div>
                            <label>Correct</label>
                            <input type="radio" name="grading" onChange={() => handleRadioButtonChange("correct")}/>
                        </div>
                        <div>
                            <label>Wrong</label>
                            <input type="radio" name="grading" onChange={() => handleRadioButtonChange("wrong")}/>
                        </div>
                    </div>
                    
                )
            }
            
            {
                (currQnInd+1) === questionList.length ? (
                    <button onClick={submitdatatodb}>Save</button>
                ) : (
                    <button onClick={incrementQn}>Next</button>
                )
            }
            
        </div>
    )
}

export default TestGradingPage;