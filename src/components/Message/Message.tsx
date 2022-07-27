import React, { FC, useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { useDispatch } from 'react-redux'
import { modify_message, remove_message } from '../../state/slices/map_slice.js'
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

function useHookWithRefCallBack(ref) {
  const set_scripts_ref = useCallback(node => {
    ref.current = node
    if (ref.current)
      ref.current.style.height = ref.current.scrollHeight + "px";
  }, [ref])
  return set_scripts_ref
}



export function Message({ message }) {
  const { show } = useContextMenu({
    id: message.id,
  });

  const [is_open, toggle_modal] = useState(false);
  const [is_saveable, toggle_save] = useState(false);
  console.log(is_open)
  const [is_editing, toggle_edit] = useState(false);
  // @ts-ignore
  const dispatch = useDispatch();

  let all_scripts_string = ""
  let raw_message = "123"
  if (message.scripts.length > 0) {
    all_scripts_string = message.scripts.slice(1).reduce((previous_value, current_value) => previous_value + "\n" + current_value, message.scripts[0])
  }
  const modify_interface = React.createRef()
  const modify_interface_ref = useHookWithRefCallBack(modify_interface)
  const modify_description = React.createRef()
  const modify_description_ref = useHookWithRefCallBack(modify_description)
  const modify_scripts = React.createRef()
  const modify_scripts_ref = useHookWithRefCallBack(modify_scripts);
  const modify_data = React.createRef()
  const modify_data_ref = useHookWithRefCallBack(modify_data);

  const check_message_changes = () => {
    // @ts-ignore
    return (modify_interface.current.value !== message.comserver || modify_description.current.value !== message.description
      // @ts-ignore
      || modify_scripts.current.value !== all_scripts_string || modify_data.current.value !== message.raw_message) && modify_description.current.value !== ""
  }

  const modify_message_dispatch = () => {
    if (is_saveable) {
      // clean up the scripts into array
      let array_scripts: any[] = []
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
      const modify_message_payload = {
        message: message,
        // @ts-ignore
        raw_message: modify_data.current.value,
        // @ts-ignore
        comserver: modify_interface.current.value,
        scripts: array_scripts,
        // @ts-ignore
        description: modify_description.current.value
      }
      dispatch(modify_message(modify_message_payload))
      console.log("WE DISPATCHED")
      toggle_save(false)
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
    }
  };

  const remove_message_dispatch = () => {
    dispatch(remove_message({ message: message }))
    console.log("WE DISPATCHED")
    toast.dismiss();
    toast('Message was deleted!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  const view_change = () => {
    toggle_modal(true)
  }

  const edit_change = () => {
    toggle_modal(true)
    toggle_edit(true)
  }
  
  const handleContextMenu = useCallback((event) => {
    if(is_open){
      return
    }
    event.preventDefault();
    show(event)
  }, [is_open, message.id])

  let form_data = {
    interface: message.comserver,
    scripts: all_scripts_string,
    description: message.description,
    raw_data: message.raw_message,
  }
  return (
    <div className={styles.Message} data-testid="Message" style={{ cursor: 'pointer' }} onContextMenu={handleContextMenu}>
      <img className="img-fluid" src={message_icon} onClick={() => { toggle_modal(true) }} />
      {message.description}
      {<Modal
        show={is_open}
        // onAfterOpen={afterOpenModal}
        onHide={() => { toggle_modal(false); }}
        size="lg"
      >
        <Modal.Header closeButton className="show-grid">

          <Container className={styles.Message}>
            <Row>
              <Modal.Title>{!is_editing && "File View"} {is_editing && "File Edit"}</Modal.Title>
            </Row>
            <hr />
            <Row style={{fontSize:"0.98rem"}}>
              <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: 'pointer' }} onClick={() => {
                toast.dismiss();
                navigator.clipboard.writeText(message.raw_message.replace(/(\r\n|\r)/gm, "\r"));
                console.log("HIH")
                toast('Data Copied to Clipboard', {
                  position: "top-center",
                  autoClose: 1000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: true,
                  progress: undefined,
                });
              }}
              >
                Copy
                <br />

                <FaCopy style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </Col>
              <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: 'pointer' }} onClick={() => { toggle_edit(!is_editing) }}>
                {!is_editing && "Edit"}
                {is_editing && "View"}
                <br />
                {is_editing && <FaEye style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />}
                {!is_editing && <FaEdit style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />}


              </Col>
              <Col xs={12} md={6} lg={2} xl={10} sm={6} style={{ cursor: is_saveable ? 'pointer' : 'not-allowed' }} onClick={modify_message_dispatch}>
                Save
                <br />
                <FaSave style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </Col>
            </Row>
          </Container>
        </Modal.Header>
        <Modal.Body>
          {is_editing && <Form>

            <Container>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Interface</Form.Label>
                <Form.Control
                  defaultValue={message.comserver}
                  ref={modify_interface_ref}
                  onChange={() => { toggle_save(check_message_changes()) }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Message Description <b>* (required)</b></Form.Label>
                <Form.Control
                  required
                  defaultValue={message.description}
                  ref={modify_description_ref}
                  onChange={() => { toggle_save(check_message_changes()) }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Scripts</Form.Label>
                <Form.Control as="textarea"
                  defaultValue={all_scripts_string}
                  ref={modify_scripts_ref}
                  style={{ overflow: 'hidden' }}
                  onChange={() => { toggle_save(check_message_changes()); modify_scripts.current.style.height = modify_scripts.current.scrollHeight + "px" }}
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>Data</Form.Label>
                <Form.Control as="textarea"
                  defaultValue={message.raw_message}
                  // @ts-ignore
                  ref={modify_data_ref}
                  style={{ overflow: 'hidden' }}
                  onChange={() => { toggle_save(check_message_changes()); modify_data.current.style.height = modify_data.current.scrollHeight + "px" }}
                />
              </Form.Group>
            </Container>
          </Form>}
          {!is_editing && <div><Container>
                                <Row style={{fontWeight:800}}>
                                    Description
                                </Row>
                                <Row>
                                  {message.description}
                                </Row>
                                <div className={styles.astrodivider}><div className={styles.astrodividermask}></div><span><i>&#10038;</i></span></div>
                                <Row style={{fontWeight:800}}>
                                    Interface
                                </Row>
                                <Row>
                                  {message.comserver}
                                </Row>
                                <div className={styles.astrodivider}><div className={styles.astrodividermask}></div><span><i>&#10038;</i></span></div>
                                <Row style={{fontWeight:800}}>
                                    Scripts
                                </Row>
                                <Row style={{whiteSpace: "pre-line"}}>
                                  {all_scripts_string}
                                </Row>
                                <div className={styles.astrodivider}><div className={styles.astrodividermask}></div><span><i>&#10038;</i></span></div>
                                <Row style={{fontWeight:800}}>
                                    Data
                                </Row>
                                <Row style={{whiteSpace: "pre-line"}}>
                                  {message.raw_message}
                                </Row>
                                <div className={styles.astrodivider}><div className={styles.astrodividermask}></div><span><i>&#10038;</i></span></div>
                          </Container></div>}
        </Modal.Body>
      </Modal>}
      {!is_open &&<Menu id={message.id}>
        <Item onClick={view_change}>View</Item>
        <Item onClick={edit_change}>Edit</Item>
        <Item onClick={remove_message_dispatch}>Remove</Item>
      </Menu>}
      <ToastContainer />

    </div>
  );
}

export default Message;
