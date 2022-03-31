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

function Index() {

    const { globalVars } = useContext(AuthContext)

    useEffect(() => {
        console.log(new Date(), globalVars.chatList)
    }, [globalVars.chatList, globalVars.userInfoList])

    const dispatch = useDispatch()

    const {selectedChat} = useSelector(state => state)

    const [tooltipOpen, setTooltipOpen] = useState(false)
    const toggle = () => setTooltipOpen(!tooltipOpen)

    const chatSelectHandle = (chat, user, coach) => {
        chat.unreadCount = 0
        let chatInfo = { chat, user, coach }
        dispatch(selectedChatAction(chatInfo))
        document.querySelector('.chat').classList.add('open')
    }

    const mobileMenuBtn = () => document.body.classList.toggle('navigation-open')

    const ChatListView = ({chat, index}) => {
        return <li className={"list-group-item " + (chat.id === selectedChat.chat?.id ? 'open-chat' : '')}
                   onClick={() => chatSelectHandle(chat, globalVars.userInfoList?.find(val => val.correspondingChatID === chat.id), globalVars.coachInfoList?.find(val => val.correspondingChatID === chat.id))}>
            <figure className="avatar">
                <img src={globalVars.userInfoList[index]?.photoURL || `https://avatars.dicebear.com/api/bottts/${globalVars.userInfoList[index]?.displayName}.png?dataUri=true`} className="rounded-circle" alt="avatar"/>
            </figure>
            <div className="users-list-body">
                <div>
                    <h5 className={chat.unreadCount > 0 ? 'text-primary' : ''}>{globalVars.userInfoList[index]?.displayName}</h5>
                    <p style={{ width: chat.unreadCount > 0 ? '75%' : '100%' }}>{chat.latestMessage}</p>
                </div>
                <div className="users-list-action">
                    {chat.unreadCount > 0 ? <div className="new-message-count">{chat.unreadCount}</div> : ''}
                    <small className={chat.unreadCount > 0 ? 'text-primary' : 'text-muted'}>{moment(chat.latestMessageTime?.toDate()).format('LT')}</small>
                    <div className="action-toggle">
                        <ChatsDropdown/>
                    </div>
                </div>
            </div>
        </li>
    }

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
                <input type="text" className="form-control" placeholder="Search chats"/>
            </form>
            <div className="sidebar-body">
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {globalVars.chatList?.map((chat, index) => <ChatListView chat={chat} index={index} key={index}/>)}
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Index
