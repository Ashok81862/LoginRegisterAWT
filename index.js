const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken')

const saltRounds = 10;

const app = express();
const PORT = 3001;
const mysql = require('mysql');

app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    key: "userId",
    secret: "important code",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expire: 60*60*24
    }
}))

const db = mysql.createConnection({
    user: "root" , host: "localhost", password:"", database: "loginregister"
})

app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err) console.log(err)

        db.query("INSERT INTO users (username, password) VALUES (?,?)", [username, hash],(error, result) => {
            res.send("User created")
        })
    })
})

app.get('/login', (req,res) => {
  if(req.session.user){
      res.send({ loggedIn: true, user: req.session.user})
  }
  else{
      res.send({ loggedIn: false})
  }
})

//Middleware
const verifyJWT = (req,res, next) => {
    const token = req.headers["x-access-token"];

    if(!token){
        res.send("We need token, please give it to us next time.")
    }
    else{
        jwt.verify(token, "jwtSecret", (err, decode) => {
            if(err){
                res.json({auth: false , message: "You failed to authenticate"})
            }
            else{
                req.userId = decode.id
                next()
            }
        })
    }
}

app.get('/isUserAuth',verifyJWT ,(req,res) => {
    res.send("You are authenticated")
})

app.post('/login', (req,res) => {
    const username = req.body.username
    const password = req.body.password

    db.query("SELECT * FROM users WHERE username = ?" , username , (error, result) => {
       if(error) res.send({error: error})

       if(result.length > 0){
           bcrypt.compare(password, result[0].password, (err,status) => {
               if(status){
                   
                    const id = result[0].id
                    const token  = jwt.sign({id}, 'jwtSecret', {
                        expiresIn: 300,
                    })
                    req.session.user = result;
                    res.json({ auth: true, token: token, result: result})
               }else{
                   res.send({auth :false, error: "Wrong combination between username and password"})
               }
           })
       }
       else{
           res.send({auth: false ,error : "No user found"})
       }
    })
})

app.listen(PORT, () => {
    console.log(`Server is running in port ${PORT}`)
})