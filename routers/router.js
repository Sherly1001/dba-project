const express = require('express');
const fetch = require('node-fetch');

const router = new express.Router();

router.get('/', (req, res) => {
  res.render('index', {title: 'Kết nối và dạy học'});
})

router.get('/tutors', (req, res) => {
  res.render('tutors', {title: 'Tìm kiếm gia sư', tutors: null});
})

router.get('/become-tutor', (req, res) => {
  res.render('become-tutor', {title: 'Đăng ký làm gia sư'})
})

router.get('/class', (req, res) => {
  res.render('class', {title: 'Các lớp mới'});
})

router.get('/new-class', (req, res) => {
  res.render('new-class.ejs', {title: 'Đăng yêu cầu mở lớp mới'});
})

module.exports = router;
