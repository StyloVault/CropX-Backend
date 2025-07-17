import { RequestType } from "./../enums/RequestType";

export class RequestObject {
    
    userId: string;
    body :  any;
    userRole : string;
    url : string;
    method : RequestType
  
    constructor(userId: string, body : any, userRole : string, url: string, method : RequestType) {
      this.userId = userId;
      this.body = body;
      this.userRole = userRole
      this.url = url,
      this.method = method
    }

    static from(userId: string, body: any, userRole : string, url : string, method : RequestType) : RequestObject {
        return new RequestObject(userId, body, userRole, url, method );
      }
  }
