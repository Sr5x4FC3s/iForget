const mongoose = require('mongoose').set('debug', true);

/* ********* Schema ********* */
let user_schema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  account: {type: String, lowercase: true, required: true, index: true, unique: true, sparse: false},
  password: {type: String, required: true},
  email: {type: String, lowercase: true, required: true, index: true, unique: true, sparse: false},
  data: [{}]
});

/* ********* Model ********* */
let user = mongoose.model('User', user_schema);

/* ******** Utility Functions ******** */
/* -------- save --------- */
const save = (entry) => {
  let newEntry = new user(entry);
  newEntry.save(err => {
    if (err) {
      console.log('error while saving data');
      return console.error(err);
    };
  })
}
/* -------- query --------- */
const query = async (params, target) => {
  let account_case;
  let email_case;
  
  //case: account
  if (params === 'account') {
    let info = await user.findOne({account: target.toLowerCase()}).then(result => {
      if (result === null || result === undefined) {
        account_case = 'AVAILABLE';
        return account_case;
      } else {
        account_case = 'IN_USE';
        return account_case;
      }
    })
    return info;
  };
  //case email
  if (params === 'email') {
    let info = await user.findOne({email: target.toLowerCase()}).then(result => {
      if (result === null || result === undefined) {
        email_case = 'AVAILABLE';
        return email_case;
      } else {
        email_case = 'IN_USE';
        return email_case;
      }
    })
    return info;
  };

  if (params === 'user_login') {
    let info = await user.findOne({account: target.toLowerCase()}).then(result => {
      if (result === null || result === undefined) {
        account_case = 'NOT_FOUND';
        return account_case;
      } else {
        return result;
      }
    })
    return info;
  };
}

/* -------- account/email verification --------- */
const verification = (target_account, target_email) => {
  let promiseArray = [query('account', target_account), query('email', target_email)];
  return Promise.all(promiseArray).then(result => {
    let verify = {
      account: 'AVAILABLE',
      email: 'AVAILABLE'
    };

    for (let i = 0; i < result.length; i++) {
      if (result[0] === 'IN_USE') {
        verify.account = 'IN_USE';
      };
      if (result[1] === 'IN_USE') {
        verify.email = 'IN_USE';
      }
    };
    return verify;
  });
}

/* -------- update existing entry -------- */
const update = (target_account, payload) => {
  let update_target = user.updateOne({account: target_account}, {data: payload}, (err, res) => {
    if (err) {
      console.log(err);
      return console.error(err);
    }
    return res;
  })
}

module.exports = {
  save: save,
  query: query,
  verify: verification,
  update: update,
};
