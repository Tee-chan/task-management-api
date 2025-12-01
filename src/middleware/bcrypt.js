import bcrypt from "bcrypt";

export const comparePassword = async (str, hash) => {
  return bcrypt.compare(str, hash);
};