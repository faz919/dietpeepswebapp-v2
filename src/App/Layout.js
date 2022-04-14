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

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(sidebarAction('Chats'))
    }, [])

    useEffect(() => {
        const adminGetter = async () => {
            const adminGet = query(collection(db, 'user-info'), where('type', '==', 'admin'))
            const adminDocList = await getDocs(adminGet)
            let adminList = []
            let adminInfo = []
            adminDocList.forEach((admin) => {
                if (admin.exists()) {
                    setGlobalVars(val => ({ ...val, adminList: val.adminList.concat(admin.id)}))
                    adminList.push(admin.id)
                    adminInfo.push({ ...admin.data(), id: admin.id })
                }
            })
            console.log('admin getter func called ', new Date())
            return { adminList, adminInfo }
        }
        const coachGetter = async () => {
            const coachGet = query(collection(db, 'user-info'), where('type', '==', 'coach'))
            const coachDocList = await getDocs(coachGet)
            let coachList = []
            let coachInfo = []
            coachDocList.forEach((coach) => {
                if (coach.exists()) {
                    setGlobalVars(val => ({ ...val, coachList: val.coachList.concat(coach.id)}))
                    coachList.push(coach.id)
                    coachInfo.push({ ...coach.data(), id: coach.id })
                }
            })
            console.log('coach getter func called ', new Date())
            return { coachList, coachInfo }
        }
        const clientGetter = async () => {
            const clientGet = query(collection(db, 'user-info'), where('type', '==', 'client'))
            const clientDocList = await getDocs(clientGet)
            let clientList = []
            let clientInfo = []
            clientDocList.forEach((client) => {
                if (client.exists()) {
                    setGlobalVars(val => ({ ...val, clientList: val.clientList.concat(client.id)}))
                    clientList.push(client.id)
                    clientInfo.push({ ...client.data(), id: client.id })
                }
            })
            console.log('coach getter func called ', new Date())
            return { clientList, clientInfo }
        }
        const fetchMessages = async () => {
            const { coachList, coachInfo } = await coachGetter()
            const { adminList, adminInfo } = await adminGetter()
            const { clientList, clientInfo } = await clientGetter()
            const q = query(collection(db, "chat-rooms"), where('userIDs', 'array-contains-any', coachList), orderBy('latestMessageTime', 'desc'))
            onSnapshot(q, async (querySnapshot) => {
                let chatList = []
                let userInfoList = []
                let coachInfoList = []
                for (let i = 0; i < querySnapshot.size; i++) {
                    let chatRooms = querySnapshot.docs[i]
                    if (chatRooms.exists) {
                        for (let chatUser of chatRooms.data().userIDs) {
                            if (chatUser !== user.uid) {
                                if (!coachList?.includes(chatUser)) {
                                    if (clientList?.includes(chatUser) && clientInfo?.find(user => user.id === chatUser && user.deleted !== true && user.shadowBanned !== true)) {
                                        let userSnap = clientInfo?.find(user => user.id === chatUser)
                                        chatList.push({ ...chatRooms.data(), id: chatRooms.id })
                                        userInfoList.push({ ...userSnap, correspondingChatID: chatRooms.id })
                                        // console.log('chat user found in client list', userSnap.displayName)
                                    } else if (clientInfo?.find(user => user.id === chatUser && user.deleted !== true && user.shadowBanned !== true)) {
                                        let userSnap = await getDoc(doc(db, "user-info", chatUser))
                                        if (userSnap.exists() && userSnap.data().type === 'client') {
                                            if (!userSnap.data().deleted && !userSnap.data().shadowBanned) {
                                                chatList.push({ ...chatRooms.data(), id: chatRooms.id })
                                                userInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                                                // console.log('chat user retrieved from db: ', userSnap.id)
                                            } else if (!userSnap.data().deleted && userSnap.data().shadowBanned) {
                                                // if(adminList?.includes(user.uid)) {
                                                //   chatsList.push({ ...chatRooms.data(), id: chatRooms.id })
                                                // }
                                            }
                                        }
                                    }
                                } else if (coachList?.includes(chatUser)) {
                                    let coachSnap = coachInfo.find(coach => coach.id === chatUser)
                                    coachInfoList.push({ ...coachSnap, correspondingChatID: chatRooms.id })
                                    // console.log('coach info added')
                                }
                            } else if (coachList?.includes(chatUser)) {
                                let coachSnap = coachInfo.find(coach => coach.id === chatUser)
                                coachInfoList.push({ ...coachSnap, correspondingChatID: chatRooms.id })
                                // console.log('coach info added (1)')
                            }
                        }
                    }
                }
                // console.log('snapshot called', chatList, userInfoList, coachInfoList)
                setGlobalVars(val => ({...val, chatList, userInfoList, coachInfoList, loadingChats: false}))
            })
        }
        fetchMessages()
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
