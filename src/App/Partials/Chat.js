import React, {useContext, useEffect, useState} from 'react'
import ChatHeader from "./ChatHeader"
import ChatFooter from "./ChatFooter"
import PerfectScrollbar from "react-perfect-scrollbar"
import UnselectedChat from '../../assets/img/unselected-chat.svg'
import {useDispatch, useSelector} from "react-redux"
import {profileAction} from "../../Store/Actions/profileAction"
import {mobileProfileAction} from "../../Store/Actions/mobileProfileAction"
import {
    getFirestore,
    collection,
    query,
    onSnapshot,
    orderBy,
    limitToLast,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth'
import app from '../../firebase'
import { AuthContext } from '../../providers/AuthProvider'
import moment from 'moment'

const db = getFirestore(app)

function Chat() {

    const { user, globalVars, setGlobalVars } = useContext(AuthContext)

    const dispatch = useDispatch()

    const {selectedChat} = useSelector(state => state);
    const [inputMsg, setInputMsg] = useState('');
    const [scrollEl, setScrollEl] = useState();

    const [q, setQ] = useState(null)
    const [messages, setMessages] = useState(null)

    const handleSubmit = (newValue) => {
        selectedChat.messages.push(newValue);
        setInputMsg("");
    };

    const handleChange = (newValue) => {
        setInputMsg(newValue);
    };

    useEffect(() => {
        if (scrollEl) {
            setTimeout(() => {
                scrollEl.scrollTop = scrollEl.scrollHeight;
            }, 100)
        }
    });

    useEffect(() => {
        if (selectedChat != null) {
            dispatch(profileAction(true))
            dispatch(mobileProfileAction(true))
            selectedChat.chat?.id && setQ(query(collection(db, "chat-rooms", selectedChat.chat?.id, "chat-messages"), orderBy('timeSent'), limitToLast(100)))
        }
    }, [selectedChat])

    useEffect(() => {
        if (q == null) {
            return null
        } else {
            const unsub = onSnapshot(q, (querySnapshot) => {
                let msgList = []
                querySnapshot.forEach((doc) => {
                    msgList.push({ ...doc.data(), id: doc.id })
                })
                setMessages(msgList)
                setGlobalVars(val => ({...val, msgList }))
                msgList = []
            })
            return () => unsub()
        }
    }, [q])

    const MessagesView = (props) => {
        const {message} = props;

        if (message.type === 'divider') {
            return <div className="message-item messages-divider sticky-top" data-label={message.text}></div>
        } else {
            return <div className={message.userID === selectedChat.user.id ? 'message-item' : 'outgoing-message message-item' }>
                <div className="message-avatar">
                    <figure className="avatar">
                        <img src={message.userID === selectedChat.user.id ? selectedChat.user.photoURL || `https://avatars.dicebear.com/api/bottts/${selectedChat.user.displayName}.png?dataUri=true` : selectedChat.coach?.photoURL} className="rounded-circle" alt="avatar"/>
                    </figure>
                    <div>
                        <h5>{message.userID === selectedChat.user.id ? selectedChat.user.displayName : selectedChat.coach?.displayName}</h5>
                        <div className="time">
                            {moment(message.timeSent?.toDate()).calendar()}
                            {message.type ? <i className="ti-double-check text-info"></i> : null}
                        </div>
                    </div>
                </div>
                {
                    message.img != null
                        ?
                        <div className="message-content">
                            {message.img.map((image) => 
                            <>
                                {image.graded && <p><strong>Image grade data: </strong><i>Score: {image.grade}, Red: {image.red}, Yellow: {image.yellow}, Green: {image.green}</i></p>}
                                <figure>
                                    <img src={image.url} className="w-25 img-fluid rounded" alt="media"/>
                                </figure>
                            </>
                            )}
                            {message.msg}
                        </div>
                        :
                        <div className="message-content">
                            {message.msg}
                        </div>
                }
            </div>
        }
    };

    return (
        <div className="chat">
            {
                selectedChat.chat?.id
                    ?
                    <React.Fragment>
                        <ChatHeader selectedChat={selectedChat}/>
                        <PerfectScrollbar containerRef={ref => setScrollEl(ref)}>
                            <div className="chat-body">
                                <div className="messages">
                                    {
                                        messages
                                            ?
                                            messages.map((message, i) => {
                                                return <MessagesView message={message} key={i}/>
                                            })
                                            :
                                            console.log('no messages')
                                    }
                                </div>
                            </div>
                        </PerfectScrollbar>
                        <ChatFooter onSubmit={handleSubmit} onChange={handleChange} inputMsg={inputMsg}/>
                    </React.Fragment>
                    :
                    <div className="chat-body no-message">
                        <div className="no-message-container">
                            <div className="mb-5">
                                <img src={UnselectedChat} width={200} className="img-fluid" alt="unselected"/>
                            </div>
                            <p className="lead">Select a chat to read messages</p>
                        </div>
                    </div>
            }
        </div>
    )
}

export default Chat
