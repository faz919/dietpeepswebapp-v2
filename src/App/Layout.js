import React, {useEffect, useState, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import Tour from 'reactour'
import TourModal from "./Modals/TourModal"
import SidebarIndex from "./Sidebars/index"
import Navigation from "./Navigation"
import ImageGradingTab from "./Sidebars/ImageGradingTab"
import Chat from "./Partials/Chat"
import { sidebarAction } from '../Store/Actions/sidebarAction'
import { allChatInfoAction } from '../Store/Actions/allChatInfoAction'
import DisconnectedModal from "./Modals/DisconnectedModal"
import {
    getFirestore,
    collection,
    doc,
    query,
    onSnapshot,
    where,
    getDocs,
    addDoc,
    Timestamp,
    orderBy,
    updateDoc,
    limitToLast,
    limit,
    deleteDoc,
    getDoc
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import app from '../firebase'
import { AuthContext } from '../providers/AuthProvider'

const db = getFirestore(app)

function Layout() {

    const { user, globalVars, setGlobalVars } = useContext(AuthContext)

    const { selectedChat } = useSelector(state => state)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(sidebarAction('Chats'))
        const unsub = onSnapshot(doc(db, 'user-info', user.uid), (userInfo) => {
            setGlobalVars(val => ({ ...val, userInfo: { ...userInfo.data(), id: userInfo.id }}))
        })
        return unsub
    }, [])

    useEffect(() => {
        const adminGetter = async () => {
            const adminGet = query(collection(db, 'user-info'), where('type', '==', 'admin'))
            const adminDocList = await getDocs(adminGet)
            let adminList = []
            let adminInfo = []
            for (let i = 0; i < adminDocList.size; i++) {
                const admin = adminDocList.docs[i]
                if (admin.exists()) {
                    setGlobalVars(val => ({ ...val, 
                        // adminList: val.adminList.concat(admin.id),
                        adminInfoList: val.adminInfoList.concat({ ...admin.data(), id: admin.id })
                    }))
                    adminList.push(admin.id)
                    adminInfo.push({ ...admin.data(), id: admin.id })
                }
            }
            console.log('admin getter func called ', new Date())
            return { adminList, adminInfo }
        }
        const coachGetter = async () => {
            const coachGet = query(collection(db, 'user-info'), where('type', 'in', ['coach', 'removed-coach', 'shadow-coach']))
            const coachDocList = await getDocs(coachGet)
            let coachList = []
            let coachInfo = []
            for (let i = 0; i < coachDocList.size; i++) {
                const coach = coachDocList.docs[i]
                if (coach.exists()) {
                    setGlobalVars(val => ({ ...val, 
                        // coachList: val.coachList.concat(coach.id), removedCoachList: coach.data().type === 'removed-coach' ? val.removedCoachList.concat(coach.id) : val.removedCoachList, 
                        coachInfoList: val.coachInfoList.concat({ ...coach.data(), id: coach.id })
                    }))
                    coachList.push(coach.id)
                    coachInfo.push({ ...coach.data(), id: coach.id })
                }
            }
            console.log('coach getter func called ', new Date())
            return { coachList, coachInfo }
        }
        const clientGetter = async () => {
            const clientGet = query(collection(db, 'user-info'), where('type', '==', 'client'))
            const clientDocList = await getDocs(clientGet)
            let formerClientList = []
            let clientList = []
            let clientInfo = []
            for (let i = 0; i < clientDocList.size; i++) {
                const client = clientDocList.docs[i]
                if (client.exists() && !client.data().deleted && !client.data().shadowBanned) {
                    setGlobalVars(val => ({ ...val, 
                        // clientList: val.clientList.concat(client.id), 
                        clientInfoList: val.clientInfoList.concat({ ...client.data(), id: client.id })
                    }))
                    clientList.push(client.id)
                    clientInfo.push({ ...client.data(), id: client.id })
                } else if (client.exists()) {
                    formerClientList.push(client.id)
                }
            }
            console.log('client getter func called ', new Date())
            return { formerClientList, clientList, clientInfo }
        }
        const fetchMessages = async () => {
            const { coachList, coachInfo } = await coachGetter()
            const { adminList, adminInfo } = await adminGetter()
            const { formerClientList, clientList, clientInfo } = await clientGetter()
            const q = query(collection(db, "chat-rooms"), where('userIDs', 'array-contains-any', coachList), orderBy('latestMessageTime', 'desc'))
            onSnapshot(q, async (querySnapshot) => {
                let chatList = []
                // let clientInfoList = []
                // let coachInfoList = []
                // for every document in the querySnapshot
                for (let i = 0; i < querySnapshot.size; i++) {
                    // assign variable
                    let chatRooms = querySnapshot.docs[i]
                    // if chat room exists
                    if (chatRooms.exists()) {
                        // for each user in the chat room
                        for (let chatUser of chatRooms.data().userIDs) {
                            // if new user
                            if (!coachList.includes(chatUser) && !adminList.includes(chatUser) && !clientList.includes(chatUser) && !formerClientList.includes(chatUser)) {
                                const client = await getDoc(doc(db, "user-info", chatUser))
                                if (client.exists() && client.data().type === 'client') {
                                    clientInfo.push({ ...client.data(), id: client.id })
                                }
                            }
                            // if the chatuser does not include the current user
                            if (chatUser !== user.uid) {
                                // if the user is a client
                                if (clientInfo?.some(user => user.id === chatUser)) {
                                    let userSnap = clientInfo?.find(user => user.id === chatUser)
                                    chatList.push({ ...chatRooms.data(), id: chatRooms.id })
                                    // clientInfoList.push({ ...userSnap, correspondingChatID: chatRooms.id })
                                    // console.log('chat user found in client list', userSnap.displayName)
                                    // if the user doesn't have a chatID
                                    if (userSnap.chatID == null) {
                                        // set chatID to current chat room id
                                        clientInfo.find(user => user.id === chatUser && (user.chatID = chatRooms.id, true))
                                    }
                                    // if the user doesn't have a coachID
                                    if (userSnap.coachID == null) {
                                        // for each user id in this chatroom's user ids
                                        for (let otherChatUser of chatRooms.data().userIDs) {
                                            // if the user is a coach
                                            if (coachList.includes(otherChatUser)) {
                                                // set the client's coachID to the coach in their chat
                                                clientInfo.find(user => user.id === chatUser && (user.coachID = otherChatUser, true))
                                            }
                                        }
                                    }
                                    // else if (clientInfo?.some(user => user.id === chatUser)) {
                                    //     let userSnap = clientInfo?.find(user => user.id === chatUser)
                                    //     if (userSnap.exists() && userSnap.data().type === 'client') {
                                    //         if (!userSnap.data().deleted && !userSnap.data().shadowBanned) {
                                    //             chatList.push({ ...chatRooms.data(), id: chatRooms.id })
                                    //             // clientInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                                    //             // console.log('chat user retrieved from db: ', userSnap.id)
                                    //         } else if (!userSnap.data().deleted && userSnap.data().shadowBanned) {
                                    //             // if(adminList?.includes(user.uid)) {
                                    //             //   chatsList.push({ ...chatRooms.data(), id: chatRooms.id })
                                    //             // }
                                    //         }
                                    //     }
                                    // }
                                } 
                                // else if (coachList?.includes(chatUser)) {
                                //     let coachSnap = coachInfo.find(coach => coach.id === chatUser)
                                //     coachInfoList.push({ ...coachSnap, correspondingChatID: chatRooms.id })
                                //     // console.log('coach info added')
                                // }
                            }
                            // else if (coachList?.includes(chatUser)) {
                            //     let coachSnap = coachInfo.find(coach => coach.id === chatUser)
                            //     coachInfoList.push({ ...coachSnap, correspondingChatID: chatRooms.id })
                            //     // console.log('coach info added (1)')
                            // }
                        }
                    }
                }
                // console.log('snapshot called', chatList, clientInfoList, coachInfoList)
                setGlobalVars(val => ({ ...val, chatList, loadingChats: false }))
                console.log('client info is: ', clientInfo)
                console.log('client info list is: ', globalVars.clientInfoList)
                if (clientInfo.length > globalVars.clientInfoList && clientInfo.length > 0 && globalVars.clientInfoList.length > 0) {
                    setGlobalVars(val => ({ ...val, clientInfoList: clientInfo }))
                    console.log('client list updated due to mismatch')
                }

                // querySnapshot.docChanges().forEach(async (change) => {
                //     console.log(change.type, change.doc.id, change.doc.data())
                //     if (change.type === 'modified') {
                //         try {   
                //             const updatedUser = clientInfo.find((client) => client.chatID === change.doc.id)
                //             if (updatedUser == null) {
                //                 console.log('no user found')
                //             }
    
                //             const latestInfo = await getDoc(doc(db, 'user-info', updatedUser.id))
                //             // find all the clients in globalVars.clientInfoList that have the same id as the updated user and replace their data with the latest info
                //             const updatedClientInfo = globalVars.clientInfoList.map((client) => {
                //                 if (client.id === updatedUser.id) {
                //                     return { ...latestInfo.data(), id: latestInfo.id }
                //                 } else {
                //                     return client
                //                 }
                //             })
                //             setGlobalVars(val => ({ ...val, clientInfoList: updatedClientInfo }))
                //             // setGlobalVars(val => ({ ...val, clientInfoList: val.clientInfoList.find(client => client.id === updatedUser.id && (client = { ...client, ...latestInfo.data() }, true)) }))
                //             selectedChat.user = { ...selectedChat.user, ...latestInfo.data() }
                //         } catch (e) {
                //             console.log(e)
                //         }
                //     }
                // })
            })
        }
        fetchMessages()
    }, [])

    useEffect(() => {
        onSnapshot(query(collection(db, "activity-feed"), orderBy('timeSent', 'desc')), (querySnapshot) => {
            let activity = []
            querySnapshot.forEach((doc) => {
                activity.push({ ...doc.data(), id: doc.id })
            })
            setGlobalVars(val => ({ ...val, activityFeed: activity }))
        })
    }, [])

    useEffect(() => {
        document.querySelector('*').addEventListener('click', (e) => {
            if (document.body.classList.contains('navigation-open') && e.target.nodeName === 'BODY') {
                document.body.classList.remove('navigation-open')
            }
        })
    }, [])

    // useEffect(() => {
    //     const favorites = window.localStorage.getItem('@favorite_users')
    //     if (favorites != null) {
    //         setGlobalVars(val => ({ ...val, favorites: JSON.parse(favorites) }))
    //     } else {
    //         return null
    //     }
    // }, [])

    // useEffect(() => {
    //     window.localStorage.setItem('@favorite_users', JSON.stringify(globalVars.favorites))
    // }, [globalVars.favorites])

    return (
        <div className="layout">
            <div className="content">
                <Navigation/>
                <SidebarIndex/>
                <Chat/>
                <ImageGradingTab/>
                <TourModal/>
                <DisconnectedModal/>
            </div>
        </div>
    )
}

export default Layout
