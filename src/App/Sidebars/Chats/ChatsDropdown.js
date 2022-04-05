import React, {useContext, useState} from 'react'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import {profileAction} from "../../../Store/Actions/profileAction"
import {mobileProfileAction} from "../../../Store/Actions/mobileProfileAction"
import {useDispatch} from "react-redux"
import { AuthContext } from '../../../providers/AuthProvider'

const ChatsDropdown = ({ chatID }) => {

    const { globalVars, setGlobalVars } = useContext(AuthContext)

    const toggleFavoriteUser = () => {
        let newArr = [...globalVars.favorites]
        newArr[chatID] = !newArr[chatID]
        setGlobalVars(val => ({ ...val, favorites: newArr }))
    }

    return (
        <button className='dropdown' tag='span' style={{ borderWidth: 0, backgroundColor: 'transparent' }}>
            <FeatherIcon.Star className='dropdown-toggle' size={18} />
        </button>
    )

    // return (
    //     <Dropdown isOpen={dropdownOpen} toggle={toggle}>
    //         <DropdownToggle tag="span">
    //             <FeatherIcon.MoreHorizontal/>
    //         </DropdownToggle>
    //         <DropdownMenu>
    //             <DropdownItem onClick={profileActions}>Profile</DropdownItem>
    //             <DropdownItem>Delete</DropdownItem>
    //         </DropdownMenu>
    //     </Dropdown>
    // )
}

export default ChatsDropdown
