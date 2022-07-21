import React, { FC, useState } from 'react';
import styles from './Message.module.scss';
import message from '../../types/message.ts'
import message_icon from '../../resources/Icons/message.png'
import copy_icon from '../../resources/Icons/copy.png'
import modify_icon from '../../resources/Icons/modify.png'
import { Modal, Button, Row, Container, Col, Form } from 'react-bootstrap';
import { FaCopy, FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'

export function Message({ message }) {
  const [is_open, toggle_modal] = useState(false);
  const [is_editing, toggle_edit] = useState(false);
  
  console.log(is_open)
  let all_scripts_string = ""
  if(message.scripts.length > 0){
    all_scripts_string = message.scripts.slice(1).reduce((previous_value, current_value) => previous_value + "\n" + current_value, message.scripts[0])
  }
  console.log("scripts", all_scripts_string, "..", message.scripts)
  return (<div id="Modal" className={styles.Message} data-testid="Message">
    <img className="img-fluid" src={message_icon} onClick={() => { toggle_modal(true) }} />
    {message.description}
    <Modal
      show={is_open}
      // onAfterOpen={afterOpenModal}
      onHide={() => { console.log("HI"); toggle_modal(false); }}
      size="lg"
    >
      <Modal.Header closeButton className="show-grid">
        <Container>
          <Row>
            <Modal.Title>HL7 Message</Modal.Title>
          </Row>
          <hr />
          <Row>
            <Col xs={12} md={6} lg={2} xl={10} sm={6}>
              Copy
              <br />
              <FaCopy style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            </Col>
            <Col xs={12} md={6} lg={2} xl={10} sm={6}>
              Edit
              <br />
              <FaEdit style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />

            </Col>
            <Col xs={12} md={6} lg={2} xl={10} sm={6}>
              Save
              <br />
              <FaSave style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            </Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Container>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Interface</Form.Label>
              <Form.Control
                placeholder={message.comserver}
                value={message.comserver}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Scripts (new line delimited)</Form.Label>
              <Form.Control as="textarea"
                placeholder={all_scripts_string}
                value={all_scripts_string}
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Data</Form.Label>
              <Form.Control as="textarea"
                placeholder={message.raw_message}
                value={message.raw_message}
              />
            </Form.Group>
          </Container>
        </Form>
      </Modal.Body>
    </Modal>
  </div>
  );
}

export default Message;
