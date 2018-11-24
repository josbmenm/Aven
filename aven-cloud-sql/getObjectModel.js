import { Model } from 'objection';

export default function getObjectModel() {
  class Obj extends Model {
    static tableName = 'objects';

    static get idColumn() {
      return ['id'];
    }
  }

  return Obj;
}
