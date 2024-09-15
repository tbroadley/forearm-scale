import { useState } from "react";
import { createRoom, createUser } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

const LoggedOutRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const onSubmit = async () => {
    if (!roomId) {
      return;
    }

    const userId = await createUser(roomId, name);
    navigate(`/rooms/${roomId}/users/${userId}`);
  };

  if (!roomId) {
    return <div>Invalid room ID</div>;
  }

  return (
    <div>
      <h1>Join room {roomId}</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};

export default LoggedOutRoom;
