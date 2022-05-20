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
    const coachInfoFilter = globalVars.coachInfoList?.filter((coach) => coach.type !== 'removed-coach')
    const coachFilter = globalVars.coachList?.filter((coachID, index) => searchQuery != '' ? coachInfoFilter.find((coach) => coach.id === coachID && coach.type !== 'removed-coach').displayName?.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 : coachInfoFilter.filter((coach) => coach.id === coachID && coach.type !== 'removed-coach')?.length > 0 )

    const coachSelectHandle = (chat, user, coach) => {
        let chatInfo = { chat, user, coach }
        dispatch(selectedChatAction(chatInfo))
    }

    const unselectCoachStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(180,180,180,0.7)',
        // position: 'absolute',
        // top: 5,
        // right: 5,
        width: 20,
        height: 20,
        borderRadius: 10
    }

    const CoachListView = ({ coachID }) => {
        const coachInfo = coachInfoFilter.find((coach) => coach.id === coachID && coach.type !== 'removed-coach')
        return (
            <li className={"list-group-item " + (coachID === selectedChat.coach?.id ? 'open-chat' : '')}>
                <CoachAvatar coach={coachInfo} />
                <div className="users-list-body">
                    <div onClick={() => coachSelectHandle('stats', null, coachInfo)}>
                        <h5>{coachInfo.displayName}</h5>
                    </div>
                    <div className="users-list-action">
                        <div className="action-toggle" style={{ opacity: selectedChat.coach?.id === coachID ? 1 : 0 }}>
                            <div style={unselectCoachStyle} onClick={() => coachSelectHandle('stats', null, null)}>
                                <FeatherIcon.X
                                    size={16}
                                    color='#000'
                                />
                            </div>
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
                <input type="text" className="form-control" placeholder="Filter by coach (broken)" disabled value={searchQuery} onChange={q => setQuery(q.target.value)} />
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
                            : coachFilter?.map((coachID, index) => { return (<CoachListView coachID={coachID} key={index} />) })}
                    </ul>
                </PerfectScrollbar>
            </div>
        </div>
    )
}

export default Index
