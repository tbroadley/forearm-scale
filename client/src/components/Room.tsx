import React, { useEffect, useState } from "react";
import { openWebSocket } from "../services/websocket";
import { useParams } from "react-router-dom";
import { getRoom, Room as RoomType, User } from "../services/api";

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
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

  return (
    <div>
      <h1>Room {roomId}</h1>

      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Room;
