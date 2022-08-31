import DocumentNotFoundError from 'errors/DocumentNotFoundError';
import { Resources } from 'models';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { ResourceDoc, ResourceFields } from 'types/models';

const getManyResources = async (fields: FilterQuery<ResourceDoc>): Promise<ResourceDoc[]> => (
  Resources.find(fields)
);

const createResource = (fields: ResourceFields): Promise<ResourceDoc> => (
  new Resources(fields).save()
);

const getResource = async (id: string): Promise<ResourceDoc> => {
  const resource = await Resources.findById(id);
  if (!resource) throw new DocumentNotFoundError(id);
  return resource;
};

const updateResource = async (id: string, fields: UpdateQuery<ResourceDoc>): Promise<ResourceDoc> => {
  const updatedResource = await Resources.findByIdAndUpdate(id, fields, { new: true });
  if (!updatedResource) throw new DocumentNotFoundError(id);
  return updatedResource;
};

const deleteResource = async (id: string): Promise<ResourceDoc> => {
  const deletedResource = await Resources.findByIdAndDelete(id);
  if (!deletedResource) throw new DocumentNotFoundError(id);
  return deletedResource;
};

const resourceService = {
  getManyResources,
  createResource,
  getResource,
  updateResource,
  deleteResource,
};

export default resourceService;
