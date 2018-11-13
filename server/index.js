require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database/connect');
const port = 4000;
const mongoose = require('../database/index');
const redis = require('../redis/connect');

const app = express();

//establish reuseable connection to mongo on server load
db.establishConnection(); 

//establish connection to redis 
redis.redisConnection();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get('/api_key', (req, res) => {
  res.status(200).send(process.env.MAPBOX_TOKEN);
})

app.get(`/retrieveCoordinates/:accountName`, (req, res) => {
  let account_name = req.params.accountName;

  //querying db for older entries --> need to work on the new entries that are already cached in DB because they're not added to the db until the user is ready to log off
  let getData = new Promise (resolve => {
    let query = mongoose.query('user_login', account_name);
    resolve(query);
  }).then(result => {
    let data = result.data;
    res.status(200).send(result.data);
  });
});

app.post(`/coordinates`, (req, res) => {
  let data = req.body;

  if (data.login_status === true) {
    redis.set(data.account, JSON.stringify(data.coordinates));
    res.status(200).send('data cached');
  } else if (data.login_status === false) {
    // if data login is false => meaning we're logging out
    //****** Need to build a auto logout feature if inactive to prevent cache memory loss */
    if (data.coordinates !== null) {
      redis.set(data.account, JSON.stringify(data.coordinates));
    };

    let retrieveData = redis.get(data.account);
  }
})

app.post(`/new_user_token`, async (req, res) => {
  let data = req.body;

  const verify_dupicates = (account, email) => {
    let status_token = {
      status: 'OK',
      data: null,
      error: []
    };

    let verify = new Promise (resolve => {
      let promise = mongoose.verify(account, email);
      resolve(promise);
    }).then(result => {
      let status_token = {
        status: 'OK',
        data: null,
        error: []
      };
      if (result.account === 'IN_USE' || result.email === 'IN_USE') {
        status_token.status = 'FAIL'
        if (result.account === 'IN_USE') {
          status_token.error.push('ACCOUNT');
        }
        if (result.email === 'IN_USE') {
          status_token.error.push('EMAIL');
        }
        return status_token;
      } else {
        return status_token;
      }
    }).then(result => {
      if (result.status ===  'FAIL') {
        res.status(200).send(result);
      } else {
        const create_account = async (data) => {
          let insert = await mongoose.save(data);
        }
        create_account(data);
        res.status(200).send(result);
      }
    })
  }

  verify_dupicates(data.account, data.email);
})

app.post(`/user_login`, (req, res) => {
  let data = req.body;

  let verify_usr_token = (data) => {
    let query_promise = new Promise (resolve => {
      let query = mongoose.query('user_login', data.account);
      resolve(query);
    }).then(result => {
      let status_token = {
        status: 'OK',
        data: null,
        error: []
      };

      if (result === 'NOT_FOUND') {
        status_token.status = 'FAIL';
        status_token.error.push('ACCOUNT_NOT_FOUND');
        res.status(200).send(status_token);
      } else {
        if (result.password === data.password) {
          let login_data = {
            first_name: result.first_name,
            last_name: result.last_name,
            email: result.email
          };
          res.status(200).send(login_data);
        } else {
          status_token.status = 'FAIL';
          status_token.error.push('PASSWORD');
          res.status(200).send(status_token);
        }
      }
    }).catch(err => {
      console.log(err);
    })
  }
  verify_usr_token(data);
})

app.listen(port, () => { console.log(`Connected to ${port}`)});