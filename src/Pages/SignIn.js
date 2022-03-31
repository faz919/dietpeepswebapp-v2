import { LoadingButton } from "@mui/lab";
import * as FeatherIcon from 'react-feather'
import React, { useEffect, useContext, useState } from "react"
import { ReactComponent as Logo } from '../assets/logo.svg'
import { AuthContext } from "../providers/AuthProvider";

function SignIn() {

    useEffect(() => document.body.classList.add('form-membership'), []);

    const { login, globalVars, setGlobalVars, googleLogin, appleLogin } = useContext(AuthContext)

    const [loginEntry, setLoginEntry] = useState({
        email: '',
        password: ''
    })

    const submitForm = (e) => {
        e.preventDefault()
        login(loginEntry.email, loginEntry.password)
        setGlobalVars(val => ({ ...val, loggingIn: true }))
    }

    const googleSignin = (e) => {
        e.preventDefault()
        googleLogin()
        setGlobalVars(val => ({ ...val, loggingIn: true }))
    }

    const appleSignin = (e) => {
        e.preventDefault()
        appleLogin()
        setGlobalVars(val => ({ ...val, loggingIn: true }))
    }

    return (
        <div className="form-wrapper">
            <div className="logo">
                <Logo />
            </div>
            <h5>Welcome</h5>
            <p>Please sign in with your email and password.</p>
            <form onSubmit={submitForm}>
                <div className="form-group">
                    <input value={loginEntry.email} onChange={(v) => setLoginEntry(currentVal => ({...currentVal, email: v.target.value}))} type="text" name="email" className="form-control" placeholder="Username or email" />
                </div>
                <div className="form-group">
                    <input value={loginEntry.password} onChange={(v) => setLoginEntry(currentVal => ({...currentVal, password: v.target.value}))} type="password" name="password" className="form-control" placeholder="Password" />
                </div>
                <LoadingButton loading={globalVars.loggingIn} onClick={submitForm} variant='outlined' className="btn btn-block">
                    Sign in
                </LoadingButton>
                <hr />
                {/* <LoadingButton style={{ marginBottom: 20 }} loading={globalVars.loggingIn} onClick={appleLogin} variant='outlined' className="btn btn-block">
                    Sign in with Apple
                </LoadingButton>
                <LoadingButton sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} loading={globalVars.loggingIn} onClick={googleLogin} variant='outlined' className="btn btn-block">
                    <i className="fa fa-google"></i> 
                    Sign in with Google
                </LoadingButton> */}
                <p className="text-muted">Or use another login method.</p>
                <ul className="list-inline">
                    <li className="list-inline-item">
                        <LoadingButton loading={globalVars.loggingIn} onClick={appleLogin} style={{ minWidth: 0 }} className="btn btn-floating btn-twitter">
                            <i className="fa fa-apple"></i>
                        </LoadingButton>
                    </li>
                    <li className="list-inline-item">
                        <LoadingButton loading={globalVars.loggingIn} onClick={googleLogin} style={{ minWidth: 0 }} className="btn btn-floating btn-google">
                            <i className="fa fa-google"></i>
                        </LoadingButton>
                    </li>
                </ul>
                <hr />
                <p className="text-muted">Forgot your password?</p>
                <a href="/forgot-password" className="btn btn-outline-light btn-sm">Click here</a>
            </form>
        </div>
    )
}

export default SignIn
