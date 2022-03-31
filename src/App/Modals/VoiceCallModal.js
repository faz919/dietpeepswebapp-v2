import React, {useState} from 'react'
import {Modal, ModalBody, Tooltip} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import ManAvatar5 from "../../assets/img/man_avatar5.jpg"
import { useDispatch } from 'react-redux'
import { profileAction } from '../../Store/Actions/profileAction'
import { mobileProfileAction } from '../../Store/Actions/mobileProfileAction'

function VoiceCallModal() {

    const dispatch = useDispatch()

    const openImageGradingTab = () => {
        dispatch(profileAction(true));
        dispatch(mobileProfileAction(true))
    }

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const tooltipToggle = () => setTooltipOpen(!tooltipOpen);

    return (
        <div>
            <button className="btn btn-outline-light text-success" onClick={openImageGradingTab} id="Tooltip-Voice-Call">
                <FeatherIcon.PieChart/>
            </button>
            <Tooltip
                placement="bottom"
                isOpen={tooltipOpen}
                target={"Tooltip-Voice-Call"}
                toggle={tooltipToggle}>
                Grade Images
            </Tooltip>
            {/* <Modal isOpen={modal} toggle={modalToggle} centered className="modal-dialog-zoom">
                <ModalBody>
                    <div className="call">
                        <div>
                            <figure className="avatar avatar-xl mb-4">
                                <img src={ManAvatar5} className="rounded-circle" alt="avatar"/>
                            </figure>
                            <h4>Brietta Blogg <span className="text-success">calling...</span></h4>
                            <div className="action-button">
                                <button type="button" onClick={modalToggle}
                                        className="btn btn-danger btn-floating btn-lg"
                                        data-dismiss="modal">
                                    <FeatherIcon.X/>
                                </button>
                                <button type="button" onClick={modalToggle}
                                        className="btn btn-success btn-pulse btn-floating btn-lg">
                                    <FeatherIcon.Phone/>
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal> */}
        </div>
    )
}

export default VoiceCallModal
