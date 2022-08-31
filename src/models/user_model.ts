/* eslint-disable func-names */
import bcrypt from 'bcrypt';
import {
  createSchema, Type, typedModel, ExtractDoc,
} from 'ts-mongoose';

import { CompareCallback } from 'types/mongoose';

const UserSchema = createSchema({
  email: Type.string({ required: true, unique: true }),
  password: Type.string({ required: true }),
  first_name: Type.string({ required: true }),
  last_name: Type.string({ required: true }),
  scope: Type.string({ required: true, default: 'USER' }),
  // trick to allow typing of virtual fields and methods
  ...({} as {
    full_name: string,
    comparePassword: (password: string, callback: CompareCallback) => void
  }),
}, {
  toObject: { virtuals: true },
  toJSON: {
    virtuals: true,
    transform: (doc, {
      __v, id, password, ...user
    }) => user,
  },
  timestamps: true,
});

const saltRounds = 10;

UserSchema.pre('save', function (next) {
  const doc = this as ExtractDoc<typeof UserSchema>;
  // Check if password needs to be rehashed
  if (this.isNew || this.isModified('password')) {
    // Hash and save document password
    bcrypt.hash(doc.password, saltRounds, (error, hashedPassword) => {
      if (error) {
        next(error);
      } else {
        doc.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});

UserSchema.methods.comparePassword = function (password: string, callback: CompareCallback): void {
  bcrypt.compare(password, this.password, (error, same) => {
    if (error) {
      callback(error);
    } else {
      callback(null, same);
    }
  });
};

UserSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

const UserModel = typedModel('User', UserSchema);

export { UserSchema };

export default UserModel;
