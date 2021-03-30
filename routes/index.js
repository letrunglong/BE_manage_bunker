var express = require('express');
var router = express.Router();
const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'prj-manage-bunker',
  password: 'Chiancut1999',
  port: 5432,
})
//login
router.post('/login', (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  pool.query('SELECT * from users where email = $1 AND password = $2', [email, password], (error, response) => {
    if (response) {
      if (response.rowCount === 0) {
        res.status(200).json({ status: 404, messages: "Tài khoản hoặc mật khẩu không chính xác" })
      }
      else {
        res.status(200).json({ status: 200, messages: "Đăng nhập thành công", data: response.rows })
      }
    }
    else {
      res.send(error)
    }
  })
})
//register
router.post('/register', (req, res, next) => {
  let { email, password, firstname, lastname, username, token } = req.body
  pool.query("INSERT INTO users(user_name,first_name,last_name,email,password,status,token) VALUES ($1,$2,$3,$4,$5,2,$6)", [username, firstname, lastname, email, password, token], (error, response) => {
    try {
      if (response) {
        return res.status(200).json({ status: 200, messages: "Đăng ký thành công " })
      } else if (error) {
        return res.status(200).json({ status: 404, messages: "Email đã được đăng ký" })
      }
    } catch (error) {
      if (error) { res.status(200).json({ status: 404, messages: "Tài khoản đã tồn tại" }) }
    }
  })
})

router.get('/getProducts', (req, res, next) => {
  const query = 'SELECT products.prod_id,products.prod_name,products.prod_price,products.prod_producer,products.prod_quantity,products.prod_bunker,products.prod_unit,products.prod_image, categories.cate_name FROM products INNER JOIN categories ON products.prod_cate = categories.cate_id'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})
module.exports = router;
