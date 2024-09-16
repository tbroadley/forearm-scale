import React, { useEffect, useState } from "react";
import { openWebSocket } from "../services/websocket";
import { useParams } from "react-router-dom";
import {
  getRoom,
  Room as RoomType,
  updateUsername,
  User,
} from "../services/api";
import debounce from "lodash/debounce";

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
          // TODO filter out events for the current user.

          setUsers((users) => {
            if (!parsedData.change.new_val) {
              return users.filter(
                (user) => user.id !== parsedData.change.old_val.id
              );
            }

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

  const sendHandPosition = debounce((userId: string, handPosition: number) => {
    socket?.send(
      JSON.stringify({
        type: "handPosition",
        userId,
        handPosition,
      })
    );
  }, 100);

  return (
    <div>
      <h1>Room {roomId}</h1>

      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
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
                  Save
                </button>
              </>
            ) : (
              <span>{user.name}</span>
            )}

            <input
              disabled={user.id !== userId}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={user.handPosition}
              onChange={(e) => {
                setUsers((users) =>
                  users.map((u) =>
                    u.id === user.id
                      ? { ...u, handPosition: parseFloat(e.target.value) }
                      : u
                  )
                );
                sendHandPosition(user.id, parseFloat(e.target.value));
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoggedInRoom;
