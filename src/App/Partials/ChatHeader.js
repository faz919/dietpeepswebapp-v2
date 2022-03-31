import React, {useContext, useState} from 'react'
import {useDispatch} from "react-redux"
import {
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Tooltip
} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import VoiceCallModal from "../Modals/VoiceCallModal"
import VideoCallModal from "../Modals/VideoCallModal"
import {profileAction} from "../../Store/Actions/profileAction"
import {mobileProfileAction} from "../../Store/Actions/mobileProfileAction";
import moment from 'moment'
import { AuthContext } from '../../providers/AuthProvider'

function ChatHeader(props) {

    const { globalVars } = useContext(AuthContext)

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggle = () => setDropdownOpen(prevState => !prevState);

    const selectedChatClose = () => document.querySelector('.chat').classList.remove('open');

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const tooltipToggle = () => setTooltipOpen(!tooltipOpen);

    return (
        <div className="chat-header">
            <div className="chat-header-user">
                <figure className="avatar">
                    <img src={props.selectedChat.user.photoURL || `https://avatars.dicebear.com/api/bottts/${props.selectedChat.user.displayName}.png?dataUri=true`} className="rounded-circle" alt="avatar"/>
                </figure>
                <div>
                    <h5>{props.selectedChat.user.displayName}</h5>
                    <small className="text-muted">
                        <i>{moment(props.selectedChat.chat.latestMessageTime?.toDate()).fromNow()}</i>
                    </small>
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
