const users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Denver D.", email: "denver@example.com" },
];

module.exports = {
  getAllUsers: () => users,

  getUserById: (id) => users.find((u) => u.id === Number(id)),

  getUserByEmail: (email) => users.find((u) => u.email === email),

  createUser: ({ name, email }) => {
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    return newUser;
  },
};
