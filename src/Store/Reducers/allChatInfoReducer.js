const allChatInfoReducer = (state = [], action) => {
    switch (action.type) {
        case 'CHAT_INFO':
            return action.info
        default:
            return state
    }
}

export default allChatInfoReducer