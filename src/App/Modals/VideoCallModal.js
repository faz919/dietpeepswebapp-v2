import React, {useEffect, useState} from 'react'
import {Modal, ModalBody, Tooltip} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import WomenAvatar1 from "../../assets/img/women_avatar1.jpg"
import { useSelector } from 'react-redux';
import moment from 'moment';

function VideoCallModal() {
    const [modal, setModal] = useState(false);

    const {selectedChat} = useSelector(state => state)

    const modalToggle = () => setModal(!modal);

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const tooltipToggle = () => setTooltipOpen(!tooltipOpen);

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
                            <h4>{selectedChat.user?.displayName}</h4>
                            <p>Date Joined: {moment(selectedChat.user?.dateJoined).format('llll')}</p>
                            <p>Streak: {selectedChat.user?.streak}</p>
                            <p>Course Day: {selectedChat.user?.courseData.courseDay}</p>
                            <p>Latest Course Completed: {selectedChat.user?.courseData.latestCourseCompleted}</p>
                            <p>Time of Latest Course Completion: {moment(selectedChat.user?.courseData.courseCompletedAt?.toDate()).format('llll')}</p>
                            <p>Current Course Day Completed: {JSON.stringify(selectedChat.user?.courseData.courseDayCompleted)}</p>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default VideoCallModal
