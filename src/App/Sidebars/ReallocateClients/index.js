import React, { useContext, useEffect, useState } from 'react'
import 'react-perfect-scrollbar/dist/css/styles.css'
import PerfectScrollbar from 'react-perfect-scrollbar'
import * as FeatherIcon from "react-feather"
import { useDispatch } from 'react-redux'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import { AuthContext } from '../../../providers/AuthProvider'
import { Alert, Card, CardBody, Collapse, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Tooltip } from 'reactstrap'
import moment from 'moment'
import { doc, Timestamp, updateDoc, getFirestore, addDoc, collection } from 'firebase/firestore'
import app from '../../../firebase'
import { LoadingButton } from '@mui/lab'
import { Avatar, Checkbox, Chip } from '@mui/material'
import UserAvatar from '../../../components/UserAvatar'
import XButton from '../../../components/XButton'

const db = getFirestore(app)

function Index() {

    const { user, globalVars } = useContext(AuthContext)

    const dispatch = useDispatch()

    const mobileMenuBtn = () => document.body.classList.toggle('navigation-open')

    useEffect(() => {
        dispatch(selectedChatAction({ chat: null, client: null, coach: null }))
    }, [])

    const [selectedUsers, setSelectedUsers] = useState([])
    // const [modalOpen, setModalOpen] = useState(false)
    // const toggleModal = () => setModalOpen(!modalOpen)
    // const openModal = (client) => {
    //     setSelectedUser(client)
    //     toggleModal()
    // }

    // const [userBioCollapse, setUserBioCollapse] = useState(false)
    // const userBioToggle = () => setUserBioCollapse(!userBioCollapse)

    // const FavoritesDropdown = ({ client }) => {
    //     const [dropdownOpen, setDropdownOpen] = useState(false)

    //     const toggle = () => setDropdownOpen(prevState => !prevState)

    //     return (
    //         <Dropdown isOpen={dropdownOpen} toggle={toggle}>
    //             <DropdownToggle tag="span">
    //                 <FeatherIcon.MoreHorizontal />
    //             </DropdownToggle>
    //             <DropdownMenu>
    //                 <DropdownItem onClick={() => openModal(client)}>View Profile</DropdownItem>
    //                 <DropdownItem divider />
    //                 <DropdownItem>Ban User</DropdownItem>
    //             </DropdownMenu>
    //         </Dropdown>
    //     )
    // }

    function age(birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate);
        return Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365));
    }

    const [allocateUserModalOpen, setAllocateUserModalOpen] = useState(false)
    const toggleAllocateUserModal = () => setAllocateUserModalOpen(!allocateUserModalOpen)
    const openAllocateUserModal = (clients) => {
        setSelectedUsers(clients)
        toggleAllocateUserModal()
    }

    const [allocating, setAllocating] = useState(false)

    function AllocateUserModal({ clients }) {

        const batch = clients.length > 1
        const currentClient = clients[0]
        const [selectedCoach, setSelectedCoach] = useState(null)
        const [allocateUserMessage, setAllocateUserMessage] = useState(`Hey there, ${batch ? '{CLIENT_DISPLAY_NAME}' : currentClient?.displayName}! My name is ${globalVars.userInfo?.displayName} and I'll be your personal coach from now on. Please let me know if you have any questions or concerns.`)

        const allocateUser = async (e) => {
            e.preventDefault()
            setAllocating(true)
            if (globalVars.userInfo.type !== 'coach' && globalVars.userInfo.type !== 'admin') {
                alert('You do not have permission to allocate users to coaches. Please contact an admin if you believe this is a mistake.')
                toggleAllocateUserModal()
                setAllocating(false)     
                return
            }
            if (globalVars.userInfo.type === 'admin' && selectedCoach == null) {
                alert('Please select a coach.')
                setAllocating(false)
                return
            }
            if (globalVars.userInfo.type !== 'admin' && selectedCoach != null) {
                alert('You may not assign users to other coaches. Please contact an admin if you believe this is a mistake.')
                toggleAllocateUserModal()
                setAllocating(false)
                return
            }
            // if (selectedCoach != null) {
            for (let client of clients) {
                try {
                    await updateDoc(doc(db, 'chat-rooms', client.chatID), {
                        userIDs: selectedCoach == null ? [user.uid, client.id] : [selectedCoach?.id, client.id]
                    })
                    await updateDoc(doc(db, 'user-info', client.id), {
                        coachID: selectedCoach == null ? user.uid : selectedCoach?.id
                    })
                    await addDoc(collection(db, 'chat-rooms', client.chatID, 'chat-messages'), {
                        img: null,
                        msg: batch ? `Hey there, ${client.displayName}! My name is ${selectedCoach?.displayName} and I'll be your personal coach from now on. Please let me know if you have any questions or concerns.` : allocateUserMessage,
                        timeSent: Timestamp.now(),
                        userID: selectedCoach == null ? user.uid : selectedCoach?.id,
                        senderType: 'coach'
                    })
                } catch (e) {
                    console.log('error while re-allocating user: ', e)
                }
            } 
            // } else {
            //     try {
            //         await updateDoc(doc(db, 'chat-rooms', client.chatID), {
            //             userIDs: [user.uid, client.id]
            //         })
            //         await updateDoc(doc(db, 'user-info', client.id), {
            //             coachID: user.uid
            //         })
            //         await addDoc(collection(db, 'chat-rooms', client.chatID, 'chat-messages'), {
            //             img: null,
            //             msg: allocateUserMessage,
            //             timeSent: Timestamp.now(),
            //             userID: user.uid,
            //             senderType: 'coach'
            //         })
            //     } catch (e) {
            //         console.log('error while re-allocating user: ', e)
            //     }
            // }
            toggleAllocateUserModal()
            setAllocating(false)
            window.location.reload()
        }

        const handleCoachSelect = (coachInfo) => {
            setSelectedCoach(coachInfo)
            setAllocateUserMessage(`Hey there, ${batch ? '{CLIENT_DISPLAY_NAME}' : currentClient?.displayName}! My name is ${coachInfo?.displayName} and I'll be your personal coach from now on. Please let me know if you have any questions or concerns.`)
        }

        return (
            <Modal className="modal-dialog-zoom" isOpen={allocateUserModalOpen} toggle={toggleAllocateUserModal} centered>
                <ModalHeader toggle={toggleAllocateUserModal}>
                    <FeatherIcon.UserPlus className="mr-2"/> &nbsp; {batch ? `Batch Allocate Users` : `Allocate User ${currentClient?.displayName}`}
                </ModalHeader>
                <ModalBody>
                    {globalVars.userInfo?.type === 'coach' && <Alert color="warning">This action will make you the new coach of {currentClient?.displayName}.</Alert>}
                    {globalVars.userInfo?.type !== 'coach' && globalVars.userInfo?.type !== 'admin' && <Alert color="danger">Warning: You are not registered as a coach. Doing this action will make this client's chat invisible in the chat feed.</Alert>}
                    {globalVars.userInfo?.type === 'admin' && batch && selectedCoach != null && <Alert color="danger">Warning: Some users may already have the selected coach as their personal coach. Please be sure that all selected users have a coach <i>different</i> from the selected one.</Alert>}
                    {globalVars.userInfo?.type === 'admin' && <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Label>Select a Coach</Label>
                        <div>
                            {globalVars.coachInfoList?.filter(coach => coach.type === 'coach' && (batch || coach.id !== currentClient?.coachID))?.map((coachInfo, index) => {
                                return (
                                    <Chip 
                                        key={index}
                                        clickable 
                                        avatar={<Avatar src={coachInfo.photoURL} />} 
                                        label={coachInfo.displayName} 
                                        style={{ marginLeft: index === 0 ? 0 : '5px' }} 
                                        onClick={() => handleCoachSelect(coachInfo)}
                                        variant={selectedCoach?.id === coachInfo.id ? 'filled' : 'outlined'} 
                                        color='primary'
                                    />
                                )
                            })}
                        </div>
                    </div>}
                    <Label style={{ marginTop: '10px' }} for="message">Allocation message</Label>
                    <Input 
                        type="textarea" 
                        name="message" 
                        id="message" 
                        rows={6} 
                        value={allocateUserMessage} 
                        onChange={(e) => setAllocateUserMessage(e.target.value)}
                        disabled={batch}
                    />
                </ModalBody>
                <ModalFooter>
                    <LoadingButton loading={allocating} variant='outlined' style={{ textTransform: 'none' }} onClick={allocateUser}>Allocate</LoadingButton>
                </ModalFooter>
            </Modal>
        )
    }

    useEffect(() => {
        if (!allocateUserModalOpen) {
            setAllocating(false)
        }
    }, [allocateUserModalOpen])

    const [showOnlyUnallocatedTooltip, setShowOnlyUnallocatedTooltip] = useState(false)
    const toggleShowOnlyUnallocatedTooltip = () => setShowOnlyUnallocatedTooltip(!showOnlyUnallocatedTooltip)
    const [showOnlyUnallocated, setShowOnlyUnallocated] = useState(false)
    const toggleShowOnlyUnallocated = () => setShowOnlyUnallocated(!showOnlyUnallocated) 

    const [searchQuery, setQuery] = useState('')
    const clientFilter = globalVars.userInfo?.type === 'admin' && !showOnlyUnallocated ? 
        globalVars.clientInfoList?.filter(client => searchQuery == '' ? 
            client : 
            (client.displayName && client.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) || (client.nickName && client.nickName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)) : 
        globalVars.clientInfoList?.filter(client => searchQuery == '' ? 
            globalVars.coachInfoList.some((coach) => coach.type === 'removed-coach' && client.coachID === coach.id) : 
            (globalVars.coachInfoList.some((coach) => coach.type === 'removed-coach' && client.coachID === coach.id) && client.displayName && client.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) || (globalVars.coachInfoList.some((coach) => coach.type === 'removed-coach' && client.coachID === coach.id) && client.nickName && client.nickName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1))
    const [clientBatch, setClientBatch] = useState([])

    return (<>
        <div className="sidebar active">
            <header>
                <div className="d-flex align-items-center">
                    <button onClick={mobileMenuBtn} className="btn btn-outline-light mobile-navigation-button mr-3 d-xl-none d-inline">
                        <FeatherIcon.Menu />
                    </button>
                    <span className="sidebar-title">Reallocate Clients</span>
                </div>
                {globalVars.userInfo?.type === 'admin' && <ul className="list-inline">
                    <li className='list-inline-item'>
                        <button className="btn btn-outline-light text-danger" onClick={toggleShowOnlyUnallocated} id="Tooltip-Show-OnlyUnallocated">
                            <FeatherIcon.Archive />
                        </button>
                        <Tooltip
                            placement="bottom"
                            isOpen={showOnlyUnallocatedTooltip}
                            target={"Tooltip-Show-OnlyUnallocated"}
                            toggle={toggleShowOnlyUnallocatedTooltip}>
                            {showOnlyUnallocated ? 'Show All Users' : 'Only Show Unallocated Users'}
                        </Tooltip>
                    </li>
                </ul>}
            </header>
            <form>
                <InputGroup style={{ alignItems: 'center' }}>
                    <Input type="text" className="form-control" placeholder="Filter by client" style={{ zIndex: 0 }} value={searchQuery} onChange={(q) => setQuery(q.target.value)} />
                    {searchQuery.length > 0 && <div style={{ position: 'absolute', marginTop: '10px', marginBottom: '10px', right: '10px', zIndex: 1 }}><XButton onClick={() => setQuery('')} /></div>}
                </InputGroup>
            </form>
            <div className="sidebar-body">
                {clientFilter.length > 0 &&
                <li className="list-group-item">
                    <div style={{ cursor: 'default' }} className="users-list-body">
                        <LoadingButton disabled={clientBatch.length === 0} variant='outlined' style={{ textTransform: 'none' }} onClick={() => openAllocateUserModal(clientBatch)}>Batch Allocate</LoadingButton>
                        <div className="users-list-action">
                            <div className="action-toggle-checked">
                                <Checkbox
                                    className='checkbox'
                                    disabled={clientFilter.length === 0}
                                    checked={JSON.stringify(clientBatch) === JSON.stringify(clientFilter)}
                                    title='Select All'
                                    onChange={(e) => {
                                        console.log(clientFilter)
                                        e.target.checked ?
                                            setClientBatch(clientFilter) :
                                            setClientBatch([])
                                    }}
                                /> 
                            </div>
                        </div>
                    </div>
                </li>}
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {clientFilter.length === 0 ? 
                            <li className='list-group-item'>
                                <div className='users-list-body'>
                                    <div style={{ alignItems: 'center' }}>
                                        <p>No unallocated users!</p>
                                        <p>Check back regularly to make sure</p>
                                        <p>all users have an active coach.</p>
                                    </div>
                                </div>
                            </li>
                        : clientFilter.map((item, i) => {
                            return (
                                <li key={i} className="list-group-item">
                                    <UserAvatar user={item} />
                                    <div className="users-list-body">
                                        <div onClick={() => openAllocateUserModal([item])}>
                                            <h5>
                                                {item.displayName} {item.nickName && <small className='text-muted'>({item.nickName})</small>}
                                            </h5>
                                            <p style={{ textTransform: 'capitalize' }}>{globalVars.coachInfoList.some((coach) => coach.type === 'removed-coach' && item.coachID === coach.id) ? 'Coach Removed' : `${globalVars.coachInfoList.find((coach) => coach.id === item.coachID)?.displayName}`}</p>
                                        </div>
                                        <div className="users-list-action">
                                            <div className={clientBatch.includes(item) ? "action-toggle-checked" : "action-toggle"}>
                                                    <Checkbox 
                                                        className='checkbox'
                                                        checked={clientBatch.includes(item)}
                                                        onChange={(e) => {
                                                            e.target.checked ? 
                                                                setClientBatch(val => val.concat(item)) :
                                                                setClientBatch(val => val.filter(ids => ids !== item))
                                                        }}
                                                    />
                                                    {/* <FavoritesDropdown client={item} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
        {/* <Modal isOpen={modalOpen} toggle={toggleModal} centered className="modal-dialog-zoom call">
            <ModalHeader style={{ backgroundColor: 'transparent', height: 0 }}>
                {globalVars.userInfo?.type === 'admin' && <a style={{ position: 'absolute', top: 5, right: 5, fontSize: 14, fontWeight: 'normal' }} target='_blank' rel="noreferrer" href={`https://console.firebase.google.com/u/0/project/firstproject-b3f4a/firestore/data/~2Fuser-info~2F${selectedUser.id}`}>(Admin)</a>}
            </ModalHeader>
            <ModalBody>
                <div className="call">
                    <div style={{ paddingLeft: 15, paddingRight: 15 }}>
                        {selectedUser != null && <>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <h4>{selectedUser.displayName}</h4>
                            &nbsp;
                            {selectedUser.nickName && <p className='text-muted'>({selectedUser.nickName})</p>}
                        </div>
                        <p>
                            <b>Date Joined:</b> {moment(selectedUser.dateJoined).format('llll')}<br />
                            <b>Streak:</b> {selectedUser.streak}<br />
                            <b>Images Submitted:</b> {selectedUser.totalImageCount || '(Metric Unavailable)'}<br />
                            <b>Notifications Enabled:</b> {selectedUser.notificationsEnabled ? 'Yes' : 'No'}<br />
                            <b>Device OS: </b> {selectedUser.userBioData?.deviceOS || selectedUser.deviceInfo?.deviceOS || '(Metric Unavailable)'}<br />
                            <b>Course Day:</b> {selectedUser.courseData?.courseDay}<br />
                            <b>Latest Course Completed:</b> {selectedUser.courseData?.latestCourseCompleted}<br />
                            <b>Time of Latest Course Completion:</b> {selectedUser.courseData?.latestCourseCompleted > 0 ? moment(selectedUser.courseData?.courseCompletedAt?.toDate()).format('llll') : 'No courses completed.'}<br />
                            <b>Current Course Day Completed:</b> {selectedUser.courseData?.courseDayCompleted ? 'Yes' : 'No'}
                        </p></>}
                        {selectedUser.userBioData && <><p style={{ cursor: 'pointer' }} onClick={userBioToggle}>{userBioCollapse ? <FeatherIcon.ChevronDown /> : <FeatherIcon.ChevronRight />} <b>User Bio Data:</b></p>
                            <Collapse isOpen={userBioCollapse}>
                                <Card>
                                    <CardBody>
                                        <p>
                                            <b>Gender: </b> {selectedUser.userBioData.gender}<br />
                                            <b>Age: </b> {selectedUser.userBioData.dob instanceof Timestamp ? age(selectedUser.userBioData.dob?.toDate()) : age(selectedUser.userBioData.dob)}<br />
                                            <b>Date of Birth: </b> {selectedUser.userBioData.dob instanceof Timestamp ? moment(selectedUser.userBioData.dob?.toDate()).calendar() : moment(selectedUser.userBioData.dob).calendar()}<br />
                                            <b>Height: </b> {`${selectedUser.userBioData.height.cm}.${selectedUser.userBioData.height.mm} cm (${selectedUser.userBioData.height.ft}'${selectedUser.userBioData.height.in})`}<br />
                                            <b>Weight: </b> {`${selectedUser.userBioData.weight.kgs} kgs (${selectedUser.userBioData.weight.lbs} lbs)`}<br />
                                            <b>Target Weight: </b> {`${selectedUser.userBioData.targetWeight.kgs} kgs (${selectedUser.userBioData.targetWeight.lbs} lbs)`}<br />
                                            <b>Weight Goal: </b> {selectedUser.userBioData.weightGoal}<br />
                                            <b># of Meals per Day: </b> {selectedUser.userBioData.mealCount}<br />
                                            <b>Meal Times (Local Time): </b> {selectedUser.userBioData.mealTimes?.map((meal, index) => index + 1 === selectedUser.userBioData.mealTimes.length ? meal instanceof Timestamp ? `${moment(meal?.toDate()).format('LT')}` : `${moment(meal).format('LT')}` : meal instanceof Timestamp ? `${moment(meal?.toDate()).format('LT')}, ` : `${moment(meal).format('LT')}, `)}<br />
                                            <b>Meal Times (User Time): </b> {selectedUser.userBioData.mealTimes?.map((meal, index) => index + 1 === selectedUser.userBioData.mealTimes.length ? meal instanceof Timestamp ? `${moment(meal?.toDate().setHours(meal?.toDate().getUTCHours() - selectedUser.userBioData.timezoneOffset)).format('LT')}` : `${moment((new Date(meal))?.setHours((new Date(meal))?.getUTCHours() - selectedUser.userBioData.timezoneOffset)).format('LT')}` : meal instanceof Timestamp ? `${moment(meal?.toDate().setHours(meal?.toDate().getUTCHours() - selectedUser.userBioData.timezoneOffset)).format('LT')}, ` : `${moment((new Date(meal))?.setHours((new Date(meal))?.getUTCHours() - selectedUser.userBioData.timezoneOffset)).format('LT')}, `)}<br />
                                            <b>User Local Time: </b> {moment((new Date()).setHours((new Date()).getUTCHours() - selectedUser.userBioData.timezoneOffset)).format('LT')}<br />
                                            <b>Other Goals: </b> {selectedUser.userBioData.goals.map((goal, index) => index + 1 === selectedUser.userBioData.goals.length ? `${goal}` : `${goal}, `)}
                                        </p>
                                    </CardBody>
                                </Card>
                            </Collapse></>}
                        <p><b>Notes:</b> {selectedUser.notes || <i className='text-muted'>{'(None)'}</i>}</p>
                    </div>
                </div>
            </ModalBody>
        </Modal> */}
        <AllocateUserModal clients={selectedUsers} />
    </>)
}

export default Index
