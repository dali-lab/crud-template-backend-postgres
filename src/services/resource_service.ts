// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import ResourceModel, { IResource } from 'db/models/resource';
import { Op } from 'sequelize';
import { DatabaseQuery } from '../constants';
import { BaseError } from 'errors';

export interface ResourceParams {
  id?: string;
  title?: string;
  description?: string;
  value?: number;
}

const constructQuery = (params: ResourceParams) => {
  const { id, title, description, value } = params;
  const query: DatabaseQuery<ResourceParams> = {
    where: {},
  };
  if (id) {
    query.where.id = {
      [Op.eq]: id,
    };
  }
  if (title) {
    query.where.title = {
      [Op.eq]: title,
    };
  }
  if (description) {
    query.where.description = {
      [Op.eq]: description,
    };
  }
  if (value) {
    query.where.value = {
      [Op.eq]: value,
    };
  }
  return query;
};

const getResources = async (params: ResourceParams) => {
  const query = constructQuery(params);
  try {
    return await ResourceModel.findAll(query);
  } catch (e : any) {
    throw new BaseError(e.message, 500);
  }
};

const editResources = async (resource: Partial<IResource>, params: ResourceParams) => {
  const query = constructQuery(params);
  return (await ResourceModel.update(resource, { ...query, returning: true }))[1];
};

const deleteResources = async (params: ResourceParams) => {
  const query = constructQuery(params);
  try {
    return await ResourceModel.destroy(query);
  } catch (e : any) {
    throw new BaseError(e.message, 500);
  }
};

const createResource = async (resource: Pick<IResource, 'title' | 'description' | 'value'>) => {
  try {
    return await ResourceModel.create({ 
      ...resource, 
      id: uuidv4(),
    });
  } catch (e : any) {
    throw e;
  }
};

const resourceService = {
  getResources,
  editResources,
  deleteResources,
  createResource,
};

export default resourceService;
