const mongoose= require('mongoose');
const url = `mongodb://localhost/users`;

let establishConnection = (callback) => {
  mongoose.connect(url, {useCreateIndex: true, useNewUrlParser: true});
  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'An error had occur when establishing a mongoose connection'));

  db.once('open', () => {
    console.log('Mongoose Connection has been established successfully!');
  });

  return db;
};

module.exports = {
  establishConnection : establishConnection
};
