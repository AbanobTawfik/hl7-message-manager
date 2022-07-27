import React, { FC, useState } from 'react';
// @ts-ignore
import styles from './Add.module.scss';
import './Add.module.scss'
// @ts-ignore
import add_icon from '../../resources/Icons/add.png'
import { Modal, Button, Row, Container, Col, Form } from 'react-bootstrap';
import { FaFolderPlus, FaFileUpload, FaSave, FaEye } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { add_directory, add_message } from '../../state/slices/map_slice.js'

let form_data = {
  interface: "",
  scripts: "",
  description: "",
  raw_data: "",
  directory_name: ""
}

export function Add() {
  const [is_open, toggle_modal] = useState(false);
  const [is_saveable, toggle_save] = useState(false);
  const [adding_file, toggle_adding_file] = useState(true);
  const add_interface = React.createRef()
  const add_description = React.createRef()
  const add_scripts = React.createRef()
  const add_data = React.createRef()
  const add_directory_name = React.createRef()
  const dispatch = useDispatch();
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const current_directory_path = global_state.current_directory

  const check_message_changes = () => {
    // @ts-ignore
    return (adding_file && add_description.current.value !== "") || (!adding_file && add_directory_name !== "")
  }
  const send_message_or_file = () => {
    if (is_saveable) {
      if (adding_file) {
        let array_scripts: any[] = []
        // @ts-ignore
        if (add_scripts.current.value !== "") {
          // @ts-ignore
          array_scripts = add_scripts.current.value.split("\n")
          if (array_scripts.length == 1) {
            // @ts-ignore
            array_scripts = add_scripts.current.value.split(",")
          }
        }
        array_scripts = array_scripts.map(element => {
          return element.trim();
        });

        const add_message_payload = {
          directory_path: current_directory_path.path,
          // @ts-ignore
          raw_message: add_data.current.value,
          // @ts-ignore
          comserver: add_interface.current.value,
          scripts: array_scripts,
          // @ts-ignore
          description: add_description.current.value,
        }
        dispatch(add_message(add_message_payload))
        // clear inputs
        add_data.current.value = ""
        add_description.current.value = ""
        add_interface.current.value = ""
        add_scripts.current.value = ""
        form_data.description = ""
        form_data.scripts = ""
        form_data.raw_data = ""
        form_data.interface = ""
        toggle_save(false)
      } else {
        const add_directory_payload = {
          parent_directory_path: current_directory_path.path,
          // @ts-ignore
          name: add_directory_name.current.value,
        }
        dispatch(add_directory(add_directory_payload))
        // clear inputs
        add_directory_name.current.value = ""
        form_data.directory_name = ""
        toggle_save(false)
        // add message callback
        // require that description is filled in
      }
    }
  }

  console.log(is_open)

  return (
    <div className={styles.Add} style={{ cursor: 'pointer' }} data-testid="Add">
      <img className="img-fluid .resize" style={{maxHeight:"100px", maxWidth:"100px"}} src={add_icon} onClick={() => { toggle_modal(true) }} />
      <br/>
      Add
      {<Modal
        show={is_open}
        // onAfterOpen={afterOpenModal}
        onHide={() => { toggle_modal(false); }}
        size="lg"
      >
        <Form>
          <Modal.Header closeButton className="show-grid">

            <Container className={styles.Add}>
              <Row>
                <Modal.Title>{adding_file && "Add File"} {!adding_file && "Add Folder"} </Modal.Title>
              </Row>
              <hr />
              <Row style={{ fontSize: "0.98rem" }}>
                <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: 'pointer' }} onClick={() => {
                  toggle_save(form_data.description != "")
                  toggle_adding_file(true)
                }}>
                  File
                  <br />
                  <FaFileUpload style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                </Col>
                <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: 'pointer' }} onClick={() => {
                  toggle_save(form_data.directory_name != "")
                  toggle_adding_file(false)
                }}>
                  Folder
                  <br />
                  <FaFolderPlus style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                </Col>
                <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: is_saveable ? 'pointer' : 'not-allowed' }} onClick={send_message_or_file}>
                  Save
                  <br />
                  <FaSave style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                </Col>
              </Row>
            </Container>
          </Modal.Header>
          {adding_file && <Modal.Body>
            <Container>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label style={{ fontWeight: 800 }}>Message Description* (required)</Form.Label>
                <Form.Control
                  // @ts-ignore
                  ref={add_description}
                  defaultValue={form_data.description}
                  style={{ fontWeight: 300, minHeight: "2.4rem" }}
                  onChange={() => { form_data.description = add_description.current.value; toggle_save(adding_file && add_description.current.value != "") }}
                // onChange={toggle_save(adding_file && add_description.current.value != "")}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label style={{ fontWeight: 800 }}>Interface</Form.Label>
                <Form.Control
                  // @ts-ignore
                  ref={add_interface}
                  defaultValue={form_data.interface}
                  style={{ fontWeight: 300, minHeight: "2.4rem" }}
                  onChange={() => { form_data.interface = add_interface.current.value }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label style={{ fontWeight: 800 }}>Scripts</Form.Label>
                <Form.Control as="textarea"
                  // @ts-ignore
                  ref={add_scripts}
                  style={{ overflow: 'hidden' }}
                  defaultValue={form_data.scripts}
                  style={{ minHeight: "5rem", overflow: 'hidden', fontWeight: 300 }}
                  onChange={() => {
                    form_data.scripts = add_scripts.current.value;
                    add_scripts.current.style.height = "0px"
                    add_scripts.current.style.height = add_scripts.current.scrollHeight + "px"
                  }}
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label style={{ fontWeight: 800 }}>Data</Form.Label>
                <Form.Control as="textarea"
                  // @ts-ignore
                  ref={add_data}
                  style={{ minHeight: "5rem", overflow: 'hidden', fontWeight: 300 }}
                  defaultValue={form_data.raw_data}
                  onChange={() => {
                    form_data.raw_data = add_data.current.value;
                    add_data.current.style.height = "0px"
                    add_data.current.style.height = add_data.current.scrollHeight + "px"
                  }}
                />
              </Form.Group>
            </Container>
          </Modal.Body>
          }
          {!adding_file && <Modal.Body>
            <Container>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label style={{ fontWeight: 800 }}>Directory Name* (required)</Form.Label>
                <Form.Control
                  // @ts-ignore
                  ref={add_directory_name}
                  defaultValue={form_data.directory_name}
                  onChange={() => {
                    form_data.directory_name = add_directory_name.current.value;
                    console.log(form_data)
                    toggle_save(!adding_file && add_directory_name.current.value != "")
                  }}
                />
              </Form.Group>
            </Container>
          </Modal.Body>
          }
        </Form>
      </Modal>}
    </div>)
}

export default Add;
