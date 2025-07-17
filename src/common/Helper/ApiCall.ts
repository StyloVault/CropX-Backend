import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { AppConfig } from './../../config.schema';
import { RequestObject } from './RequestObject';
import { AxiosInterceptor } from '../services/axios.service';

@Injectable()
export class ApiCall {
  public apiProviderName = 'MICROSERVICE CALL';
  constructor(private axiosInterceptor: AxiosInterceptor) {
    //
  }
  protected accessToken: string;
  protected headers: {};

  async transport(request: RequestObject) {
    (await this.setToken(request)).setHeaders();

    try {
      const { status, data } = await this.axiosInterceptor.apiCall({
        method: request.method,
        data: request.body,
        url: request.url,
        headers: this.headers,
        apiProviderName: this.apiProviderName,
      });

      return { status, data };
    } catch (error) {
      const { status, data } = error.response;
      return { status, data };
    }
  }

  private async setToken(request: RequestObject) {
    const payload = {
      sID: request.userId,
      userRole: request.userRole,
      usage: 'TRANSPORT',
    };

    this.accessToken = await jwt.sign(payload, AppConfig.JWT_SECRET, {
      expiresIn: '15m',
    });

    return this;
  }

  private setHeaders() {
    this.headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };
  }
}
