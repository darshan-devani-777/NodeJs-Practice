const User = require('../models/User');

const createSuperAdmin = async () => {
  try {

    const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });

    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists:', existingSuperAdmin.email);
      return;
    }

    const superAdminData = {
      name: 'SuperAdmin',
      email: 'superadmin@gmail.com',
      password: 'SuperAdmin@123',
      role: 'SuperAdmin',
      department: 'GLOBAL',
      location: 'INDIA',
      status: 'ACTIVE',
      roles: []
    };

    const superAdmin = await User.create(superAdminData);

    console.log('SuperAdmin created:', superAdmin.email);

  } catch (error) {
    console.error('Error creating SuperAdmin:', error);
  }
};

module.exports = createSuperAdmin;