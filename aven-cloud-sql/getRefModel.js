import { Model } from 'objection';

export default function getRefModel(models) {
  class Ref extends Model {
    static tableName = 'refs';

    static get idColumn() {
      return ['name', 'domainName'];
    }

    static get relationMappings() {
      return {
        object: {
          relation: Model.HasOneRelation,
          modelClass: models.Object,
          join: {
            from: 'refs.currentObject',
            to: 'objects.id',
          },
        },
        domain: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Domain,
          join: {
            from: 'refs.domainName',
            to: 'domains.name',
          },
        },
      };
    }
  }
  return Ref;
}
