import {createStore, combineReducers} from "redux"

import sidebarReducer from "./Reducers/sidebarReducer"
import mobileSidebarReducer from "./Reducers/mobileSidebarReducer"
import profileSidebarReducer from "./Reducers/profileSidebarReducer"
import mobileProfileSidebarReducer from "./Reducers/mobileProfileSidebarReducer"
import pageTourReducer from "./Reducers/pageTourReducer"
import selectedChatReducer from "./Reducers/selectedChatReducer"
import allChatInfoReducer from "./Reducers/allChatInfoReducer"

const reducers = combineReducers({
    selectedSidebar: sidebarReducer,
    mobileSidebar: mobileSidebarReducer,
    profileSidebar: profileSidebarReducer,
    mobileProfileSidebar: mobileProfileSidebarReducer,
    pageTour: pageTourReducer,
    selectedChat: selectedChatReducer,
    allChatInfo: allChatInfoReducer
})

const store = createStore(reducers)

export default store
