import React, { useContext, useState } from 'react'
import { Slider } from '@mui/material'
import { Input } from 'reactstrap'
import { LoadingButton } from '@mui/lab'
import * as FeatherIcon from 'react-feather'
import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Modal, ModalBody } from 'reactstrap'
import Chart from 'react-apexcharts'
import { AuthContext } from '../providers/AuthProvider'
import { doc, getDoc, query, getFirestore, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore'
import app from '../firebase'

const db = getFirestore(app)

const ImageGrader = ({ image, message, chat }) => {

    const { user } = useContext(AuthContext)

    const [formValues, setFormValues] = useState({ red: 0, yellow: 0, green: 0 })
    const [submitting, setSubmitting] = useState(false)
    const [skipping, setSkipping] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const toggleDropdown = () => setDropdownOpen(prevState => !prevState)

    const [showPieChart, setPieChart] = useState(true)
    const togglePieChart = () => setPieChart(prevState => !prevState)

    const [imageSkipModal, openImageSkipModal] = useState(false)
    const toggleImageSkipModal = () => openImageSkipModal(prevState => !prevState)

    const [imageDeleteModal, openImageDeleteModal] = useState(false)
    const toggleImageDeleteModal = () => openImageDeleteModal(prevState => !prevState)

    let chart = {
        options: {
            plotOptions: {
                pie: { 
                    expandOnClick: false,
                    donut: {
                        size: '50%',
                        labels: {
                            show: formValues.green + formValues.yellow + formValues.red !== 0,
                            total: {
                                show: formValues.green + formValues.yellow + formValues.red !== 0,
                                showAlways: true,
                                label: `${formValues.green + formValues.yellow + formValues.red === 0 ? '50' : Math.round((((formValues.green - formValues.red) / (formValues.green + formValues.yellow + formValues.red)) + 1) * 50)}`,
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: '#202060',
                                formatter: function () {
                                    return ''
                                }
                            }
                        }
                    }
                }
            },
            chart: {
                id: 'score-chart',
            },
            dataLabels: {
                enabled: false,
                formatter: function (val) {
                    return val?.toFixed(1) + "%"
                },
                style: {
                    colors: ['#fff']
                }
            },
            legend: {
                show: false
            },
            fill: {
                colors: ['#C70039', '#EBD32E', '#43CD3F'],
                labels: {
                    colors: ['#C70039', '#EBD32E', '#43CD3F'],
                }
            },
            labels: ['Red', 'Yellow', 'Green'],
            colors: ['#C70039', '#EBD32E', '#43CD3F'],
            stroke: {
                show: formValues.green + formValues.yellow + formValues.red !== 0,
                curve: 'smooth',
                lineCap: 'butt',           
            }
        },
        series: [formValues.red, formValues.yellow, formValues.green],
        chartOptions: {
            labels: ['Red', 'Yellow', 'Green'],
        }
    }

    const gradeImage = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        const newGradedImage = await getDoc(doc(db, "chat-rooms", chat.id, "chat-messages", message.id))
        console.log('data is: ', newGradedImage.data())
        let imageData = newGradedImage.data().img
        let tempImageData = {}
        const newData = imageData.map(i => {
            if (i.url === image.url) {
                tempImageData = i
                return {
                    ...i,
                    red: formValues.red,
                    yellow: formValues.yellow,
                    green: formValues.green,
                    comment: formValues.comment,
                    grade: Math.round((((formValues.green - formValues.red) / (formValues.green + formValues.yellow + formValues.red)) + 1) * 50),
                    graded: true,
                    gradedAt: Timestamp.fromDate(new Date()),
                    gradedBy: user.uid
                }
            }
            return i
        })
        updateDoc(newGradedImage.ref, {
            img: newData
        })
        await addDoc(collection(db, "chat-rooms", chat.id, "chat-messages"), {
            img: [{
                url: image.url,
                red: formValues.red,
                yellow: formValues.yellow,
                green: formValues.green,
                comment: formValues.comment,
                grade: Math.round((((formValues.green - formValues.red) / (formValues.green + formValues.yellow + formValues.red)) + 1) * 50),
                graded: true,
                gradedAt: Timestamp.fromDate(new Date()),
                gradedBy: user.uid,
                uploadedAt: tempImageData?.uploadedAt
            }],
            msg: formValues.comment,
            timeSent: Timestamp.fromDate(new Date()),
            userID: user.uid,
        }).then(() => {
            updateDoc(doc(db, "chat-rooms", chat.id), {
                latestMessage: formValues.comment === '' ? '[Image]' : formValues.comment,
                latestMessageTime: Timestamp.fromDate(new Date())
            })
            setSubmitting(false)
            setFormValues({
                red: 0,
                yellow: 0,
                green: 0,
                comment: ''
            })
        }).catch((e) => {
            console.log("error while adding new image grade message: ", e)
        })
    }

    const skipImage = async (e) => {
        e.preventDefault()
        setSkipping(true)
        const newGradedImage = await getDoc(doc(db, "chat-rooms", chat.id, "chat-messages", message.id))
        console.log('data is: ', newGradedImage.data())
        let imageData = newGradedImage.data().img
        const newData = imageData.map(i => {
            if (i.url === image.url) {
                return {
                    ...i,
                    skipped: true
                }
            }
            return i
        })
        updateDoc(newGradedImage.ref, {
            img: newData
        }).then(() => {
            toggleImageSkipModal()
            setSkipping(false)
        })
    }

    const deleteImage = async (e) => {
        e.preventDefault()
        setDeleting(true)
        const newGradedImage = await getDoc(doc(db, "chat-rooms", chat.id, "chat-messages", message.id))
        console.log('data is: ', newGradedImage.data())
        let imageData = newGradedImage.data().img
        const newData = imageData.map(i => {
            if (i.url === image.url) {
                return {
                    ...i,
                    url: 'https://firebasestorage.googleapis.com/v0/b/firstproject-b3f4a.appspot.com/o/chat-pictures%2Ferror1.png?alt=media&token=0a372008-b772-4989-abb2-b6fd847ec25d',
                    deletedURL: image.url,
                    deleted: true
                }
            }
            return i
        })
        updateDoc(newGradedImage.ref, {
            img: newData
        }).then(() => {
            toggleImageDeleteModal()
            setDeleting(false)
        })  
    }

    return (
        <div style={{ marginBottom: 0 }}>
            <div style={{
                backgroundImage: `url(${image.url})`,
                borderRadius: 10,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                width: '100%',
                objectFit: 'cover',
                display: 'flex',
                padding: '10px',
                position: 'relative'
            }}>
                <img style={{ visibility: 'hidden', width: '100%' }} src={image.url} />
                <div style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    position: 'absolute',
                    width: '100%',
                    display: 'flex',
                    height: '100%',
                }}>
                    <div style={{ alignSelf: 'flex-end', marginRight: 24 }}>
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                            <DropdownToggle
                                tag="span"
                                data-toggle="dropdown"
                                aria-expanded={dropdownOpen}
                            >
                                <button style={{ color: "#fff", boxShadow: '2px 2px 4px #000000' }} className="btn">
                                    <FeatherIcon.MoreVertical />
                                </button>
                            </DropdownToggle>
                            <DropdownMenu end>
                                <DropdownItem onClick={togglePieChart}>{showPieChart ? 'Hide' : 'Show'} Pie Chart</DropdownItem>
                                <DropdownItem onClick={toggleImageSkipModal}>Skip Image</DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem onClick={toggleImageDeleteModal}>Delete Image</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    {showPieChart && <div style={{ justifyContent: 'center', alignSelf: 'flex-start', alignItems: 'center', marginBottom: 10, marginLeft: -25}}>
                        {formValues.green + formValues.yellow + formValues.red !== 0 && <div style={{ position: 'absolute', bottom: 45, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }} />}
                        <Chart options={chart.options} series={chart.series} type="donut" width={150} height={150} />
                    </div>}
                </div>
            </div>
            <p style={{ marginTop: 15, marginBottom: -15 }}><strong>User Message: </strong>{message?.msg || '(None)'}</p>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                padding: 20
            }}>
                <Slider
                    aria-label="Red"
                    valueLabelDisplay="auto"
                    value={formValues.red}
                    onChange={e => setFormValues(val => ({ ...val, red: e.target.value }))}
                    step={0.05}
                    min={0}
                    max={10}
                    style={{ color: '#C70039', marginBottom: 10 }}
                />
                <Slider
                    aria-label="Yellow"
                    valueLabelDisplay="auto"
                    value={formValues.yellow}
                    onChange={e => setFormValues(val => ({ ...val, yellow: e.target.value }))}
                    step={0.05}
                    min={0}
                    max={10}
                    style={{ color: '#EBD32E', marginBottom: 10 }}
                />
                <Slider
                    aria-label="Green"
                    valueLabelDisplay="auto"
                    value={formValues.green}
                    onChange={e => setFormValues(val => ({ ...val, green: e.target.value }))}
                    step={0.05}
                    min={0}
                    max={10}
                    style={{ color: '#43CD3F', marginBottom: 10 }}
                />
                <Input
                    type='textarea'
                    id="standard-multiline-static"
                    label="Comments"
                    placeholder="Give your feedback here..."
                    rows={6}
                    value={formValues.comment}
                    onChange={e => setFormValues(val => ({ ...val, comment: e.target.value }))}
                    className="form-control"
                    style={{ marginBottom: 20 }}
                />
                <LoadingButton variant="contained" disabled={!formValues.comment} onClick={gradeImage} loading={submitting} >
                    Submit
                </LoadingButton>
            </div>
            <hr />
            <Modal isOpen={imageSkipModal} toggle={toggleImageSkipModal} centered className="modal-dialog-zoom call">
                <ModalBody>
                    <div className="call">
                        <div>
                            <h5>Are you sure you want to skip this image?</h5>
                            <div className="action-button">
                                <button type="button" onClick={toggleImageSkipModal}
                                        className="btn btn-danger btn-floating btn-lg"
                                        data-dismiss="modal" disabled={skipping}>
                                    <FeatherIcon.X/>
                                </button>
                                <button type="button" onClick={skipImage}
                                        className="btn btn-success btn-pulse btn-floating btn-lg" disabled={skipping}>
                                    <FeatherIcon.Check/>
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
            <Modal isOpen={imageDeleteModal} toggle={toggleImageDeleteModal} centered className="modal-dialog-zoom call">
                <ModalBody>
                    <div className="call">
                        <div>
                            <h5>Are you sure you want to delete this image?</h5>
                            <div className="action-button">
                                <button type="button" onClick={toggleImageDeleteModal}
                                        className="btn btn-danger btn-floating btn-lg"
                                        data-dismiss="modal" disabled={deleting}>
                                    <FeatherIcon.X/>
                                </button>
                                <button type="button" onClick={deleteImage}
                                        className="btn btn-success btn-pulse btn-floating btn-lg" disabled={deleting}>
                                    <FeatherIcon.Check/>
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default ImageGrader