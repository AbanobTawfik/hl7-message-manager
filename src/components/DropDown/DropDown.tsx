import React, { FC, useState } from 'react'
import styles from './DropDown.module.scss'
import { FaCog, FaSearch, FaCheckDouble, FaCheck } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { Col, Container, Form, Modal, Row } from 'react-bootstrap'

interface DropDownProps {}

export function DropDown () {
  const global_state = useSelector(state => state)
  // @ts-ignore
  const current_directory_path = global_state.current_directory
  // @ts-ignore
  const script_map_string = global_state.map.comserver_script_map_string
  const script_map = new Map(JSON.parse(script_map_string))
  const comserver_map_string = global_state.map.script_comserver_map_string
  const comserver_map = new Map(JSON.parse(comserver_map_string))
  // need to get all scripts and all comservers, can be easily gathered from above maps^^, get all entries ez pz
  const all_scripts = [...script_map.keys()]
  const all_comservers = [...comserver_map.keys()]

  const [is_open, toggle_modal] = useState(false)
  const [is_multi_select, toggle_multi_select] = useState(false)
  const [selection, setSelection] = useState([])
  const modal_ref = React.createRef()

  return (
    <div className={styles.DropDown}>
      <FaCog
        style={{ cursor: 'pointer' }}
        onClick={() => {
          toggle_modal(true)
        }}
      ></FaCog>{' '}
      <Modal
        className={styles.DropDown}
        show={is_open}
        // onAfterOpen={afterOpenModal}
        onHide={() => {
          toggle_modal(false)
        }}
        size='lg'
      >
        <Form>
          <Modal.Header closeButton className='show-grid'>
            <Container className={styles.Add}>
              <Row>
                <Modal.Title> Filter </Modal.Title>
              </Row>
              <hr />
              <Row style={{ fontSize: '0.98rem' }}>
                <Col xs={12} md={6} lg={2} xl={3} sm={6}>
                  Search
                  <br />
                  <FaSearch
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => {}}
                  />
                </Col>
                <Col xs={12} md={6} lg={2} xl={3} sm={6}>
                  {is_multi_select && 'Single Select'}
                  {!is_multi_select && 'Multi Select'}
                  <br />
                  {is_multi_select && (
                    <FaCheck
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        toggle_multi_select(false)
                      }}
                    />
                  )}
                  {!is_multi_select && (
                    <FaCheckDouble
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        toggle_multi_select(true)
                      }}
                    />
                  )}
                  <br />
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
                {is_multi_select && (
                  <div>
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Scripts
                    </Form.Label>
                    <Form.Select aria-label='Floating label select example'>
                      <option>Open this select menu</option>
                      <option value='1'>One</option>
                      <option value='2'>Two</option>
                      <option value='3'>Three</option>
                    </Form.Select>
                  </div>
                )}
                {/* {!is_multi_select && ()} */}
              </Form.Group>
            </Container>
          </Modal.Body>
        </Form>
      </Modal>
    </div>
  )
}

export default DropDown
