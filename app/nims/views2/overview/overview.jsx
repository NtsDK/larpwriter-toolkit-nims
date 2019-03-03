import React, { Component } from 'react';

// import Header from '../header';
// import RandomPlanet from '../random-planet';
// import ErrorBoundry from '../error-boundry';
// import SwapiService from '../../services/swapi-service';
// import DummySwapiService from '../../services/dummy-swapi-service';

// import {
//   PeoplePage,
//   PlanetsPage,
//   StarshipsPage,
//   LoginPage,
//   SecretPage } from '../pages';

// import { SwapiServiceProvider } from '../swapi-service-context';


import './overview.css';

import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Datetime from 'react-datetime';
// import { Container } from 'winston';
// import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
// import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';
// import Navbar from 'react-bootstrap/lib/Navbar';
// import NavItem  from 'react-bootstrap/lib/NavItem';


const Overview = () => (
  <Container fluid>
    <Row>
      <Col>
        <Card body>
          <Form>
            <Form.Row>
              <Form.Group as={Col} controlId="gameName">
                <Form.Label>Название игры</Form.Label>
                <Form.Control type="text" placeholder="" />
              </Form.Group>
              <Form.Group as={Col} controlId="eventRangeStart">
                <Form.Label>Дата начала доигровых событий</Form.Label>
                <Datetime />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col} controlId="">
                <Form.Label>Время последнего сохранения базы</Form.Label>
                {/* <Form.Control type="text" placeholder="" /> */}
                <Form.Control plaintext readOnly defaultValue="some date" />
              </Form.Group>
              <Form.Group as={Col} controlId="eventRangeEnd">
                <Form.Label>Дата окончания доигровых событий</Form.Label>
                <Datetime />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col} controlId="gameName">
                <Form.Label>Описание</Form.Label>
                {/* <Form.Control type="text" placeholder="" /> */}
                <Form.Control as="textarea" placeholder="" />
                {/* <Form.Control plaintext readOnly defaultValue="some date" /> */}
              </Form.Group>
              {/* <Form.Group as={Col} controlId="gameName">
                <Form.Label>Дата окончания доигровых событий</Form.Label>
                <Datetime />
              </Form.Group> */}
            </Form.Row>
          </Form>

        </Card>
      </Col>
    </Row>
  </Container>
  // <Navbar bg="light" variant="primary" expand="lg">
  //   {/* <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand> */}
  //   {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
  //       <Navbar.Collapse id="basic-navbar-nav"> */}
  //   <Nav className="mr-auto" variant="tabs" defaultActiveKey="#overview">
  //     <LinkContainer to="/overview">
  //       <Nav.Link>Обзор</Nav.Link>
  //     </LinkContainer>
  //     {/* <Nav.Link href="#link">Link</Nav.Link> */}
  //     <NavDropdown title="Персонажи">
  //       <LinkContainer to="/characterProfiles">
  //         <NavDropdown.Item>Заполнение досье</NavDropdown.Item>
  //       </LinkContainer>
  //       <LinkContainer to="/characterProfileSchema">
  //         <NavDropdown.Item>Изменение структуры досье</NavDropdown.Item>
  //       </LinkContainer>
  //       <LinkContainer to="/profileBindings">
  //         <NavDropdown.Item>Сопоставление персонажей и игроков</NavDropdown.Item>
  //       </LinkContainer>
  //     </NavDropdown>
  //     <LinkContainer to="/stories">
  //       <Nav.Link>Истории</Nav.Link>
  //     </LinkContainer>
  //     <LinkContainer to="/subjectiveVisions">
  //       <Nav.Link>Адаптации</Nav.Link>
  //     </LinkContainer>
  //     <NavDropdown title="Вводные">
  //       <LinkContainer to="/characterSheetsPreview">
  //         <NavDropdown.Item>Предварительный просмотр</NavDropdown.Item>
  //       </LinkContainer>
  //       <LinkContainer to="/characterSheetsExport">
  //         <NavDropdown.Item>Экспорт</NavDropdown.Item>
  //       </LinkContainer>
  //     </NavDropdown>
  //   </Nav>
  // </Navbar>
);

export default Overview;
