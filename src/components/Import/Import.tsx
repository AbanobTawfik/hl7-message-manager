import React, { FC, useMemo, useState } from "react";
// @ts-ignore
import styles from "./Import.module.scss";
import { FaUpload } from "react-icons/fa";
import { Col, Container, Form, Modal, Row } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import * as dba from "../../services/database";
import { useDispatch, useSelector } from "react-redux";

// update all state from this
import { import_dictionary } from "../../state/slices/map_slice.js";
import { change_current_directory_no_save } from "../../state/slices/current_directory_slice";

function Import() {
  const global_state = useSelector((state) => state);
  const dispatch = useDispatch();
  const [is_open, toggle_modal] = useState(false);

  const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#eeeeee",
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    color: "#bdbdbd",
    outline: "none",
    transition: "border .24s ease-in-out",
  };

  const focusedStyle = {
    borderColor: "#2196f3",
  };

  const acceptStyle = {
    borderColor: "#00e676",
  };

  const rejectStyle = {
    borderColor: "#ff1744",
  };

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    maxFiles: 1,
    accept: {
      "application/json": [".json", ".JSON"],
    },
  });
  const files = acceptedFiles.map((file) => (
    // @ts-ignore
    <li key={file.path}>{file.path}</li>
  ));
  console.log(files);
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const update_map = () => {
    let reader = new FileReader();
    reader.readAsText(acceptedFiles[0]);
    reader.onload = () => {
      if (!!reader.result) {
        dba.import_message_manager(reader.result);
        dispatch(
          change_current_directory_no_save(
            window.localStorage.getItem("current_directory")
          )
        );
        dispatch(import_dictionary({}));
      }
    };
  };

  return (
    <div className={styles.Import} data-testid="Import">
      <Col xs={12} md={6} lg={2} xl={3} sm={6}>
        Import
        <FaUpload
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          onClick={() => {
            toggle_modal(true);
          }}
        />
        <Modal
          className={styles.DropDown}
          show={is_open}
          // onAfterOpen={afterOpenModal}
          onHide={() => {
            toggle_modal(false);
          }}
          size="lg"
        >
          <Form>
            <Modal.Header closeButton className="show-grid">
              <Container className={styles.Import}>
                <Row>
                  <Modal.Title>Import Message Manager</Modal.Title>
                </Row>
                <hr />
              </Container>
            </Modal.Header>
            <Modal.Body>
              <Form.Label style={{ fontWeight: 800 }}>Upload File</Form.Label>
              <div
                {...getRootProps({
                  // @ts-ignore
                  style,
                })}
              >
                <input {...getInputProps()} />
                <p>Upload your message manager import here</p>
                <em>(Drag 'n' drop or click to upload!)</em>
              </div>
              <Form.Label style={{ fontWeight: 800 }}>Chosen file</Form.Label>

              <p> {files}</p>
            </Modal.Body>

            <Modal.Footer>
              {" "}
              <div onClick={update_map} className="btn btn-outline-primary">
                Upload
              </div>
            </Modal.Footer>
          </Form>
        </Modal>
      </Col>
    </div>
  );
}

export default Import;
