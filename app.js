const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at https://localhost:3000");
    });
  } catch (e) {
    console.log(`db error - ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team order by player_id;`;
  const list = await db.all(getPlayersQuery);
  response.send(
    list.map((eachPlayer) => convertObjectToResponseObject(eachPlayer))
  );
});

//API2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addBookQuery = `insert into cricket_team(player_name,jersey_number,role) 
    values('${playerName}',
    '${jerseyNumber}',
    '${role}'
    );`;
  const dbResponse = await db.run(addBookQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertObjectToResponseObject(player));
});

//API4

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `update cricket_team 
    set
    player_name ='${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
    where player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API5

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `delete from cricket_team where player_id = ${playerId}`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
