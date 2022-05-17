import React, {useContext, useEffect, useState} from 'react'
import { Button, Input, Modal, ModalBody, Spinner, Tooltip, ModalHeader, Collapse, Card, CardBody } from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { doc, getDoc, getFirestore, updateDoc, Timestamp } from 'firebase/firestore'
import app from '../../firebase'
import { AuthContext } from '../../providers/AuthProvider'
import { LoadingButton } from '@mui/lab'
import { FormControlLabel, Switch, FormGroup, Checkbox } from '@mui/material'

const db = getFirestore(app)

function UserInfoModal() {

    const { user, globalVars, setGlobalVars } = useContext(AuthContext)

    const [modal, setModal] = useState(false)
    const {selectedChat} = useSelector(state => state)
    const modalToggle = () => setModal(!modal)
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const tooltipToggle = () => setTooltipOpen(!tooltipOpen)
    const [userBioCollapse, setUserBioCollapse] = useState(false)
    const userBioToggle = () => setUserBioCollapse(!userBioCollapse)
    const [userSettingsCollapse, setUserSettingsCollapse] = useState(false)
    const userSettingsToggle = () => setUserSettingsCollapse(!userSettingsCollapse)

    const [reloadingInfo, setReloadingInfo] = useState(false)

    const [notesDBSync, setSyncing] = useState(false)
    const [notes, setNotes] = useState(selectedChat.user?.notes)
    const [editingNotes, setEditing] = useState(false)


    const getLatestInfo = async () => {
        setReloadingInfo(true)
        const latestInfo = await getDoc(doc(db, 'user-info', selectedChat.user.id))
        let userIndex = globalVars.userInfoList?.findIndex(val => val.id === selectedChat.user.id)
        let newInfo = globalVars.userInfoList
        newInfo[userIndex] = { ...newInfo[userIndex], ...latestInfo.data() }
        setGlobalVars(val => ({ ...val, userInfoList: newInfo }))
        selectedChat.user = { ...selectedChat.user, ...latestInfo.data() }
        setReloadingInfo(false)
    } 

    const toggleManualExtension = async (checked) => {
        const latestInfo = await updateDoc(doc(db, 'user-info', selectedChat.user.id), { manuallyExtendedTrialPeriod: checked })
        let userIndex = globalVars.userInfoList?.findIndex(val => val.id === selectedChat.user.id)
        let newInfo = globalVars.userInfoList
        newInfo[userIndex] = { ...newInfo[userIndex], ...latestInfo.data() }
        setGlobalVars(val => ({ ...val, userInfoList: newInfo }))
        selectedChat.user = { ...selectedChat.user, ...latestInfo.data() }
    }

    const updateUserNotes = async () => {
        setSyncing(true)
        await updateDoc(doc(db, 'user-info', selectedChat.user.id), {
            notes
        })
        setNotes('')
        setEditing(false)
        setSyncing(false)
    }

    const ubd = selectedChat.user?.userBioData
    const usrS = selectedChat.user?.settings?.notificationTypes
    const notifTypes = [
        { label: 'Chat Message', value: 'chatMessage', icon: 'chatbox-ellipses-outline' },
        { label: 'Meal Score', value: 'imageGrade', icon: 'image-outline' },
        { label: 'Course Link', value: 'courseLink', icon: 'book-outline' },
        { label: 'Weekly Check-in', value: 'statSummary', icon: 'bar-chart-outline' },
        { label: 'Meal Reminder', value: 'mealReminder', icon: 'nutrition-outline' }
    ]

    function age (birthDate) {
        var ageInMilliseconds = new Date() - new Date(birthDate);
        return Math.floor(ageInMilliseconds/(1000 * 60 * 60 * 24 * 365));
    }

    return (
        <div>
            <button className="btn btn-outline-light text-warning" onClick={modalToggle} id="Tooltip-Video-Call">
                <FeatherIcon.User/>
            </button>
            <Tooltip
                placement="bottom"
                isOpen={tooltipOpen}
                target={"Tooltip-Video-Call"}
                toggle={tooltipToggle}>
                View User Profile
            </Tooltip>
            <Modal isOpen={modal} toggle={modalToggle} centered className="modal-dialog-zoom call">   
                <ModalHeader style={{ backgroundColor: 'transparent', height: 0 }}>
                    {globalVars.adminList?.includes(user.uid) && <a style={{ position: 'absolute', top: 5, right: 5, fontSize: 14, fontWeight: 'normal' }} target='_blank' href={`https://console.firebase.google.com/u/0/project/firstproject-b3f4a/firestore/data/~2Fuser-info~2F${selectedChat.user?.id}`}>(Admin)</a>}
                </ModalHeader>
                <ModalBody>
                    <div className="call">
                        <div style={{ paddingLeft: 15, paddingRight: 15 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <h4>{selectedChat.user?.displayName}</h4>
                                &nbsp;
                                {selectedChat.user.nickName && <p className='text-muted'>({selectedChat.user.nickName})</p>}
                            </div>
                            <p>
                                <b>Date Joined:</b> {moment(selectedChat.user?.dateJoined).format('llll')}<br/>
                                <b>Streak:</b> {selectedChat.user?.streak}<br/>
                                <b>Images Submitted:</b> {selectedChat.user?.totalImageCount || '(Metric Unavailable)'}<br/>
                                <b>Notifications Enabled:</b> {selectedChat.user?.notificationsEnabled ? 'Yes' : 'No'}<br/>
                                <b>Device OS: </b> {ubd?.deviceOS || selectedChat.user?.deviceInfo?.deviceOS || '(Metric Unavailable)'}<br/>
                                <b>Course Day:</b> {selectedChat.user?.courseData.courseDay}<br/>
                                <b>Latest Course Completed:</b> {selectedChat.user?.courseData.latestCourseCompleted}<br/>
                                <b>Time of Latest Course Completion:</b> {selectedChat.user?.courseData.latestCourseCompleted > 0 ? moment(selectedChat.user?.courseData.courseCompletedAt?.toDate()).format('llll') : 'No courses completed.'}<br/>
                                <b>Current Course Day Completed:</b> {selectedChat.user?.courseData.courseDayCompleted ? 'Yes' : 'No'}
                            </p>
                            {ubd && <><p style={{ cursor: 'pointer' }} onClick={userBioToggle}>{userBioCollapse ? <FeatherIcon.ChevronDown  />: <FeatherIcon.ChevronRight />} <b>User Bio Data:</b></p>
                            <Collapse isOpen={userBioCollapse}>
                                <Card>
                                    <CardBody>
                                        <p>
                                            <b>Gender: </b> {ubd.gender}<br/>
                                            <b>Age: </b> {ubd.dob instanceof Timestamp ? age(ubd.dob?.toDate()) : age(ubd.dob)}<br/>
                                            <b>Date of Birth: </b> {ubd.dob instanceof Timestamp ? moment(ubd.dob?.toDate()).calendar() : moment(ubd.dob).calendar()}<br/>
                                            <b>Height: </b> {`${ubd.height.cm}.${ubd.height.mm} cm (${ubd.height.ft}'${ubd.height.in})`}<br/>
                                            <b>Weight: </b> {`${ubd.weight.kgs} kgs (${ubd.weight.lbs} lbs)`}<br/>
                                            <b>Target Weight: </b> {`${ubd.targetWeight.kgs} kgs (${ubd.targetWeight.lbs} lbs)`}<br/>
                                            <b>Weight Goal: </b> {ubd.weightGoal}<br/>
                                            <b># of Meals per Day: </b> {ubd.mealCount}<br/>
                                            <b>Meal Times (Local Time): </b> {ubd.mealTimes?.map((meal, index) => index + 1 === ubd.mealTimes.length ? meal instanceof Timestamp ? `${moment(meal?.toDate()).format('LT')}` : `${moment(meal).format('LT')}` : meal instanceof Timestamp ? `${moment(meal?.toDate()).format('LT')}, ` : `${moment(meal).format('LT')}, `)}<br/>
                                            <b>Meal Times (User Time): </b> {ubd.mealTimes?.map((meal, index) => index + 1 === ubd.mealTimes.length ? meal instanceof Timestamp ? `${moment(meal?.toDate().setHours(meal?.toDate().getUTCHours() - ubd.timezoneOffset)).format('LT')}` : `${moment((new Date(meal))?.setHours((new Date(meal))?.getUTCHours() - ubd.timezoneOffset)).format('LT')}` : meal instanceof Timestamp ? `${moment(meal?.toDate().setHours(meal?.toDate().getUTCHours() - ubd.timezoneOffset)).format('LT')}, ` : `${moment((new Date(meal))?.setHours((new Date(meal))?.getUTCHours() - ubd.timezoneOffset)).format('LT')}, `)}<br/>
                                            <b>User Local Time: </b> {moment((new Date()).setHours((new Date()).getUTCHours() - ubd.timezoneOffset)).format('LT')}<br/>
                                            <b>Other Goals: </b> {ubd.goals.map((goal, index) => index + 1 === ubd.goals.length ? `${goal}` : `${goal}, `)}
                                        </p>
                                    </CardBody>
                                </Card>
                            </Collapse></>}
                            {usrS && <><p style={{ cursor: 'pointer' }} onClick={userSettingsToggle}>{userSettingsCollapse ? <FeatherIcon.ChevronDown  />: <FeatherIcon.ChevronRight />} <b>User Settings:</b></p>
                            <Collapse isOpen={userSettingsCollapse}>
                                <Card>
                                    <CardBody>
                                        <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                            Enabled Notification Types: (Not editable)
                                            <FormGroup>
                                            {notifTypes.map((type, index) => 
                                                <FormControlLabel control={<Checkbox checked={usrS.includes(type.value)} />} label={type.label}/>
                                            )}
                                            </FormGroup>
                                            Subscription Data:
                                            <FormControlLabel control={<Switch checked={selectedChat.user.manuallyExtendedTrialPeriod} onChange={(e) => toggleManualExtension(e.target.checked)} />} label='Manually Extend Trial Period'/>
                                            <p style={{ margin: 0 }}><b>Subscribed: </b> {selectedChat.user.subscribed ? 'Yes' : 'No'}<br/></p>
                                            <p style={{ margin: 0 }}><b>Trial Period: </b> {selectedChat.user.trialPeriod ? 'Yes' : 'No'}<br/></p>
                                        </p>
                                    </CardBody>
                                </Card>
                            </Collapse></>}
                            {editingNotes ?
                            <div>
                                <Input 
                                    type='textarea'
                                    id="standard-multiline-static"
                                    label="Notes"
                                    placeholder={"Write about " + selectedChat.user?.displayName + " here..."}
                                    rows={6}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="form-control"
                                    style={{ marginBottom: 10 }}
                                />
                                <div>
                                    <LoadingButton className='color-primary' style={{ textTransform: 'none', height: 30, marginLeft: 5 }} disabled={!notes} loading={notesDBSync} variant='contained' onClick={updateUserNotes}>Save</LoadingButton>
                                    <Button style={{ height: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }} onClick={() => { setEditing(false); setSyncing(false); setNotes(selectedChat.user?.notes) }}>Cancel</Button>
                                </div>
                            </div>                      
                             :
                            <button onClick={() => setEditing(true)} style={{ borderWidth: 0, backgroundColor: 'transparent' }}>
                                <p><b>Notes:</b> {selectedChat.user?.notes || <i className='text-muted'>Click to Add Notes</i>}</p>
                            </button>}
                        </div>
                    </div>
                    {reloadingInfo ? 
                    <div className='modal-refresh' style={{ position: 'absolute', right: 25, borderWidth: 0, backgroundColor: 'transparent' }}>
                        <Spinner variant='primary' />
                    </div> :
                    <button className='modal-refresh' onClick={getLatestInfo} style={{ position: 'absolute', right: 20, borderWidth: 0, backgroundColor: 'transparent' }}>
                        <FeatherIcon.RefreshCcw size={32} />
                    </button>}
                </ModalBody>
            </Modal>
        </div>
    )
}

export default UserInfoModal
