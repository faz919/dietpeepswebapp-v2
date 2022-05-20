import React from 'react'

const CoachAvatar = ({ coach }) => {

    return (
        <figure className={`avatar`}>
            <img src={coach.photoURL} className="rounded-circle" alt="avatar"/>
        </figure>
    )
}

export default CoachAvatar