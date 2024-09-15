import * as r from "rethinkdb";
import WebSocket from "ws";
import express from "express";
import RethinkDBClient from "./rethinkdb";
import { z } from "zod";

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

  const rethinkDBClient = new RethinkDBClient();
  await rethinkDBClient.connect();

  await initializeDatabase(rethinkDBClient);

  app.use(express.json());

  app.post("/rooms", async (req, res) => {
    try {
      const { username } = z.object({ username: z.string() }).parse(req.body);

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

  app.post("/rooms/:roomId/users", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { name } = z.object({ name: z.string() }).parse(req.body);

      // Create a user associated with the room
      const user = await rethinkDBClient.executeQuery(
        r.db("forearm-scale").table("users").insert({ name, roomId })
      );

      res.json({
        userId: user.generated_keys[0],
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/rooms/:roomId/users/:userId", async (req, res) => {
    try {
      const { roomId, userId } = req.params;
      const { name } = z.object({ name: z.string() }).parse(req.body);

      await rethinkDBClient.executeQuery(
        r
          .db("forearm-scale")
          .table("users")
          .filter({ id: userId, roomId })
          .update({ name }, { returnChanges: true })
      );
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  const wss = new WebSocket.Server({ noServer: true });
  wss.on("connection", async (ws, request) => {
    if (!request.url) {
      ws.close(1011, "Invalid URL");
      return;
    }

    const { pathname } = new URL(request.url, `http://${request.headers.host}`);
    const [rooms, roomId] = pathname.split("/", 2);
    if (rooms !== "rooms") {
      ws.close(1011, "Invalid URL");
      return;
    }

    const roomChanges = r
      .db("forearm-scale")
      .table("rooms")
      .getAll(roomId)
      .outerJoin(r.db("forearm-scale").table("users"), (room, user) =>
        room("id").eq(user("roomId"))
      )
      .without({ left: { id: true } } as any) // TODO does this work?
      .zip()
      .changes();

    const result = await rethinkDBClient.executeQuery(roomChanges);
    result.each((error, change) => {
      if (error) {
        console.error("Error processing change:", error);
        ws.close(1011, "Internal error");
        return;
      }

      ws.send(JSON.stringify(change));
    });
  });

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });
}

void main();
