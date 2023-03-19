import { RequestHandler } from 'express';
import { ValidatedRequest } from 'express-joi-validation';
import { CreateResourceRequest, UpdateResourceRequest } from 'validation/resource';
import { resourceService } from 'services';
import { IResource } from 'db/models/resource'; 
import { BaseError } from 'errors';

const createResource: RequestHandler = async (req: ValidatedRequest<CreateResourceRequest>, res, next) => {
  try {
    const savedResource = await resourceService.createResource(req.body);
    res.status(201).json(savedResource);
  } catch (error) {
    next(error);
  }
};

const getResources: RequestHandler = async (req, res, next) => {
  try {
    const id = req.query?.id as string;
    const title = req.query?.title as string;
    const description = req.query?.description as string;
    const value = Number(req.query?.value);
    
    const resources: IResource[] = await resourceService.getResources({ 
      id,
      title,
      description,
      value,
    });
    
    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
};

const getResource: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    const title = req.query?.title as string;
    const description = req.query?.description as string;
    const value = Number(req.query?.value);
    
    const resources: IResource[] = await resourceService.getResources({ 
      id,
      title,
      description,
      value,
    });
    if (resources.length === 0) throw new BaseError('User not found', 404);
    else if (resources.length > 1) throw new BaseError('Multiple Users found', 404);
    else res.status(200).json(resources[0]);
  } catch (error) {
    next(error);
  }
};

const updateResource: RequestHandler = async (req: ValidatedRequest<UpdateResourceRequest>, res, next) => {
  try {
    // ! Only allow user to update certain fields (avoids privilege elevation)
    const { title, description, value } = req.body;
    
    const updatedResources = await resourceService.updateResources(
      { title, description, value },
      { id: req.params.id },
    );

    if (updatedResources.length === 0) throw new BaseError('Resource not found', 404);
    else res.status(200).json(updatedResources[0]);
  } catch (error) {
    next(error);
  }
};

const deleteResource: RequestHandler = async (req, res, next) => {
  try {
    const resources : IResource[] = await resourceService.getResources({ id: req.params.id });
    if (resources.length === 0) throw new BaseError('Resource not found', 404);
    else {
      await resourceService.deleteResources({ id: req.params.id });
      res.status(200).json(resources[0]); // returning the deleted resource
    }
  } catch (error) {
    next(error);
  }
};

const resourceController = {
  getResources,
  createResource,
  getResource,
  updateResource,
  deleteResource,
};

export default resourceController;
