const { Router } = require('express');
const { cadastrar } = require('../controllers/auth.controller');

const router = Router();

router.post('/cadastro', cadastrar);

module.exports = router;