const profileSidebarReducer = (state = false, action) => {
    if (action.status != null) {
        return action.status
    } else {
        return state
    }
}

export default profileSidebarReducer
