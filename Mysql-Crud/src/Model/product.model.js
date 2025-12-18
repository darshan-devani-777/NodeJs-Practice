const db = require('../Database/db');

exports.createProduct = (name, price, description, userId) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO products (name, price, description, user_id) VALUES (?, ?, ?, ?)';
    db.query(query, [name, price, description, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


