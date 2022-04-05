import React, { useEffect } from 'react'
import 'react-perfect-scrollbar/dist/css/styles.css'
import { useDispatch } from 'react-redux'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import { profileAction } from '../../../Store/Actions/profileAction'
import { mobileProfileAction } from '../../../Store/Actions/mobileProfileAction'

function Index() {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(selectedChatAction({ chat: 'stats', user: null, coach: null }))
        dispatch(profileAction(false))
        dispatch(mobileProfileAction(false))
    }, [])

    return null
}

export default Index
