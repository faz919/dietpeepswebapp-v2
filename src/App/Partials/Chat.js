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
    collectionGroup,
    startAt,
    Timestamp,
    updateDoc,
    doc,
    arrayUnion,
    deleteDoc,
} from 'firebase/firestore'
import app from '../../firebase'
import { AuthContext } from '../../providers/AuthProvider'
import moment from 'moment'
import localization from 'moment/locale/en-nz'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Modal, ModalBody, Spinner } from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import { LoadingButton } from '@mui/lab'
import UserAvatar from '../../components/UserAvatar'

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
        } else if (selectedChat.chat === 'stats') {
            setQ(query(collectionGroup(db, "chat-messages"), orderBy('timeSent'), limitToLast(20 * scrollPage) ))
            setLoading(true)
        }
    }, [selectedChat?.chat, scrollPage])

    useEffect(() => {
        if (q == null) {
            return null
        } else {
            const unsub = onSnapshot(q, (querySnapshot) => {
                let msgList = []
                querySnapshot.forEach((doc) => {
                    msgList.push({ ...doc.data(), id: doc.id })
                })
                console.log('message list: ', msgList)
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

        const [messageOptionsDropdown, showMessageOptionsDropdown] = useState(false)
        const toggleMessageOptionsDropdown = () => showMessageOptionsDropdown(!messageOptionsDropdown)
        const [editing, setEditing] = useState(false)
        const toggleEditing = () => setEditing(!editing)
        const [editedMessage, setEditedMessage] = useState(message.msg)
        const [committingToDB, setCommitting] = useState(false)

        const stopEditing = () => {
            toggleEditing()
            setEditedMessage(message.msg)
            setCommitting(false)
        }

        const editMessage = async (e) => {
            e.preventDefault()
            if (editedMessage === message.msg || editedMessage === '') {
                return null
            }
            setCommitting(true)
            await updateDoc(doc(db, 'chat-rooms', selectedChat.chat.id, 'chat-messages', message.id), {
                editHistory: arrayUnion({ oldMsg: message.msg, editedAt: Timestamp.now() }),
                msg: editedMessage
            })
            stopEditing()
        }

        const [deleting, setDeleting] = useState(false)
        const toggleDeleting = () => setDeleting(!deleting)

        const deleteMessage = async (e) => {
            e.preventDefault()
            await deleteDoc(doc(db, 'chat-rooms', selectedChat.chat.id, 'chat-messages', message.id))
            toggleDeleting()
        }

        return (<>
            {/* find latest unread message, then put a little indicator above it */}
            {globalVars.msgList && selectedChat.chat?.unreadCount > 0 && selectedChat.chat?.coachLastRead && Math.min(...globalVars.msgList?.filter(message => message.timeSent?.toDate() > selectedChat.chat?.coachLastRead?.toDate()).map(e => new Date(e.timeSent?.toDate()))) === (new Date(message.timeSent?.toDate())).getTime() && <div className="message-item messages-divider sticky-top" data-label={selectedChat.chat.unreadCount === 1 ? selectedChat.chat.unreadCount + ' unread message' : selectedChat.chat.unreadCount + ' unread messages'} />}
            <div className={message.userID === selectedChat.user.id ? 'message-item' : 'outgoing-message message-item' }>
                <div className="message-avatar">
                    {message.userID === selectedChat.user.id ? 
                    <UserAvatar user={selectedChat.user} />
                        :
                    <figure className="avatar">
                        <img src={selectedChat.coach?.photoURL} className="rounded-circle" alt="avatar"/>
                    </figure>}
                    <div>
                        <h5>{message.userID === selectedChat.user.id ? selectedChat.user.displayName : selectedChat.coach?.displayName}</h5>
                        {message.userID !== selectedChat.user.id && message.userID !== selectedChat.coach.id && <small className='text-muted'>({globalVars.coachInfoList?.find(coach => coach.id === message.userID)?.displayName ? globalVars.coachInfoList?.find(coach => coach.id === message.userID)?.displayName : 'Admin'})</small>}
                        <div className="time">
                            {moment(message.timeSent?.toDate()).calendar()}
                        </div>
                        {message.editHistory || message.msgHistory ? <i className='time'>{' (edited)'}</i> : null}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: message.userID === selectedChat.user.id ? 'flex-start' : 'flex-end', alignItems: 'center' }}>
                {!editing && message.userID !== selectedChat.user.id &&
                    <Dropdown isOpen={messageOptionsDropdown} toggle={toggleMessageOptionsDropdown}>
                        <DropdownToggle
                            tag="span"
                            data-toggle="dropdown"
                            aria-expanded={messageOptionsDropdown}
                        >
                            <Button style={{ backgroundColor: 'transparent', borderWidth: 0, color: 'black', padding: '5px' }}>
                                <FeatherIcon.MoreHorizontal />
                            </Button>
                        </DropdownToggle>
                        <DropdownMenu direction='right'>
                            <DropdownItem onClick={toggleEditing}>Edit</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem onClick={toggleDeleting}>Delete</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>}
                {editing && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingButton className='color-primary' style={{ textTransform: 'none', height: 30, marginLeft: 5 }} disabled={editedMessage === message.msg || editedMessage === ''} loading={committingToDB} variant='contained' onClick={editMessage}>Save</LoadingButton>
                    <Button style={{ height: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }} onClick={stopEditing}>Cancel</Button>
                </div>}
                {
                    editing ? 
                    <div className='message-content'>
                        <Input
                            type="text" 
                            className="form-control" 
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            style={{ width: '500px' }}
                        />
                    </div> :
                    message.img != null
                        ?
                        <div className="message-content">
                            {message.img.map((image) => <>
                                {image.graded && <p key={image.url}><strong>Image grade data: </strong><i>Score: {image.grade}, White: {image.red}, Yellow: {image.yellow}, Green: {image.green}</i></p>}
                                {image.graded && image.uploadedAt && <p key={image.url} style={{ marginTop: -15 }}><strong>Time taken to grade: </strong><i>{Math.floor((image.gradedAt - image.uploadedAt)/60) + 'min' + Math.round((image.gradedAt - image.uploadedAt)%60) + 's'}</i></p>}
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
                {/* {message.userID === selectedChat.user.id && 
                <div>
                    <FeatherIcon.MoreHorizontal />
                </div>} */}
                </div>
            </div>
            <Modal isOpen={deleting} toggle={toggleDeleting} centered className="modal-dialog-zoom call">
                <ModalBody>
                    <div className="call">
                        <div>
                            <h5>Are you sure you want to delete this message?</h5>
                            <div className="action-button">
                                <button type="button" onClick={toggleDeleting}
                                        className="btn btn-danger btn-floating btn-lg"
                                        data-dismiss="modal" disabled={committingToDB}>
                                    <FeatherIcon.X/>
                                </button>
                                <button type="button" onClick={deleteMessage}
                                        className="btn btn-success btn-pulse btn-floating btn-lg" disabled={committingToDB}>
                                    <FeatherIcon.Check/>
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </>)
    }

    const FeedView = (props) => {

        const { message, index } = props

        return (<>
            <div className='message-item'>
                {/* <div className="message-avatar">
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
                } */}
            </div>
        </>)
    }

    return (
        <div className="chat">
            {
                selectedChat.chat?.id
                    ?
                    <>
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
                                {scrollToBottom && scrollEl != null && scrollEl.scrollTop !== scrollEl.scrollHeight && <button onClick={() => scrollEl.scrollTop = scrollEl.scrollHeight} style={{ position: 'absolute', bottom: 10, left: 5, backgroundColor: 'transparent', width: 40, height: 40, borderRadius: 20, borderWidth: 0 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0a80ff' }}>
                                        <div style={{ position: 'relative', top: 8 }}>
                                            <FeatherIcon.ChevronDown color='#fff' />
                                        </div>
                                    </div>
                                </button>}
                            </div>
                        </PerfectScrollbar>
                        <ChatFooter inputMsg={inputMsg}/>
                    </>
                    :
                    selectedChat.chat === 'stats' ? (
                        <PerfectScrollbar>
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
                                            return <FeedView message={message} index={i} key={message.id}/>
                                        }) : console.log('no messages')}
                                </div>
                                {/* {scrollToBottom && scrollEl.scrollTop !== scrollEl.scrollHeight && <button onClick={() => scrollEl.scrollTop = scrollEl.scrollHeight} style={{ position: 'absolute', bottom: 10, left: 5, backgroundColor: 'transparent', width: 40, height: 40, borderRadius: 20, borderWidth: 0 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0a80ff' }}>
                                        <div style={{ position: 'relative', top: 8 }}>
                                            <FeatherIcon.ChevronDown color='#fff' />
                                        </div>
                                    </div>
                                </button>} */}
                            </div>
                        </PerfectScrollbar>
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
