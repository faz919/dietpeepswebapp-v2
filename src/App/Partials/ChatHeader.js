import React, {useContext, useEffect, useRef, useState} from 'react'
import {useDispatch} from "react-redux"
import {
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Tooltip, Button
} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import VoiceCallModal from "../Modals/VoiceCallModal"
import VideoCallModal from "../Modals/VideoCallModal"
import {profileAction} from "../../Store/Actions/profileAction"
import {mobileProfileAction} from "../../Store/Actions/mobileProfileAction"
import moment from 'moment'
import { AuthContext } from '../../providers/AuthProvider'
import { doc, getFirestore, Timestamp, updateDoc } from 'firebase/firestore'
import app from '../../firebase'
import { LoadingButton } from '@mui/lab'

const db = getFirestore(app)

function ChatHeader(props) {

    const { globalVars } = useContext(AuthContext)

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const toggle = () => setDropdownOpen(prevState => !prevState)

    const selectedChatClose = () => document.querySelector('.chat').classList.remove('open')

    const [tooltipOpen, setTooltipOpen] = useState(false)
    const tooltipToggle = () => setTooltipOpen(!tooltipOpen)

    const [editingName, setEditingName] = useState(false)
    const [nnDBSync, setSyncing] = useState(false)
    const [nickName, setNickName] = useState('')
    const textboxHeight = document.getElementById('nickname-textbox')?.getBoundingClientRect().height

    const changeNickName = () => {
        if (props.selectedChat.user.nickName !== nickName) {
            props.selectedChat.user.nickName = nickName
            updateDoc(doc(db, 'user-info', props.selectedChat.user.id), {
                nickName
            }).then(() => {
                setEditingName(false)
                setSyncing(false)
                setNickName('')
            })
            console.log('Updated local info + DB to reflect nickname change.')
        } else {
            console.log('Nicknames already match.')
        }
    }

    function age (birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate);
        return Math.floor(ageInMilliseconds/(1000 * 60 * 60 * 24 * 365));
    }

    useEffect(() => {
        setEditingName(false)
        setNickName('')
    }, [props.selectedChat])

    let userJoinedText 
    switch (Math.round((new Date() - new Date(props.selectedChat.user.dateJoined))/(1000 * 60 * 60 * 24))) {
        case 0:
            userJoinedText = 'today'
            break
        case 1:
            userJoinedText = 'yesterday'
            break
        default:
            userJoinedText = `${Math.round((new Date() - new Date(props.selectedChat.user.dateJoined))/(1000 * 60 * 60 * 24))} days ago`
    }

    const user_age = props.selectedChat.user.userBioData.dob instanceof Timestamp ? age(props.selectedChat.user.userBioData.dob?.toDate()) : age(props.selectedChat.user.userBioData.dob)

    return (
        <div className="chat-header">
            <div className="chat-header-user">
                <figure className="avatar">
                    {/* attempt to get user photourl, if not, load the default pfp for their username. */}
                    <img src={props.selectedChat.user.photoURL || `https://avatars.dicebear.com/api/bottts/${props.selectedChat.user.displayName}.png?dataUri=true`} className="rounded-circle" alt="avatar"/>
                </figure>
                <div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: textboxHeight }}>
                        <h5>{props.selectedChat.user.displayName}</h5>
                        {props.selectedChat.user.nickName && !editingName && <div id='nickname-textbox' className="text-muted" style={{ marginLeft: 5, height: textboxHeight }}>({props.selectedChat.user.nickName})</div>}
                        {editingName && <div style={{ marginLeft: 5, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '1px' }}>
                            <div className='text-muted' style={{ marginRight: 1 }}>(</div>
                            <input style={{ padding: '1px' }} type='text' className="custom-control-input" placeholder={props.selectedChat.user.nickName} value={nickName} onChange={e => setNickName(e.target.value)} maxLength={20} size={nickName.length === 0 ? props.selectedChat.user.nickName == '' || props.selectedChat.user.nickName == null ? 1 : props.selectedChat.user.nickName.length : nickName.length} />
                            <div className='text-muted' style={{ marginLeft: 1 }}>)</div>
                            <LoadingButton className='color-primary' style={{ textTransform: 'none', height: 30, marginLeft: 5 }} disabled={!nickName} loading={nnDBSync} variant='contained' onClick={() => { setSyncing(true); changeNickName() }}>Save</LoadingButton>
                            <Button style={{ height: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }} onClick={() => { setSyncing(false); setEditingName(false); setNickName('') }}>Cancel</Button>
                        </div>}
                        {!editingName && <button style={{ borderWidth: 0, backgroundColor: 'transparent', marginBottom: 2 }} onClick={() => setEditingName(true)} >
                            <FeatherIcon.Edit2 size={15}/>
                        </button>}
                    </div>
                    <small className="text-muted">
                        {/* check if client has sent message, if so, display time since last client message */}
                        {globalVars.msgList && <i>{globalVars.msgList?.filter(message => message.userID === props.selectedChat.user.id).length === 0 ? 'User has not sent any messages' : 'Last message sent ' + moment(new Date(Math.max(...globalVars.msgList?.filter(message => message.userID === props.selectedChat.user.id)?.map(e => new Date(e.timeSent?.toDate()))))).fromNow()}</i>}
                        &nbsp; <i>User joined {userJoinedText}</i>
                        {props.selectedChat.user.userBioData && <>&nbsp; <i>User Local Time: {moment((new Date()).setHours((new Date()).getUTCHours() - props.selectedChat.user.userBioData?.timezoneOffset)).format('LT')}</i></>}
                        &nbsp; <i>Course Day: {props.selectedChat.user.courseData.courseDay}</i>
                        &nbsp; <i>Latest Course: {props.selectedChat.user.courseData.latestCourseCompleted}</i>
                    </small>
                    <br />
                    {props.selectedChat.user.userBioData && <small className='text-muted'>
                        <i>Age: {user_age}</i>
                        &nbsp; <i>Gender: {props.selectedChat.user.userBioData.gender}</i>
                    </small>}
                </div>
            </div>
            <div className="chat-header-action">
                <ul className="list-inline">
                    <li className="list-inline-item d-xl-none d-inline">
                        <button onClick={selectedChatClose} className="btn btn-outline-light text-danger mobile-navigation-button">
                            <FeatherIcon.X/>
                        </button>
                    </li>
                    <li className="list-inline-item">
                        <VoiceCallModal/>
                    </li>
                    <li className="list-inline-item">
                        <VideoCallModal/>
                    </li>
                    <li className="list-inline-item" data-toggle="tooltip" title="Video call">
                        <Dropdown isOpen={dropdownOpen} toggle={toggle} id="Tooltip-Chat-Header-Menu">
                            <DropdownToggle
                                tag="span"
                                data-toggle="dropdown"
                                aria-expanded={dropdownOpen}
                            >
                                <button className="btn btn-outline-light">
                                    <FeatherIcon.MoreHorizontal/>
                                </button>
                            </DropdownToggle>
                            <DropdownMenu end>
                                <DropdownItem>Add to archive</DropdownItem>
                                <DropdownItem>Delete</DropdownItem>
                                <DropdownItem divider/>
                                <DropdownItem>Block</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Tooltip
                            placement="bottom"
                            isOpen={!dropdownOpen && tooltipOpen}
                            target={"Tooltip-Chat-Header-Menu"}
                            toggle={!dropdownOpen && tooltipToggle}
                        >
                            More
                        </Tooltip>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default ChatHeader
