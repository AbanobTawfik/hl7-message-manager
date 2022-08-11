import React, { useState } from "react";
// @ts-ignore
import styles from "./DropDown.module.scss";
import { FaCog, FaSearch, FaCheckDouble, FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Col, Container, Form, Modal, Row } from "react-bootstrap";
import Multiselect from "multiselect-react-dropdown";
import { search_filtered } from "../../state/slices/map_slice";
import { change_current_directory_no_save } from "../../state/slices/current_directory_slice";

function reviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}
const prefix = "root/";
export function DropDown() {
  const global_state = useSelector((state) => state);
  // @ts-ignore
  const current_directory_path = global_state.current_directory;
  // @ts-ignore
  const project_map_string = global_state.map.project_map_string;
  const project_map = new Map(JSON.parse(project_map_string, reviver));
  let all_projects = [];
  // @ts-ignore
  all_projects.push({ name: "" });
  for (let [key, value] of project_map) {
    if (key === "") {
      continue;
    }
    // @ts-ignore
    all_projects.push({ name: key.replace(prefix, "") });
  }
  // @ts-ignore
  const script_map = project_map.get("").scripts_comserver_map;
  // @ts-ignore
  const comserver_map = project_map.get("").comserver_scripts_map;
  // need to get all scripts and all comservers, can be easily gathered from above maps^^, get all entries ez pz
  const all_scripts = [...script_map.keys()].map((value) => {
    return { name: value };
  });
  const all_comservers = Array.from(comserver_map.keys()).map((value) => {
    return { name: value };
  });
  all_scripts.splice(0, 0, { name: "" });
  all_scripts.splice(all_scripts.length - 1, 1);
  all_comservers.splice(0, 0, { name: "" });
  const [is_open, toggle_modal] = useState(false);
  const [is_multi_select, toggle_multi_select] = useState(false);
  const [script_selection, set_script_selection] = useState(all_scripts);
  const [chosen_project, set_project] = useState("");
  const [comserver_selection, set_comserver_selection] =
    useState(all_comservers);
  const comserver_ref = React.createRef();
  const script_ref = React.createRef();
  const search_ref = React.createRef();
  const dispatch = useDispatch();
  const filter_scripts = (value) => {
    let filtered_scripts = comserver_map.has(value)
      ? comserver_map.get(value).map((value) => {
          return { name: value };
        })
      : all_scripts;
    if (filtered_scripts[0].name !== "") {
      filtered_scripts.splice(0, 0, { name: "" });
    }
    set_script_selection(filtered_scripts);
  };
  const filter_comservers = (value) => {
    let filtered_comservers = script_map.has(value)
      ? script_map.get(value).map((value) => {
          return { name: value };
        })
      : all_comservers;
    if (filtered_comservers[0].name !== "") {
      filtered_comservers.splice(0, 0, { name: "" });
    }
    set_comserver_selection(filtered_comservers);
  };

  const filter_all_maps = (project) => {
    let using_prefix = project === "" ? "" : prefix + project;
    set_project(using_prefix);
    const new_maps = project_map.get(using_prefix);
    // @ts-ignore
    const all_scripts = [...new_maps.scripts_comserver_map.keys()].map(
      (value) => {
        return { name: value };
      }
    );
    // @ts-ignore
    const all_comservers = [...new_maps.comserver_scripts_map.keys()].map(
      (value) => {
        return { name: value };
      }
    );
    all_scripts.splice(0, 0, { name: "" });
    all_scripts.splice(all_scripts.length - 1, 1);
    all_comservers.splice(0, 0, { name: "" });
    // @ts-ignore
    comserver_ref.current.resetSelectedValues();
    // @ts-ignore
    script_ref.current.resetSelectedValues();
    set_comserver_selection(all_comservers);
    set_script_selection(all_scripts);
  };

  const send_search_filtered = () => {
    // we will create a new Directory, with no parent called search result, this is a temporary special directory
    // this directory will not be saved, but contain just the search results of the query (note no call to write_file in dictionary)
    // inside messages we will have link to directory if user wants to access directory. This will be simpler than having
    // different "search states"
    // grab the query
    // @ts-ignore
    const search_params = search_ref.current.value;
    // @ts-ignore
    const comservers = comserver_ref.current
      .getSelectedItems()
      .map((elm) => elm.name);
    // @ts-ignore
    const scripts = script_ref.current
      .getSelectedItems()
      .map((elm) => elm.name);
    const filter_query = {
      search_query: search_params,
      comservers: comservers,
      scripts: scripts,
      parent_directory: current_directory_path.path,
      project: chosen_project,
    };
    dispatch(search_filtered(filter_query));
    // switch current directory to search result directory
    set_script_selection(all_scripts);
    set_comserver_selection(all_comservers);
    toggle_modal(false);
    dispatch(change_current_directory_no_save("Search Results"));
  };
  return (
    <div className={styles.DropDown}>
      <FaCog
        style={{ cursor: "pointer" }}
        onClick={() => {
          toggle_modal(true);
        }}
      ></FaCog>{" "}
      <Modal
        className={styles.DropDown}
        show={is_open}
        // onAfterOpen={afterOpenModal}
        onHide={() => {
          toggle_modal(false);
          set_script_selection(all_scripts);
          set_comserver_selection(all_comservers);
        }}
        size="lg"
      >
        <Form>
          <Modal.Header closeButton className="show-grid">
            <Container className={styles.Add}>
              <Row>
                <Modal.Title>
                  {" "}
                  {is_multi_select && "Multi Select Filter"}{" "}
                  {!is_multi_select && "Single Select Filter"}{" "}
                </Modal.Title>
              </Row>
              <hr />
              <Row style={{ fontSize: "0.98rem" }}>
                <Col xs={12} md={6} lg={2} xl={3} sm={6}>
                  Search
                  <br />
                  <FaSearch
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5rem",
                      cursor: "pointer",
                    }}
                    onClick={send_search_filtered}
                  />
                </Col>
                <Col xs={12} md={6} lg={2} xl={3} sm={6}>
                  {is_multi_select && "Single Select"}
                  {!is_multi_select && "Multi Select"}
                  <br />
                  {is_multi_select && (
                    <FaCheck
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        toggle_multi_select(false);
                      }}
                    />
                  )}
                  {!is_multi_select && (
                    <FaCheckDouble
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        toggle_multi_select(true);
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
              // @ts-ignore
              ref={search_ref}
              type="text"
              placeholder="Search"
              className="mr-sm-2"
              style={{ display: "initial" }}
            />
            <br />
            <hr />
            <Container>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                {is_multi_select && (
                  <div>
                    <Form.Label style={{ fontWeight: 800 }}>
                      Projects
                    </Form.Label>
                    <Multiselect
                      onSelect={(value) => {
                        filter_all_maps(value[0].name);
                      }}
                      // @ts-ignore
                      ref={comserver_ref}
                      singleSelect={true}
                      options={all_projects} // Options to display in the dropdown
                      displayValue="name"
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                    <br />
                    <br />
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Comservers
                    </Form.Label>
                    <Multiselect
                      // @ts-ignore
                      ref={comserver_ref}
                      options={all_comservers} // Options to display in the dropdown
                      displayValue="name"
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                    <br />
                    <br />
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Scripts
                    </Form.Label>
                    <Multiselect
                      // @ts-ignore
                      ref={script_ref}
                      options={all_scripts} // Options to display in the dropdown
                      displayValue="name"
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                  </div>
                )}
                {!is_multi_select && (
                  <div>
                    <Form.Label style={{ fontWeight: 800 }}>
                      Projects
                    </Form.Label>
                    <Multiselect
                      onSelect={(value) => {
                        filter_all_maps(value[0].name);
                      }}
                      // @ts-ignore
                      ref={comserver_ref}
                      singleSelect={true}
                      options={all_projects} // Options to display in the dropdown
                      displayValue="name"
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                    <br />
                    <br />
                    <Form.Label style={{ fontWeight: 800 }}>
                      Select Comservers
                    </Form.Label>
                    <Multiselect
                      // @ts-ignore
                      ref={comserver_ref}
                      singleSelect={true}
                      options={comserver_selection} // Options to display in the dropdown
                      displayValue="name"
                      onSelect={(value) => {
                        filter_scripts(value[0].name);
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
                      // @ts-ignore
                      ref={script_ref}
                      singleSelect={true}
                      onSelect={(value) => {
                        filter_comservers(value[0].name);
                      }}
                      options={script_selection} // Options to display in the dropdown
                      displayValue="name"
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                    <div className={styles.astrodivider}>
                      <div className={styles.astrodividermask}></div>
                      <span>
                        <i>&#10038;</i>
                      </span>
                    </div>
                  </div>
                )}
                {/* {!is_multi_select && ()} */}
              </Form.Group>
            </Container>
          </Modal.Body>
        </Form>
      </Modal>
    </div>
  );
}

export default DropDown;
