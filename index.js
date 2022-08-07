// Import the required modules
const express = require("express");
const cors = require("cors");
require("dotenv").config();
// nodemailer to send email
const nodemailer = require("nodemailer");
const mysql = require("mysql");
const app = express();
app.use(express.json());
app.use(cors());

// cryptocurrency for live price
const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

// smtp details of sender
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// sql databse connection hosted on heroku
const db = mysql.createPool({
  connectionLimit: 100,
  queueLimit :0,
  wait_timeout : 28800,
  connect_timeout :10,
  waitForConnections: true,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: "us-cdbr-east-06.cleardb.net",
});

db.getConnection((err, connection) => {
  if (err) throw err;
  console.log(connection)

});

// email text
function emailtext(cryptoname, price, email) {
  const mailOptions = {
    from: "gaurav27c@gmail.com",
    to: email,
    subject: `${cryptoname} price update`,
    html: `<div>Dear User</div>

    <text>Current price of ${cryptoname} is USD ${price}.</text>
    
    <footer>You are getting this price email because you requested the price update.
    </footer>
    
    <div>Thanks</div>
    <div>Crypto Team</div>
    `,
  };

  return mailOptions;
}

// when coin name is wrong email
function failedprice(cryptoname, email) {
  const mailOptions = {
    from: "gaurav27c@gmail.com",
    to: email,
    subject: `${cryptoname} price is not available`,
    html: `<div>Dear User</div>

    <text>Current price of ${cryptoname} is not available.</text>
    <text>Please check the cryptocurrency name and try again.</text>

    <footer>You are getting this price email because you requested the price update.
    </footer>
    
    <div>Thanks</div>
    <div>Crypto Team</div>
    `,
  };

  return mailOptions;
}

// api to get current price
app.get("/getprice", (req, res) => {
  const cryptoname = req.body.cryptoname;
  const email = req.body.email;

  // get the coin price
  var func = async () => {
    let data = await CoinGeckoClient.coins.fetch(cryptoname);
    if (data.success == false) {
      // send email if crypto name is wrong
      const mailOptions = failedprice(cryptoname, email);
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.send("Error Sending Email");
        } else {
          res
            .send("Could not find cryptocurrency with that name")

        }
      });
    } else {
      const price = data.data.market_data.current_price.usd;
      const mailOptions = emailtext(cryptoname, price, email);

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.send("Error Sending Email");
        } else {
          // add data in database
          db.query(
            "Insert into userhistory (email, coinprice, coinname) VALUES (?, ?, ?)",
            [email, price, cryptoname],
            (er, resulta) => {
              if (er) {
                res.send({ msg: "Error inserting data in database.", err: er });
              } else {
                res.send("Email Sent And Database Updated")
              }
            }
          );
        }
      });
    }
  };
  func();
});

// api to get history
app.get("/gethistory", (req, res) => {
  const email = req.body.email;

  db.query(
    "Select * from userhistory where email=?",
    [email],
    (er, resulta) => {
      if (resulta.length > 0) {
        res.send(resulta)
      } else {
        res.send("No history found linked to provided email.")
      }
      if (er) {
        console.log(er);
      }
    }
  );
});

// test connection with backend server
app.get("/test", (req, res) => {
  res.json("Hello from server");
});

// starting the server
app.listen(process.env.PORT || 3001, () => {
  console.log("listening on port 3001");
});

module.exports = app;
