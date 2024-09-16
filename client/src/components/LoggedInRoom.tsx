import React, { useEffect, useState } from "react";
import { openWebSocket } from "../services/websocket";
import { useParams } from "react-router-dom";
import {
  getRoom,
  Room as RoomType,
  updateUsername,
  User,
} from "../services/api";
import sortBy from "lodash/sortBy";
import throttle from "lodash/throttle";
import Draggable from "react-draggable";

const sendHandPosition = throttle(
  (socket: WebSocket, userId: string, handPosition: number) => {
    socket?.send(
      JSON.stringify({
        type: "handPosition",
        userId,
        handPosition,
      })
    );
  },
  // TODO: Increase this after switching to a custom input that allows transition animations.
  1_000 / 60,
  { leading: true, trailing: true }
);

const LoggedInRoom: React.FC = () => {
  const { roomId, userId } = useParams<{ roomId: string; userId: string }>();
  const [_room, setRoom] = useState<RoomType | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = openWebSocket(roomId, (data) => {
      const parsedData = JSON.parse(data);

      switch (parsedData.type) {
        case "room":
          setRoom(parsedData.change.new_val);
          break;
        case "user":
          setUsers((users) => {
            if (!parsedData.change.new_val) {
              return users.filter(
                (user) => user.id !== parsedData.change.old_val.id
              );
            }

            // Ignore changes to the current user.
            if (parsedData.change.new_val.id === userId) return users;

            const index = users.findIndex(
              (user) => user.id === parsedData.change.new_val.id
            );
            if (index === -1) {
              return [...users, parsedData.change.new_val];
            }

            return users.map((user) =>
              user.id === parsedData.change.new_val.id
                ? parsedData.change.new_val
                : user
            );
          });
          break;
        default:
          console.error("Unknown message type:", parsedData.type);
      }
    });

    setSocket(socket);

    return () => {
      setSocket(null);
      socket.close();
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    (async () => {
      const { room, users } = await getRoom(roomId);
      setRoom(room);
      setUsers(users);
    })();
  }, [roomId]);

  if (!roomId) return <div>Invalid room ID</div>;

  if (!userId) return <div>Invalid user ID</div>;

  if (users.length === 0) return <div>Loading...</div>;

  const sortedUsers = sortBy(users, "id");
  const userIndex = sortedUsers.findIndex((user) => user.id === userId);
  const reorderedUsers = [
    ...sortedUsers.slice(userIndex),
    ...sortedUsers.slice(0, userIndex),
  ];

  return (
    <div>
      <h1>Room {roomId}</h1>

      <button
        onClick={async () => {
          await navigator.clipboard.writeText(
            `http://localhost:5173/rooms/${roomId}`
          );
        }}
      >
        Copy room link
      </button>

      <div style={{ display: "flex", flexDirection: "row" }}>
        {reorderedUsers.map((user) => (
          <div key={user.id}>
            <div
              style={{
                position: "relative",
                width: "280px",
                height: "300px",
              }}
            >
              <img
                src="/arm.svg"
                alt="Arm"
                style={{
                  width: "200px",
                  position: "absolute",
                  top: "60px",
                  bottom: "90px",
                  transform: "rotate(90deg) scaleY(-1)",
                  transformOrigin: "0 0",
                }}
              />

              <Draggable
                disabled={user.id !== userId}
                axis="y"
                bounds="parent"
                position={{ x: 0, y: (1 - user.handPosition) * 200 }}
                onDrag={(_, data) => {
                  let handPosition = 1 - data.y / 200;
                  if (handPosition < 0) {
                    handPosition = 0;
                  }

                  setUsers((users) =>
                    users.map((u) =>
                      u.id === user.id ? { ...u, handPosition } : u
                    )
                  );

                  if (socket) {
                    sendHandPosition(socket, user.id, handPosition);
                  }
                }}
              >
                <div>
                  <img
                    src="/arm.svg"
                    alt="Hand"
                    draggable={false}
                    style={{
                      width: "200px",
                      position: "absolute",
                      right: "0",
                    }}
                  />
                </div>
              </Draggable>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              {user.id === userId ? (
                <>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      setUsers((users) =>
                        users.map((u) =>
                          u.id === user.id ? { ...u, name: e.target.value } : u
                        )
                      )
                    }
                  />
                  <button
                    onClick={async () =>
                      updateUsername(roomId, user.id, user.name)
                    }
                  >
                    Update
                  </button>
                </>
              ) : (
                <span>{user.name}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoggedInRoom;
