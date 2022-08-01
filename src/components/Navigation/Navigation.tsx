import React, { FC } from 'react';
import { Container, Navbar, Form, Button } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import styles from './Nav.module.scss';

interface NavProps { }

export function Navigation() {
  return (<Navbar bg="dark" variant="dark" fixed='top'>
    <Container>
      <Nav className="me-auto">
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">

            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#products">Products</Nav.Link>
            <Nav.Link href="#aboutus">About Us</Nav.Link>
            <Nav.Link href="#contactus">Contact Us</Nav.Link>
            <Form>
              <Form.Control type="text" placeholder="Search" className="mr-sm-2" />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Nav>
        </Navbar.Collapse>

      </Nav>
    </Container>
  </Navbar>
  );
}

export default Navigation;
