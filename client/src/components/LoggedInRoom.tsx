import React, { useEffect, useState } from "react";
import { openWebSocket } from "../services/websocket";
import { useParams } from "react-router-dom";
import {
  getRoom,
  Room as RoomType,
  updateUsername,
  User,
} from "../services/api";

const LoggedInRoom: React.FC = () => {
  const { roomId, userId } = useParams<{ roomId: string; userId: string }>();
  const [_room, setRoom] = useState<RoomType | null>(null);
  const [users, setUsers] = useState<User[]>([]);

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

    return () => {
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
              user.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoggedInRoom;
