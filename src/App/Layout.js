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

    const adminGetter = async () => {
        const adminGet = query(collection(db, 'user-info'), where('type', '==', 'admin'))
        const adminList = await getDocs(adminGet)
        adminList.forEach((admin) => {
            setGlobalVars(val => ({ ...val, adminList: val.adminList.concat(admin.id)}))
        })
        console.log(globalVars.adminList)
        return adminList
    }

    const coachGetter = async () => {
        const coachGet = query(collection(db, 'user-info'), where('type', '==', 'coach'))
        const coachList = await getDocs(coachGet)
        let coachesList = []
        coachList.forEach((coach) => {
            setGlobalVars(val => ({ ...val, coachList: val.coachList.concat(coach.id)}))
            coachesList.push(coach.id)
        })
        return coachesList
    }

    useEffect(() => {
        const fetchMessages = async () => {
            const coachList = await coachGetter()
            const adminList = await adminGetter()
            // console.log(new Date() + coachList)
            // console.log(new Date() + adminList)
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
                                    let userSnap = await getDoc(doc(db, "user-info", chatUser))
                                    if (userSnap.exists() && userSnap.data().type === 'client') {
                                        if (!userSnap.data().deleted && !userSnap.data().shadowBanned) {
                                            // globalVars.chatList?.length === 0 ? setGlobalVars(val => ({...val, chatList: [{ ...chatRooms.data(), id: chatRooms.id }] })) : setGlobalVars(val => ({...val, chatList: [...val.chatList, { ...chatRooms.data(), id: chatRooms.id }] }))
                                            // globalVars.chatList?.length === 0 ? setGlobalVars(val => ({...val, userInfoList: [{ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id }] })) : setGlobalVars(val => ({...val, userInfoList: [...val.userInfoList, { ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id }] }))
                                            chatList.push({ ...chatRooms.data(), id: chatRooms.id })
                                            userInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                                        } else if (!userSnap.data().deleted && userSnap.data().shadowBanned) {
                                            // if(adminList?.includes(user.uid)) {
                                            //   chatsList.push({ ...chatRooms.data(), id: chatRooms.id })
                                            // }
                                        }
                                    }
                                } else if (coachList?.includes(chatUser)) {
                                    // let userSnap = await getDoc(doc(db, "user-info", chatUser))
                                    // coachInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                                    let userSnap = await getDoc(doc(db, "user-info", chatUser))
                                    setGlobalVars(val => ({...val, coachInfoList: val.coachInfoList.concat({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })}))
                                    console.log('coaches: ', globalVars.coachInfoList)
                                }
                            } else if (coachList?.includes(chatUser)) {
                                let userSnap = await getDoc(doc(db, "user-info", chatUser))
                                setGlobalVars(val => ({...val, coachInfoList: val.coachInfoList.concat({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })}))
                                console.log('coaches: ', globalVars.coachInfoList)
                            }
                        }
                    }
                }
                // querySnapshot.forEach((chatRooms) => {
                //     if (chatRooms.exists) {
                //         for (let chatUser of chatRooms.data().userIDs) {
                //             if (chatUser !== user.uid) {
                //                 if (!coachList?.includes(chatUser)) {
                //                     getDoc(doc(db, "user-info", chatUser)).then((userSnap) => {
                //                         if (userSnap.exists() && userSnap.data().type === 'client') {
                //                             if (!userSnap.data().deleted && !userSnap.data().shadowBanned) {
                //                                 // globalVars.chatList?.length === 0 ? setGlobalVars(val => ({...val, chatList: [{ ...chatRooms.data(), id: chatRooms.id }] })) : setGlobalVars(val => ({...val, chatList: [...val.chatList, { ...chatRooms.data(), id: chatRooms.id }] }))
                //                                 // globalVars.chatList?.length === 0 ? setGlobalVars(val => ({...val, userInfoList: [{ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id }] })) : setGlobalVars(val => ({...val, userInfoList: [...val.userInfoList, { ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id }] }))
                //                                 chatList.push({ ...chatRooms.data(), id: chatRooms.id })
                //                                 userInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                //                             } else if (!userSnap.data().deleted && userSnap.data().shadowBanned) {
                //                                 // if(adminList?.includes(user.uid)) {
                //                                 //   chatsList.push({ ...chatRooms.data(), id: chatRooms.id })
                //                                 // }
                //                             }
                //                         }
                //                     })
                //                 } else if (coachList?.includes(chatUser)) {
                //                     getDoc(doc(db, "user-info", chatUser)).then((userSnap) => {
                //                         coachInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                //                     })
                //                 }
                //             } else if (coachList?.includes(chatUser)) {
                //                 getDoc(doc(db, "user-info", chatUser)).then((userSnap) => {
                //                     coachInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                //                 })
                //             }
                //         }
                //     }
                // })
                console.log('snapshot called')
                setGlobalVars(val => ({...val, chatList, userInfoList, coachInfoList}))
            })
        }
        fetchMessages()
    }, [])

    useEffect(() => {
        console.log('yo: ', globalVars.chatList)
    }, [globalVars.chatList])

    useEffect(() => {
        document.querySelector('*').addEventListener('click', (e) => {
            if (document.body.classList.contains('navigation-open') && e.target.nodeName === 'BODY') {
                document.body.classList.remove('navigation-open')
            }
        })
    }, [])

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
