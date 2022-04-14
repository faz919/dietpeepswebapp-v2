import React, {useContext, useEffect, useRef, useState} from 'react'
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
} from 'firebase/firestore'
import app from '../../firebase'
import { AuthContext } from '../../providers/AuthProvider'
import moment from 'moment'
import localization from 'moment/locale/en-nz'
import { Spinner } from 'reactstrap'
import * as FeatherIcon from 'react-feather'

const db = getFirestore(app)

function Chat() {

    moment.updateLocale('en-nz', localization)

    const { user, globalVars, setGlobalVars } = useContext(AuthContext)

    const dispatch = useDispatch()

    const {selectedChat} = useSelector(state => state)
    const [inputMsg, setInputMsg] = useState('')
    const [scrollEl, setScrollEl] = useState()

    const [q, setQ] = useState(null)
    const [messages, setMessages] = useState(null)
    const [scrollPage, setScrollPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [canLoadMore, setCanLoadMore] = useState(true)
    const [scrollToBottom, showScrollToBottom] = useState(false)

    useEffect(() => {
        scrollEl && showScrollToBottom(scrollEl.scrollTop !== scrollEl.scrollHeight)
    }, [scrollEl?.scrollTop])

    useEffect(() => {
        setScrollPage(1)
        setCanLoadMore(true)
    }, [selectedChat?.chat?.id])

    useEffect(() => {
        if (selectedChat.chat != null && selectedChat.chat !== 'stats') {
            dispatch(profileAction(true))
            dispatch(mobileProfileAction(true))
            selectedChat.chat?.id && setQ(query(collection(db, "chat-rooms", selectedChat.chat?.id, "chat-messages"), orderBy('timeSent'), limitToLast(20 * scrollPage)))
            setLoading(true)
        }
    }, [selectedChat?.chat?.id, scrollPage])

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
                if (querySnapshot.size < 20 * scrollPage) {
                    setCanLoadMore(false)
                }
                setLoading(false)
            })
            return () => unsub()
        }
    }, [q])

    const MessagesView = (props) => {
        const { message, index } = props

        return (<>
            {/* find latest unread message, then put a little indicator above it */}
            {globalVars.msgList && selectedChat.chat?.unreadCount > 0 && selectedChat.chat?.coachLastRead && Math.min(...globalVars.msgList?.filter(message => message.timeSent?.toDate() > selectedChat.chat?.coachLastRead?.toDate()).map(e => new Date(e.timeSent?.toDate()))) === (new Date(message.timeSent?.toDate())).getTime() && <div className="message-item messages-divider sticky-top" data-label={selectedChat.chat.unreadCount === 1 ? selectedChat.chat.unreadCount + ' unread message' : selectedChat.chat.unreadCount + ' unread messages'} />}
            <div className={message.userID === selectedChat.user.id ? 'message-item' : 'outgoing-message message-item' }>
                <div className="message-avatar">
                    <figure className="avatar">
                        <img src={message.userID === selectedChat.user.id ? selectedChat.user.photoURL || `https://avatars.dicebear.com/api/bottts/${selectedChat.user.displayName}.png?dataUri=true` : selectedChat.coach?.photoURL} className="rounded-circle" alt="avatar"/>
                    </figure>
                    <div>
                        <h5>{message.userID === selectedChat.user.id ? selectedChat.user.displayName : selectedChat.coach?.displayName}</h5>
                        {message.userID !== selectedChat.user.id && message.userID !== selectedChat.coach.id && <small className='text-muted'>({globalVars.coachInfoList?.find(coach => coach.id === message.userID)?.displayName ? globalVars.coachInfoList?.find(coach => coach.id === message.userID)?.displayName : 'Admin'})</small>}
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
                            {message.img.map((image) => <>
                                {image.graded && <p><strong>Image grade data: </strong><i>Score: {image.grade}, White: {image.red}, Yellow: {image.yellow}, Green: {image.green}</i></p>}
                                {image.graded && image.uploadedAt && <p style={{ marginTop: -15 }}><strong>Time taken to grade: </strong><i>{Math.floor((image.gradedAt - image.uploadedAt)/60) + 'min' + Math.round((image.gradedAt - image.uploadedAt)%60) + 's'}</i></p>}
                                <figure>
                                    <img src={image.url} className="w-25 img-fluid rounded" alt="media"/>
                                </figure>
                            </>)}
                            {message.msg}
                        </div>
                        :
                        <div className="message-content">
                            {message.msg}
                        </div>
                }
            </div>
        </>)
    }

    return (
        <div className="chat">
            {
                selectedChat.chat?.id
                    ?
                    <React.Fragment>
                        <ChatHeader selectedChat={selectedChat}/>
                        <PerfectScrollbar containerRef={ref => setScrollEl(ref)}>
                            <div className="chat-body">
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: -10 }}>
                                    {canLoadMore ?
                                    <>
                                    <small className='text-muted'>{loading ? 'Loading...' : 'Load more'}</small>
                                    {loading ?
                                        <div style={{ marginTop: 5 }}>
                                            <Spinner variant='primary' />
                                        </div> :
                                        <button onClick={() => canLoadMore && setScrollPage(scrollPage + 1)} style={{ borderWidth: 0, backgroundColor: 'transparent', marginTop: 5 }}>
                                            <FeatherIcon.RefreshCcw size={32} />
                                        </button>}
                                    </>
                                    : <small className='text-muted'>No more messages to load!</small>}
                                </div>
                                <div className="messages">
                                    {messages ?
                                        messages.map((message, i) => {
                                            return <MessagesView message={message} index={i} key={message.id}/>
                                        }) : console.log('no messages')}
                                </div>
                                {scrollToBottom && scrollEl.scrollTop !== scrollEl.scrollHeight && <button onClick={() => scrollEl.scrollTop = scrollEl.scrollHeight} style={{ position: 'absolute', bottom: 10, left: 5, backgroundColor: 'transparent', width: 40, height: 40, borderRadius: 20, borderWidth: 0 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0a80ff' }}>
                                        <div style={{ position: 'relative', top: 8 }}>
                                            <FeatherIcon.ChevronDown color='#fff' />
                                        </div>
                                    </div>
                                </button>}
                            </div>
                        </PerfectScrollbar>
                        <ChatFooter inputMsg={inputMsg}/>
                    </React.Fragment>
                    :
                    selectedChat.chat === 'stats' ? (
                    <div className="chat-body no-message">
                        <div className="no-message-container">
                            <div className="mb-5">
                                <img src={UnselectedChat} width={200} className="img-fluid" alt="unselected"/>
                            </div>
                            <p className="lead">Stats page coming soon...</p>
                        </div>
                    </div>
                    ):
                    (<div className="chat-body no-message">
                        <div className="no-message-container">
                            <div className="mb-5">
                                <img src={UnselectedChat} width={200} className="img-fluid" alt="unselected"/>
                            </div>
                            <p className="lead">Select a chat to read messages</p>
                        </div>
                    </div>)
            }
        </div>
    )
}

export default Chat
