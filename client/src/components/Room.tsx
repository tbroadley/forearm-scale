import React, { useEffect, useState } from "react";
import { openWebSocket } from "../services/websocket";
import { useParams } from "react-router-dom";

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!roomId) return;

    const socket = openWebSocket(roomId, (data) => setMessage(data));

    return () => {
      socket.close();
    };
  }, [roomId]);

  if (!roomId) return <div>Invalid room ID</div>;

  return (
    <div>
      <h1>Room {roomId}</h1>
      <p>{message}</p>
    </div>
  );
};

export default Room;
