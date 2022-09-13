
import { resourceService } from 'services';
import db from '../../db/db';
import { IResource } from '../../db/models/resource';
import dotenv from 'dotenv';

dotenv.config();

let idResourceA = '';
let idResourceB = '';
const invalidId = '3fe847d8-2074-4ed7-a51c-e10fb1053c9e';

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

describe('resourceService', () => {
  beforeAll(async () => {
    try {
      await db.authenticate();
      await db.sync();
    } catch (error) {
      throw new Error('Unable to connect to database...');
    }
  });

  describe('createResource', () => {
    it('Can create resource A', async () => {
      const resource: IResource = await resourceService.createResource(resourceDataA);

      expect(resource.id).toBeDefined();
      expect(resource.title).toBe(resourceDataA.title);
      expect(resource.description).toBe(resourceDataA.description);
      expect(resource.value).toBe(resourceDataA.value);
      idResourceA = String(resource.id);
    });

    it('Can create resource B', async () => {
      const resource: IResource = await resourceService.createResource(resourceDataB);

      expect(resource.id).toBeDefined();
      expect(resource.title).toBe(resourceDataB.title);
      expect(resource.description).toBe(resourceDataB.description);
      expect(resource.value).toBe(resourceDataB.value);
      idResourceB = String(resource.id);
    });
  });

  describe('getResources', () => {
    it('Can get resource', async () => {
      const resource: IResource = await resourceService.getResources({ id: idResourceA }).then((res) => res[0]);

      expect(resource.title).toBe(resourceDataA.title);
      expect(resource.description).toBe(resourceDataA.description);
      expect(resource.value).toBe(resourceDataA.value);
    });

    it('Returns empty array if no resources to get', async () => {
      expect(await resourceService.getResources({ id: invalidId })).toStrictEqual([]);
    });

    it('Gets all resources when no filter passed in', async () => {
      const resources: IResource[] = await resourceService.getResources({});
      expect(resources.length).toBe(8);
    });

    it('Gets all resources that match filter', async () => {
      const resources = await resourceService.getResources({ value: resourceDataA.value });
      expect(resources.length).toBe(1);
    });
  });

  describe('editResources', () => {
    it('Updates resource field, returns updated resource', async () => {
      const newDescription = 'Test description';

      const updatedResource: IResource = await resourceService.editResources({ description: newDescription }, { id: idResourceA }).then((res) => res[0]);
      expect(updatedResource.description).toBe(newDescription);
    });

    it('Returns empty array if no resources to edit', async () => {
      expect(await resourceService.editResources({ id: invalidId }, { value: 10000 })).toStrictEqual([]);
    });
  });

  describe('deleteResource', () => {
    it('Deletes existing resource A', async () => {
      await resourceService.deleteResources({ id: idResourceA });
      expect(await resourceService.getResources({ id: idResourceA })).toStrictEqual([]);
    });

    it('Deletes existing resource B', async () => {
      await resourceService.deleteResources({ id: idResourceB });
      expect(await resourceService.getResources({ id: idResourceA })).toStrictEqual([]);
    });

    it('Reports zero deleted rows if no resources to delete', async () => {
      expect(await resourceService.deleteResources({ id: invalidId })).toStrictEqual(0);
    });
  });
});
