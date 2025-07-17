import { Injectable, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseEnum } from './../enums/ApiResponse';
@Injectable()
export class ApiResponse {
   success(res: Response, message: string = '', data: any = [], code: number = 200): any {
    const response = {
      code: code,
      status: ApiResponseEnum.StatusSuccess,
      message: message,
      result: {
        data: data,
      },
    };

    return res.status(code).json(response);
  }

   failure(res : Response, message: string = '', data: any = [], code: number = 400): any {
    const response = {
      code: code,
      status: ApiResponseEnum.StatusFailed,
      message: message,
      result: {
        data: data,
      },
    };

    return res.status(code).json(response);
  }

   exceptionResponse(res: Response, exception: any): any {
    console.log(exception.message);

   const response =  {
      status: ApiResponseEnum.StatusFailed,
      message: 'An unexpected error was encountered. Please contact the Admin.',
      result: {
        data: null,
      },
      error: exception.message,
    };
    return res.status(500).json(response);
  }
}