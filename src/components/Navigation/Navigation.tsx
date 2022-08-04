import React, { FC, useCallback, useState } from 'react';
import { Container, Navbar, Form, Button, Row, Col } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import { useDispatch } from 'react-redux'
import { change_current_directory, change_current_directory_no_save } from '../../state/slices/current_directory_slice'
import { search_map } from '../../state/slices/map_slice'
import { FaHome } from 'react-icons/fa'
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify'
import styles from './Navigation.module.scss'
import 'react-contexify/dist/ReactContexify.css'
import DropDown from '../DropDown/DropDown'

interface NavProps { }

export function Navigation() {
  
  const { show } = useContextMenu({
    id: "filter"
  })
  const handleContextMenu = useCallback(
    event => {
      show(event)
    },
    ["filter"]
  )

  const search = React.createRef()
  const dispatch = useDispatch()

  const send_search_query = () => {
    // we will create a new Directory, with no parent called search result, this is a temporary special directory
    // this directory will not be saved, but contain just the search results of the query (note no call to write_file in dictionary)
    // inside messages we will have link to directory if user wants to access directory. This will be simpler than having
    // different "search states"

    // grab the query
    const search_params = search.current.value;
    if (search_params != "") {
      console.log(search_params)
      dispatch(search_map({ search_query: search_params, parent_directory: current_directory_path.path }))
      // switch current directory to search result directory
      dispatch(change_current_directory_no_save('Search Results'))
    }
  }

  return (
    <div       className={styles.Nav}    >
      <Navbar bg="dark" variant="dark" style={{ width: '100%' }}>
        <Container>
          <Row style={{ width: 'inherit', textAlign: 'initial' }}>
            <Col sm={12} md={3}>
              <div>
                <Navbar.Brand style={{ cursor: 'pointer' }} onClick={() => { dispatch(change_current_directory('root')) }}><FaHome style={{marginRight:"10px"}}/>Home</Navbar.Brand>
              </div>
            </Col>

            <Col sm={10} md={6}>
              <Form >

                <Form.Control ref={search} type="text" placeholder="Search" className="mr-sm-2" style={{ display: 'initial' }} />
              </Form>
            </Col>
            <Col sm={2} md={1}>
              <DropDown />
            </Col>

            <Col sm={12} md={2}>
              <Form >
                <Button variant="outline-success" style={{ verticalAlign: 'baseline' }} onClick={send_search_query}>Search</Button>
              </Form>
            </Col>

          </Row>
        </Container>
      </Navbar>
    </div>
  );
}

export default Navigation;
