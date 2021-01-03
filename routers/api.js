const express = require('express');
const pg = require('pg');
const create_hash = require('create-hash');

const sha256 = str => create_hash('sha256').update(str).digest('hex');
const valid_pass = (a, b) => a == b || a == sha256(b) || sha256(a) == b;

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

api.get('/login', async (req, res) => {
  if (req.query.user) {
    let rs = await db.query('select * from admin where username = $1', [req.query.user]);
    if (rs.rowCount > 0 && valid_pass(rs.rows[0].pass, req.query.pass)) {
      res.json({user: req.query.user, pass: sha256(rs.rows[0].pass), role: 'admin', result: true});
    } else {
      rs = await db.query('select name, username, pass from tutors where username = $1', [req.query.user]);
      if (rs.rowCount > 0 && valid_pass(rs.rows[0].pass, req.query.pass)) {
        res.json({user: req.query.user, pass: sha256(rs.rows[0].pass), name: rs.rows[0].name, role: 'tutor', result: true});
      } else {
        rs = await db.query('select name, username, pass from parrents where username = $1', [req.query.user]);
        if (rs.rowCount > 0 && valid_pass(rs.rows[0].pass, req.query.pass)) {
          res.json({user: req.query.user, pass: sha256(rs.rows[0].pass), name: rs.rows[0].name, role: 'parrent', result: true});
        } else {
          res.json({result: false});
        }
      }
    }
  }
  else {
    res.json({result: false});
  }
})

module.exports = api;
