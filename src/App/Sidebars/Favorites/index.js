import React, { useContext, useEffect, useState } from 'react'
import 'react-perfect-scrollbar/dist/css/styles.css'
import PerfectScrollbar from 'react-perfect-scrollbar'
import * as FeatherIcon from "react-feather"
import { useDispatch } from 'react-redux'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import { AuthContext } from '../../../providers/AuthProvider'
import { Alert, Card, CardBody, Collapse, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import moment from 'moment'
import { doc, Timestamp, updateDoc, getFirestore, addDoc, collection } from 'firebase/firestore'
import app from '../../../firebase'
import { LoadingButton } from '@mui/lab'
import { Avatar, Chip } from '@mui/material'
import UserAvatar from '../../../components/UserAvatar'

const db = getFirestore(app)

function Index() {

    const { user, globalVars } = useContext(AuthContext)

    const dispatch = useDispatch()

    const mobileMenuBtn = () => document.body.classList.toggle('navigation-open')

    useEffect(() => {
        dispatch(selectedChatAction({ chat: null, client: null, coach: null }))
    }, [])

    const [selectedUser, setSelectedUser] = useState({})
    const [modalOpen, setModalOpen] = useState(false)
    const toggleModal = () => setModalOpen(!modalOpen)
    const openModal = (client) => {
        setSelectedUser(client)
        toggleModal()
    }

    const [userBioCollapse, setUserBioCollapse] = useState(false)
    const userBioToggle = () => setUserBioCollapse(!userBioCollapse)

    const FavoritesDropdown = ({ client }) => {
        const [dropdownOpen, setDropdownOpen] = useState(false)

        const toggle = () => setDropdownOpen(prevState => !prevState)

        return (
            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                <DropdownToggle tag="span">
                    <FeatherIcon.MoreHorizontal />
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={() => openModal(client)}>View Profile</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem>Ban User</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        )
    }

    function age(birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate);
        return Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365));
    }

    const [allocateUserModalOpen, setAllocateUserModalOpen] = useState(false)
    const toggleAllocateUserModal = () => setAllocateUserModalOpen(!allocateUserModalOpen)
    const openAllocateUserModal = (client) => {
        setSelectedUser(client)
        toggleAllocateUserModal()
    }

    const [allocating, setAllocating] = useState(false)

    function AllocateUserModal({ client }) {

        const [selectedCoach, setSelectedCoach] = useState(null)
        const [allocateUserMessage, setAllocateUserMessage] = useState(`Hey there, ${client.displayName}! My name is ${globalVars.userInfo.displayName} and I'll be your personal coach from now on. Please let me know if you have any questions or concerns.`)

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
            if (selectedCoach != null) {
                try {
                    await updateDoc(doc(db, 'chat-rooms', client.correspondingChatID), {
                        userIDs: [selectedCoach, client.id],
                        // latestMessage: allocateUserMessage,
                        // latestMessageTime: Timestamp.now()
                    })
                    await updateDoc(doc(db, 'user-info', client.id), {
                        coachID: selectedCoach
                    })
                    await addDoc(collection(db, 'chat-rooms', client.correspondingChatID, 'chat-messages'), {
                        img: null,
                        msg: allocateUserMessage,
                        timeSent: Timestamp.now(),
                        userID: selectedCoach,
                        senderType: 'coach'
                    })
                } catch (e) {
                    console.log('error while re-allocating user: ', e)
                }
            } else {
                try {
                    await updateDoc(doc(db, 'chat-rooms', client.correspondingChatID), {
                        userIDs: [user.uid, client.id],
                        // latestMessage: allocateUserMessage,
                        // latestMessageTime: Timestamp.now()
                    })
                    await updateDoc(doc(db, 'user-info', client.id), {
                        coachID: user.uid
                    })
                    await addDoc(collection(db, 'chat-rooms', client.correspondingChatID, 'chat-messages'), {
                        img: null,
                        msg: allocateUserMessage,
                        timeSent: Timestamp.now(),
                        userID: user.uid,
                        senderType: 'coach'
                    })
                } catch (e) {
                    console.log('error while re-allocating user: ', e)
                }
            }
            toggleAllocateUserModal()
            setAllocating(false)
        }

        const handleCoachSelect = (coachInfo, coachID) => {
            setSelectedCoach(coachID)
            setAllocateUserMessage(`Hey there, ${client.displayName}! My name is ${coachInfo.displayName} and I'll be your personal coach from now on. Please let me know if you have any questions or concerns.`)
        }

        return (
            <Modal className="modal-dialog-zoom" isOpen={allocateUserModalOpen} toggle={toggleAllocateUserModal} centered>
                <ModalHeader toggle={toggleAllocateUserModal}>
                    <FeatherIcon.UserPlus className="mr-2"/> &nbsp; Allocate User
                </ModalHeader>
                <ModalBody>
                    {globalVars.userInfo.type === 'coach' && <Alert color="warning">This action will make you the new coach of {client.displayName}.</Alert>}
                    {globalVars.userInfo.type !== 'coach' && globalVars.userInfo.type !== 'admin' && <Alert color="danger">Warning: You are not registered as a coach. Doing this action will make this client's chat invisible in the chat feed.</Alert>}
                    {globalVars.userInfo.type === 'admin' && <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Label>Select a Coach</Label>
                        <div>
                            {globalVars.coachList.filter(listedCoach => globalVars.coachInfoList.find(coach => coach.id === listedCoach && coach.type === 'coach')).map((coachID, index) => {
                                const coachInfo = globalVars.coachInfoList.find(coach => coach.id === coachID)
                                return (
                                    <Chip 
                                        clickable 
                                        avatar={<Avatar src={coachInfo.photoURL} />} 
                                        label={coachInfo.displayName} 
                                        style={{ marginLeft: index === 0 ? 0 : '5px' }} 
                                        onClick={() => handleCoachSelect(coachInfo, coachID)}
                                        variant={selectedCoach === coachInfo.id ? 'filled' : 'outlined'} 
                                        color='primary'
                                    />
                                )
                            })}
                        </div>
                    </div>}
                    <Label style={{ marginTop: '10px' }} for="message">Allocation message</Label>
                    <Input type="textarea" name="message" id="message" rows={6} value={allocateUserMessage} onChange={(e) => setAllocateUserMessage(e.target.value)} />
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

    return (<>
        <div className="sidebar active">
            <header>
                <div className="d-flex align-items-center">
                    <button onClick={mobileMenuBtn} className="btn btn-outline-light mobile-navigation-button mr-3 d-xl-none d-inline">
                        <FeatherIcon.Menu />
                    </button>
                    <span className="sidebar-title">Unallocated Users</span>
                </div>
            </header>
            <form>
                <input type="text" className="form-control" placeholder="Search favorites" />
            </form>
            <div className="sidebar-body">
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {
                            globalVars.userInfoList.filter(client => globalVars.removedCoachList.includes(client.coachID)).length === 0 ? 
                                <li className='list-group-item'>
                                    <div className='users-list-body'>
                                        <div style={{ alignItems: 'center', marginTop: -20 }}>
                                            <p>No unallocated users!</p>
                                            <p>Check back regularly to make sure</p>
                                            <p>all users have an active coach.</p>
                                        </div>
                                    </div>
                                </li>
                            : globalVars.userInfoList.filter(client => globalVars.removedCoachList.includes(client.coachID)).map((item, i) => {
                                return (
                                    <li key={i} className="list-group-item">
                                        <UserAvatar user={item} />
                                        <div className="users-list-body">
                                            <div onClick={() => openAllocateUserModal(item)}>
                                                <h5>{item.displayName}</h5>
                                                <p style={{ textTransform: 'capitalize' }}>Coach Removed</p>
                                            </div>
                                            <div className="users-list-action">
                                                <div className="action-toggle">
                                                    <FavoritesDropdown client={item} />
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
        <Modal isOpen={modalOpen} toggle={toggleModal} centered className="modal-dialog-zoom call">
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
        </Modal>
        <AllocateUserModal client={selectedUser} />
    </>)
}

export default Index
