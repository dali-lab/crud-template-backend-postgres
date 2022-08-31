import { createSchema, Type, typedModel } from 'ts-mongoose';

export const ResourceSchema = createSchema({
  title: Type.string({ required: true }),
  description: Type.string({ required: true }),
  value: Type.number({ required: true }),
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, { __v, ...resource }) => resource,
  },
});

const ResourceModel = typedModel('Resource', ResourceSchema);

export default ResourceModel;
