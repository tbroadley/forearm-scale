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

  // Set up middleware and routes here

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

void main();
