import React, { FC, useState, useMemo } from 'react';
// @ts-ignore
import styles from './Dictionary.module.scss';
// @ts-ignore
import Folder from '../Folder/Folder'
// @ts-ignore
import * as dba from "../../services/database"
// @ts-ignore
import * as mapper from "../../services/dictionary"
// @ts-ignore
import Window from "../Window/Window"
import { useSelector, useDispatch } from 'react-redux'
import { change_current_directory } from '../../state/slices/current_directory_slice.js'
import { stringify, parse } from 'circular-json'
import Back from '../Back/Back';
import { Col, Container, Row } from 'react-bootstrap';

interface DictionaryProps { }



export function Dictionary(DictionaryProps) {
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const current_directory_path = global_state.current_directory
  // @ts-ignore
  const dictionary: Map<number, directory> = new Map(parse(global_state.map.map_string))
  const dispatch = useDispatch();
  const current_directory = mapper.get_directory_by_name(dictionary, current_directory_path.path)
  return (<div className={styles.Dictionary} data-testid="Dictionary">
    {
      <div>
        <div style={{justifyContent:"center", textAlign:"center"}}>

          <Container style={{display:"flex", width:"100%", maxWidth: "90%", margin: "0 auto",justifyContent:"center"}}>
            <Row style={{display:"flex", width:"100%", maxWidth: "70%", margin: "0 auto",justifyContent:"center", marginBottom:"2%"}}>
              <Col sm={1}>
                <Back />
              </Col>
              <Col style={{textAlign:'left'}}sm={11}>
                {current_directory_path.path}
              </Col>
            </Row>
          </Container>
        </div>
        {<Window current_directory={current_directory} />}
      </div>
    }
  </div>);
}


export default Dictionary;
