const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const intializeDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

intializeDatabase()

const result = playerArray => {
  return {
    playerId: playerArray.player_id,
    playerName: playerArray.player_name,
    jerseyNumber: playerArray.jersey_number,
    role: playerArray.role,
  }
}

//players API

app.get('/players/', async (request, response) => {
  const playerDetails = `
    SELECT
       *
    FROM
    cricket_team;`

  const getPlayerArray = await db.all(playerDetails)
  response.send(getPlayerArray.map(eachPlayer => result(eachPlayer)))
})

//postApI

app.post('/players/', async (request, response) => {
  const getDetails = request.body
  const {playerName, jerseyNumber, role} = getDetails
  const addPlayerQuery = `
  INSERT INTO 
    cricket_team (player_name, jersey_number, role)
  
  VALUES
  (
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  );`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API 3

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
     SELECT
     *
     FROM 
      cricket_team 
    WHERE 
     player_id = ${playerId};`

  const player = await db.get(getPlayerQuery)
  response.send(result(player))
})

//update Book Api

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getbody = request.body
  const {playerName, jerseyNumber, role} = getbody

  const updateQuery = `
   UPDATE
    cricket_team 
   SET
    player_name = '${playerName}',
    jersey_number= ${jerseyNumber},
    role = '${role}'
   WHERE
    player_id = ${playerId};`
  await db.run(updateQuery)
  response.send('Player Details Updated')
})

//palyer deatils Delete API

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
   cricket_team
  WHERE
    player_id = ${playerId};`

  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
