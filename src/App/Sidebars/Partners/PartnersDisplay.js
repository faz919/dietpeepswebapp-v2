import { Alert, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material'
import moment from 'moment'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SocialIcon } from 'react-social-icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush, Bar, BarChart, Label, Text } from 'recharts'
import { AuthContext } from '../../../providers/AuthProvider'
import { selectedChatAction } from '../../../Store/Actions/selectedChatAction'
import { sidebarAction } from '../../../Store/Actions/sidebarAction'
import PerfectScrollbar from "react-perfect-scrollbar"
import * as FeatherIcon from 'react-feather'
import { Dropdown, Modal, ModalBody } from 'reactstrap'
import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import app from '../../../firebase'
import EditPartnerModal from '../../Modals/EditPartnerModal'

const db = getFirestore(app)
const storage = getStorage(app)

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

  const uploadPartnerPhoto = async (e) => {
    console.log(e)

    const photo = e.target.files[0]

    let fileName = photo.name
    const extension = fileName.split('.').pop()
    const name = fileName.split('.').slice(0, -1).join('.')
    fileName = name + Date.now() + '.' + extension

    const photoRef = ref(storage, `partner-headshots/${fileName}`)

    const uploadTask = uploadBytesResumable(photoRef, photo)

    uploadTask.on('state-changed',
    (snapshot) => {
      // // progress indicator, add this later

      // const percent = Math.round(
      //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      // )

      // setPercent(percent)

    },
    (error) => console.log(error),
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((url) => {
        console.log(url)
        setSelectedPartner(val => ({ ...val, photoURL: url }))
      })
    })

  }

  const photoReader = useRef()

  // const EditPartnerModal = () => {

  //   const [editingDisplayName, setEditingDisplayName] = useState(false)
  //   const toggleEditingDisplayName = () => setEditingDisplayName(!editingDisplayName)
  //   const [editingReferralCode, setEditingReferralCode] = useState(false)
  //   const toggleEditingReferralCode = () => setEditingReferralCode(!editingReferralCode)

  //   const [tempDisplayName, setTempDisplayName] = useState('')
  //   const [tempReferralCode, setTempReferralCode] = useState('')

  //   const confirmDisplayName = () => {
  //     tempDisplayName.length > 0 && setSelectedPartner(val => ({ ...val, displayName: tempDisplayName }))
  //     cancelDisplayName()
  //   }

  //   const cancelDisplayName = () => {
  //     toggleEditingDisplayName()
  //     setTempDisplayName('')
  //   }

  //   const confirmReferralCode = () => {
  //     tempReferralCode.length > 0 && setSelectedPartner(val => ({ ...val, referralCode: tempReferralCode }))
  //     cancelReferralCode()
  //   }

  //   const cancelReferralCode = () => {
  //     toggleEditingReferralCode()
  //     setTempReferralCode('')
  //   }

  //   const addSocial = () => {

  //     if (selectedPartner == null || selectedPartner?.socials == null) {
  //       setSelectedPartner(val => ({ ...val, socials: [{ link: '', logo: '' }] }))
  //       return
  //     }

  //     setSelectedPartner(val => ({ ...val, socials: [...val.socials, { link: '', logo: '' }] }))
  //   }

  //   const removeSocial = (social) => {
  //     var result = selectedPartner?.socials?.filter(function (ele) {
  //       return ele != social
  //     })
  //     setSelectedPartner(val => ({ ...val, socials: result }))
  //   }
    
  //   const editSocial = (e, index, value) => {
  //     let newArr = selectedPartner?.socials
  //     newArr[index][value] = e.target.value
  //     setSelectedPartner(val => ({ ...val, socials: newArr }))
  //   }

  //   const socials = [
  //     'tiktok',
  //     'instagram',
  //     'youtube',
  //     'twitter'
  //   ]

  //   return (
  //     <Modal centered className='edit-partner' isOpen={editPartnerModalOpen} toggle={toggleEditPartnerModal}>
  //       <div className='card'>
  //         <div className='avatar'>
  //           {selectedPartner?.photoURL && <img src={selectedPartner?.photoURL} />}
  //           <div className='photo-mask' onClick={() => photoReader.current.click()}>
  //             <input ref={photoReader} onChange={uploadPartnerPhoto} type='file' accept='image/*' />
  //             <div className='add-photo'>
  //               <FeatherIcon.Plus 
  //                 size={40}
  //                 className='icon'
  //               />
  //             </div>
  //           </div>
  //         </div>
  //         <div className='content'>
  //           <div className='details'>
  //             {editingDisplayName ?
  //               <div className='editing'>
  //                 <input 
  //                   type='text' 
  //                   placeholder={selectedPartner?.displayName || 'Add a name...'}
  //                   onChange={(e) => setTempDisplayName(e.target.value)}
  //                   onSubmit={confirmDisplayName}
  //                 />
  //                 <FeatherIcon.CheckCircle onClick={confirmDisplayName} className='confirm' />
  //                 <FeatherIcon.Trash2 onClick={cancelDisplayName} className='cancel' />
  //               </div>
  //               :
  //               <div className='not-editing'>
  //                 <h2>{selectedPartner?.displayName || 'Add a name...'}</h2>
  //                 <FeatherIcon.Edit2 onClick={toggleEditingDisplayName} className='edit' />
  //               </div>
  //             }
  //             {editingReferralCode ?
  //               <div className='editing'>
  //                 <input
  //                   type='text'
  //                   placeholder={selectedPartner?.referralCode || 'Add a referral code...'}
  //                   onChange={(e) => setTempReferralCode(e.target.value)}
  //                   onSubmit={confirmReferralCode}
  //                 />
  //                 <FeatherIcon.CheckCircle onClick={confirmReferralCode} className='confirm' />
  //                 <FeatherIcon.Trash2 onClick={cancelReferralCode} className='cancel' />
  //               </div>
  //               :
  //               <div className='not-editing'>
  //                 <h3>Referral Code: <b>{selectedPartner?.referralCode || 'Add a referral code...'}</b></h3>
  //                 <FeatherIcon.Edit2 onClick={toggleEditingReferralCode} className='edit' />
  //               </div>
  //             }
  //             <div className='socials'>
  //               {selectedPartner?.socials?.map((social, index) =>
  //                 <div key={social.link} className='social-editor'>
  //                   <div className='link'>
  //                     <input
  //                       type='text'
  //                       value={social.link || 'Paste link here...'}
  //                       onChange={(e) => editSocial(e, index, 'link')}
  //                       onSubmit={confirmReferralCode}
  //                     />
  //                   </div>
  //                   <div className='logo'>
  //                     <FormControl fullWidth>
  //                       <InputLabel id="demo-simple-select-label">Logo</InputLabel>
  //                       <Select
  //                         labelId="demo-simple-select-label"
  //                         id="demo-simple-select"
  //                         value={social.logo || ''}
  //                         label="Logo"
  //                         onChange={(e) => editSocial(e, index, 'logo')}
  //                       >
  //                         {socials.map((type, index) => 
  //                           <MenuItem value={type}>{type}</MenuItem>
  //                         )}
  //                       </Select>
  //                     </FormControl>
  //                   </div>
  //                   <FeatherIcon.Trash2 onClick={() => removeSocial(social)} className='cancel' />
  //                 </div>
  //               )}
  //               <div className='add-social'>
  //                 <h3>Add a social media profile...</h3>
  //                 <div onClick={addSocial} className='add-photo'>
  //                   <FeatherIcon.Plus />
  //                 </div>
  //               </div>
  //             </div>
  //             <div className='action-button'>
  //               {/* <LoadingButton loading={loading} onClick={submitPartnerChanges}>Save</LoadingButton> */}
  //               <button onClick={submitPartnerChanges}>Save</button>
  //               <button onClick={toggleEditPartnerModal}>Cancel</button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </Modal>
  //   )
  // }

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
        await setDoc(doc(db, 'partner-info', selectedPartner?.id), selectedPartner, { merge: true })
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
    toggleEditPartnerModal()
  }

  const [deletePartnerModalOpen, setDeletePartnerModalOpen] = useState(false)
  const toggleDeletePartnerModal = () => setDeletePartnerModalOpen(!deletePartnerModalOpen)

  function DeletePartnerModal() {
    return (
      <Modal isOpen={deletePartnerModalOpen} toggle={toggleDeletePartnerModal} centered className="modal-dialog-zoom call">
        <ModalBody>
          <div className="call">
            <div>
              <h5>Are you sure you want to delete this partner?</h5>
              <div className="action-button">
                <button type="button" onClick={toggleDeletePartnerModal}
                  className="btn btn-danger btn-floating btn-lg"
                  data-dismiss="modal">
                  <FeatherIcon.X />
                </button>
                <button type="button" onClick={deletePartner}
                  className="btn btn-success btn-pulse btn-floating btn-lg">
                  <FeatherIcon.Check />
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    )
  }

  const selectPartnerForDeletion = (partner) => {
    setSelectedPartner(partner)
    toggleDeletePartnerModal()
  }

  const deletePartner = async () => {
    try {
      await setDoc(doc(db, 'partner-info', selectedPartner?.id), { deleted: true }, { merge: true })
    } catch (e) {
      console.error(e)
    }
    toggleDeletePartnerModal()
  }

  return (
  <>
    <Grid component='div' className='chat-body no-message partner-info' container spacing={2}>
        {globalVars.partnerInfo?.map((partner, index) =>
          <Grid className='container' key={partner.id} item xs={3}>
            <div className='card'>
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
                    <button onClick={() => handleSelectPartner(partner)}>Edit</button>
                    <button onClick={() => selectPartnerForDeletion(partner)}>Delete</button>
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
    <EditPartnerModal selectedP={selectedPartner} isOpen={editPartnerModalOpen} toggle={toggleEditPartnerModal} />
    <DeletePartnerModal />
  </>
  )
}

export default Partners