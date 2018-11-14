import { Model } from "objection";

export default class Object extends Model {
  static tableName = "objects";

  static get idColumn() {
    return ["id"];
  }
}
