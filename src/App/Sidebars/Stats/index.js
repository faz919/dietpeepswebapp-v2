import React, { useContext, useEffect, useState } from 'react'
import 'react-perfect-scrollbar/dist/css/styles.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import { profileAction } from '../../../Store/Actions/profileAction'
import { mobileProfileAction } from '../../../Store/Actions/mobileProfileAction'
import { AuthContext } from '../../../providers/AuthProvider'
import PerfectScrollbar from 'react-perfect-scrollbar'
import CoachAvatar from '../../../components/CoachAvatar'
import * as FeatherIcon from 'react-feather'
import XButton from '../../../components/XButton'

function Index() {

    const { user, globalVars } = useContext(AuthContext)

    const { selectedChat } = useSelector(state => state)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(selectedChatAction({ chat: 'stats', user: null, coach: null }))
        dispatch(profileAction(false))
        dispatch(mobileProfileAction(false))
    }, [])

    const [searchQuery, setQuery] = useState('')
    const coachFilter = globalVars.coachInfoList?.filter((coach, index) => searchQuery != '' ? coach.type !== 'removed-coach' && coach.displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 : coach.type !== 'removed-coach')

    const coachSelectHandle = (chat, user, coach) => {
        let chatInfo = { chat, user, coach }
        dispatch(selectedChatAction(chatInfo))
    }

    const CoachListView = ({ coach }) => {
        return (
            <li className={"list-group-item " + (coach.id === selectedChat.coach?.id ? 'open-chat' : '')}>
                <CoachAvatar coach={coach} />
                <div className="users-list-body">
                    <div onClick={() => coachSelectHandle('stats', null, coach)}>
                        <h5>{coach.displayName}</h5>
                    </div>
                    <div className="users-list-action">
                        <div className="action-toggle" style={{ opacity: selectedChat.coach?.id === coach.id ? 1 : 0 }}>
                            <XButton onClick={() => coachSelectHandle('stats', null, null)} />
                        </div>
                    </div>
                </div>
            </li>
        )
    }

    return (
        <div className="sidebar active">
            <header>
                <div className="d-flex align-items-center">
                    {/* <button onClick={mobileMenuBtn} className="btn btn-outline-light mobile-navigation-button mr-3 d-xl-none d-inline">
                        <FeatherIcon.Menu />
                    </button> */}
                    <span className="sidebar-title">Coaches</span>
                </div>
                {/* <ul className="list-inline">
                    <li className="list-inline-item">
                        <AddFriendsModal />
                    </li>
                </ul> */}
            </header>
            <form>
                <input type="text" className="form-control" placeholder="Filter by coach" value={searchQuery} onChange={q => setQuery(q.target.value)} />
            </form>
            <div className="sidebar-body">
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {coachFilter?.length === 0 ?
                            <li className='list-group-item'>
                                <div className='users-list-body'>
                                    <div style={{ alignItems: 'center', marginTop: -20 }}>
                                        <p>No coaches found.</p>
                                    </div>
                                </div>
                            </li>
                            : coachFilter?.map((coach, index) => { return (<CoachListView coach={coach} key={index} />) })}
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Index
