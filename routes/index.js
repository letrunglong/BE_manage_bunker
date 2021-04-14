var express = require('express');
var router = express.Router();
const fs = require('fs');
const { Pool, Client } = require('pg')
const multer = require('multer')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'prj-manage-bunker',
  password: 'Chiancut1999',
  port: 5432,
})
//login --WORKED
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
//register --WORKED
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



//get products --WORKED
router.get('/getProducts', (req, res, next) => {
  const query = 'SELECT products.prod_id,	prod_name, cate_name, price_sell, prod_price,	prod_quantity,	prod_cate,	prod_bunker,prod_image,	unit_name,	prod_unit,	prod_producer,	producer_name,	prod_description FROM	products INNER JOIN producer    ON producer.producer_id = products.prod_producer INNER JOIN unit_prod u	ON u.unit_id = prod_unit INNER JOIN categories cate ON cate.cate_id = prod_cate ORDER BY prod_name'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})



//get products by category --TESTING
router.get('/get-product-by-cate/:fieldid', (req, res, next) => {
  let prod_cate = req.params.fieldid
  let query = 'SELECT products.prod_id,prod_name, cate_name, price_sell, prod_price,	prod_quantity,	prod_cate,prod_image,	unit_name,	prod_unit,	prod_producer,	producer_name,	prod_description FROM	products INNER JOIN producer    ON producer.producer_id = products.prod_producer INNER JOIN unit_prod u	ON u.unit_id = prod_unit INNER JOIN categories cate ON cate.cate_id = prod_cate where (prod_cate = $1)'
  pool.query(query, [prod_cate], (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      response.send(error)
    }
  })
})
//get image --WORKED
router.get('/products-image/:fieldid', (req, res) => {
  const { fieldid } = req.params
  res.sendFile('images/products/' + fieldid, { root: '.' })
})

//get categories --WORKED
router.get('/get-categories', (req, res, next) => {
  const query = 'SELECT * from categories'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})
//get unit --WORKED
router.get('/get-unit', (req, res, next) => {
  const query = 'SELECT * from unit_prod'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})
//get bunker list --WORKED
router.get('/get-bunker', (req, res, next) => {
  const query = 'SELECT * from bunker'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})

//get porducer list --WORKED
router.get('/get-producer', (req, res, next) => {
  const query = 'SELECT * from producer'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})
//get bills list --WORKED
router.get('/get-bill', (req, res, next) => {
  const query = 'SELECT bills.bill_id,bill_infor,bill_total,bill_create_at, users.email, bunker.bunker_name, pay_status.status_name, bunker_status.status_name, suplier.suplier_name FROM bills INNER JOIN users ON users.user_id = bills.bill_user INNER JOIN bunker ON bunker.bunker_id = bills.bill_bunker_status INNER JOIN pay_status ON pay_status.status_id = bills.bill_pay_status INNER JOIN suplier ON suplier.suplier_id = bills.bill_suplier INNER JOIN bunker_status ON bunker_status.status_id = bills.bill_bunker_status'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})

// get suplier list --TESTING
router.get('/get-suplier', (req, res, next) => {
  const query = 'SELECT * FROM suplier'
  pool.query(query, (error, response) => {
    if (response) {
      res.send(response.rows)
    } else if (error) {
      res.send(error)
    }
  })
})
/***********************POST METHOD**********************************/

//upload image --WORKED
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images/products')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: fileStorageEngine })
//add products --WORKED
router.post('/add-products', upload.single("image"), (req, res) => {
  let { product_name, product_bunker, product_cate, product_price, product_producer, product_quantity, product_unit, product_image, product_description, product_sell } = req.body


  let query = "INSERT INTO public.products( prod_name, prod_price, prod_quantity, prod_cate, prod_image, prod_unit, prod_producer, prod_description, price_sell)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
  pool.query(query, [product_name, product_price, product_quantity, product_cate, product_image, product_unit, product_producer, product_description, product_sell], (error, response) => {
    try {
      if (response) {
        return res.status(201).json({ status: 200, messages: "Thêm sản phẩm thành công " })
      } else if (error) {
        return res.status(200).json({ status: 404, messages: "Thêm sản phẩm thất bại " })
      }
    } catch {
      return res.status(200).json({ status: 400, messages: "Thêm sản phẩm thất bại" })
    }
  })
})

// POST ADD CATEGORIES --WORKED
router.post('/add-categories', (req, res, next) => {
  let { cate_name, cate_description } = req.body
  pool.query('INSERT INTO categories (cate_name,cate_description) VALUES ($1,$2)', [cate_name, cate_description], (error, response) => {
    try {
      if (response) {
        return res.status(200).json({ status: 200, messages: "Thêm danh mục thành công" })
      } else if (error) {
        return res.status(200).json({ status: 400, messages: "Thêm danh mục thất bại!" })
      }
    } catch {
      return res.status(200).json({ status: 400, messages: "Thêm danh mục thất bại!" })
    }
  })
})
// POST ADD PRODUCER --WORKED
router.post('/add-producer', (req, res, next) => {
  let { producer_name, producer_description } = req.body
  console.log(req.body);
  pool.query('INSERT INTO producer (producer_name,producer_description) VALUES ($1,$2)', [producer_name, producer_description], (error, response) => {
    try {
      if (response) {
        return res.status(200).json({ status: 200, messages: "Thêm nhà sản xuất thành công" })
      } else if (error) {
        return res.status(200).json({ status: 400, messages: "Thêm nhà sản xuất thất bại!" })
      }
    } catch {
      res.send('Failure!')
    }
  })
})
// POST ADD UNIT --TEST
router.post('/add-unit', (req, res, next) => {
  let { unit_name, unit_description } = req.body
  console.log(req.body);
  pool.query('INSERT INTO unit_prod (unit_name,unit_description) VALUES ($1,$2)', [unit_name, unit_description], (error, response) => {
    try {
      if (response) {
        return res.status(200).json({ status: 200, messages: "Thêm đơn vị tính thành công" })
      } else if (error) {
        return res.status(200).json({ status: 400, messages: "Thêm đơn vị tính thất bại!" })
      }
    } catch {
      res.send('Failure!')
    }
  })
})

// POST ADD BUNKER --WORKED
router.post('/add-bunker', (req, res, next) => {
  pool.query('INSERT INTO bunker (bunker_name,bunker_location) VALUES ($1,$2)', [bunker_name, bunker_location], (error, response) => {
    try {
      if (response) {
        return res.status(200).json({ status: 200, messages: "Thêm nhà kho thành công" })
      } else if (error) {
        return res.status(200).json({ status: 400, messages: "Thêm nhà kho thất bại!" })
      }
    } catch {
      return res.status(200).json({ status: 400, messages: "Lỗi" })
    }
  })
})
// POST ADD SUPLIER --WORKED
router.post('/add-suplier', (req, res, next) => {
  let { suplier } = req.body
  pool.query('INSERT INTO suplier (suplier_name) VALUES ($1)', [suplier], (error, response) => {
    try {
      if (response) {
        return res.status(201).json({ status: 201, messages: "Thêm nhà cung cấp thành công" })
      } else if (error) {
        return res.status(200).json({ status: 400, messages: "Thêm nhà cung cấp thất bại" })
      }
    } catch {
      return res.status(200).json({ status: 400, messages: "Lỗi" })
    }
  })
})
/***********************DELETE METHOD**********************************/
// DELETE PRODUCTS --WORKED
router.delete('/delete-product/:id/:image', async (req, res, next) => {
  let { id } = req.params
  let { image } = req.params
  pool.query('DELETE FROM products WHERE prod_id = ' + id, (err, response) => {
    try {
      if (response) {
        res.status(200).json({ status: 200, messages: "Xóa sản phẩm thành công" })
        fs.unlinkSync(`images/products/${image}`)
      } else if (err) {
        return res.status(200).json({ status: 200, messages: "Xóa sản phẩm thất bại" })
      }
    } catch {
      return res.send("Failure!")
    }
  })
})

module.exports = router;
