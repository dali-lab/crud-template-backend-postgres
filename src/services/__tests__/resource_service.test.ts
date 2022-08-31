import { resourceService } from 'services';
import { ResourceFields } from 'types/models';

import {
  connectDB, dropDB,
} from '../../../__jest__/helpers';

let idResourceA = '';
const invalidId = 'invalidId';

const resourceDataA: ResourceFields = {
  title: 'Flu Season',
  description: 'Leslie comes down with the flu while planning the local Harvest Festival; Andy and Ron bond.',
  value: 32,
};

const resourceDataB: ResourceFields = {
  title: 'Time Capsule',
  description: 'Leslie plans to bury a time capsule that summarizes life in Pawnee; Andy asks Chris for help.',
  value: 33,
};

describe('resourceService', () => {
  beforeAll(async () => {
    connectDB();
  });

  afterAll(async () => {
    dropDB();
  });

  describe('createResource', () => {
    it('Can create resource', async () => {
      const resource = await resourceService.createResource(resourceDataA);
      idResourceA = String(resource._id);

      expect(resource._id).toBeDefined();
      expect(resource.title).toBe(resourceDataA.title);
      expect(resource.description).toBe(resourceDataA.description);
      expect(resource.value).toBe(resourceDataA.value);
    });

    it('Can create second resource', async () => {
      const resource = await resourceService.createResource(resourceDataB);

      expect(resource._id).toBeDefined();
      expect(resource.title).toBe(resourceDataB.title);
      expect(resource.description).toBe(resourceDataB.description);
      expect(resource.value).toBe(resourceDataB.value);
    });
  });

  describe('getResource', () => {
    it('Can get resource', async () => {
      const resource = await resourceService.getResource(idResourceA);

      expect(resource.title).toBe(resourceDataA.title);
      expect(resource.description).toBe(resourceDataA.description);
      expect(resource.value).toBe(resourceDataA.value);
    });

    it('Rejects if resource does not exist', async () => {
      expect(resourceService.getResource(invalidId)).rejects.toBeDefined();
    });
  });

  describe('getManyResources', () => {
    it('Gets all resources when no filter passed in', async () => {
      const resources = await resourceService.getManyResources({});
      expect(resources.length).toBe(2);
    });

    it('Gets all resources that match filter', async () => {
      const resources = await resourceService.getManyResources({ value: resourceDataA.value });
      expect(resources.length).toBe(1);
    });
  });

  describe('updateResource', () => {
    it('Updates resource field, returns updated resource', async () => {
      const newDescription = 'Test description';

      const updatedResource1 = await resourceService.updateResource(idResourceA, { description: newDescription });
      expect(updatedResource1.description).toBe(newDescription);

      const updatedResource2 = await resourceService.getResource(idResourceA);
      expect(updatedResource2.description).toBe(newDescription);
    });

    it('Rejects if resource does not exist', async () => {
      expect(resourceService.updateResource(invalidId, { value: 10000 })).rejects.toBeDefined();
    });

    it('Does not add field thats not part of schema', async () => {
      const resource = await resourceService.updateResource(idResourceA, { director: 'Wendey Stanzler' });
      expect((resource as any).director).toBeUndefined();
    });
  });

  describe('deleteResource', () => {
    it('Deletes existing resource', async () => {
      expect(resourceService.getResource(idResourceA)).rejects.toBeDefined();
    });
  });

  it('Rejects if resource does not exist', async () => {
    expect(resourceService.deleteResource(invalidId)).rejects.toBeDefined();
  });
});
