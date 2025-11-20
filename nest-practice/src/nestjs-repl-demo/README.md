<!-- Start REPL -->
npm run start:repl

<!-- REPL Execute Commands -->
<!-- Create User -->
await userService.createUser('Alice', 'alice@example.com')

<!-- Find All User -->
await userService.findAll()

<!-- Find One User by _id -->
await userService.findOne('691db501a9b4d979c6684abe')

<!-- Update User -->
await userService.updateUser('691db501a9b4d979c6684abe', 'Alice Smith')

<!-- Delete User -->
await userService.deleteUser('691db548a9b4d979c6684ac0')