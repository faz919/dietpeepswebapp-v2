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
import { Input, InputGroup } from 'reactstrap'

function Index() {

    const { user, globalVars } = useContext(AuthContext)

    const { selectedChat } = useSelector(state => state)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(selectedChatAction({ chat: 'partners', user: null, coach: null }))
        dispatch(profileAction(false))
        dispatch(mobileProfileAction(false))
    }, [])

    return null
}

export default Index
