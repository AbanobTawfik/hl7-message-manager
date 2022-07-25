import React, { FC, useState, useMemo } from 'react';
// @ts-ignore
import styles from './Message.module.scss';
// @ts-ignore
import message from '../../types/message.ts'
// @ts-ignore
import message_icon from '../../resources/Icons/message.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Row, Container, Col, Form } from 'react-bootstrap';
import { FaCopy, FaEdit, FaSave, FaEye } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import {modify_message} from '../../state/slices/map_slice.js'
// @ts-ignore
import * as map from "../../services/dictionary.ts"



export function Message({ message }) {
  const [is_open, toggle_modal] = useState(false);
  const [is_editing, toggle_edit] = useState(false);
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const dictionary = global_state.map
  
  const dispatch = useDispatch();

  let all_scripts_string = ""
  if (message.scripts.length > 0) {
    all_scripts_string = message.scripts.slice(1).reduce((previous_value, current_value) => previous_value + "\n" + current_value, message.scripts[0])
  }
  const modify_interface = React.createRef()
  const modify_description = React.createRef()
  const modify_scripts = React.createRef();
  const modify_data = React.createRef();

  const modify_message_dispatch = () => {
    // clean up the scripts into array
    let array_scripts:any[] = []
    // @ts-ignore
    if (modify_scripts.current.value !== "") {
      // @ts-ignore
      array_scripts = modify_scripts.current.value.split("\n")
      if (array_scripts.length == 1) {
        // @ts-ignore
        array_scripts = modify_scripts.current.value.split(",")
      }
    }
    array_scripts = array_scripts.map(element => {
      return element.trim();
    });
    console.log(message)
    
    const modify_message_payload = {message: message, 
                                   // @ts-ignore
                                    raw_message: modify_data.current.value,
                                    // @ts-ignore
                                    comserver: modify_interface.current.value,
                                    scripts: array_scripts,
                                    // @ts-ignore
                                    description: modify_description.current.value}
    dispatch(modify_message(modify_message_payload))
    toggle_edit(false)
    toast.dismiss();
    toast('Changes have been saved!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  return (<div className={styles.Message} data-testid="Message" style={{ cursor: 'pointer' }}>
    <img className="img-fluid" src={message_icon} onClick={() => { toggle_modal(true) }} />
    {message.description}
    {is_open && <Modal
      show={is_open}
      // onAfterOpen={afterOpenModal}
      onHide={() => { console.log("HI"); toggle_modal(false); }}
      size="lg"
    >
      <Form>
        <Modal.Header closeButton className="show-grid">

          <Container>
            <Row>
              <Modal.Title>File Details</Modal.Title>
            </Row>
            <hr />
            <Row>
              <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: 'pointer' }} onClick={() => {
                toast.dismiss();
                navigator.clipboard.writeText(message.raw_message.replace(/(\r\n|\r)/gm, "\r"));
                toast('Data Copied to Clipboard', {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
              }}
              >
                Copy
                <br />
                <ToastContainer />

                <FaCopy style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </Col>
              <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: 'pointer' }} onClick={() => { toggle_edit(!is_editing) }}>
                {!is_editing && "Edit"}
                {is_editing && "View"}
                <br />
                {is_editing && <FaEye style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />}
                {!is_editing && <FaEdit style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />}


              </Col>
              <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: 'pointer' }} onClick={modify_message_dispatch}>
                Save
                <br />
                <ToastContainer />
                <FaSave style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </Col>
            </Row>
          </Container>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Interface</Form.Label>
              <Form.Control
                defaultValue={message.comserver}
                disabled={!is_editing}
                // @ts-ignore
                ref={modify_interface}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Message Description</Form.Label>
              <Form.Control
                defaultValue={message.description}
                disabled={!is_editing}
                // @ts-ignore
                ref={modify_description}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Scripts (new line delimited)</Form.Label>
              <Form.Control as="textarea"
                defaultValue={all_scripts_string}
                disabled={!is_editing}
                // @ts-ignore
                ref={modify_scripts}
                style={{height:'500px'}}
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Data</Form.Label>
              <Form.Control as="textarea"
                defaultValue={message.raw_message}
                disabled={!is_editing}
                // @ts-ignore
                ref={modify_data}
                style={{height:'auto'}}
              />
            </Form.Group>
          </Container>
        </Modal.Body>
      </Form>
    </Modal>
    }
  </div>
  );
}

export default Message;
