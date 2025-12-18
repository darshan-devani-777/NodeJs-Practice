import { AppDataSource } from "../Database/db";
import { User } from "../Entity/user.entity";

const userRepo = AppDataSource.getRepository(User);

export const createUser = async (data: Partial<User>) => {
  const user = userRepo.create(data);
  return await userRepo.save(user);
};

export const getUsers = async () => {
  return await userRepo.find();
};

export const getUserById = async (id: number) => {
  return await userRepo.findOneBy({ id });
};

export const updateUser = async (id: number, data: Partial<User>) => {
  await userRepo.update(id, data);
  return await userRepo.findOneBy({ id });
};

export const deleteUser = async (id: number) => {
  return await userRepo.delete(id);
};
