import { Injectable } from '@nestjs/common';
import { AxiosInterceptor } from 'src/common/services/axios.service';
import { AppConfig } from 'src/config.schema';

@Injectable()
export class SudoService {
  apiProviderName = 'SudoAfrica';
  baseUrl = AppConfig.SUDO_BASE_URL;
  apiKey = AppConfig.SUDO_API_KEY;

  constructor(private axiosInterceptor: AxiosInterceptor) {}

  private async apiCall(method: string, url: string, data: any = {}) {
    const response = await this.axiosInterceptor.apiCall({
      method,
      data,
      url: this.baseUrl + url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      apiProviderName: this.apiProviderName,
    });

    return response;
  }

  async createCardHolder(data: {
    type: string;
    name: string;
    status: string;
    individual: {
      firstName: string;
      lastName: string;
    };
    billingAddress: {
      line1: string;
      city: string;
      state: string;
      country: string;
    };
  }) {
    return this.apiCall('POST', 'customers', data);
  }

  async createCard(data: {
    type: string;
    customerId: string;
    status: string;
    number: string;
    currency: string;
    brand : string
  }) {
    return this.apiCall('POST', 'cards', data);
  }

  async getCard(cardId: string) {
    return this.apiCall('GET', `cards/${cardId}`);
  }

  async getCustomerCards(customerId: string) {
    return this.apiCall('GET', `customers/${customerId}/cards`);
  }

  async getAllCards() {
    return this.apiCall('GET', 'cards');
  }

  async sendDefaultCardPin(cardId: string) {
    return this.apiCall('PUT', `cards/${cardId}/send-pin`);
  }

  async changeCardPin(cardId: string, data: { newPin: string }) {
    return this.apiCall('POST', `cards/${cardId}/pin`, data);
  }

  async enrollCardFor2FA(cardId: string) {
    return this.apiCall('POST', `cards/${cardId}/enroll-for-2fa`);
  }

  async updateCard(cardId: string, data: { status: string }) {
    return this.apiCall('PUT', `cards/${cardId}`, data);
  }

  async generateCardToken(cardId: string) {
    return this.apiCall('POST', `cards/${cardId}/generate-token`);
  }

  async orderCards(data: {
    customerId: string;
    type: string;
    quantity: number;
  }) {
    return this.apiCall('POST', 'cards/order', data);
  }
}
