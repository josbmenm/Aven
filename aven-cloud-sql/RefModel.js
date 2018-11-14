import { Model } from "objection";

export default class Ref extends Model {
  static tableName = "refs";

  static get idColumn() {
    return ["name", "domain"];
  }
}
