import React, { useContext, useEffect, useState } from 'react'
import 'react-perfect-scrollbar/dist/css/styles.css'
import PerfectScrollbar from 'react-perfect-scrollbar'
import AddFriendsModal from "../../Modals/AddFriendModal"
import FriendsDropdown from "./FriendsDropdown"
import * as FeatherIcon from "react-feather"
import { AuthContext } from '../../../providers/AuthProvider'
import { useDispatch, useSelector } from 'react-redux'
import app from '../../../firebase'
import { doc, getFirestore, Timestamp, updateDoc } from 'firebase/firestore'
import moment from 'moment'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import ChatsDropdown from '../Chats/ChatsDropdown'
import UserAvatar from '../../../components/UserAvatar'

const db = getFirestore(app)

function Index() {

    const { user, globalVars } = useContext(AuthContext)

    const mobileMenuBtn = () => document.body.classList.toggle('navigation-open')

    const dispatch = useDispatch()

    const { selectedChat } = useSelector(state => state)

    const chatSelectHandle = (chat, user, coach) => {
        let chatInfo = { chat, user, coach }
        dispatch(selectedChatAction(chatInfo))
        document.querySelector('.chat').classList.add('open')
        if (chat.unreadCount > 0) {
            updateDoc(doc(db, 'chat-rooms', chat.id), {
                unreadCount: 0,
                coachLastRead: Timestamp.fromDate(new Date())
            })
        }
    }

    useEffect(() => {
        dispatch(selectedChatAction({ chat: null, user: null, coach: null }))
    }, [])

    const ClientListView = ({ chat }) => {
        const clientInfo = globalVars.clientInfoList?.find(val => val.chatID === chat.id)
        if (clientInfo == null) {
            return null
        }

        const coachInfo = globalVars.coachInfoList?.find(val => clientInfo.coachID === val.id)
        if (coachInfo == null) {
            return null
        }

        return (
            <li className={"list-group-item " + (chat.id === selectedChat.chat?.id ? 'open-chat' : '')}
                    onClick={() => chatSelectHandle(chat, clientInfo, coachInfo)}>
                <UserAvatar user={clientInfo} />
                <div className="users-list-body">
                    <div>
                        {/* lot of complicated formatting so that dates/times, unread message counts, and names/latest messages don't overlap */}
                        <h5 style={{ width: chat.unreadCount === 0 || chat.ungradedImageCount === 0 ? (new Date()).getDay() !== (chat.latestMessageTime?.toDate()).getDay() ? new Date() - chat.latestMessageTime?.toDate() >= 60 * 60 * 24 * 1000 * 7 ? '75%' : '35%' : '75%' : '70%' }} className={chat.unreadCount > 0 ? 'text-primary' : chat.ungradedImageCount > 0 ? 'text-warning' : ''}>{clientInfo.displayName}</h5>
                        <p style={{ width: chat.unreadCount > 0 || chat.ungradedImageCount > 0 ? (new Date()).getDay() !== (chat.latestMessageTime?.toDate()).getDay() ? new Date() - chat.latestMessageTime?.toDate() >= 60 * 60 * 24 * 1000 * 7 ? '70%' : '30%' : '75%' : '90%' }}>{chat.latestMessage}</p>
                    </div>
                    <div className="users-list-action">
                        {chat.unreadCount > 0 ? <div className="new-message-count">{chat.unreadCount}</div> : chat.ungradedImageCount > 0 ? <div className="ungraded-image-count">{chat.ungradedImageCount}</div> : ''}
                        <small className={chat.unreadCount > 0 ? 'text-primary' : chat.ungradedImageCount > 0 ? 'text-warning' : 'text-muted'}>{(new Date()).getDay() !== (chat.latestMessageTime?.toDate()).getDay() ? moment(chat.latestMessageTime?.toDate()).calendar() : moment(chat.latestMessageTime?.toDate()).format('LT')}</small>
                        <div className={chat.ungradedImageCount > 0 ? "action-toggle-image" : "action-toggle"}>
                            <ChatsDropdown/>
                        </div>
                    </div>
                </div>
            </li>
        )
    }

    const [searchQuery, setQuery] = useState('')
    const chatFilter = globalVars.chatList?.filter((chat, index) => chat.userIDs.includes(user.uid) ? searchQuery != '' ? globalVars.clientInfoList[index]?.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 || globalVars.clientInfoList[index]?.nickName && globalVars.clientInfoList[index]?.nickName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 : chat : null )

    return (
        <div className="sidebar active">
            <header>
                <div className="d-flex align-items-center">
                    <button onClick={mobileMenuBtn} className="btn btn-outline-light mobile-navigation-button mr-3 d-xl-none d-inline">
                        <FeatherIcon.Menu/>
                    </button>
                    <span className="sidebar-title">Your Clients</span>
                </div>
                <ul className="list-inline">
                    <li className="list-inline-item">
                        <AddFriendsModal/>
                    </li>
                </ul>
            </header>
            <form>
                <input type="text" className="form-control" placeholder="Filter by client" value={searchQuery} onChange={q => setQuery(q.target.value)}/>
            </form>
            <div className="sidebar-body">
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {chatFilter?.length === 0 ? 
                        <li className='list-group-item'>
                            <div className='users-list-body'>
                                <div style={{ alignItems: 'center', marginTop: -20 }}>
                                    <p>You have no personal clients.</p>
                                </div>
                            </div>
                        </li>
                        : chatFilter?.map((chat, index) => { return (<ClientListView chat={chat} key={index}/>)})}
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Index
