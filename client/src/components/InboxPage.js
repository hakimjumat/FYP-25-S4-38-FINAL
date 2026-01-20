import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import "../CSS/InboxPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import "../CSS/CourseEditorPage.css";
import "../CSS/CoursePage.css";

function InboxPage() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("messages");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState("readMessage"); //readMessage or writeMessage
    const [selectedMessage, setSelectedMessgae] = useState(null);
    const [allMessages, setAllMessages] = useState([]); //should be fetched when user enters page
    const [isLoading, setIsLoading] = useState(true);

    const [msgRecipient, setMsgRecipient] = useState(null); //should be hidden
    const [reciverSelectScreen, setReciverSelectScreen] = useState(false);

    const [msgData, setMsgData] = useState(null);
    const [msgSubjectData, setSMsgData] = useState(null);
    const [msgBodyData, setBMsgData] = useState(null);

    const [sendMessage, setSendMessage] = useState(false);
    const [sending, setSending] = useState(false);

    const[allUsers, setAllusers] = useState([])

    useEffect(() => {
        if (user){
            fetchMessages();
            getUserList();
        } 
      }, [user]);

    const getUserList = async () => {
        try{
            const x = await authFetch("http://localhost:5000/api/messages/getMsgRecivers", {method: "GET"}, user);
            if(x.success){
                setAllusers(x.data.users);
            }
        } catch(error){
            //smth fk up
        }
    }

    
    const fetchMessages = async () => {
        try{
            const x = await authFetch("http://localhost:5000/api/messages/getAllYourMsgs", {method: "GET"}, user);
            if (x.success){
                setAllMessages(x.data.msgs);
            }
        } catch(error){
            //smth fk up
        }finally{
            setIsLoading(false);
        }
    }

    function openReadModal(){
        setIsModalOpen(true);
        setActiveModal("readMessage");
    }

    function openWriteModal(){
        setIsModalOpen(true);
        setActiveModal("writeMessage");
    }

    function closeModal(){
        setIsModalOpen(false);
    }

    const sendMessageToDB = async () =>{
        try{
            await authFetch("http://localhost:5000/api/messages/sendMessage", {method: "POST", body:JSON.stringify(msgData)}, user);
        } catch(error){
            //smth fk up
        }finally{
            setSending(false);
            setSendMessage(false);
            setIsModalOpen(false);
        }
    }

    const handleSubChange = event => {
        setSMsgData(event.target.value);
        console.log('value is:', event.target.value);
    }

    const handleMessageChange = event => {
        setBMsgData(event.target.value);
        console.log('value is:', event.target.value);
    }

    function pulldata(){
        let y = new Date()
        let x = {
            sender_user_id: user.uid, 
            reciver_user_id: msgRecipient.uid,
            s_name: user.displayName,
            subject: msgSubjectData,
            text: msgBodyData,
            sent_on: y,
        }
        setMsgData(x);
        setMsgRecipient(null);
        setSendMessage(true);
    }

    function SelectedRecipient(person){
        //setMsgRecipient(person)
        //setActiveModal("writeMessage");

    }

    if(sendMessage === true && sending === false)
    {
        setSending(true);
        sendMessageToDB();
    }


    return (
        <div className="inbox-page">
            <h2>Inbox</h2>
            <div className="inbox-tabs">
                <button
                    className={activeTab === "all" ? "active" : ""}
                    onClick={() => setActiveTab("all")}
                >
                    All
                </button>
                <button
                    className={activeTab === "messages" ? "active" : ""}
                    onClick={() => setActiveTab("messages")}
                >
                    Messages
                </button>
                <button
                    className={activeTab === "announcement" ? "active" : ""}
                    onClick={() => setActiveTab("announcement")}
                >
                    Announcements
                </button>
            </div>
            <div>
                <button onClick={openWriteModal}>+ Draft New Message</button>
            </div>

            <div className="inbox-content">
                {activeTab === "all" && (
                    <div>
                        {
                            isLoading === true ? (
                                <p>Loading Messages...</p>
                            ) : (
                                <div>
                                {allMessages.map((message) => {
                                        return(
                                            <span>
                                                <div>
                                                    {message.subject}
                                                    <button onClick={() => {setSelectedMessgae(message);setActiveModal("readMessage");setIsModalOpen(true);}}>Read</button>
                                                </div>
                                            </span>
                                        )
                                    })}
                                </div>
                            )
                        }
                    </div>
                    ) }
                
                {activeTab === "messages" && <div>Messages Content</div>}
                {activeTab === "announcement" && <div>Announcements Content</div>}
            </div>


            {
                isModalOpen === true && activeModal === "writeMessage" && (
                //structured like an email
                    <div className="modal-overlay">
                        <div className="course-modal-box">
                            {
                                msgRecipient === null ? (
                                    <button onClick={() => setActiveModal("selectReciver")}>Select Recipient</button>
                                ) : (
                                    <div>
                                        <p>Recipient: {msgRecipient.displayName}</p>
                                        <button onClick={() => setMsgRecipient(null)}>Clear Selection</button>
                                    </div>
                                )
                            }
                            <label>Subject: <input id = "subjectInput" name="SubjectInputBox" onChange={handleSubChange}/></label>
                            <input id = "bodyInput" name="BodyInputBox" onChange={handleMessageChange}/>
                            <div className="course-modal-footer">
                                <button
                                    className="modal-btn"
                                    style={{ background: "#4cd137", cursor: "default" }}
                                    onClick={pulldata}
                                >
                                    Send
                                </button>
                                <button className="text-btn" onClick={closeModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isModalOpen === true && activeModal === "readMessage" && (
                //structured like an email
                    <div className="modal-overlay">
                        <div className="course-modal-box">
                            <label>Sender: {selectedMessage.s_name}</label>
                            <h3>Subject: {selectedMessage.subject}</h3>
                            <p>{selectedMessage.text}</p>
                            <div className="course-modal-footer">
                                <button className="text-btn" onClick={closeModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isModalOpen === true && activeModal === "selectReciver" && (
                //structured like an email
                    <div className="modal-overlay">
                        <div className="course-modal-box">
                            <div>
                                Users:
                            </div>
                            {
                                
                                allUsers.map((person)=>{return(
                                    <div>
                                        {
                                            person.role === "student" && (
                                                <span>
                                                    <label>{person.displayName}</label>
                                                    <button onClick={() => {setMsgRecipient(person);
                                                                                setActiveModal("writeMessage");
                                                    }}>Select</button>
                                                </span>
                                            )
                                        }
                                        {
                                            person.role === "instructor" && (
                                                <span>
                                                    <label>{person.displayName}</label>
                                                    <button onClick={() => {setMsgRecipient(person);setActiveModal("writeMessage");}}>Select</button>
                                                </span>
                                            )
                                        }
                                    </div>

                                    )}
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>



    );
}

export default InboxPage;