const { Client } = require("pg");

const { USER_DB, PASS_DB, HOST_DB, PORT_DB, NAME_DB } = process.env;

const client = new Client({
  user: USER_DB,
  password: PASS_DB,
  host: HOST_DB,
  port: PORT_DB,
  database: NAME_DB,
});

client
  .connect()
  .then(() => console.log("connected to database"))
  .catch((err) => console.log(`connection error ${err}`));

module.exports = client;
