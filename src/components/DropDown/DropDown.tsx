import React, { FC, useState } from 'react'
import styles from './DropDown.module.scss'
import { FaCog, FaSearch, FaCheckDouble, FaCheck } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Container, Form, Modal, Row } from 'react-bootstrap'
import Multiselect from 'multiselect-react-dropdown'

interface DropDownProps {}

export function DropDown () {
  const global_state = useSelector(state => state)
  // @ts-ignore
  const current_directory_path = global_state.current_directory
  // @ts-ignore
  const script_map_string = global_state.map.script_comserver_map_string
  const script_map = new Map(JSON.parse(script_map_string))
  const comserver_map_string = global_state.map.comserver_script_map_string
  const comserver_map = new Map(JSON.parse(comserver_map_string))
  // need to get all scripts and all comservers, can be easily gathered from above maps^^, get all entries ez pz
  const all_scripts = [...script_map.keys()].map(value => {
    return { name: value }
  })
  const all_comservers = [...comserver_map.keys()].map(value => {
    return { name: value }
  })
  all_scripts.splice(0, 0, { name: '' })
  all_scripts.splice(all_scripts.length - 1, 1)
  all_comservers.splice(0, 0, { name: '' })
  const [is_open, toggle_modal] = useState(false)
  const [is_multi_select, toggle_multi_select] = useState(false)

  const [script_selection, set_script_selection] = useState(all_scripts)
  const [comserver_selection, set_comserver_selection] = useState(
    all_comservers
  )

  const comserver_ref = React.createRef()
  const script_ref = React.createRef()
  const search_ref = React.createRef()

  const dispatch = useDispatch()

  const filter_scripts = value => {
    let filtered_scripts = comserver_map.has(value)
      ? comserver_map.get(value).map(value => {
          return { name: value }
        })
      : all_scripts
    if (filtered_scripts[0].name !== '') {
      filtered_scripts.splice(0, 0, { name: '' })
    }
    set_script_selection(filtered_scripts)
  }

  const filter_comservers = value => {
    let filtered_comservers = script_map.has(value)
      ? script_map.get(value).map(value => {
          return { name: value }
        })
      : all_comservers
    if (filtered_comservers[0].name !== '') {
      filtered_comservers.splice(0, 0, { name: '' })
    }
    set_comserver_selection(filtered_comservers)
  }

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
                <Modal.Title>
                  {' '}
                  {is_multi_select && 'Multi Select Filter'}{' '}
                  {!is_multi_select && 'Single Select Filter'}{' '}
                </Modal.Title>
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
            <Form.Label style={{ fontWeight: 800 }}>Query</Form.Label>
            <Form.Control
              ref={search_ref}
              type='text'
              placeholder='Search'
              className='mr-sm-2'
              style={{ display: 'initial' }}
            />
            <br />
            <hr />
            <Container>
              <Form.Group
                className='mb-3'
                controlId='exampleForm.ControlInput1'
              >
                {is_multi_select && (
                  <div>
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Comservers
                    </Form.Label>
                    <Multiselect
                      ref={comserver_ref}
                      options={all_comservers} // Options to display in the dropdown
                      displayValue='name'
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                    <br />
                    <br />
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Scripts
                    </Form.Label>
                    <Multiselect
                      ref={script_ref}
                      options={all_scripts} // Options to display in the dropdown
                      displayValue='name'
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                  </div>
                )}

                {!is_multi_select && (
                  <div>
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Comservers
                    </Form.Label>
                    <Multiselect
                      ref={comserver_ref}
                      singleSelect={true}
                      options={comserver_selection} // Options to display in the dropdown
                      displayValue='name'
                      onSelect={value => {
                        filter_scripts(value[0].name)
                      }}
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                    <br />
                    <br />
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Scripts
                    </Form.Label>
                    <Multiselect
                      ref={script_ref}
                      singleSelect={true}
                      onSelect={value => {
                        filter_comservers(value[0].name)
                      }}
                      options={script_selection} // Options to display in the dropdown
                      displayValue='name'
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
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
