
import { resourceService } from 'services';
import { ResourceFields } from 'types/models';
import { db } from '../../server';

/*
import {
  connectDB, dropDB,
} from '../../../__jest__/helpers';
*/

let idResourceA = '';
let idResourceB = '';
const invalidId = '365e5281-bbb5-467c-a92d-2f4041828948';

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
    try {
      await db.authenticate();
      await db.sync();
    } catch (error) {
      throw new Error('Unable to connect to database...');
    }
  });

  describe('createResource', () => {
    it('Can create resource A', async () => {
      const resource = await resourceService.createResource(resourceDataA);

      expect(resource.id).toBeDefined();
      expect(resource.title).toBe(resourceDataA.title);
      expect(resource.description).toBe(resourceDataA.description);
      expect(resource.value).toBe(resourceDataA.value);
      idResourceA = String(resource.id);
    });

    it('Can create resource B', async () => {
      const resource = await resourceService.createResource(resourceDataB);

      expect(resource.id).toBeDefined();
      expect(resource.title).toBe(resourceDataB.title);
      expect(resource.description).toBe(resourceDataB.description);
      expect(resource.value).toBe(resourceDataB.value);
      idResourceB = String(resource.id);
    });
  });

  describe('getResources', () => {
    it('Can get resource', async () => {
      const resource = await resourceService.getResources({ id: idResourceA }).then((res) => res[0]);

      expect(resource.title).toBe(resourceDataA.title);
      expect(resource.description).toBe(resourceDataA.description);
      expect(resource.value).toBe(resourceDataA.value);
    });

    it('Returns empty array if no resources to get', async () => {
      expect(resourceService.getResources({ id: invalidId })).toStrictEqual([]);
    });

    it('Gets all resources when no filter passed in', async () => {
      const resources = await resourceService.getResources({});
      expect(resources.length).toBe(2);
    });

    it('Gets all resources that match filter', async () => {
      const resources = await resourceService.getResources({ value: resourceDataA.value });
      expect(resources.length).toBe(1);
    });
  });

  describe('editResources', () => {
    it('Updates resource field, returns updated resource', async () => {
      const newDescription = 'Test description';

      const updatedResource1 = await resourceService.editResources({ id: idResourceA }, { description: newDescription }).then((res) => res[0]);
      expect(updatedResource1.description).toBe(newDescription);

      const updatedResource2 = await resourceService.getResources({ id: idResourceA }).then((res) => res[0]);
      expect(updatedResource2.description).toBe(newDescription);
    });

    it('Returns empty array if no resources to edit', async () => {
      expect(await resourceService.editResources({ id: invalidId }, { value: 10000 })).toStrictEqual([]);
    });
  });

  describe('deleteResource', () => {
    it('Deletes existing resource A', async () => {
      await resourceService.deleteResources({ id: idResourceA });
      expect(await resourceService.deleteResources({ id: idResourceA })).toStrictEqual([]);
    });

    it('Deletes existing resource B', async () => {
      await resourceService.deleteResources({ id: idResourceB });
      expect(await resourceService.deleteResources({ id: idResourceA })).toStrictEqual([]);
    });

    it('Reports zero deleted rows if no resources to delete', async () => {
      expect(await resourceService.deleteResources({ id: invalidId })).toStrictEqual(0);
    });
  });
});
