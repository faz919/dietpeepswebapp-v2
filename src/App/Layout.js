import React, {useEffect, useState, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import Tour from 'reactour'
import TourModal from "./Modals/TourModal"
import SidebarIndex from "./Sidebars/index"
import Navigation from "./Navigation"
import ImageGradingTab from "./Sidebars/ImageGradingTab"
import Chat from "./Partials/Chat"
import { sidebarAction } from '../Store/Actions/sidebarAction'
import DisconnectedModal from "./Modals/DisconnectedModal";
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
} from 'firebase/firestore';
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
        const adminGet = query(collection(db, 'user-info'), where('type', '==', 'admin'))
        const adminGetter = async () => {
            let adminList = []
            const getAdmins = await getDocs(adminGet)
            getAdmins.forEach((admin) => {
                adminList.push(admin.id)
            })
            setGlobalVars(val => ({ ...val, adminList }))
            return adminList
        }
        const coachGet = query(collection(db, 'user-info'), where('type', '==', 'coach'))
        const coachGetter = async () => {
            let coachList = []
            const getCoaches = await getDocs(coachGet)
            getCoaches.forEach((coach) => {
                coachList.push(coach.id)
            })
            setGlobalVars(val => ({ ...val, coachList }))
            return coachList
        }
        const fetchMessages = async () => {
            const coachList = await coachGetter()
            const adminList = await adminGetter()
            console.log(new Date() + coachList)
            console.log(new Date() + adminList)
            const q = query(collection(db, "chat-rooms"), where('userIDs', 'array-contains-any', coachList), orderBy('latestMessageTime', 'desc'))
            onSnapshot(q, (querySnapshot) => {
                let chatList = []
                let userInfoList = []
                let coachInfoList = []
                querySnapshot.forEach((chatRooms) => {
                    if (chatRooms.exists) {
                        for (let chatUser of chatRooms.data().userIDs) {
                            if (chatUser !== user.uid) {
                                if (!coachList?.includes(chatUser)) {
                                    getDoc(doc(db, "user-info", chatUser)).then((userSnap) => {
                                        if (userSnap.exists() && userSnap.data().type === 'client') {
                                            if (!userSnap.data().deleted && !userSnap.data().shadowBanned) {
                                                chatList.push({ ...chatRooms.data(), id: chatRooms.id })
                                                userInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                                            } else if (!userSnap.data().deleted && userSnap.data().shadowBanned) {
                                                // if(adminList?.includes(user.uid)) {
                                                //   chatsList.push({ ...chatRooms.data(), id: chatRooms.id })
                                                // }
                                            }
                                        }
                                    })
                                } else if (coachList?.includes(chatUser)) {
                                    getDoc(doc(db, "user-info", chatUser)).then((userSnap) => {
                                        coachInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                                    })
                                }
                            } else if (coachList?.includes(chatUser)) {
                                getDoc(doc(db, "user-info", chatUser)).then((userSnap) => {
                                    coachInfoList.push({ ...userSnap.data(), id: userSnap.id, correspondingChatID: chatRooms.id })
                                })
                            }
                        } 
                    }
                })
                setGlobalVars(val => ({...val, chatList, userInfoList, coachInfoList }))
            })
        }
        fetchMessages()
    }, [])

    useEffect(() => {
        document.querySelector('*').addEventListener('click', (e) => {
            if (document.body.classList.contains('navigation-open') && e.target.nodeName === 'BODY') {
                document.body.classList.remove('navigation-open')
            }
        });
    }, []);

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
