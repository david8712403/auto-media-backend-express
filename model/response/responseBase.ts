import { Status, StatusCode } from "./status";

class ResponseBase {
  status: Status = new Status();
  setError = (message: string) => {
    this.status.error = message;
    this.status.code = StatusCode.error;
    return this;
  };
}

export { ResponseBase };
