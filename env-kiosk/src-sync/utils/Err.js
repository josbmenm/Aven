export default class Err extends Error {
  constructor(message, type, detail) {
    super(message);
    this.type = type;
    this.detail = detail;
  }

  toJSON() {
    return {
      detail: this.detail,
      type: this.type,
      message: this.message,
    };
  }

  suppressInDevTools = true;
}
