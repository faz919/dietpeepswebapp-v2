import { Grid } from '@mui/material'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SocialIcon } from 'react-social-icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush, Bar, BarChart, Label, Text } from 'recharts'
import { AuthContext } from '../../../providers/AuthProvider'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import { sidebarAction } from '../../../Store/Actions/sidebarAction'
import PerfectScrollbar from "react-perfect-scrollbar"
import * as FeatherIcon from 'react-feather'
import { Modal } from 'reactstrap'
import { addDoc, collection, getFirestore, setDoc } from 'firebase/firestore'
import app from '../../../firebase'

const db = getFirestore(app)

const Partners = () => {

  const { globalVars } = useContext(AuthContext)

  const { selectedChat } = useSelector(state => state)

  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)

  const [selectedPartner, setSelectedPartner] = useState(null)

  const [editPartnerModalOpen, setEditPartnerModalOpen] = useState(false)
  const toggleEditPartnerModal = () => setEditPartnerModalOpen(!editPartnerModalOpen)

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner)
    toggleEditPartnerModal()
  }

  const EditPartnerModal = () => {
    return (
      <Modal centered className='modal-content edit-partner' isOpen={editPartnerModalOpen} toggle={toggleEditPartnerModal}>
        
      </Modal>
    )
  }

  const submitPartnerChanges = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (selectedPartner === null) {
      setLoading(false)
      return
    }

    try {
      if (selectedPartner?.id === null) {
        await addDoc(collection(db, 'partner-info'), selectedPartner)
      } else {
        await setDoc(collection(db, 'partner-info'), selectedPartner, { merge: true })
      }
    } catch (e) {
      console.log(e)
    }
    setLoading(false)
    toggleEditPartnerModal()
  }

  return (
  <>
    <Grid component='div' className='chat-body no-message partner-info' container spacing={2}>
        {globalVars.partnerInfo?.map((partner, index) =>
          <Grid className='container' key={partner.id} item xs={3}>
            <div onClick={() => handleSelectPartner(partner)} className='card'>
              <div className='avatar'>
                <img src={partner.photoURL} />
              </div>
              <div className='content'>
                <div className='details'>
                  <h2>{partner.displayName}<br /><span>Referral Code: <b>{partner.referralCode}</b></span></h2>
                  <div className='socials'>
                    {partner.socials.map((social, index) =>
                      <SocialIcon 
                        url={social.link}
                      />
                    )}
                  </div>
                  <div className='action-button'>
                    <button>Edit</button>
                    <button>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
        )}
        <Grid className='partner-info container' item xs={3}>
          <div onClick={() => handleSelectPartner(null)} className='card-placeholder'>
            <div className='avatar' />
            <div className='add-new-partner' >
              <FeatherIcon.Plus 
                size={40}
                className='icon'
              />
            </div>
          </div>
        </Grid>
    </Grid>
    <EditPartnerModal />
  </>
  )
}

export default Partners