import React from 'react'

const UserAvatar = ({ user }) => {

    const colorCode = () => {
        const daysSinceLIS = new Date() - user.lastImageSent?.toDate()
        const oneDay = 60 * 60 * 24 * 1000
        if (daysSinceLIS < oneDay) {
            return 'avatar-state-success'
        }
        if (daysSinceLIS < oneDay * 3) {
            return 'avatar-state-warning'
        }
        if (daysSinceLIS < oneDay * 7) {
            return 'avatar-state-danger'
        }
        if (daysSinceLIS >= oneDay * 7) {
            return 'avatar-state-dark'
        }
    }

    return (
        <figure className={`avatar ${colorCode()}`}>
            <img src={user.photoURL || `https://avatars.dicebear.com/api/bottts/${user.displayName}.png?dataUri=true`} className="rounded-circle" alt="avatar"/>
        </figure>
    )
}

export default UserAvatar