import { compareSync, genSaltSync, hashSync } from 'bcrypt';

// TODO: Remove this adapter
// We already handle this on our user entity
export const bcryptAdapter = {
  hash: (password: string) => {
    const salt = genSaltSync();
    return hashSync(password, salt);
  },

  compare: (password: string, hashed: string) => {
    return compareSync(password, hashed);
  },
};
