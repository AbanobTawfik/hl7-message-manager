import React, { useState, useCallback } from "react";
// @ts-ignore
import styles from "./Message.module.scss";
// @ts-ignore
// @ts-ignore
import message_icon from "../../resources/Icons/message.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Row, Container, Col, Form } from "react-bootstrap";
import {
  FaCopy,
  FaEdit,
  FaSave,
  FaEye,
  FaBookOpen,
  FaFolder,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import {
  modify_message,
  remove_message,
} from "../../state/slices/map_slice.js";
import { change_current_directory } from "../../state/slices/current_directory_slice";
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

function useHookWithRefCallBack(ref) {
  const set_scripts_ref = useCallback(
    (node) => {
      ref.current = node;
      if (ref.current)
        ref.current.style.height = ref.current.scrollHeight + "px";
    },
    [ref]
  );
  return set_scripts_ref;
}

export function Message({ message }) {
  const { show } = useContextMenu({
    id: message.id,
  });

  const [is_open, toggle_modal] = useState(false);
  const [is_saveable, toggle_save] = useState(false);
  const [is_editing, toggle_edit] = useState(false);
  const [has_focus, toggle_focus] = useState(false);
  const [view_notes, toggle_notes] = useState(false);

  // @ts-ignore
  const dispatch = useDispatch();

  let all_scripts_string = "";
  if (message.scripts.length > 0) {
    all_scripts_string = message.scripts
      .slice(1)
      .reduce(
        (previous_value, current_value) =>
          previous_value + "\n" + current_value,
        message.scripts[0]
      );
  }
  const modify_interface = React.createRef();
  const modify_interface_ref = useHookWithRefCallBack(modify_interface);
  const modify_description = React.createRef();
  const modify_description_ref = useHookWithRefCallBack(modify_description);
  const modify_scripts = React.createRef();
  const modify_scripts_ref = useHookWithRefCallBack(modify_scripts);
  const modify_data = React.createRef();
  const modify_data_ref = useHookWithRefCallBack(modify_data);
  const modify_notes = React.createRef();
  const modify_notes_ref = useHookWithRefCallBack(modify_notes);
  const modal_ref = React.createRef();

  const check_message_changes = () => {
    return (
      // @ts-ignore
      (modify_interface.current.value !== message.comserver ||
        // @ts-ignore
        modify_description.current.value !== message.description ||
        // @ts-ignore
        modify_scripts.current.value !== all_scripts_string ||
        // @ts-ignore
        modify_data.current.value !== message.raw_message ||
        // @ts-ignore
        modify_notes.current.value !== message.notes) &&
      // @ts-ignore
      modify_description.current.value !== ""
    );
  };

  const modify_message_dispatch = () => {
    if (is_saveable) {
      // clean up the scripts into array
      let array_scripts: any[] = [];
      // @ts-ignore
      if (modify_scripts.current.value !== "") {
        // @ts-ignore
        array_scripts = modify_scripts.current.value.split("\n");
        if (array_scripts.length == 1) {
          // @ts-ignore
          array_scripts = modify_scripts.current.value.split(",");
        }
      }
      array_scripts = array_scripts.map((element) => {
        return element.trim();
      });
      const modify_message_payload = {
        message: message,
        // @ts-ignore
        raw_message: modify_data.current.value,
        // @ts-ignore
        comserver: modify_interface.current.value,
        scripts: array_scripts,
        // @ts-ignore
        description: modify_description.current.value,
        // @ts-ignore
        notes: modify_notes.current.value,
      };
      console.log(modify_message_payload);
      dispatch(modify_message(modify_message_payload));
      toggle_save(false);
      toggle_edit(false);
    }
  };

  const remove_message_dispatch = () => {
    dispatch(remove_message({ message: message }));
  };

  const view_change = () => {
    toggle_modal(true);
  };

  const edit_change = () => {
    toggle_modal(true);
    toggle_edit(true);
  };

  const handleTextAreaInput = (e, ref) => {
    if (e.key === "Tab") {
      e.preventDefault();
      let start = ref.current.selectionStart;
      var end = ref.current.selectionEnd;

      ref.current.value =
        ref.current.value.substring(0, start) +
        "    " +
        ref.current.value.substring(end);
      ref.current.selectionStart = start + 4;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      ref.current.blur();
      // @ts-ignore
      modal_ref.current.focus();
    }
  };

  const handleInputInput = (e, ref) => {
    if (e.key === "Escape") {
      e.preventDefault();
      ref.current.blur();
      // @ts-ignore
      modal_ref.current.focus();
    }
  };

  const handleContextMenu = useCallback(
    (event) => {
      if (is_open) {
        return;
      }
      event.preventDefault();
      show(event);
    },
    [is_open, message.id]
  );

  return (
    <div
      className={styles.Message}
      data-testid="Message"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!has_focus && is_open) {
          if (e.key === "Enter") {
            if (is_editing && is_saveable) {
              modify_message_dispatch();
            }
          }
          if (e.key === "e") {
            toggle_notes(false);
            toggle_edit(true);
            // @ts-ignore
            modal_ref.current.focus();
          }
          if (e.key === "v") {
            toggle_edit(false);
            toggle_notes(false);
            // @ts-ignore
            modal_ref.current.focus();
          }
          if (e.key === "n") {
            toggle_edit(false);
            toggle_notes(true);
            // @ts-ignore
            modal_ref.current.focus();
          }
        }
      }}
    >
      <img
        className="img-fluid"
        style={{ cursor: "pointer", maxHeight: "100px", maxWidth: "100px" }}
        onContextMenu={handleContextMenu}
        src={message_icon}
        onClick={() => {
          toggle_modal(true);
        }}
      />
      <br />
      {message.description}
      {
        <Modal
          show={is_open}
          // onAfterOpen={afterOpenModal}
          onHide={() => {
            toggle_modal(false);
            toggle_edit(false);
            toggle_focus(false);
            toggle_notes(false);
            toggle_save(false);
          }}
          tabIndex={-1}
          size="lg"
        >
          <Modal.Header
            closeButton
            className="show-grid"
            tabIndex={1}
            // @ts-ignore
            ref={modal_ref}
          >
            <Container className={styles.Message}>
              <Row>
                <Modal.Title>
                  {!is_editing && !view_notes && "File View"}{" "}
                  {is_editing && !view_notes && "File Edit"}{" "}
                  {!is_editing && view_notes && message.description + " Notes"}
                </Modal.Title>
              </Row>
              <hr />
              <Row style={{ fontSize: "0.98rem" }}>
                <Col xs={12} md={6} lg={2} xl={2} sm={6}>
                  Copy
                  <br />
                  <FaCopy
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "2.5rem",
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        message.raw_message.replace(/(\r\n|\r)/gm, "\r")
                      );
                      toast.dismiss();
                      toast.success("Data Copied to Clipboard", {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                      });
                    }}
                  />
                </Col>
                <Col xs={12} md={6} lg={2} xl={2} sm={6}>
                  {!is_editing && "Edit"}
                  {is_editing && "View"}
                  <br />
                  {is_editing && (
                    <FaEye
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "2.5rem",
                      }}
                      onClick={() => {
                        toggle_notes(false);
                        toggle_edit(!is_editing);
                      }}
                    />
                  )}
                  {!is_editing && (
                    <FaEdit
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "2.5rem",
                      }}
                      onClick={() => {
                        toggle_notes(false);
                        toggle_edit(!is_editing);
                      }}
                    />
                  )}
                </Col>
                <Col xs={12} md={6} lg={2} xl={2} sm={6}>
                  {view_notes && "View"}
                  {view_notes && <br /> && (
                    <FaEye
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "2.5rem",
                      }}
                      onClick={() => {
                        if (view_notes) {
                          toggle_notes(false);
                        } else {
                          toggle_edit(false);
                          toggle_notes(true);
                        }
                      }}
                    />
                  )}
                  {!view_notes && "Notes"}{" "}
                  {!view_notes && <br /> && (
                    <FaBookOpen
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "2.5rem",
                      }}
                      onClick={() => {
                        if (view_notes) {
                          toggle_notes(false);
                        } else {
                          toggle_edit(false);
                          toggle_notes(true);
                        }
                      }}
                    />
                  )}
                </Col>
                <Col xs={12} md={6} lg={2} xl={2} sm={6}>
                  Save
                  <br />
                  <FaSave
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "2.5rem",
                      // @ts-ignore
                      cursor: is_saveable ? "pointer" : "not-allowed",
                    }}
                    onClick={modify_message_dispatch}
                  />
                </Col>
                <Col xs={12} md={6} lg={2} xl={2} sm={6}>
                  Location
                  <br />
                  <FaFolder
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "2.5rem",
                    }}
                    onClick={() => {
                      dispatch(
                        change_current_directory(message.directory_path)
                      );
                      toggle_modal(false);
                    }}
                  />
                </Col>
              </Row>
            </Container>
          </Modal.Header>
          <Modal.Body>
            {is_editing && !view_notes && (
              <Form>
                <Container>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label style={{ fontWeight: 800 }}>
                      {" "}
                      Message Description* (required)
                    </Form.Label>
                    <Form.Control
                      required
                      defaultValue={message.description}
                      ref={modify_description_ref}
                      style={{ fontWeight: 300, minHeight: "2.4rem" }}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      onChange={() => {
                        toggle_save(check_message_changes());
                      }}
                      onKeyDown={(e) => {
                        handleInputInput(e, modify_description);
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label style={{ fontWeight: 800 }}>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      defaultValue={message.notes}
                      ref={modify_notes_ref}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      style={{
                        minHeight: "5rem",
                        overflow: "hidden",
                        fontWeight: 300,
                      }}
                      onChange={() => {
                        toggle_save(check_message_changes());
                        // @ts-ignore
                        modify_notes.current.style.height = "0px";
                        // @ts-ignore
                        modify_notes.current.style.height =
                          // @ts-ignore
                          modify_notes.current.scrollHeight + "px";
                      }}
                      onKeyDown={(e) => {
                        handleTextAreaInput(e, modify_notes);
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label style={{ fontWeight: 800 }}>Data</Form.Label>
                    <Form.Control
                      as="textarea"
                      defaultValue={message.raw_message}
                      // @ts-ignore
                      ref={modify_data_ref}
                      autoComplete="off"
                      style={{
                        minHeight: "5rem",
                        overflow: "hidden",
                        fontWeight: 300,
                      }}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      onChange={() => {
                        toggle_save(check_message_changes());
                        // @ts-ignore
                        modify_data.current.style.height = "0px";
                        // @ts-ignore
                        modify_data.current.style.height =
                          // @ts-ignore
                          modify_data.current.scrollHeight + "px";
                      }}
                      onKeyDown={(e) => {
                        handleTextAreaInput(e, modify_data);
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label style={{ fontWeight: 800 }}>
                      Interface
                    </Form.Label>
                    <Form.Control
                      defaultValue={message.comserver}
                      ref={modify_interface_ref}
                      style={{ fontWeight: 300, minHeight: "2.4rem" }}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      onChange={() => {
                        toggle_save(check_message_changes());
                      }}
                      onKeyDown={(e) => {
                        handleInputInput(e, modify_interface);
                      }}
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label style={{ fontWeight: 800 }}>Scripts</Form.Label>
                    <Form.Control
                      as="textarea"
                      defaultValue={all_scripts_string}
                      ref={modify_scripts_ref}
                      onFocus={() => toggle_focus(true)}
                      onBlur={() => toggle_focus(false)}
                      style={{
                        minHeight: "5rem",
                        overflow: "hidden",
                        fontWeight: 300,
                      }}
                      onChange={() => {
                        toggle_save(check_message_changes());
                        // @ts-ignore
                        modify_scripts.current.style.height = "0px";
                        // @ts-ignore
                        modify_scripts.current.style.height =
                          // @ts-ignore
                          modify_scripts.current.scrollHeight + "px";
                      }}
                      onKeyDown={(e) => {
                        handleTextAreaInput(e, modify_scripts);
                      }}
                    />
                  </Form.Group>
                </Container>
              </Form>
            )}
            {!is_editing && !view_notes && (
              <div>
                <Container>
                  <Row style={{ fontWeight: 800 }}>Description</Row>
                  <Row style={{ fontWeight: 300 }}>{message.description}</Row>
                  <div className={styles.astrodivider}>
                    <div className={styles.astrodividermask}></div>
                    <span>
                      <i>&#10038;</i>
                    </span>
                  </div>
                  {message.comserver !== "" && (
                    <div>
                      <Row style={{ fontWeight: 800 }}>Interface</Row>
                      <Row style={{ fontWeight: 300 }}>{message.comserver}</Row>
                      <div className={styles.astrodivider}>
                        <div className={styles.astrodividermask}></div>
                        <span>
                          <i>&#10038;</i>
                        </span>
                      </div>
                    </div>
                  )}
                  {message.scripts.length !== 0 && (
                    <div>
                      <Row style={{ fontWeight: 800 }}>Scripts</Row>
                      <Row style={{ whiteSpace: "pre-line", fontWeight: 300 }}>
                        {all_scripts_string}
                      </Row>
                      <div className={styles.astrodivider}>
                        <div className={styles.astrodividermask}></div>
                        <span>
                          <i>&#10038;</i>
                        </span>
                      </div>
                    </div>
                  )}
                  {message.raw_message && (
                    <div>
                      <Row style={{ fontWeight: 800 }}>Data</Row>
                      <Row style={{ whiteSpace: "pre-line", fontWeight: 300 }}>
                        {message.raw_message}
                      </Row>
                      <div className={styles.astrodivider}>
                        <div className={styles.astrodividermask}></div>
                        <span>
                          <i>&#10038;</i>
                        </span>
                      </div>
                    </div>
                  )}
                </Container>
              </div>
            )}
            {!is_editing && view_notes && (
              <div>
                <Container>
                  <Row style={{ fontWeight: 800 }}>Your Notes</Row>
                  <Row style={{ whiteSpace: "pre-line", fontWeight: 300 }}>
                    {message.notes}
                  </Row>
                  <div className={styles.astrodivider}>
                    <div className={styles.astrodividermask}></div>
                    <span>
                      <i>&#10038;</i>
                    </span>
                  </div>
                </Container>
              </div>
            )}
          </Modal.Body>
        </Modal>
      }
      {!is_open && (
        <Menu id={message.id}>
          <Item onClick={view_change}>View</Item>
          <Item onClick={edit_change}>Edit</Item>
          <Item onClick={remove_message_dispatch}>Remove</Item>
        </Menu>
      )}
    </div>
  );
}

export default Message;
