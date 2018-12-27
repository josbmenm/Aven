import { Model } from 'objection';

export default function getBlockModel() {
  class Obj extends Model {
    static tableName = 'blocks';

    static get idColumn() {
      return ['id'];
    }
  }

  return Obj;
}
