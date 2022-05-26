import React from 'react'
import PropTypes from 'prop-types'
import * as FeatherIcon from 'react-feather'

const XButton = props => {
    const { size, color, onClick } = props

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(180,180,180,0.7)',
        // position: 'absolute',
        // top: 5,
        // right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        cursor: 'pointer'
    }

    return (
        <div style={buttonStyle} onClick={onClick}>
            <FeatherIcon.X
                size={size}
                color={color}
            />
        </div>
    )
}

XButton.defaultProps = {
    size: 16,
    color: '#000',
    onClick: null
}

XButton.propTypes = {
    size: PropTypes.number,
    color: PropTypes.string,
    onClick: PropTypes.func
}

export default XButton
