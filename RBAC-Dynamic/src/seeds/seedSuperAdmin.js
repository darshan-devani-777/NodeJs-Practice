const bcrypt = require('bcryptjs');
const User = require('../models/User'); 

const createSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });

    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists:', existingSuperAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10); 
    const superAdminData = {
      name: 'SuperAdmin',
      email: 'superadmin@gmail.com',
      password: hashedPassword,
      role: 'SuperAdmin',
      permissions: [
        'APPROVE_PERMISSION',
        'VIEW_AUDIT_LOGS',
        'USERS:CREATE',
        'USERS:ASSIGN_ROLE',
        'REVIEW_PERMISSION',
        'DASHBOARD:VIEW',
        'ROLES:CREATE'
      ],
      roles: [],
    };

    const superAdmin = await User.create(superAdminData);
    console.log('SuperAdmin created:', superAdmin.email);
  } catch (error) {
    console.error('Error creating SuperAdmin:', error);
  }
};

module.exports = createSuperAdmin;