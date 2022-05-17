import React, {useContext, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Tooltip, Button, Modal, ModalBody, Input, Collapse, ModalFooter, Label, ModalHeader
} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import VoiceCallModal from "../Modals/VoiceCallModal"
import UserInfoModal from "../Modals/UserInfoModal"
import {profileAction} from "../../Store/Actions/profileAction"
import {mobileProfileAction} from "../../Store/Actions/mobileProfileAction"
import moment from 'moment'
import { AuthContext } from '../../providers/AuthProvider'
import { doc, getFirestore, Timestamp, updateDoc } from 'firebase/firestore'
import app from '../../firebase'
import { LoadingButton } from '@mui/lab'
import { green, grey, orange, red } from '@mui/material/colors'
import { Radio } from '@mui/material'
import UserAvatar from '../../components/UserAvatar'

const db = getFirestore(app)

function ChatHeader(props) {

    const { user, globalVars, setGlobalVars } = useContext(AuthContext)

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const toggle = () => setDropdownOpen(prevState => !prevState)

    const { selectedChat } = useSelector(state => state)
    const selectedChatClose = () => document.querySelector('.chat').classList.remove('open')

    const [tooltipOpen, setTooltipOpen] = useState(false)
    const tooltipToggle = () => setTooltipOpen(!tooltipOpen)
    const [banUserModalOpen, setBanUserModalOpen] = useState(false)
    const banUserModalToggle = () => setBanUserModalOpen(!banUserModalOpen)
    const [banning, setBanning] = useState(false)
    const [banReasonTextInput, showBanReasonTextInput] = useState(false)
    const [banReason, setBanReason] = useState('')

    const [editingName, setEditingName] = useState(false)
    const [nnDBSync, setSyncing] = useState(false)
    const [nickName, setNickName] = useState('')
    const textboxHeight = document.getElementById('nickname-textbox')?.getBoundingClientRect().height

    // const [colorCodeModalOpen, setColorCodeModalOpen] = useState(false)
    // const colorCodeModalToggle = () => setColorCodeModalOpen(!colorCodeModalOpen)

    // function ColorCodeModal() {

    //     const colorCodings = [
    //         { label: 'Active', value: 'green_active', color: green[400] },
    //         { label: "Hasn't submitted", value: 'yellow_no-submit', color: orange[400] },
    //         { label: 'High Risk of Churn', value: 'red_churn-risk', color: red[500] },
    //         { label: 'Inactive', value: 'grey_inactive', color: grey[500] },
    //     ]

    //     const colorCodeUser = async (value) => {
    //         if (globalVars.userInfo.type !== 'coach' && globalVars.userInfo.type !== 'admin') {
    //             alert('You do not have permission to allocate users to coaches. Please contact an admin if you believe this is a mistake.')
    //             colorCodeModalToggle()
    //             return
    //         }
    //         const latestInfo = await updateDoc(doc(db, 'user-info', selectedChat.user.id), { colorCode: value, colorCodedBy: user.uid })
    //         let userIndex = globalVars.userInfoList?.findIndex(val => val.id === selectedChat.user.id)
    //         let newInfo = globalVars.userInfoList
    //         newInfo[userIndex] = { ...newInfo[userIndex], ...latestInfo.data() }
    //         setGlobalVars(val => ({ ...val, userInfoList: newInfo }))
    //         selectedChat.user = { ...selectedChat.user, ...latestInfo.data() }
    //         props.selectedChat.user = { ...props.selectedChat.user, ...latestInfo.data() }
    //     }

    //     return (
    //         <Modal className="modal-dialog-zoom" isOpen={colorCodeModalOpen} toggle={colorCodeModalToggle} centered>
    //             <ModalHeader toggle={colorCodeModalToggle}>
    //                 <FeatherIcon.Database className="mr-2"/> &nbsp; Color Code User
    //             </ModalHeader>
    //             <ModalBody>
    //                 <Label style={{ marginTop: '10px' }} for="message">Set Color</Label>
    //                 {colorCodings.map((code, index) => 
    //                     <Radio
    //                         checked={props.selectedChat.user.colorCode === code.value}
    //                         onChange={(e) => colorCodeUser(e.target.value)}
    //                         value={code.value}
    //                         sx={{
    //                             color: code.color,
    //                             '&.Mui-checked': {
    //                                 color: code.color,
    //                             },
    //                         }}
    //                     />
    //                 )}
    //             </ModalBody>
    //             <ModalFooter>
    //                 <Button variant='outlined' style={{ textTransform: 'none' }} onClick={colorCodeModalToggle}>Finish</Button>
    //             </ModalFooter>
    //         </Modal>
    //     )
    // }

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

    const banUser = async (e) => {
        e.preventDefault()
        if (!banReasonTextInput) {
            return showBanReasonTextInput(true)
        }
        if (banReason === '') {
            return null
        }
        setBanning(true)
        updateDoc(doc(db, "user-info", props.selectedChat.user.id), {
            shadowBanned: true,
            shadowBanReason: banReason
        }).then(() => {
            banUserModalToggle()
            setBanning(false)
            window.location.reload()
        })  
    }

    useEffect(() => {
        if (!banUserModalOpen) {
            setBanReason('')
            showBanReasonTextInput(false)
        }
    }, [banUserModalOpen])

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

    const user_age = props.selectedChat.user.userBioData && props.selectedChat.user.userBioData?.dob instanceof Timestamp ? age(props.selectedChat.user.userBioData?.dob?.toDate()) : age(props.selectedChat.user.userBioData?.dob)

    return (
        <div style={{ backgroundImage: user_age >= 18 ? null : 'linear-gradient(to top right, rgba(255, 0, 0, 0.3), rgba(0,0,0,0))' }} className="chat-header">
            <div className="chat-header-user">
                <UserAvatar user={props.selectedChat.user} />
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
                    {props.selectedChat.user.userBioData && <small style={{ display: 'flex' }} className='text-muted'>
                        <i style={{ display: 'flex' }}>Age: {user_age >= 18 ? user_age : <p className='text-danger' style={{ margin: 0 }}>&nbsp;{user_age}</p>}</i>
                        &nbsp;&nbsp; <i>Gender: {props.selectedChat.user.userBioData.gender}</i>
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
                        <UserInfoModal/>
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
                                {/* <DropdownItem>(Option 1)</DropdownItem> */}
                                <DropdownItem>(WIP) Flag User</DropdownItem>
                                <DropdownItem divider/>
                                <DropdownItem onClick={banUserModalToggle}>Ban User</DropdownItem>
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
            <Modal isOpen={banUserModalOpen} toggle={banUserModalToggle} centered className="modal-dialog-zoom call">
                <ModalBody>
                    <div className="call">
                        <div>
                            <h5>Are you sure you want to ban this user?</h5>
                            <Collapse isOpen={banReasonTextInput} style={{ padding: '0px 20px' }}>            
                                <Input
                                    type='textarea'
                                    id="standard-multiline-static"
                                    label="Reason"
                                    placeholder="Please provide a reason for this ban..."
                                    rows={6}
                                    value={banReason}
                                    onChange={e => setBanReason(e.target.value)}
                                    className="form-control"
                                    style={{ marginBottom: 20 }}
                                />
                            </Collapse>
                            <div className="action-button">
                                <button type="button" onClick={banUserModalToggle}
                                        className="btn btn-danger btn-floating btn-lg"
                                        data-dismiss="modal" disabled={banning}>
                                    <FeatherIcon.X/>
                                </button>
                                <button type="button" onClick={banUser}
                                        className="btn btn-success btn-pulse btn-floating btn-lg" disabled={banning} style={{ opacity: banReasonTextInput && banReason === '' || banning ? 0.5 : 1 }}>
                                    <FeatherIcon.Check/>
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default ChatHeader
