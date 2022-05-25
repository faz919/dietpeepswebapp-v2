import React, {useState, useContext, useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux"
import * as FeatherIcon from 'react-feather'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Spinner, Tooltip} from 'reactstrap'
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
import UserAvatar from '../../../components/UserAvatar'

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

    useEffect(() => {
        if (selectedChat.user == null) {
            dispatch(selectedChatAction({ chat: null, user: null, coach: null }))
        }
    }, [])

    function age (birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate);
        return Math.floor(ageInMilliseconds/(1000 * 60 * 60 * 24 * 365));
    }

    const ChatListView = ({ chat }) => {
        const clientInfo = globalVars.clientInfoList?.find(val => val.chatID === chat.id)
        if (clientInfo == null) {
            return null
        }

        const coachInfo = globalVars.coachInfoList?.find(val => clientInfo.coachID === val.id)
        if (coachInfo == null) {
            return null
        }

        const user_age = clientInfo.userBioData?.dob && clientInfo.userBioData?.dob instanceof Timestamp ? age(clientInfo.userBioData?.dob?.toDate()) : age(clientInfo.userBioData?.dob)

        if (!showFlagged && ((user_age != null && user_age < 18) || clientInfo.flagged)) {
            return null
        }

        return (
            <li style={{ backgroundImage: user_age != null && user_age < 18 ? 'linear-gradient(to top right, rgba(255, 0, 0, 0.3), rgba(0,0,0,0))' : null }} className={"list-group-item " + (chat.id === selectedChat.chat?.id ? 'open-chat' : '')}
                    onClick={() => chatSelectHandle(chat, clientInfo, coachInfo)}>
                <UserAvatar user={clientInfo} />
                <div className="users-list-body">
                    <div>
                        {/* lot of complicated formatting so that dates/times, unread message counts, and names/latest messages don't overlap */}
                        <h5 style={{ width: chat.unreadCount === 0 || chat.ungradedImageCount === 0 ? (new Date()).getMonth() !== (chat.latestMessageTime?.toDate()).getMonth() || (new Date()).getDate() !== (chat.latestMessageTime?.toDate()).getDate() ? new Date() - chat.latestMessageTime?.toDate() >= 60 * 60 * 24 * 1000 * 7 ? '70%' : '35%' : '75%' : '70%' }} 
                            className={chat.unreadCount > 0 ? 'text-primary' : chat.ungradedImageCount > 0 ? 'text-warning' : ''}>
                            {clientInfo.displayName} {clientInfo.nickName && <small className='text-muted'>({clientInfo.nickName})</small>}
                        </h5>
                        <p style={{ width: chat.unreadCount > 0 || chat.ungradedImageCount > 0 ? (new Date()).getDay() !== (chat.latestMessageTime?.toDate()).getDay() ? new Date() - chat.latestMessageTime?.toDate() >= 60 * 60 * 24 * 1000 * 7 ? '70%' : '30%' : '75%' : '90%' }}>{chat.latestMessage}</p>
                    </div>
                    <div className="users-list-action">
                        {chat.unreadCount > 0 ? <div className="new-message-count">{chat.unreadCount}</div> : chat.ungradedImageCount > 0 ? <div className="ungraded-image-count">{chat.ungradedImageCount}</div> : ''}
                        <small className={chat.unreadCount > 0 ? 'text-primary' : chat.ungradedImageCount > 0 ? 'text-warning' : 'text-muted'}>{(new Date()).getMonth() !== (chat.latestMessageTime?.toDate()).getMonth() || (new Date()).getDate() !== (chat.latestMessageTime?.toDate()).getDate() ? moment(chat.latestMessageTime?.toDate()).calendar() : moment(chat.latestMessageTime?.toDate()).format('LT')}</small>
                        <div className={chat.ungradedImageCount > 0 ? "action-toggle-image" : "action-toggle"}>
                            <ChatsDropdown chatID={chat.id}/>
                        </div>
                    </div>
                </div>
            </li>
        )
    }

    const [searchQuery, setQuery] = useState('')
    const chatFilter = globalVars.chatList?.filter((chat, index) => searchQuery == '' ?  chat : globalVars.clientInfoList.find((client) => client.chatID === chat.id)?.displayName && globalVars.clientInfoList.find((client) => client.chatID === chat.id)?.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 || globalVars.clientInfoList.find((client) => client.chatID === chat.id)?.nickName && globalVars.clientInfoList.find((client) => client.chatID === chat.id)?.nickName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)

    const [colorCode, setColorCode] = useState('clear')
    const [activityTooltipOpen, setActivityTooltipOpen] = useState(false)
    const activityTooltipToggle = () => setActivityTooltipOpen(!activityTooltipOpen)
    const [activityDropdownOpen, setActivityDropdownOpen] = useState(false)
    const activityDropdownToggle = () => setActivityDropdownOpen(!activityDropdownOpen)

    let tempFilter
    const oneDay = 60 * 60 * 24 * 1000
    const [activityFilter, setActivityFilter] = useState([])
    
    let tempFilterMsg = {}
    const [activityFilterMsg, setActivityFilterMsg] = useState(tempFilterMsg)

    useEffect(() => {
        console.log(globalVars.clientInfoList?.filter((client) => client.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1))
    }, [searchQuery])
    
    useEffect(() => {
        switch (colorCode) {
            case 'clear':
                tempFilter = chatFilter
                tempFilterMsg = {}
                break
            case 'active':
                tempFilter = chatFilter.filter((chat) => globalVars.clientInfoList.filter((user) => user.chatID === chat.id && new Date() - user.lastImageSent?.toDate() < oneDay).length > 0)
                tempFilterMsg = { message: 'Active', color: 'success' }
                break
            case 'no-submit':
                tempFilter = chatFilter.filter((chat) => globalVars.clientInfoList.filter((user) => user.chatID === chat.id && new Date() - user.lastImageSent?.toDate() >= oneDay && new Date() - user.lastImageSent?.toDate() < oneDay * 3).length > 0)
                tempFilterMsg = { message: 'Low Churn Risk (No Images in Last 24h)', color: 'warning' }
                break
            case 'churn-risk':
                tempFilter = chatFilter.filter((chat) => globalVars.clientInfoList.filter((user) => user.chatID === chat.id && new Date() - user.lastImageSent?.toDate() >= oneDay * 3 && new Date() - user.lastImageSent?.toDate() < oneDay * 7).length > 0)
                tempFilterMsg = { message: 'High Churn Risk (No Images in Last 72h)', color: 'danger' }
                break
            case 'inactive':
                tempFilter = chatFilter.filter((chat) => globalVars.clientInfoList.filter((user) => user.chatID === chat.id && new Date() - user.lastImageSent?.toDate() >= oneDay * 7).length > 0)
                tempFilterMsg = { message: 'Inactive' }
                break
            default: 
                tempFilter = chatFilter
                tempFilterMsg = {}
                break
        }
        setActivityFilter(tempFilter)
        setActivityFilterMsg(tempFilterMsg)
    }, [colorCode, searchQuery, globalVars.chatList])

    let ungradedFilter = activityFilter.filter((chat) => chat.ungradedImageCount > 0)
    const [ungradedTooltipOpen, setUngradedTooltipOpen] = useState(false)
    const ungradedTooltipToggle = () => setUngradedTooltipOpen(!ungradedTooltipOpen)
    const [useUngradedFilter, setUseUngradedFilter] = useState(false)
    const useUngradedToggle = () => setUseUngradedFilter(!useUngradedFilter)

    const [showFlaggedTooltip, setShowFlaggedTooltip] = useState(false)
    const toggleShowFlaggedTooltip = () => setShowFlaggedTooltip(!showFlaggedTooltip)
    const [showFlagged, setShowFlagged] = useState(false)
    const toggleShowFlagged = () => setShowFlagged(!showFlagged) 

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
                    <li className='list-inline-item'>
                        <button className="btn btn-outline-light text-danger" onClick={toggleShowFlagged} id="Tooltip-Show-Flagged">
                            <FeatherIcon.Flag />
                        </button>
                        <Tooltip
                            placement="bottom"
                            isOpen={showFlaggedTooltip}
                            target={"Tooltip-Show-Flagged"}
                            toggle={toggleShowFlaggedTooltip}>
                            {showFlagged ? 'Hide Flagged Users' : 'Show Flagged Users'}
                        </Tooltip>
                    </li>
                    <li className='list-inline-item'>
                        <button className="btn btn-outline-light text-warning" onClick={useUngradedToggle} id="Tooltip-Filter-Ungraded">
                            <FeatherIcon.Image />
                        </button>
                        <Tooltip
                            placement="bottom"
                            isOpen={ungradedTooltipOpen}
                            target={"Tooltip-Filter-Ungraded"}
                            toggle={ungradedTooltipToggle}>
                            Filter by Ungraded
                        </Tooltip>
                    </li>
                    <li className="list-inline-item">
                        <Dropdown isOpen={activityDropdownOpen} toggle={activityDropdownToggle}>
                            <DropdownToggle
                                tag="span"
                                data-toggle="dropdown"
                                aria-expanded={activityDropdownOpen}
                            >
                                <button className="btn btn-outline-light" id="Tooltip-Filter-Activity">
                                    <FeatherIcon.Clock />
                                </button>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => setColorCode('clear')}>Clear</DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem onClick={() => setColorCode('active')}>Green (Active)</DropdownItem>
                                <DropdownItem onClick={() => setColorCode('no-submit')}>Yellow (No images in past 24h)</DropdownItem>
                                <DropdownItem onClick={() => setColorCode('churn-risk')}>Red (High churn risk)</DropdownItem>
                                <DropdownItem onClick={() => setColorCode('inactive')}>Gray (Inactive)</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Tooltip
                            placement="bottom"
                            isOpen={activityTooltipOpen}
                            target={"Tooltip-Filter-Activity"}
                            toggle={activityTooltipToggle}>
                            Filter by Activity
                        </Tooltip>
                    </li>
                    {/* <li className="list-inline-item">
                        <button onClick={() => dispatch(sidebarAction('Clients'))} className="btn btn-outline-light"
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
                    </li> */}
                </ul>
            </header>
            <form>
                {(activityFilterMsg.message || useUngradedFilter) && <p style={{ display: 'block' }}>Currently filtering by:&nbsp;{activityFilterMsg.message && <p style={{ margin: 0 }} className={`text-${activityFilterMsg.color}`}> - {activityFilterMsg.message}&nbsp;</p>}{useUngradedFilter && <p style={{ margin: 0 }}> - Ungraded</p>}<p style={{ margin: 0 }}>{useUngradedFilter ? ungradedFilter.length : activityFilter.length} users in query.</p></p>}
                {/* <p style={{ margin: 0, marginBottom: 5 }}>Inactive users now hidden by default.</p> */}
                <input type="text" className="form-control" placeholder="Filter by user" value={searchQuery} onChange={(q) => setQuery(q.target.value)} />
            </form>
            <div className="sidebar-body">
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {useUngradedFilter ? ungradedFilter.length === 0 ?                         
                        <li className='list-group-item'>
                            <div className='users-list-body'>
                                <div style={{ alignItems: 'center', marginTop: -20 }}>
                                    <p>No chats with ungraded images!</p>
                                    <p>Check back regularly to make sure</p>
                                    <p>no images are left ungraded.</p>
                                </div>
                            </div>
                        </li> : ungradedFilter?.map((chat, index) => { return (<ChatListView chat={chat} key={index}/>)}) : activityFilter.length === 0 ? 
                        <li className='list-group-item'>
                            <div className='users-list-body'>
                                <div style={{ alignItems: 'center', marginTop: -20 }}>
                                    <p>No chats found in query.</p>
                                </div>
                            </div>
                        </li> : activityFilter?.map((chat, index) => { return (<ChatListView chat={chat} key={index}/>)})}
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Index
