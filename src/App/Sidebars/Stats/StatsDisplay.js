import { Grid } from '@mui/material'
import moment from 'moment'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush, Bar, BarChart, Label, Text } from 'recharts'
import { AuthContext } from '../../../providers/AuthProvider'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import { sidebarAction } from '../../../Store/Actions/sidebarAction'

const Stats = () => {

  const { globalVars } = useContext(AuthContext)

  const { selectedChat } = useSelector(state => state)

  let hours = []
  for (let i = 0; i <= 23; i++) {
    hours[i] = i
  }

  const coachColors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#FF8042'
  ]

  const hourlyDate = new Date()
  hourlyDate.setMinutes(0)
  hourlyDate.setSeconds(0)
  hourlyDate.setMilliseconds(0)
  const messageData = hours.map((hour) => {

    let coachData = {}

    for (let coachID of globalVars.coachList?.filter((coachID) => globalVars.coachInfoList?.filter((coach) => coach.id === coachID && coach.type !== 'removed-coach').length > 0)) {
      const coachName = globalVars.coachInfoList?.find((coach) => coach.id === coachID)?.displayName
      coachData[coachName] = globalVars.activityFeed?.filter((activity) => activity.timeSent?.toDate().getHours() === hour && activity.senderID === coachID).length
    }

    return { name: moment(new Date(hourlyDate.setHours(hour))).format('LT'), ...coachData }
  })

  const imageGradeData = globalVars.activityFeed.filter((activity) => activity.activityType === 'imageGrade').map((image) => {

    let coachData = {}

    for (let coachID of globalVars.coachList?.filter((coachID) => image.senderID === coachID && globalVars.coachInfoList?.filter((coach) => coach.id === coachID && coach.type !== 'removed-coach').length > 0)) {
      const coachName = globalVars.coachInfoList?.find((coach) => coach.id === coachID)?.displayName
      coachData[coachName] = (image.timeTakenToGrade / 60000)
    }

    return { name: moment(image.timeSent?.toDate()).format('MMM Do YY, h:mm a'), ...coachData, chatID: image.chatID }
  })

  const ImageGradeGraphTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='custom-tooltip'>
          <p className='label'>{`${payload[0].dataKey}: ${payload[0].value >= 60 ? Math.floor(payload[0].value / 60) + 'hr' + Math.floor(payload[0].value % 60) + 'min' + Math.round((payload[0].value * 60) % 60) + 's' : Math.floor(payload[0].value) + 'min' + Math.round((payload[0].value * 60) % 60) + 's'}`}</p>
          <p style={{ marginTop: '-18px' }} className='label'>@ {label}</p>
        </div>
      )
    }

    return null
  }

  const dispatch = useDispatch()

  const handleImageGradeClick = (chatID) => {
    const chat = globalVars.chatList?.find(val => val.id === chatID)
    const user = globalVars.userInfoList?.find(val => val.correspondingChatID === chatID)
    const coach = globalVars.coachInfoList?.find(val => val.correspondingChatID === chatID)
    dispatch(sidebarAction('Chats'))
    dispatch(selectedChatAction({ chat, user, coach }))
    document.querySelector('.chat').classList.add('open')
    // if (chat.unreadCount > 0) {
    //   updateDoc(doc(db, 'chat-rooms', chat.id), {
    //     unreadCount: 0,
    //     coachLastRead: Timestamp.fromDate(new Date())
    //   })
    // }
  }

  return (
    <Grid component='div' className='chat-body no-message' container spacing={2}>
      <Grid item xs={6}>
        {/* <p>Total Messages by Hour of Day</p> */}
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            width={500}
            height={300}
            data={messageData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Legend />
            {globalVars.coachList?.filter((coachID) => selectedChat.coach == null ? globalVars.coachInfoList?.filter((coach) => coach.id === coachID && coach.type !== 'removed-coach').length > 0 : selectedChat.coach.id === coachID).map((coachID, index) => (
              <Line type='monotone' dataKey={`${globalVars.coachInfoList?.find((coach) => coach.id === coachID)?.displayName}`} stroke={coachColors[index]} activeDot={{ r: 8 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item xs={6}>
        {/* <p>Image Grades, with Time Taken to Grade</p> */}
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            width={500}
            height={300}
            data={imageGradeData.reverse()}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip content={<ImageGradeGraphTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke='#000' />
            <Brush dataKey='name' height={30} stroke='#8884d8' />
            {globalVars.coachList?.filter((coachID) => selectedChat.coach == null ? globalVars.coachInfoList?.filter((coach) => coach.id === coachID && coach.type !== 'removed-coach').length > 0 : selectedChat.coach.id === coachID).map((coachID, index) => (
              <Bar style={{ cursor: 'pointer' }} dataKey={`${globalVars.coachInfoList?.find((coach) => coach.id === coachID)?.displayName}`} fill={coachColors[index]} stackId='a' onClick={(data) => handleImageGradeClick(data.chatID)} />
            ))}
            {/* <Bar dataKey={`${globalVars.coachInfoList?.find((coach) => coach.id === globalVars.coachList[0])?.displayName}`} fill='#8884d8' /> */}
            {/* <Bar dataKey={`${globalVars.coachInfoList?.find((coach) => coach.id === globalVars.coachList[3])?.displayName}`} fill='#82ca9d' /> */}
          </BarChart>
        </ResponsiveContainer>
      </Grid>
      {/* <Grid item xs={6}>
      </Grid>
      <Grid item xs={6}>
      </Grid> */}
    </Grid>
  )
}

export default Stats