import { Injectable, NotFoundException } from '@nestjs/common';
import { NotFoundError } from 'rxjs';
import { AxiosInterceptor } from 'src/common/services/axios.service';
import { AppConfig } from 'src/config.schema';


@Injectable()
export class SafeHaveService {
  apiProviderName='SafeHaven';
  safeHavenAssertion =  AppConfig.SAFEHAVEN_ASSERTION;
  safeHavenOauthId =  AppConfig.SAFEHAVEN_OAUTH_CLIENT_ID
  safeHavenDefaultAccount =  AppConfig.SAFEHAVEN_DEFAULT_ACCOUNT;
  safeHavenBaseUrl = AppConfig.SAFEHAVEN_BASE_URL;
  public cbnBankCode =
    AppConfig.APP_ENV === 'development' ? '951113' : '951113';
  public nibssBankCode =
    AppConfig.APP_ENV === 'development' ? '999240' : '090286';
  constructor(private axiosInterceptor: AxiosInterceptor) {
    //
  }

  async getAccessToken() {
    //
    const data = {
      grant_type: "client_credentials",
      client_id: this.safeHavenOauthId,
      client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: this.safeHavenAssertion,
    }
    let formBody: any = [];
    for (const property in data) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(data[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');

    const response = await this.axiosInterceptor.apiCall({
      method: 'POST',
      data: formBody,
      url: `${this.safeHavenBaseUrl}/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      apiProviderName: this.apiProviderName
    });

    if(response == false) return false;
    return response.data.access_token;;
  }

  async getTransaction() {
    //
  }

  async transfer(data: {
    nameEnquiryReference: string;
    debitAccountNumber?: string ;
    beneficiaryBankCode: string;
    beneficiaryAccountNumber: string;
    narration?: string;
    amount: number;
    paymentReference?: any;
    saveBeneficiary: boolean;
  }) {
    //
    if(!data.debitAccountNumber || data.debitAccountNumber == undefined) {
      data.debitAccountNumber = this.safeHavenDefaultAccount;
    }
    const response = await this.axiosInterceptor.apiCall({
      method: 'POST',
      data: JSON.stringify(data),
      url: `${this.safeHavenBaseUrl}/transfers`,
      headers: {
        Authorization: 'Bearer ' + (await this.getAccessToken()),
        'Content-Type': 'application/json',
        ClientID: this.safeHavenOauthId,
      },
      apiProviderName: this.apiProviderName
    })

    return response;
  }

  async getBank() {
    return await this.axiosInterceptor.apiCall({
      method: 'GET',
      url: `${this.safeHavenBaseUrl}/transfers/banks`,
      headers:{
        Authorization: 'Bearer ' + (await this.getAccessToken()),
        'Content-Type': 'application/json',
        ClientID: this.safeHavenOauthId,
      },
      apiProviderName: this.apiProviderName
    })
  }

  async nameEnquiry(data: { bankCode: string; accountNumber: string }) {
    const response = await this.axiosInterceptor.apiCall({
      method: 'POST',
      data: JSON.stringify(data),
      url: `${this.safeHavenBaseUrl}/transfers/name-enquiry`,
      headers: {
        Authorization: 'Bearer ' + (await this.getAccessToken()),
        'Content-Type': 'application/json',
        ClientID: this.safeHavenOauthId,
      },
      apiProviderName: this.apiProviderName
    })
    return response;
    
  }

   async createAccount(data: {
    firstName: string;
    lastName?: string;
    phoneNumber: string;
    emailAddress: string;
    externalReference: string;
    bvn?: string;
    accountType?: string;
    metadata?: object;
    autoSweep?: boolean;
    autoSweepDetails?: { schedule: 'Instant'; accountNumber: string };
  }){
    const response = await this.axiosInterceptor.apiCall({
      method: 'POST',
      data: JSON.stringify(data),
      url: `${this.safeHavenBaseUrl}/accounts/subaccount`,
      headers: {
        Authorization: 'Bearer ' + (await this.getAccessToken()),
        'Content-Type': 'application/json',
        ClientID: this.safeHavenOauthId,
      },
      apiProviderName: this.apiProviderName
    })

    return response;
    
  }
  async createVirtualAccount(data: {
    validFor: number;
    settlementAccount : {
      bankCode :string,
      accountNumber:string
    },
    accountName : string,
    amountControl : string,
    amount: number,
    callbackUrl: string,
    externalReference?: any
  }){
    try {
     const response = await this.axiosInterceptor.apiCall({
      method: 'POST',
      data: JSON.stringify(data),
      url: `${this.safeHavenBaseUrl}/virtual-accounts`,
      headers: {
        Authorization: 'Bearer ' + (await this.getAccessToken()),
        'Content-Type': 'application/json',
        ClientID: this.safeHavenOauthId,
      },
      apiProviderName: this.apiProviderName
          })  
          if(response.statusCode >= 400) {
            throw new Error('Error creating account')
          }
      
    
        return response;
        }catch (error) {
          throw new Error('Error creating account')
        }

    
  }

  async getVirtualAccount(id: string){
    
    const response = await this.axiosInterceptor.apiCall({
      method: 'GET',
      url: `${this.safeHavenBaseUrl}/virtual-accounts/${id}`,
      headers: {
        Authorization: 'Bearer ' + (await this.getAccessToken()),
        'Content-Type': 'application/json',
        ClientID: this.safeHavenOauthId,
      },
      apiProviderName: this.apiProviderName
    })

     if(response.statusCode >= 400) {
      throw new Error('Error creating account')
    }

    return response;
    
  }


}
