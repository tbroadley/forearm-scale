import * as r from "rethinkdb";
import express from "express";
import RethinkDBClient from "./rethinkdb";

async function initializeDatabase(rethinkDBClient: RethinkDBClient) {
  const dbList = await rethinkDBClient.executeQuery(r.dbList());
  if (!dbList.includes("forearm-scale")) {
    await rethinkDBClient.executeQuery(r.dbCreate("forearm-scale"));
  }

  const tablesList = await rethinkDBClient.executeQuery(
    r.db("forearm-scale").tableList()
  );
  if (!tablesList.includes("rooms")) {
    await rethinkDBClient.executeQuery(
      r.db("forearm-scale").tableCreate("rooms")
    );
  }
  if (!tablesList.includes("users")) {
    await rethinkDBClient.executeQuery(
      r.db("forearm-scale").tableCreate("users")
    );
  }
}

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  const rethinkDBClient = new RethinkDBClient();
  await rethinkDBClient.connect();

  await initializeDatabase(rethinkDBClient);

  app.use(express.json());

  app.post("/rooms", async (req, res) => {
    try {
      const { username } = req.body;

      // Create a room
      const room = await rethinkDBClient.executeQuery(
        r.db("forearm-scale").table("rooms").insert({})
      );

      // Create a user associated with the room
      const user = await rethinkDBClient.executeQuery(
        r
          .db("forearm-scale")
          .table("users")
          .insert({ name: username, roomId: room.generated_keys[0] })
      );

      res.json({
        roomId: room.generated_keys[0],
        userId: user.generated_keys[0],
      });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.put("/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { username } = req.body;

      await rethinkDBClient.executeQuery(
        r
          .db("forearm-scale")
          .table("users")
          .get(userId)
          .update({ name: username }, { returnChanges: true })
      );
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

void main();
