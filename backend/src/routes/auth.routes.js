const { Router } = require('express');
const { cadastrar, login, logout } = require('../controllers/auth.controller');

const router = Router();

router.post('/cadastro', cadastrar);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;