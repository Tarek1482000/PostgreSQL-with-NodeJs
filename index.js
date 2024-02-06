require("dotenv").config();

const express = require("express");
const app = express();

const client = require("./DataBase/DB");

app.use(express.json());

app.get("/", (req, res) => {
  const tableName = "Users"; // Set the table name here
  client.query(`Select * FROM ${tableName} `, (err, result) => {
    if (err) {
      console.error("Error executing query", err);
      res.status(500).send("Error retrieving users");
      return;
    }

    const users = result.rows;
    // Send back an object containing the table name and the fetched rows
    res.json({ table: tableName, users });
  });
});

app.get("/:id", (req, res) => {
  const tableName = "Users"; // Set the table name here

  const SelectedId = req.params.id;

  client.query(
    `Select * FROM ${tableName} where "id" = $1`,
    [SelectedId],
    (err, result) => {
      if (err) {
        console.error("Error executing query", err);
        res.status(500).send("Error retrieving users");
        return;
      }

      const users = result.rows;
      // Send back an object containing the table name and the fetched rows
      res.json({ table: tableName, users });
    }
  );
});

app.post("/", (req, res) => {
  const NewUser = req.body,
    tableName = "Users";

  if (NewUser.id) {
    client.query(
      `insert into ${tableName}("id","full name") values ($1,$2) returning *`,
      [NewUser.id, NewUser["full name"]],
      (err, result) => {
        if (err) {
          console.error("Error adding user", err);
          res.status(500).send("Error adding user");
          return;
        }

        const newUser = result.rows[0];
        res.json({ tableName, newUser });
      }
    );
  } else {
    client.query(
      `insert into ${tableName}("full name") values ($1) returning *`,
      [NewUser["full name"]],
      (err, result) => {
        if (err) {
          console.error("Error adding user", err);
          res.status(500).send("Error adding user");
          return;
        }

        const newUser = result.rows[0];
        res.json({ tableName, newUser });
      }
    );
  }
});

app.patch("/:id", (req, res) => {
  const tableName = "Users"; // Set the table name here
  const updates = req.body;
  const userId = req.params.id;

  const setClause = Object.keys(updates)
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");

  const values = Object.values(updates);

  client.query(
    `update  ${tableName} set ${setClause} where "id" = $${
      values.length + 1
    } returning *`,
    [...values, userId],
    (err, result) => {
      if (err) {
        console.error("Error executing query", err);
        res.status(500).send("Error retrieving users");
        return;
      }

      if (result.rows.length === 0) {
        // If no rows were affected, the user with the given ID doesn't exist
        res.status(404).send("User not found");
        return;
      }

      const user = result.rows[0];
      // Send back an object containing the table name and the fetched rows
      res.json({ table: tableName, user });
    }
  );
});

app.delete("/:id", (req, res) => {
  const tableName = "Users"; // Set the table name here

  const SelectedId = req.params.id;

  client.query(
    `delete FROM ${tableName} where "id" = $1 returning *`,
    [SelectedId],
    (err, result) => {
      if (err) {
        console.error("Error executing query", err);
        res.status(500).send("Error retrieving users");
        return;
      }

      if (result.rows.length === 0) {
        // If no rows were affected, the user with the given ID doesn't exist
        res.status(404).send("User not found");
        return;
      }

      const user = result.rows[0];
      // Send back an object containing the table name and the fetched rows
      res.json({ table: tableName, user });
    }
  );
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
