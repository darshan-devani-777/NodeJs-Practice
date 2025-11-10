const bcrypt = require('bcryptjs');
const userModel = require('../Model/user.model');
const db = require('../Database/db');

exports.showAddUserForm = (req, res) => {
  const message = req.query.message;  
  res.render('addUser', { error: null, message: message });  
};

exports.addUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('addUser', { error: 'All fields are required!', message: null });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);  
    const result = await userModel.createUser(name, email, hashedPassword);
    
    res.redirect(`/addProduct?userId=${result.insertId}&message=User Added Successfully...!`);
  } catch (error) {
    console.error('Error adding user:', error);
    res.render('addUser', { error: 'Error adding user.', message: null });
  }
};

exports.getUsersWithProducts = (req, res) => {
  const query = `
    SELECT users.id AS userId, users.name AS userName, users.email, 
           products.id AS productId, products.name AS productName, 
           products.price, products.description
    FROM users
    LEFT JOIN products ON users.id = products.user_id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const data = {};
    results.forEach(row => {
      if (!data[row.userId]) {
        data[row.userId] = {
          id: row.userId,
          name: row.userName,
          email: row.email,
          products: []
        };
      }

      if (row.productId) {
        data[row.userId].products.push({
          id: row.productId,
          name: row.productName,
          price: row.price,
          description: row.description 
        });
      }
    });

    res.render('getProducts', { users: Object.values(data) }); 
  });
};

