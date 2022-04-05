import React, {useContext, useEffect, useState} from 'react'
import {Button, Input, Modal, ModalBody, Spinner, Tooltip} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'
import app from '../../firebase'
import { AuthContext } from '../../providers/AuthProvider'
import { LoadingButton } from '@mui/lab'

const db = getFirestore(app)

function VideoCallModal() {

    const { globalVars, setGlobalVars } = useContext(AuthContext)

    const [modal, setModal] = useState(false)
    const {selectedChat} = useSelector(state => state)
    const modalToggle = () => setModal(!modal)
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const tooltipToggle = () => setTooltipOpen(!tooltipOpen)

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

    const updateUserNotes = async () => {
        setSyncing(true)
        await updateDoc(doc(db, 'user-info', selectedChat.user.id), {
            notes
        })
        setNotes('')
        setEditing(false)
        setSyncing(false)
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
                <ModalBody>
                    <div className="call">
                        <div style={{ paddingLeft: 15, paddingRight: 15 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <h4>{selectedChat.user?.displayName}</h4>
                                &nbsp;
                                {selectedChat.user.nickName && <p className='text-muted'>({selectedChat.user.nickName})</p>}
                            </div>
                            <p><b>Date Joined:</b> {moment(selectedChat.user?.dateJoined).format('llll')}</p>
                            <p><b>Streak:</b> {selectedChat.user?.streak}</p>
                            <p><b>Images Submitted:</b> {selectedChat.user?.totalImageCount || '(Metric Unavailable)'}</p>
                            <p><b>Course Day:</b> {selectedChat.user?.courseData.courseDay}</p>
                            <p><b>Latest Course Completed:</b> {selectedChat.user?.courseData.latestCourseCompleted}</p>
                            <p><b>Time of Latest Course Completion:</b> {selectedChat.user?.courseData.latestCourseCompleted > 0 ? moment(selectedChat.user?.courseData.courseCompletedAt?.toDate()).format('llll') : 'No courses completed.'}</p>
                            <p><b>Current Course Day Completed:</b> {selectedChat.user?.courseData.courseDayCompleted ? 'Yes' : 'No'}</p>
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
                                <p><b>Notes:</b> {selectedChat.user?.notes || 'Click to Add Notes'}</p>
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

export default VideoCallModal
