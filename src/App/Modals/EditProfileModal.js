import React, {useContext, useState} from 'react'
import {
    Modal,
    ModalBody,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    ModalFooter,
    Button,
    Form,
    FormGroup,
    Label,
    ModalHeader,
    Input,
    InputGroup,
    InputGroupText,
} from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import classnames from 'classnames'
import ManAvatar4 from '../../assets/img/man_avatar4.jpg'
import { AuthContext } from '../../providers/AuthProvider'

function EditProfileModal(props) {

    const { user } = useContext(AuthContext)

    const [activeTab, setActiveTab] = useState('1');

    const toggle = tab => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    return (
        <div>
            <Modal isOpen={props.modal} toggle={props.toggle} centered className="modal-dialog-zoom">
                <ModalHeader toggle={props.toggle}>
                    <FeatherIcon.Edit2 className="mr-2"/> Edit Profile
                </ModalHeader>
                <ModalBody>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({active: activeTab === '1'})}
                                onClick={() => {
                                    toggle('1');
                                }}
                            >
                                Personal
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({active: activeTab === '2'})}
                                onClick={() => {
                                    toggle('2');
                                }}
                            >
                                About
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({active: activeTab === '3'})}
                                onClick={() => {
                                    toggle('3');
                                }}
                            >
                                Social Links
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <Form>
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId="1">
                                <FormGroup>
                                    <Label for="fullname">Full Name</Label>
                                    <InputGroup>
                                        <Input type="text" name="fullname" id="fullname" placeholder={user.displayName}/>
                                            <Button color="light">
                                                <FeatherIcon.User/>
                                            </Button>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="avatar">Avatar</Label>
                                    <div className="d-flex align-items-center">
                                        <div>
                                            <figure className="avatar mr-3 item-rtl">
                                                <img src={user.photoURL} className="rounded-circle" alt="avatar"/>
                                            </figure>
                                        </div>
                                        <Input type="file" id="exampleCustomFileBrowser" name="customFile"/>
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="city">Email</Label>
                                    <InputGroup>
                                        <Input type="text" name="city" id="city" placeholder={user.email}/>
                                            <Button color="light">
                                                <FeatherIcon.Mail/>
                                            </Button>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="phone">New Password</Label>
                                    <InputGroup>
                                        <Input type="text" name="phone" id="phone" />
                                            <Button color="light">
                                                <FeatherIcon.EyeOff/>
                                            </Button>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="phone">Confirm New Password</Label>
                                    <InputGroup>
                                        <Input type="text" name="website" id="website" />
                                            <Button color="light">
                                                <FeatherIcon.EyeOff/>
                                            </Button>
                                    </InputGroup>
                                </FormGroup>
                            </TabPane>
                            <TabPane tabId="2">
                                <FormGroup>
                                    <Label for="about">Write a few words that describe you</Label>
                                    <Input type="textarea" name="about" id="about"/>
                                </FormGroup>
                                <FormGroup>
                                    <Input type="checkbox" id="customCheckbox1" label="View profile" defaultChecked/>
                                </FormGroup>
                            </TabPane>
                            <TabPane tabId="3">
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="facebook" id="facebook" placeholder="Username"/>
                                            <InputGroupText className="bg-facebook">
                                                <i className="fa fa-facebook"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="twitter" id="twitter" placeholder="Username"/>
                                            <InputGroupText className="bg-twitter">
                                                <i className="fa fa-twitter"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="instagram" id="instagram" placeholder="Username"/>
                                            <InputGroupText className="bg-instagram">
                                                <i className="fa fa-instagram"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="linkedin" id="linkedin" placeholder="Username"/>
                                            <InputGroupText className="bg-linkedin">
                                                <i className="fa fa-linkedin"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="dribbble" id="dribbble" placeholder="Username"/>
                                            <InputGroupText className="bg-dribbble">
                                                <i className="fa fa-dribbble"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="youtube" id="youtube" placeholder="Username"/>
                                            <InputGroupText className="bg-youtube">
                                                <i className="fa fa-youtube"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="google" id="google" placeholder="Username"/>
                                            <InputGroupText className="bg-google">
                                                <i className="fa fa-google"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <InputGroup>
                                        <Input type="text" name="whatsapp" id="whatsapp" placeholder="Username"/>
                                            <InputGroupText className="bg-whatsapp">
                                                <i className="fa fa-whatsapp"></i>
                                            </InputGroupText>
                                    </InputGroup>
                                </FormGroup>
                            </TabPane>
                        </TabContent>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary">Save</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default EditProfileModal
