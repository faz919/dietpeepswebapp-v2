import React, { useEffect } from 'react'
import 'react-perfect-scrollbar/dist/css/styles.css'
import PerfectScrollbar from 'react-perfect-scrollbar'
import FavoritesDropdown from "./FavoritesDropdown"
import * as FeatherIcon from "react-feather"
import { useDispatch } from 'react-redux'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'

function Index() {

    const dispatch = useDispatch()

    const mobileMenuBtn = () => document.body.classList.toggle('navigation-open')

    useEffect(() => {
        dispatch(selectedChatAction({ chat: null, user: null, coach: null }))
    }, [])

    return (
        <div className="sidebar active">
            <header>
                <div className="d-flex align-items-center">
                    <button onClick={mobileMenuBtn} className="btn btn-outline-light mobile-navigation-button mr-3 d-xl-none d-inline">
                        <FeatherIcon.Menu/>
                    </button>
                    <span className="sidebar-title">Favorites</span>
                </div>
            </header>
            <form>
                <input type="text" className="form-control" placeholder="Search favorites"/>
            </form>
            <div className="sidebar-body">
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {/* {
                            favoriteChats.map((item, i) => {
                                return <li key={i} className="list-group-item">
                                    <div className="users-list-body">
                                        <div>
                                            <h5>{item.name}</h5>
                                            {item.text}
                                        </div>
                                        <div className="users-list-action">
                                            <div className="action-toggle">
                                                <FavoritesDropdown/>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            })
                        } */}
                        <li className='list-group-item'>
                            <div className='users-list-body'>
                                <div style={{ alignItems: 'center', marginTop: -20 }}>
                                    <p>Menu not yet ready...</p>
                                    <p>Check back later for updates!</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Index
