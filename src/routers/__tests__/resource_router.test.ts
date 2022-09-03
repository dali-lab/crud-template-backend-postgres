import supertest from 'supertest';
import resourceRouter from 'routers/resource_router';
import { resourceService } from 'services';
import db from '../../db/db';
import { IResource } from '../../db/models/resource';

const request = supertest(resourceRouter);

const resourceDataA: Omit<IResource, 'id'> = {
  title: 'Flu Season',
  description: 'Leslie comes down with the flu while planning the local Harvest Festival; Andy and Ron bond.',
  value: 32,
};

const resourceDataB: Omit<IResource, 'id'> = {
  title: 'Time Capsule',
  description: 'Leslie plans to bury a time capsule that summarizes life in Pawnee; Andy asks Chris for help.',
  value: 33,
};

let validId = '';
const invalidId = '365e5281-bbb5-467c-a92d-2f4041828948';

// Mocks requireAuth server middleware
jest.mock('../../auth/requireAuth');
jest.mock('../../auth/requireScope');
jest.mock('../../auth/requireSelf');

describe('Working resource router', () => {
  beforeAll(async () => {
    try {
      await db.authenticate();
      await db.sync();
    } catch (error) {
      throw new Error('Unable to connect to database...');
    }
  });

  describe('POST /', () => {
    it('requires valid permissions', async () => {
      const createSpy = jest.spyOn(resourceService, 'createResource');

      const res = await request
        .post('/')
        .send(resourceDataA);

      expect(res.status).toBe(403);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('blocks creation when missing field', async () => {
      const createSpy = jest.spyOn(resourceService, 'createResource');

      const attempts = Object.keys(resourceDataA).map(async (key) => {
        const resource = { ...resourceDataA };
        delete resource[key];

        const res = await request
          .post('/')
          .set('Authorization', 'Bearer dummy_token')
          .send(resource);

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBe(1);
        expect(createSpy).not.toHaveBeenCalled();
      });
      await Promise.all(attempts);
    });

    it('blocks creation when field invalid', async () => {
      const createSpy = jest.spyOn(resourceService, 'createResource');

      const attempts = Object.keys(resourceDataA).map(async (key) => {
        const resource = { ...resourceDataA };
        resource[key] = typeof resource[key] === 'number'
          ? 'some string'
          : 0;

        const res = await request
          .post('/')
          .set('Authorization', 'Bearer dummy_token')
          .send(resource);

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBe(1);
        expect(createSpy).not.toHaveBeenCalled();
      });
      await Promise.all(attempts);
    });

    it('creates resource when body is valid', async () => {
      const createSpy = jest.spyOn(resourceService, 'createResource');

      const res = await request
        .post('/')
        .set('Authorization', 'Bearer dummy_token')
        .send(resourceDataA);

      expect(res.status).toBe(201);
      Object.keys(resourceDataA).forEach((key) => {
        expect(res.body[key]).toBe(resourceDataA[key]);
      });
      expect(createSpy).toHaveBeenCalled();
      createSpy.mockClear();

      validId = String(res.body.id);
    });
  });

  describe('GET /', () => {
    it('returns all created resources', async () => {
      const getManySpy = jest.spyOn(resourceService, 'getResources');

      const res = await request
        .get('/')
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(getManySpy).toHaveBeenCalled();
      getManySpy.mockClear();
    });
  });

  describe('GET /:id', () => {
    it('returns 404 when resource not found', async () => {
      const getSpy = jest.spyOn(resourceService, 'getResources');

      const res = await request.get(`/${invalidId}`);

      expect(res.status).toBe(404);
      expect(getSpy).rejects.toThrowError();
      getSpy.mockClear();
    });

    it('returns resource if found', async () => {
      const getSpy = jest.spyOn(resourceService, 'getResources');

      const res = await request.get(`/${validId}`);

      expect(res.status).toBe(200);
      Object.keys(resourceDataA).forEach((key) => {
        expect(res.body[key]).toBe(resourceDataA[key]);
      });
      expect(getSpy).toHaveBeenCalled();
      getSpy.mockClear();
    });
  });

  describe('PATCH /:id', () => {
    it('requires valid permissions', async () => {
      const updateSpy = jest.spyOn(resourceService, 'editResources');

      const res = await request
        .patch(`/${validId}`)
        .send({ value: 32 });

      expect(res.status).toBe(403);
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('returns 404 if resource not found', async () => {
      const updateSpy = jest.spyOn(resourceService, 'editResources');

      const res = await request
        .patch(`/${invalidId}`)
        .set('Authorization', 'Bearer dummy_token')
        .send({ value: 32 });

      expect(res.status).toBe(404);
      expect(updateSpy).rejects.toThrowError();
      updateSpy.mockClear();
    });

    it('blocks creation when field invalid', async () => {
      const updateSpy = jest.spyOn(resourceService, 'editResources');

      const attempts = Object.keys(resourceDataA).concat('otherkey').map(async (key) => {
        const resourceUpdate = {
          [key]: typeof resourceDataA[key] === 'number'
            ? 'some string'
            : 0,
        };

        const res = await request
          .patch(`/${validId}`)
          .set('Authorization', 'Bearer dummy_token')
          .send(resourceUpdate);

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBe(1);
        expect(updateSpy).not.toHaveBeenCalled();
      });
      await Promise.all(attempts);
    });

    it('updates resource when body is valid', async () => {
      const updateSpy = jest.spyOn(resourceService, 'editResources');

      const attempts = Object.keys(resourceDataB).map(async (key) => {
        const resourceUpdate = { [key]: resourceDataB[key] };

        const res = await request
          .patch(`/${validId}`)
          .set('Authorization', 'Bearer dummy_token')
          .send(resourceUpdate);

        expect(res.status).toBe(200);
        expect(res.body[key]).toBe(resourceDataB[key]);
      });
      await Promise.all(attempts);

      expect(updateSpy).toHaveBeenCalledTimes(Object.keys(resourceDataB).length);
      updateSpy.mockClear();

      const res = await request.get(`/${validId}`);

      Object.keys(resourceDataB).forEach((key) => {
        expect(res.body[key]).toBe(resourceDataB[key]);
      });
    });
  });

  describe('DELETE /:id', () => {
    it('requires valid permissions', async () => {
      const deleteSpy = jest.spyOn(resourceService, 'deleteResources');

      const res = await request.delete(`/${validId}`);

      expect(res.status).toBe(403);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('returns 404 if resource not found', async () => {
      const deleteSpy = jest.spyOn(resourceService, 'deleteResources');

      const res = await request
        .delete(`/${invalidId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(404);
      expect(deleteSpy).rejects.toThrowError();
      deleteSpy.mockClear();
    });

    it('deletes resource', async () => {
      const deleteSpy = jest.spyOn(resourceService, 'deleteResources');

      const res = await request
        .delete(`/${validId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(res.status).toBe(200);
      expect(deleteSpy).toHaveBeenCalled();
      deleteSpy.mockClear();

      const getRes = await request.get(`/${validId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
