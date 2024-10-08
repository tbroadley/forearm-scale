import * as r from "rethinkdb";

class RethinkDBClient {
  private connection: r.Connection | null;

  constructor() {
    this.connection = null;
  }

  async connect() {
    const host = process.env.RETHINKDB_HOST;
    const port = process.env.RETHINKDB_PORT;
    if (!host || !port) {
      throw new Error("RETHINKDB_HOST or RETHINKDB_PORT not set");
    }

    try {
      this.connection = await r.connect({
        host,
        port: parseInt(port),
        db: "forearm-scale",
      });
      console.log("Connected to RethinkDB");
    } catch (error) {
      console.error("Failed to connect to RethinkDB:", error);
    }
  }

  async executeQuery<T>(query: r.Operation<T>): Promise<T> {
    if (!this.connection) {
      throw new Error("No connection to RethinkDB");
    }

    try {
      const result = await query.run(this.connection);
      return result;
    } catch (error) {
      console.error("Failed to execute query:", error);
      throw error;
    }
  }

  async close() {
    try {
      await this.connection?.close();
      console.log("Connection to RethinkDB closed");
    } catch (error) {
      console.error("Failed to close connection to RethinkDB:", error);
    }
  }
}

export default RethinkDBClient;
