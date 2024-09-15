import { useState } from "react";
import { createRoom } from "../services/api";
import { useNavigate } from "react-router-dom";

const Homepage: React.FC = () => {
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const onSubmit = async () => {
    const roomId = await createRoom(name);
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div>
      <h1>Homepage</h1>
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

export default Homepage;
