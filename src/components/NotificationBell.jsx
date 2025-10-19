import React, { useState, useCallback, useMemo } from "react";
import { Dropdown } from "react-bootstrap";
import { Bell } from "react-bootstrap-icons";

/**
 * Optimized NotificationBell Component
 * - Prevents re-renders with stable handlers
 * - Uses correct `onToggle` signature
 * - Adds accessibility improvements
 */
const NotificationBell = React.memo(function NotificationBell({
  notifications = [],
  onClear = () => {},
}) {
  const [show, setShow] = useState(false);

  // ✅ Memoize unread count to avoid recalculations
  const unreadCount = useMemo(() => notifications.length, [notifications]);

  // ✅ Handle dropdown toggle (React-Bootstrap provides nextShow param)
  const handleToggle = useCallback(
    (nextShow) => {
      setShow(nextShow);
    },
    [setShow]
  );

  // ✅ Stable clear handler
  const handleClear = useCallback(() => {
    onClear();
    setShow(false);
  }, [onClear]);

  return (
    <Dropdown
      show={show}
      onToggle={handleToggle}
      align="end"
      autoClose="outside"
      className="notification-bell"
    >
      <Dropdown.Toggle
        variant="link"
        className="text-white position-relative p-0 border-0"
        id="notification-bell"
        aria-label={`Notifications (${unreadCount})`}
      >
        <Bell size={22} className="cursor-pointer" />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{
              fontSize: "0.65rem",
              minWidth: "16px",
              padding: "2px 4px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          minWidth: "300px",
          maxHeight: "350px",
          overflowY: "auto",
        }}
        className="shadow-sm"
      >
        <Dropdown.Header className="fw-semibold">
          Notifications
        </Dropdown.Header>

        {unreadCount === 0 ? (
          <Dropdown.ItemText className="text-muted text-center py-3">
            No new notifications
          </Dropdown.ItemText>
        ) : (
          notifications.map((n, i) => (
            <Dropdown.ItemText
              key={i}
              className={`small border-bottom py-2 ${
                n.type === "Accepted"
                  ? "text-success"
                  : n.type === "Rejected"
                  ? "text-danger"
                  : "text-secondary"
              }`}
            >
              <div>
                <strong>{n.type || "Update"}</strong>: {n.message || "—"}
              </div>
              {n.date && (
                <div className="text-muted small">
                  {new Date(n.date).toLocaleString()}
                </div>
              )}
            </Dropdown.ItemText>
          ))
        )}

        {unreadCount > 0 && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              className="text-center text-danger fw-semibold"
              onClick={handleClear}
            >
              Clear All
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
});

export default NotificationBell;
