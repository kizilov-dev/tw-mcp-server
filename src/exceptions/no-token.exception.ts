export class NoTokenException extends Error {
  constructor() {
    super("TIMEWEB_TOKEN environment variable is not set");
  }
}