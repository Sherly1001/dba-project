const express = require('express');
const pg = require('pg');

const db = new pg.Client(process.env.db_connect);
db.connect(err => {
  console.log(db.connection.stream._host + ' connected');
})

const api = new express.Router();

api.get('/', (req, res) => {
  res.json(req.query);
})

api.post('/', (req, res) => {
  res.json(req.body);
})

api.get('/login', (req, res) => {
  if (req.query.user) {
    res.json({...req.query, result: true});
  }
  else {
    res.json({result: false});
  }
})

module.exports = api;
