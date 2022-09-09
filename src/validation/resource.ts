import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { IResource } from '../db/models/resource';

export const CreateResourceSchema = joi.object<IResource>({
  title: joi.string().required().error(() => 'Create resource expecting a title'),
  description: joi.string().required().error(() => 'Create resource expecting a description'),
  value: joi.number().required().error(() => 'Create resource expecting a value'),
});

export interface CreateResourceRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: IResource
}

export const UpdateResourceSchema = joi.object<IResource>({
  id: joi.string(),
  title: joi.string(),
  description: joi.string(),
  value: joi.number(),
});

export interface UpdateResourceRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: Partial<IResource>
}
