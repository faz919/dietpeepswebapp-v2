import React, {useState, useContext, useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux"
import * as FeatherIcon from 'react-feather'
import {Tooltip} from 'reactstrap'
import 'react-perfect-scrollbar/dist/css/styles.css'
import PerfectScrollbar from 'react-perfect-scrollbar'
import AddGroupModal from "../../Modals/AddGroupModal"
import ChatsDropdown from "./ChatsDropdown"
import {sidebarAction} from "../../../Store/Actions/sidebarAction"
import {selectedChatAction} from "../../../Store/Actions/selectedChatAction"
import { AuthContext } from '../../../providers/AuthProvider'
import moment from 'moment'
import { doc, getFirestore, Timestamp, updateDoc } from 'firebase/firestore'
import app from '../../../firebase'

const db = getFirestore(app)

function Index() {

    const { globalVars } = useContext(AuthContext)

    const dispatch = useDispatch()

    const {selectedChat, allChatInfo} = useSelector(state => state)

    const [tooltipOpen, setTooltipOpen] = useState(false)
    const toggle = () => setTooltipOpen(!tooltipOpen)

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

    const mobileMenuBtn = () => document.body.classList.toggle('navigation-open')

    const ChatListView = ({ chat }) => {
        const clientInfo = globalVars.userInfoList?.find(val => val.correspondingChatID === chat.id)
        const coachInfo = globalVars.coachInfoList?.find(val => val.correspondingChatID === chat.id)
        return (
            <li className={"list-group-item " + (chat.id === selectedChat.chat?.id ? 'open-chat' : '')}
                    onClick={() => chatSelectHandle(chat, clientInfo, coachInfo)}>
                <figure className="avatar">
                    <img src={clientInfo.photoURL || `https://avatars.dicebear.com/api/bottts/${clientInfo.displayName}.png?dataUri=true`} className="rounded-circle" alt="avatar"/>
                </figure>
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
    const chatFilter = globalVars.chatList?.filter((chat, index) => searchQuery != '' ? globalVars.userInfoList[index]?.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 : chat )

    return (
        <div className="sidebar active">
            <header>
                <div className="d-flex align-items-center">
                    <button onClick={mobileMenuBtn} className="btn btn-outline-light mobile-navigation-button mr-3 d-xl-none d-inline">
                        <FeatherIcon.Menu/>
                    </button>
                    <span className="sidebar-title">Chats</span>
                </div>
                <ul className="list-inline">
                    <li className="list-inline-item">
                        <AddGroupModal/>
                    </li>
                    <li className="list-inline-item">
                        <button onClick={() => dispatch(sidebarAction('Friends'))} className="btn btn-outline-light"
                                id="Tooltip-New-Chat">
                            <FeatherIcon.PlusCircle/>
                        </button>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen}
                            target={"Tooltip-New-Chat"}
                            toggle={toggle}>
                            New chat
                        </Tooltip>
                    </li>
                </ul>
            </header>
            <form>
                <input type="text" className="form-control" placeholder="Search chats" value={searchQuery} onChange={q => setQuery(q.target.value) }/>
            </form>
            <div className="sidebar-body">
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {chatFilter?.map((chat, index) => { return (<ChatListView chat={chat} key={index}/>)})}
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Index
