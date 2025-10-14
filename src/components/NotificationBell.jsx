import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Bell } from "react-bootstrap-icons";

const NotificationBell = ({ notifications, onClear }) => {
  const [show, setShow] = useState(false);

  return (
    <Dropdown show={show} onToggle={() => setShow(!show)} align="end">
      <Dropdown.Toggle variant="link" className="text-white position-relative">
        <Bell size={22} />
        {notifications.length > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.6rem" }}
          >
            {notifications.length}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: "300px" }}>
        <Dropdown.Header className="fw-semibold">Notifications</Dropdown.Header>
        {notifications.length === 0 ? (
          <Dropdown.ItemText className="text-muted text-center">
            No new notifications
          </Dropdown.ItemText>
        ) : (
          notifications.map((n, i) => (
            <Dropdown.ItemText
              key={i}
              className={`small border-bottom ${n.type === "Accepted" ? "text-success" : "text-danger"}`}
            >
              <strong>{n.type}</strong>: {n.message}
              <br />
              <span className="text-muted small">{n.date}</span>
            </Dropdown.ItemText>
          ))
        )}
        {notifications.length > 0 && (
          <Dropdown.Divider />
        )}
        {notifications.length > 0 && (
          <Dropdown.Item as="button" className="text-center text-danger" onClick={onClear}>
            Clear All
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;
