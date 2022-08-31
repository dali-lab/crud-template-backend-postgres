import joi from 'joi';
import { ValidatedRequestSchema, ContainerTypes } from 'express-joi-validation';
import { ResourceFields } from 'types/models';

export const CreateResourceSchema = joi.object<ResourceFields>({
  title: joi.string().required(),
  description: joi.string().required(),
  value: joi.number().required(),
});

export interface CreateResourceRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: ResourceFields
}

export const UpdateResourceSchema = joi.object<ResourceFields>({
  title: joi.string(),
  description: joi.string(),
  value: joi.number(),
});

export interface UpdateResourceRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: Partial<ResourceFields>
}
