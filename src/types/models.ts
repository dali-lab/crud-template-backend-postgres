import { ScopeNames } from 'auth/scopes';
import { ResourceSchema } from 'models/resource_model';
import { UserSchema } from 'models/user_model';
import { Definition, ExtractDoc, ExtractProps } from 'ts-mongoose';

type ExtractFields<P extends ExtractProps<Definition>, K extends string | number | symbol = ''> = Omit<P, '_id' | '__v' | 'createdAt' | 'updatedAt' | K>;

export type User = ExtractProps<typeof UserSchema> & { scope: ScopeNames };
export type UserFields = ExtractFields<User, 'comparePassword' | 'full_name'>;
export type UserDoc = ExtractDoc<typeof UserSchema>;

export type Resource = ExtractProps<typeof ResourceSchema>;
export type ResourceFields = ExtractFields<Resource>;
export type ResourceDoc = ExtractDoc<typeof ResourceSchema>;
