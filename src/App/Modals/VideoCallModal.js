import React, {useContext, useEffect, useState} from 'react'
import {Modal, ModalBody, Spinner, Tooltip} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import app from '../../firebase'
import { AuthContext } from '../../providers/AuthProvider'

const db = getFirestore(app)

function VideoCallModal() {

    const { globalVars, setGlobalVars } = useContext(AuthContext)

    const [modal, setModal] = useState(false)
    const {selectedChat} = useSelector(state => state)
    const modalToggle = () => setModal(!modal)
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const tooltipToggle = () => setTooltipOpen(!tooltipOpen)

    const [reloadingInfo, setReloadingInfo] = useState(false)

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
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <h4>{selectedChat.user?.displayName}</h4>
                                &nbsp;
                                {selectedChat.user.nickName && <p className='text-muted'>({selectedChat.user.nickName})</p>}
                            </div>
                            <p>Date Joined: {moment(selectedChat.user?.dateJoined).format('llll')}</p>
                            <p>Streak: {selectedChat.user?.streak}</p>
                            <p>Course Day: {selectedChat.user?.courseData.courseDay}</p>
                            <p>Latest Course Completed: {selectedChat.user?.courseData.latestCourseCompleted}</p>
                            <p>Time of Latest Course Completion: {selectedChat.user?.courseData.latestCourseCompleted > 0 ? moment(selectedChat.user?.courseData.courseCompletedAt?.toDate()).format('llll') : 'No courses completed.'}</p>
                            <p>Current Course Day Completed: {selectedChat.user?.courseData.courseDayCompleted ? 'Yes' : 'No'}</p>
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
