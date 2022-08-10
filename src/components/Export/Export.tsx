import React, { FC } from "react";
// @ts-ignore
import styles from "./Export.module.scss";
import { FaDownload, FaUpload } from "react-icons/fa";
import { Col } from "react-bootstrap";
import { saveAs } from "file-saver";
import * as dba from "../../services/database";

function Export() {
  const export_message_manager = () => {
    var blob = new Blob([dba.export_message_manager_string()], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "Message Manager.json");
  };

  return (
    <div className={styles.Export} data-testid="Export">
      <Col xs={12} md={6} lg={2} xl={3} sm={6}>
        Export
        <FaDownload
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          onClick={export_message_manager}
        />
      </Col>
    </div>
  );
}

export default Export;
