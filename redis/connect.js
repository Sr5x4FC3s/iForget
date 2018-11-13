const redis               = require('redis');
const mongoose            = require('../database/index');
let client                = redis.createClient(6379, '127.0.01');


const redisConnection = (port, host) => {
  
  client.on('connect', () => {
    console.log('Redis client connected');
  });

  client.on('error', (err) => {
    console.log('Something went wrong ' + err);
  });

  return client;
};

const set = (key, value) => {
  client.set(key.toLowerCase(), value, redis.print);
};

const getnUpdate = (key) => {
  let object = client.get(key.toLowerCase(), (err, res) => {
    if (err) {
      console.log(err);
    }
    console.log('GET result ->' + res);
    let redis_data = res; // array of obj
    let new_data = {
      date: new Date(),
      places: JSON.parse(redis_data),
    };

    //update db 
    let query = new Promise (resolve => {
      let action = mongoose.query('user_login', key.toLowerCase());
      resolve(action);
    }).then(result => {
      let getPlaces = result.data;
      return getPlaces;
    }).then(result => {
      let combine_data = result;
      combine_data.push(new_data);
      mongoose.update(key.toLowerCase(), combine_data);
    });
  });
}

module.exports = {
  redisConnection: redisConnection,
  set: set,
  get: getnUpdate,
};