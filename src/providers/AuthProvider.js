import React, { createContext, useState, useEffect } from 'react'
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    OAuthProvider
} from "firebase/auth"
import app from '../firebase.js'
import { useNavigate } from 'react-router-dom'
import {
    getFirestore,
    collection,
    doc,
    where,
    query,
    getDoc,
    deleteDoc,
    setDoc
} from 'firebase/firestore'
import { getMessaging, getToken } from 'firebase/messaging'

import Bounce from "react-activity/dist/Bounce"
import "react-activity/dist/Bounce.css"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const [authVars, setAuthVars] = useState({
        errorText: '',
    })

    const [globalVars, setGlobalVars] = useState({ chatList: [], userInfoList: [], coachInfoList: [], coachList: [], adminList: [], clientList: [], loadingChats: true })

    const db = getFirestore(app)
    const auth = getAuth(app)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])
    
    if (loading) {
        return (
            <div style={{ width: window.innerWidth, height: window.innerHeight, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: '#E6E7FA', opacity: 0.5 }}>
                <Bounce color="#5B21B6" size={32} speed={0.8} animating={true} />
            </div>
        )
    }

    const runChecks = async () => {
        const _user = auth.currentUser
        const docRef = doc(db, 'user-info', _user.uid)
        const userDoc = await getDoc(docRef)
        if (userDoc.exists()) {
            if(userDoc.data().type === 'coach' || userDoc.data().type === 'admin'){
                navigate('/')
                getUserToken()
            } else {
                await signOut(auth).then(() => { 
                    navigate('/')
                    alert('Error: Client account detected. Please log in as a coach or use the mobile app to log in.')
                    setGlobalVars(val => ({...val, loggingIn: false}))
                })
            }
        } else {
            await signOut(auth).then(() => {
                navigate('/')
                alert('Invalid user account. Please try again.')
                setGlobalVars(val => ({...val, loggingIn: false}))
            })
        }
    }

    const publicKey = process.env.REACT_APP_VAPID_KEY

    const getUserToken = async () => {
        if('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('./firebase-messaging-sw.js')
                .then(function(registration) {
                    const messaging = getMessaging(app)
                    getToken(messaging, { vapidKey: publicKey, serviceWorkerRegistration: registration }).then((token) => {
                        if (token) {
                            console.log('web token is: ', token)
                        } else {
                            console.log('No registration token available. Request permission to generate one.')
                        }
                    }).catch((e) => {
                        console.log('Error while retrieving token: ', e)
                    })
                })
        }
    }

    const setUserToken = async (token) => {
        const _user = auth.currentUser
        await setDoc(doc(db, 'user-info', _user.uid), {
            fcmToken: token
        }, { merge: true })
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                authVars,
                setAuthVars,
                login: async (email, password) => {
                    try {
                        await signInWithEmailAndPassword(auth, email, password).then(() => {
                            runChecks()
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthVars({ ...authVars, errorText: eMessage.substring(eMessage.lastIndexOf(']') + 2) })
                        console.log(e)
                        setGlobalVars(val => ({...val, loggingIn: false}))
                    }
                },
                logOut: async () => {
                    try {
                        await signOut(auth).then(() => {
                            navigate("/")
                            setGlobalVars(val => ({...val, loggingIn: false}))
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthVars({ ...authVars, errorText: eMessage.substring(eMessage.lastIndexOf(']') + 2) })
                        console.log(e)
                        setGlobalVars(val => ({...val, loggingIn: false}))
                    }
                },
                appleLogin: async () => {
                    try {
                        const provider = new OAuthProvider('apple.com')
                        provider.addScope('email')
                        await signInWithPopup(auth, provider).then(() => {
                            runChecks()
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthVars({ ...authVars, errorText: eMessage })
                        console.log(e)
                        setGlobalVars(val => ({...val, loggingIn: false}))
                    }
                },
                googleLogin: async () => {
                    try {
                        const provider = new GoogleAuthProvider()
                        await signInWithPopup(auth, provider).then(() => {
                            runChecks()
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthVars({ ...authVars, errorText: eMessage.substring(eMessage.lastIndexOf(']') + 2) })
                        console.log(e)
                        setGlobalVars(val => ({...val, loggingIn: false}))
                    }
                },
                forgotPassword: async (email) => {
                    try {
                        await sendPasswordResetEmail(auth, email).then(() => {
                            setAuthVars(data => ({ ...data, forgotPasswordEmailSent: true }))
                        })
                    } catch (e) {
                        const eMessage = e.message.toString()
                        setAuthVars({ ...authVars, errorText: eMessage.substring(eMessage.lastIndexOf(']') + 2) })
                        console.log(e)
                    }
                },
                globalVars, setGlobalVars,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}