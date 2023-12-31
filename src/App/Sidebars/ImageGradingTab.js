import React, {useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux"
import * as FeatherIcon from 'react-feather'
import PerfectScrollbar from "react-perfect-scrollbar"
import {profileAction} from "../../Store/Actions/profileAction"
import {mobileProfileAction} from "../../Store/Actions/mobileProfileAction"
import ImageGrader from '../../components/ImageGrader'
import { AuthContext } from '../../providers/AuthProvider'
import { doc, getFirestore, updateDoc } from 'firebase/firestore'
import app from '../../firebase'

const db = getFirestore(app)

function ImageGradingTab() {

    const { globalVars } = useContext(AuthContext)

    const dispatch = useDispatch()

    const {profileSidebar, mobileProfileSidebar, selectedChat} = useSelector(state => state)

    const profileActions = (e) => {
        e.preventDefault()
        dispatch(profileAction(false))
        dispatch(mobileProfileAction(false))
    }

    useEffect(() => {
        // filter to messages with images
        const messageFilter = selectedChat.user && globalVars.msgList?.filter(msg => msg.img != null && msg.userID === selectedChat.user?.id)
        // filter to ungraded images
        const imageFilter = messageFilter?.map((message) => { return message.img.filter(image => !image.graded && !image.skipped && !image.deleted).length })
        // count number of images in returned array
        const ungradedImageCount = imageFilter?.reduce((partialSum, a) => partialSum + a, 0)

        if (selectedChat.chat) {
            if (messageFilter?.length === 0 || imageFilter?.length === 0) {
                if (selectedChat.chat.ungradedImageCount !== 0) {
                    // sync data with db
                    updateDoc(doc(db, "chat-rooms", selectedChat.chat.id), {
                        ungradedImageCount: 0
                    })
                }
                selectedChat.chat.ungradedImageCount = 0
            } else if (ungradedImageCount != null) {
                selectedChat.chat.ungradedImageCount = ungradedImageCount
                updateDoc(doc(db, "chat-rooms", selectedChat.chat.id), {
                    ungradedImageCount: ungradedImageCount
                })
            }
        }
    }, [globalVars.msgList, selectedChat.chat])

    return (
        <div style={{paddingLeft: 15, paddingRight: 15}} className={`sidebar-group ${mobileProfileSidebar ? "mobile-open" : ""}`}>
            <div className={profileSidebar ? 'sidebar active' : 'sidebar'}>
                <header>
                    <div className="d-flex align-items-center">
                        <span className="sidebar-title">Grade Images</span>
                    </div>
                    <ul className="list-inline">
                        <li className="list-inline-item">
                            <a href="#/" onClick={(e) => profileActions(e)}
                               className="btn btn-outline-light text-danger sidebar-close">
                                <FeatherIcon.X/>
                            </a>
                        </li>
                    </ul>
                </header>
                <div className="sidebar-body">
                    <PerfectScrollbar>
                        {selectedChat.chat !== 'activity-feed' && selectedChat.chat !== 'stats' && selectedChat.user && globalVars.msgList?.map((msg, index) => {
                            return msg.img != null && msg.userID === selectedChat.user?.id && msg.img.map((image, index) => {
                                if (!image.graded && !image.skipped && !image.deleted) {
                                    return ( <ImageGrader image={image} message={msg} chat={selectedChat.chat} /> )
                                }
                            })
                        })}
                        {/* <div className="pl-4 pr-4">
                            <div className="text-center">
                                <figure className="avatar avatar-xl mb-3">
                                    <img src={WomenAvatar5} className="rounded-circle" alt="avatar"/>
                                </figure>
                                <h5 className="mb-1">Mirabelle Tow</h5>
                                <small className="text-muted font-italic">Last seen: Today</small>

                                <Nav tabs className="justify-content-center mt-5">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({active: activeTab === '1'})}
                                            onClick={() => {
                                                toggle('1')
                                            }}
                                        >
                                            About
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({active: activeTab === '2'})}
                                            onClick={() => {
                                                toggle('2')
                                            }}
                                        >
                                            Media
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                            </div>
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId="1">
                                    <p className="text-muted">Lorem ipsum is a pseudo-Latin text used in web design,
                                        typography,
                                        layout, and printing in place of English to emphasise design elements over
                                        content.
                                        It's also called placeholder (or filler) text. It's a convenient tool for
                                        mock-ups.</p>
                                    <div className="mt-4 mb-4">
                                        <h6>Phone</h6>
                                        <p className="text-muted">(555) 555 55 55</p>
                                    </div>
                                    <div className="mt-4 mb-4">
                                        <h6>City</h6>
                                        <p className="text-muted">Germany / Berlin</p>
                                    </div>
                                    <div className="mt-4 mb-4">
                                        <h6>Website</h6>
                                        <p>
                                            <a href="foo">www.franshanscombe.com</a>
                                        </p>
                                    </div>
                                    <div className="mt-4 mb-4">
                                        <h6 className="mb-3">Social media accounts</h6>
                                        <ul className="list-inline social-links">
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-facebook"
                                                   data-toggle="tooltip" title="Facebook">
                                                    <i className="fa fa-facebook"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-twitter"
                                                   data-toggle="tooltip" title="Twitter">
                                                    <i className="fa fa-twitter"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-dribbble"
                                                   data-toggle="tooltip" title="Dribbble">
                                                    <i className="fa fa-dribbble"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-whatsapp"
                                                   data-toggle="tooltip" title="Whatsapp">
                                                    <i className="fa fa-whatsapp"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-linkedin"
                                                   data-toggle="tooltip" title="Linkedin">
                                                    <i className="fa fa-linkedin"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-google"
                                                   data-toggle="tooltip"
                                                   title="Google">
                                                    <i className="fa fa-google"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-behance"
                                                   data-toggle="tooltip" title="Behance">
                                                    <i className="fa fa-behance"></i>
                                                </a>
                                            </li>
                                            <li className="list-inline-item">
                                                <a href="foo" className="btn btn-sm btn-floating btn-instagram"
                                                   data-toggle="tooltip" title="Instagram">
                                                    <i className="fa fa-instagram"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-4 mb-4">
                                        <h6 className="mb-3">Settings</h6>
                                        <div className="form-group">
                                            <div className="form-item custom-control custom-switch">
                                                <input type="checkbox" className="custom-control-input"
                                                       id="customSwitch11"/>
                                                <label className="custom-control-label"
                                                       htmlFor="customSwitch11">Block</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="form-item custom-control custom-switch">
                                                <input type="checkbox" className="custom-control-input" defaultChecked
                                                       id="customSwitch12"/>
                                                <label className="custom-control-label"
                                                       htmlFor="customSwitch12">Mute</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="form-item custom-control custom-switch">
                                                <input type="checkbox" className="custom-control-input"
                                                       id="customSwitch13"/>
                                                <label className="custom-control-label" htmlFor="customSwitch13">Get
                                                    notification</label>
                                            </div>
                                        </div>
                                    </div>
                                </TabPane>
                                <TabPane tabId="2">
                                    <h6 className="mb-3 d-flex align-items-center justify-content-between">
                                        <span>Recent Files</span>
                                        <a href="foo" className="btn btn-link small">
                                            <i data-feather="upload" className="mr-2"></i> Upload
                                        </a>
                                    </h6>
                                    <div>
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item pl-0 pr-0 d-flex align-items-center">
                                                <a href="foo">
                                                    <i className="fa fa-file-pdf-o text-danger mr-2"></i> report4221.pdf
                                                </a>
                                            </li>
                                            <li className="list-group-item pl-0 pr-0 d-flex align-items-center">
                                                <a href="foo">
                                                    <i className="fa fa-image text-muted mr-2"></i> avatar_image.png
                                                </a>
                                            </li>
                                            <li className="list-group-item pl-0 pr-0 d-flex align-items-center">
                                                <a href="foo">
                                                    <i className="fa fa-file-excel-o text-success mr-2"></i>
                                                    excel_report_file2020.xlsx
                                                </a>
                                            </li>
                                            <li className="list-group-item pl-0 pr-0 d-flex align-items-center">
                                                <a href="foo">
                                                    <i className="fa fa-file-text-o text-warning mr-2"></i> articles342133.txt
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </TabPane>
                            </TabContent>
                        </div> */}
                    </PerfectScrollbar>
                </div>
            </div>
        </div>
    )
}

export default ImageGradingTab
