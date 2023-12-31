import React, { useContext, useEffect, useState } from 'react'
import { Button, Input } from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import WomenAvatar5 from "../../assets/img/women_avatar5.jpg"
import { useDispatch, useSelector } from "react-redux"
import { AuthContext } from '../../providers/AuthProvider'
import { addDoc, collection, doc, updateDoc, getFirestore, Timestamp } from 'firebase/firestore'
import app from '../../firebase'

const db = getFirestore(app)

function ChatFooter() {

    const { user, globalVars, setGlobalVars } = useContext(AuthContext)

    const { selectedChat } = useSelector(state => state)

    const [message, setMessage] = useState('')

    const sendMessage = async (e) => {
        e.preventDefault()

        if (message === '') {
            return null
        }

        const msg = message
        setMessage('')

        const { uid } = user

        await addDoc(collection(db, "chat-rooms", selectedChat.chat.id, "chat-messages"), {
            img: null,
            msg,
            timeSent: Timestamp.fromDate(new Date()),
            userID: uid,
            senderType: 'coach',
            repliesTo: globalVars.replyingTo?.id ? globalVars.replyingTo?.id : null
            // msgType: 'chatMessage'
        }).then(() => {
            setGlobalVars(val => ({ ...val, replyingTo: null }))
            updateDoc(doc(db, "chat-rooms", selectedChat.chat.id), {
                // latestMessage: msg,
                // latestMessageTime: Timestamp.fromDate(new Date()),
                // latestMessageSender: uid,
                unreadCount: 0,
                coachLastRead: Timestamp.fromDate(new Date())
            })
            selectedChat.chat.unreadCount = 0
        }).catch((e) => {
            console.log(e)
        })
    }

    // useEffect(() => {
    //     setMessage('')
    // }, [selectedChat.chat])

    // useEffect(() => {
    //     selectedChat.chat?.placeholderMessage && setMessage(selectedChat.chat?.placeholderMessage)
    // }, [selectedChat.chat])

    const handleMessageInput = (e) => {
        setMessage(e.target.value)
        // setGlobalVars(val => ({ ...val, chatList: val.chatList.find(chat => chat.id === selectedChat.chat?.id && (chat.placeholderMessage = e.target.value, true)) }))
    }

    return (
        <div className="chat-footer">
            <form onSubmit={sendMessage}>
                {/* <div>
                    <Button color="light" className="mr-3" title="Emoji">
                        <FeatherIcon.Smile/>
                    </Button>
                </div> */}
                <Input type="text" className="form-control" placeholder="Write a message..." value={message} onChange={(e) => handleMessageInput(e)} />
                <div className="form-buttons">
                    {/* <Button color="light">
                        <FeatherIcon.Paperclip />
                    </Button> */}
                    {/* <Button color="light" className="d-sm-none d-block">
                        <FeatherIcon.Mic/>
                    </Button> */}
                    <Button color="primary" onClick={sendMessage} disabled={!message}>
                        <FeatherIcon.Send />
                    </Button>
                </div>
            </form>
            {/* <div style={{ position: 'absolute', top: 0, right: 0 }}>
                <div style={{ height: 400, width: 300, borderRadius: 10, backgroundColor: 'black' }}></div>
                
            </div> */}
        </div>
    )
}

export default ChatFooter
