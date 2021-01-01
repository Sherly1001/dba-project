const express = require('express');

const router = new express.Router();

router.get('/', (req, res) => {
  res.render('index', {title: 'Kết nối và dạy học'});
})

router.get('/tutors', (req, res) => {
  res.render('tutors', {title: 'Tìm kiếm gia sư', tutors: null});
})

module.exports = router;
