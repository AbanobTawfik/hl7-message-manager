import React, { useState } from 'react'
// @ts-ignore
import styles from './Add.module.scss'
import './Add.module.scss'
// @ts-ignore
import add_icon from '../../resources/Icons/add.png'
import { Modal, Row, Container, Col, Form } from 'react-bootstrap'
import { FaFolderPlus, FaFileUpload, FaSave } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { add_directory, add_message } from '../../state/slices/map_slice.js'

let form_data = {
  interface: '',
  scripts: '',
  description: '',
  raw_data: '',
  directory_name: '',
  notes: ''
}

export function Add () {
  const [is_open, toggle_modal] = useState(false)
  const [is_saveable, toggle_save] = useState(false)
  const [adding_file, toggle_adding_file] = useState(true)
  const [has_focus, toggle_focus] = useState(false)
  const add_interface = React.createRef()
  const add_description = React.createRef()
  const add_scripts = React.createRef()
  const add_data = React.createRef()
  const add_directory_name = React.createRef()
  const add_notes = React.createRef()
  const modal_ref = React.createRef()
  const dispatch = useDispatch()
  const global_state = useSelector(state => state)
  // @ts-ignore
  const current_directory_path = global_state.current_directory

  const check_message_changes = () => {
    // @ts-ignore
    return (
      (adding_file && add_description.current.value !== '') ||
      (!adding_file && add_directory_name !== '')
    )
  }
  const send_message_or_file = () => {
    if (is_saveable) {
      if (adding_file) {
        let array_scripts: any[] = []
        // @ts-ignore
        if (add_scripts.current.value !== '') {
          // @ts-ignore
          array_scripts = add_scripts.current.value.split('\n')
          if (array_scripts.length == 1) {
            // @ts-ignore
            array_scripts = add_scripts.current.value.split(',')
          }
        }
        array_scripts = array_scripts.map(element => {
          return element.trim()
        })
        const add_message_payload = {
          directory_path: current_directory_path.path,
          // @ts-ignore
          raw_message: add_data.current.value,
          // @ts-ignore
          comserver: add_interface.current.value,
          scripts: array_scripts,
          // @ts-ignore
          description: add_description.current.value,
          notes: add_notes.current.value
        }
        dispatch(add_message(add_message_payload))
        // clear inputs
        add_data.current.value = ''
        add_description.current.value = ''
        add_interface.current.value = ''
        add_scripts.current.value = ''
        add_notes.current.value = ''
        form_data.description = ''
        form_data.scripts = ''
        form_data.raw_data = ''
        form_data.interface = ''
        form_data.notes = ''
        toggle_save(false)
      } else {
        const add_directory_payload = {
          parent_directory_path: current_directory_path.path,
          // @ts-ignore
          name: add_directory_name.current.value
        }
        dispatch(add_directory(add_directory_payload))
        // clear inputs
        add_directory_name.current.value = ''
        form_data.directory_name = ''
        toggle_save(false)
        toggle_modal(false)
        // add message callback
        // require that description is filled in
      }
    }
  }
  const handleTextAreaInput = (e, ref) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      let start = ref.current.selectionStart
      var end = ref.current.selectionEnd
      ref.current.value =
        ref.current.value.substring(0, start) +
        '    ' +
        ref.current.value.substring(end)
      ref.current.selectionStart = start + 4
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      ref.current.blur()
      modal_ref.current.focus()
    }
  }
  const handleInputInput = (e, ref) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      ref.current.blur()
      modal_ref.current.focus()
    }
  }

  console.log(is_open)

  return (
    <div
      className={styles.Add}
      style={{ cursor: 'pointer' }}
      data-testid='Add'
      onKeyDown={e => {
        console.log('HI')
        if (!has_focus && is_open) {
          if (e.key === 'Enter') {
            if (is_saveable) {
              send_message_or_file()
            }
          }
          if (e.key === 'd') {
            if (adding_file) {
              toggle_adding_file(false)
              modal_ref.current.focus()
            }
          }
          if (e.key === 'f') {
            if (!adding_file) {
              toggle_adding_file(true)
              modal_ref.current.focus()
            }
          }
        }
      }}
    >
      <img
        className='img-fluid .resize'
        style={{ maxHeight: '100px', maxWidth: '100px' }}
        src={add_icon}
        onClick={() => {
          toggle_modal(true)
        }}
      />
      <br />
      Add
      {
        <Modal
          show={is_open}
          onHide={() => {
            toggle_modal(false)
          }}
          tabIndex={-1}
          size='lg'
        >
          <Form tabIndex={1} ref={modal_ref}>
            <Modal.Header closeButton className='show-grid'>
              <Container className={styles.Add}>
                <Row>
                  <Modal.Title>
                    {adding_file && 'Add File'} {!adding_file && 'Add Folder'}{' '}
                  </Modal.Title>
                </Row>
                <hr />
                <Row style={{ fontSize: '0.98rem' }}>
                  <Col xs={12} md={6} lg={2} xl={4} sm={6}>
                    File
                    <br />
                    <FaFileUpload
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        toggle_save(form_data.description != '')
                        toggle_adding_file(true)
                      }}
                    />
                  </Col>
                  <Col xs={12} md={6} lg={2} xl={4} sm={6}>
                    Directory
                    <br />
                    <FaFolderPlus
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        toggle_save(form_data.directory_name != '')
                        toggle_adding_file(false)
                      }}
                    />
                  </Col>
                  <Col xs={12} md={6} lg={2} xl={4} sm={6}>
                    Save
                    <br />
                    <FaSave
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        cursor: is_saveable ? 'pointer' : 'not-allowed'
                      }}
                      onClick={send_message_or_file}
                    />
                  </Col>
                </Row>
              </Container>
            </Modal.Header>
            {adding_file && (
              <Modal.Body>
                <Container>
                  <Form.Group
                    className='mb-3'
                    controlId='exampleForm.ControlInput1'
                  >
                    <Form.Label style={{ fontWeight: 800 }}>
                      Message Description* (required)
                    </Form.Label>
                    <Form.Control
                      // @ts-ignore
                      ref={add_description}
                      defaultValue={form_data.description}
                      style={{ fontWeight: 300, minHeight: '2.4rem' }}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      onChange={() => {
                        form_data.description = add_description.current.value
                        toggle_save(
                          adding_file && add_description.current.value != ''
                        )
                      }}
                      onKeyDown={e => {
                        handleInputInput(e, add_description)
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className='mb-3'
                    controlId='exampleForm.ControlInput1'
                  >
                    <Form.Label style={{ fontWeight: 800 }}>
                      Interface
                    </Form.Label>
                    <Form.Control
                      // @ts-ignore
                      ref={add_interface}
                      defaultValue={form_data.interface}
                      style={{ fontWeight: 300, minHeight: '2.4rem' }}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      onChange={() => {
                        form_data.interface = add_interface.current.value
                      }}
                      onKeyDown={e => {
                        handleInputInput(e, add_interface)
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className='mb-3'
                    controlId='exampleForm.ControlTextarea1'
                  >
                    <Form.Label style={{ fontWeight: 800 }}>Scripts</Form.Label>
                    <Form.Control
                      as='textarea'
                      // @ts-ignore
                      ref={add_scripts}
                      defaultValue={form_data.scripts}
                      style={{
                        minHeight: '5rem',
                        overflow: 'hidden',
                        fontWeight: 300
                      }}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      onChange={() => {
                        form_data.scripts = add_scripts.current.value
                        add_scripts.current.style.height = '0px'
                        add_scripts.current.style.height =
                          add_scripts.current.scrollHeight + 'px'
                      }}
                      onKeyDown={e => {
                        handleTextAreaInput(e, add_scripts)
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className='mb-3'
                    controlId='exampleForm.ControlTextarea1'
                  >
                    <Form.Label style={{ fontWeight: 800 }}>Notes</Form.Label>
                    <Form.Control
                      as='textarea'
                      // @ts-ignore
                      ref={add_notes}
                      defaultValue={form_data.notes}
                      style={{
                        minHeight: '5rem',
                        overflow: 'hidden',
                        fontWeight: 300
                      }}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      onChange={() => {
                        form_data.notes = add_notes.current.value
                        add_notes.current.style.height = '0px'
                        add_notes.current.style.height =
                          add_notes.current.scrollHeight + 'px'
                      }}
                      onKeyDown={e => {
                        handleTextAreaInput(e, add_notes)
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className='mb-3'
                    controlId='exampleForm.ControlTextarea1'
                  >
                    <Form.Label style={{ fontWeight: 800 }}>Data</Form.Label>
                    <Form.Control
                      as='textarea'
                      // @ts-ignore
                      ref={add_data}
                      style={{
                        minHeight: '5rem',
                        overflow: 'hidden',
                        fontWeight: 300
                      }}
                      defaultValue={form_data.raw_data}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      autoComplete='off'
                      onChange={() => {
                        form_data.raw_data = add_data.current.value
                        add_data.current.style.height = '0px'
                        add_data.current.style.height =
                          add_data.current.scrollHeight + 'px'
                      }}
                      onKeyDown={e => {
                        handleTextAreaInput(e, add_data)
                      }}
                    />
                  </Form.Group>
                </Container>
              </Modal.Body>
            )}
            {!adding_file && (
              <Modal.Body>
                <Container>
                  <Form.Group
                    className='mb-3'
                    controlId='exampleForm.ControlInput1'
                  >
                    <Form.Label style={{ fontWeight: 800 }}>
                      Directory Name* (required)
                    </Form.Label>
                    <Form.Control
                      // @ts-ignore
                      ref={add_directory_name}
                      defaultValue={form_data.directory_name}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      autoComplete='off'
                      onChange={() => {
                        form_data.directory_name =
                          add_directory_name.current.value
                        toggle_save(
                          !adding_file && add_directory_name.current.value != ''
                        )
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                        handleInputInput(e, add_directory_name)
                      }}
                    />
                  </Form.Group>
                </Container>
              </Modal.Body>
            )}
          </Form>
        </Modal>
      }
    </div>
  )
}

export default Add
