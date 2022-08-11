import React, { useCallback } from "react";
// @ts-ignore
import styles from "./Dictionary.module.scss";
// @ts-ignore
import * as mapper from "../../services/dictionary";
// @ts-ignore
import Window from "../Window/Window";
import { useSelector, useDispatch } from "react-redux";
import { parse } from "circular-json";
import Back from "../Back/Back";
import { Col, Container, Row } from "react-bootstrap";
import { Item, Menu, useContextMenu } from "react-contexify";
import { paste_general } from "../../state/slices/map_slice";

export function Dictionary(DictionaryProps) {
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const current_directory_path = global_state.current_directory;
  // @ts-ignore
  const dictionary: Map<number, directory> = new Map(
    // @ts-ignore
    parse(global_state.map.map_string)
  );
  const dispatch = useDispatch();
  const { show } = useContextMenu({
    id: "PASTE",
  });
  const handleContextMenu = useCallback((event) => {
    console.log(event.target.className);
    if (event.target.className !== "img-fluid") {
      event.preventDefault();
      show(event);
    }
  }, []);

  const paste_current_directory = () => {
    dispatch(paste_general({}));
  };

  const current_directory = mapper.get_directory_by_name(
    dictionary,
    current_directory_path.path
  );
  console.log(current_directory);
  return (
    <div
      className={styles.Dictionary}
      data-testid="Dictionary"
      onContextMenu={handleContextMenu}
    >
      {
        <div>
          <div style={{ justifyContent: "center", textAlign: "center" }}>
            <Container
              style={{
                display: "flex",
                width: "100%",
                maxWidth: "90%",
                margin: "0 auto",
                justifyContent: "center",
              }}
            >
              <Row
                style={{
                  display: "flex",
                  width: "100%",
                  maxWidth: "70%",
                  margin: "0 auto",
                  justifyContent: "center",
                  marginBottom: "2%",
                }}
              >
                <Col sm={1}>
                  <Back />
                </Col>
                <Col style={{ textAlign: "left" }} sm={11}>
                  {current_directory_path.path}
                </Col>
              </Row>
            </Container>
          </div>
          {<Window current_directory={current_directory} />}
        </div>
      }
      <Menu id={"PASTE"}>
        <Item onClick={paste_current_directory}>Paste</Item>
      </Menu>
    </div>
  );
}

export default Dictionary;
