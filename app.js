var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


//在 express.js 中，使用 sqlite3 來操作數據庫，並開啟位置在 db/sqlite.db 的資料庫，需要確認是否成功打開資料庫
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});


//撰寫 /api/electricity 路由，使用 SQL 來查詢 electricity_prices 所有的資料，回傳 json 格式的資料就好
app.get('/api/electricity', (req, res) => {
    db.all('SELECT * FROM electricity_prices', (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.json(rows);
    });
});


// 撰寫 post/api 路由，使用 SQLite 查詢 electricity_prices 中，某 年份 的資料，回傳 json 格式的資料
app.post('/api', (req, res) => {
    let year = req.body.year;
    let sql = 'SELECT * FROM electricity_prices WHERE year = ?';
    db.all(sql, [year], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(rows);
    });
});


//撰寫 post /api/insert 路由，使用 SQLite 新增一筆電價資料 (year, average_light_price, average_power_price, average_price)，electricity_prices 中，回傳文字的訊息，不要 json
app.post('/api/insert', (req, res) => {
    let year = req.body.year;
    let average_light_price = req.body.average_light_price;
    let average_power_price = req.body.average_power_price;
    let average_price = req.body.average_price;
    let sql = 'INSERT INTO electricity_prices (year, average_light_price, average_power_price, average_price) VALUES (?, ?, ?, ?)';
    db.run(sql, [year, average_light_price, average_power_price, average_price], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send('Insert success');
    });
});


module.exports = app;
