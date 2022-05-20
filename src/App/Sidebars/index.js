import React from 'react'
import { useSelector } from 'react-redux'
import ChatsIndex from "./Chats"
import FriendsIndex from "./Friends"
import FavoritesIndex from "./Favorites"
import ArchivedIndex from "./Archived"
import StatsIndex from './Stats/index'

function Index() {

    const { selectedSidebar, mobileSidebar } = useSelector(state => state)

    return (
        <div className={`sidebar-group ${mobileSidebar ? "mobile-open" : ""}`}>
            {
                (() => {
                    if (selectedSidebar === 'Chats') {
                        return <ChatsIndex />
                    } else if (selectedSidebar === 'Clients') {
                        return <FriendsIndex />
                    } else if (selectedSidebar === 'Unallocated') {
                        return <FavoritesIndex />
                    } else if (selectedSidebar === 'Activity Feed') {
                        return <ArchivedIndex />
                    } else if (selectedSidebar === 'Stats') {
                        return <StatsIndex />
                    }
                })()
            }
        </div>
    )
}

export default Index
