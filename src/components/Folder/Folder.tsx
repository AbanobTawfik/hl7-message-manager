import React, { FC, useState, useCallback } from 'react'
import styles from './Folder.module.scss'
import folder_icon from '../../resources/Icons/folder.png'
import directory from '../../types/directory'
import { useSelector, useDispatch } from 'react-redux'
import { change_current_directory } from '../../state/slices/current_directory_slice.js'
import * as mapper from '../../types/directory'
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify'
import { Modal, Button, Row, Container, Col, Form } from 'react-bootstrap'
import { FaSave } from 'react-icons/fa'
import {
  remove_directory,
  modify_directory
} from '../../state/slices/map_slice.js'

// folder component, takes in directory and shows just the name of the current directory
export function Folder ({ folder }) {
  const [is_open, toggle_modal] = useState(false)
  const [is_saveable, toggle_save] = useState(false)
  const [has_focus, toggle_focus] = useState(false)
  const dispatch = useDispatch()
  const dir_name = mapper.get_path_from_root(folder)
  const modify_directory_name = React.createRef()
  const modal_ref = React.createRef()

  const modify_directory_dispatch = () => {
    if (is_saveable) {
      const remove_directory_payload = {
        directory_path: folder.name,
        directory_string: dir_name,
        name: modify_directory_name.current.value
      }
      dispatch(modify_directory(remove_directory_payload))
    }
  }

  const remove_directory_dispatch = () => {
    const remove_directory_payload = {
      directory_string: dir_name
    }
    dispatch(remove_directory(remove_directory_payload))
  }

  const { show } = useContextMenu({
    id: dir_name
  })
  const handleContextMenu = useCallback(
    event => {
      if (is_open) {
        return
      }
      event.preventDefault()
      show(event)
    },
    [is_open, dir_name]
  )

  const handleInputInput = (e, ref) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      ref.current.blur()
      modal_ref.current.focus()
    }
    if (e.key === 'Enter') {
      if (is_saveable) {
        modify_directory_dispatch()
      }
    }
  }

  return (
    <div
      className={styles.Folder}
      data-testid='Folder'
      style={{ cursor: 'pointer' }}
      onContextMenu={handleContextMenu}
      tabIndex={-1}
      onKeyDown={e => {
        if (!has_focus && is_open) {
          console.log('HI')
          if (e.key === 'Enter') {
            if (is_saveable) {
              modify_directory_dispatch()
            }
          }
        }
      }}
    >
      <div>
        <img
          className='img-fluid'
          style={{ maxHeight: '100px', maxWidth: '100px' }}
          onClick={() => {
            dispatch(change_current_directory(dir_name))
          }}
          src={folder_icon}
        />
        <br />
        <p style={{ marginTop: '-1.0rem' }}>{folder.name}</p>
      </div>
      <Modal
        show={is_open}
        // onAfterOpen={afterOpenModal}
        onHide={() => {
          toggle_modal(false)
        }}
        size='lg'
      >
        <Form tabIndex={1} ref={modal_ref}>
          <Modal.Header closeButton className='show-grid'>
            <Container className={styles.Add}>
              <Row>
                <Modal.Title> Change folder name </Modal.Title>
              </Row>
              <hr />
              <Row style={{ fontSize: '0.98rem' }}>
                <Col xs={12} md={6} lg={2} xl={3} sm={6}>
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
                    onClick={modify_directory_dispatch}
                  />
                </Col>
              </Row>
            </Container>
          </Modal.Header>

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
                  ref={modify_directory_name}
                  defaultValue={folder.name}
                  onChange={() => {
                    // @ts-ignore
                    toggle_save(
                      modify_directory_name.current.value != folder.name &&
                        modify_directory_name.current.value != ''
                    )
                  }}
                  onFocus={() => toggle_focus(true)}
                  onBlur={() => toggle_focus(false)}
                  onKeyDown={e => {
                    handleInputInput(e, modify_directory_name)
                  }}
                />
              </Form.Group>
            </Container>
          </Modal.Body>
        </Form>
      </Modal>
      {!is_open && (
        <Menu id={dir_name}>
          <Item
            onClick={() => {
              toggle_modal(true)
            }}
          >
            Rename{' '}
          </Item>

          <Item onClick={remove_directory_dispatch}>Remove </Item>
        </Menu>
      )}
    </div>
  )
}
export default Folder
