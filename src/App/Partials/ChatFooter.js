import React, { useContext, useState } from 'react'
import {Button, Input} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import WomenAvatar5 from "../../assets/img/women_avatar5.jpg"
import {useDispatch, useSelector} from "react-redux"
import { AuthContext } from '../../providers/AuthProvider'
import { addDoc, collection, doc, updateDoc, getFirestore, Timestamp } from 'firebase/firestore'
import app from '../../firebase'

const db = getFirestore(app)

function ChatFooter() {

    const { user } = useContext(AuthContext)

    const {selectedChat} = useSelector(state => state)

    const [message, setMessage] = useState('')

    const sendMessage = async (e) => {
      e.preventDefault()
  
      const msg = message
      setMessage('')
  
      const { uid } = user
  
      await addDoc(collection(db, "chat-rooms", selectedChat.chat.id, "chat-messages"), {
        img: null,
        msg,
        timeSent: Timestamp.fromDate(new Date()),
        userID: uid,
      }).then(() => {
        updateDoc(doc(db, "chat-rooms", selectedChat.chat.id), {
          latestMessage: msg,
          latestMessageTime: Timestamp.fromDate(new Date())
        })
        selectedChat.chat.unreadCount = 0
      })
    }

    return (
        <div className="chat-footer">
            <form onSubmit={sendMessage}>
                {/* <div>
                    <Button color="light" className="mr-3" title="Emoji">
                        <FeatherIcon.Smile/>
                    </Button>
                </div> */}
                <Input type="text" className="form-control" placeholder="Write a message..." value={message} onChange={(e) => setMessage(e.target.value)}/>
                <div className="form-buttons">
                    {/* <Button color="light">
                        <FeatherIcon.Paperclip/>
                    </Button>
                    <Button color="light" className="d-sm-none d-block">
                        <FeatherIcon.Mic/>
                    </Button> */}
                    <Button color="primary" onClick={sendMessage} disabled={!message}>
                        <FeatherIcon.Send/>
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ChatFooter
