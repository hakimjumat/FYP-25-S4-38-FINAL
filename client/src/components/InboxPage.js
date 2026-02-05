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

    const [allUsers, setAllusers] = useState([])

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
            console.error(error);
        }
    }

    
    const fetchMessages = async () => {
        try{
            const x = await authFetch("http://localhost:5000/api/messages/getAllYourMsgs", {method: "GET"}, user);
            if (x.success){
                setAllMessages(x.data.msgs);
            }
        } catch(error){
            console.error(error);
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
        setMsgRecipient(null);
        setSMsgData(null);
        setBMsgData(null);
    }

    const sendMessageToDB = async () =>{
        try{
            await authFetch("http://localhost:5000/api/messages/sendMessage", {method: "POST", body:JSON.stringify(msgData)}, user);
        } catch(error){
            console.error(error);
        }finally{
            setSending(false);
            setSendMessage(false);
            setIsModalOpen(false);
            fetchMessages(); // Refresh messages
            alert("Message Sent");
        }
    }

    const handleSubChange = event => {
        setSMsgData(event.target.value);
    }

    const handleMessageChange = event => {
        setBMsgData(event.target.value);
    }

    function pulldata(){
        if (!msgRecipient || !msgSubjectData || !msgBodyData) {
            alert("Please fill in all fields and select a recipient.");
            return;
        }
        
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
        setSendMessage(true);
    }

    if(sendMessage === true && sending === false)
    {
        setSending(true);
        sendMessageToDB();
    }

    // Filter messages based on active tab
    const getFilteredMessages = () => {
        if (activeTab === "all") {
            return allMessages;
        } else if (activeTab === "messages") {
            return allMessages.filter(msg => msg.sender_user_id !== "SYSTEM_ANNOUNCEMENT");
        } else if (activeTab === "announcement") {
            return allMessages.filter(msg => msg.sender_user_id === "SYSTEM_ANNOUNCEMENT");
        }
        return [];
    };

    const filteredMessages = getFilteredMessages();

    return (
        <div className="inbox-page">
            <div className="inbox-container">
                <div className="inbox-header">
                    <h1>Inbox</h1>
                    <button className="compose-btn" onClick={openWriteModal}>
                        Compose Message
                    </button>
                </div>

                <div className="inbox-tabs">
                    <button
                        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
                        onClick={() => setActiveTab("messages")}
                    >
                        Messages
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "announcement" ? "active" : ""}`}
                        onClick={() => setActiveTab("announcement")}
                    >
                        Announcements
                    </button>
                </div>

                <div className="inbox-content">
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading messages...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="empty-state">
                            <h3>No messages yet</h3>
                            <p>Your inbox is empty</p>
                        </div>
                    ) : (
                        <div className="message-list">
                            {filteredMessages.map((message, index) => (
                                <div 
                                    key={index} 
                                    className="message-card"
                                    onClick={() => {
                                        setSelectedMessgae(message);
                                        setActiveModal("readMessage");
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <div className="message-info">
                                        <div className="message-header-row">
                                            <h3 className="message-subject">{message.subject}</h3>
                                            {message.sender_user_id === "SYSTEM_ANNOUNCEMENT" && (
                                                <span className="announcement-badge">Announcement</span>
                                            )}
                                        </div>
                                        <p className="message-sender">
                                            From: {message.s_name || "System"}
                                        </p>
                                        <p className="message-preview">
                                            {message.text ? message.text.substring(0, 80) : ""}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && activeModal === "writeMessage" && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Compose Message</h2>
                        </div>

                        <div className="modal-content">
                            <div className="form-group">
                                <label>Recipient</label>
                                {msgRecipient === null ? (
                                    <button 
                                        className="select-recipient-btn"
                                        onClick={() => setActiveModal("selectReciver")}
                                    >
                                        Select Recipient
                                    </button>
                                ) : (
                                    <div className="selected-recipient">
                                        <span>{msgRecipient.displayName}</span>
                                        <button onClick={() => setMsgRecipient(null)}>✕</button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    placeholder="Enter subject..."
                                    onChange={handleSubChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Type your message here..."
                                    onChange={handleMessageChange}
                                    rows="8"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeModal}>
                                Cancel
                            </button>
                            <button 
                                className="btn-send"
                                onClick={pulldata}
                                disabled={!msgRecipient || !msgSubjectData || !msgBodyData}
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && activeModal === "readMessage" && selectedMessage && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Message</h2>
                        </div>

                        <div className="modal-content">
                            <div className="message-detail">
                                <div className="detail-row">
                                    <span className="detail-label">From:</span>
                                    <span className="detail-value">{selectedMessage.s_name || "System"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Subject:</span>
                                    <span className="detail-value">{selectedMessage.subject}</span>
                                </div>
                                <div className="message-body">
                                    {selectedMessage.text}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && activeModal === "selectReciver" && (
                <div className="modal-overlay" onClick={() => setActiveModal("writeMessage")}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Select Recipient</h2>
                        </div>

                        <div className="modal-content">
                            <div className="user-list">
                                {allUsers.map((person, index) => (
                                    <div key={index} className="user-card">
                                        <div className="user-info">
                                            <div>
                                                <div className="user-name">{person.displayName}</div>
                                                <div className="user-role">
                                                    {person.role === "student" ? "Student" : "Instructor"}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            className="btn-select"
                                            onClick={() => {
                                                setMsgRecipient(person);
                                                setActiveModal("writeMessage");
                                            }}
                                        >
                                            Select
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InboxPage;