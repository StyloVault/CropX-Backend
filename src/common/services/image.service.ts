import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageStorage {

    async getImageURL(imageData){
        const urlImage = "http://127.0.0.1:4000/api/v1/image/upload"
        const formData = new FormData();
        formData.append('file', imageData.buffer, imageData.originalname);

        // Send the FormData using Axios
        const response = axios.post(urlImage, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
        })
        .then(response => {
           return  response.data;
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            return error.data;
        });

        return response;
    }
}
