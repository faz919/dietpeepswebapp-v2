import { LoadingButton } from "@mui/lab";
import React, {useEffect, useContext, useRef} from "react"
import {ReactComponent as Logo} from '../assets/logo.svg'
import { AuthContext } from "../providers/AuthProvider";

function ForgotPassword() {

    const { forgotPassword, authVars, setAuthVars } = useContext(AuthContext)

    useEffect(() => document.body.classList.add('form-membership'), []);

    const email = useRef()
    const submitForm = (e) => {
      e.preventDefault()
      forgotPassword(email.current.value)
    }

    return (
        <div className="form-wrapper">
            <div className="logo">
                <Logo/>
            </div>
            <h5>Forgot your password?</h5>
            <p>Type in the email for your account below.</p>
            <form>
                <div className="form-group">
                    <input type="email" className="form-control" placeholder="Email" ref={email} required/>
                </div>
                <LoadingButton onClick={submitForm} disabled={authVars.forgotPasswordEmailSent} variant='outlined' className="btn btn-block">{authVars.forgotPasswordEmailSent ? 'Sent!' : 'Send'}</LoadingButton>
                <hr/>
                <p className="text-muted">Have another account?</p>
                <a href="/sign-in" className="btn btn-outline-light btn-sm">Sign in</a>
            </form>
        </div>
    )
}

export default ForgotPassword
