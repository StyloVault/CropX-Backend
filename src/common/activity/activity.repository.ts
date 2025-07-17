import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Activity } from "./activity.schema";


@Injectable()
export class ActivityRepository {

    constructor(
      @InjectModel('Activity') private readonly activityModel: Model<Activity>,
    ){}

    public async createActivity(data : any) : Promise<Activity> {
      try {
          return await this.activityModel.create(data);
      } catch (error) {
          throw new Error('Activity could not be created');
      }
     }

     public async getAll(query, sID: string|null  = null) {
        let { search, page, limit, sort, fields } = query;

       const queryObject : any = {};

        if(sID) queryObject.businessId = sID;
        if (search) queryObject.description = { $regex: search, $options: 'i' };

        
        let result :any = this.activityModel.find(queryObject)
        if (sort) {
          const sortList = sort.split(',').join(' ');
          result = result.sort(sortList);
        } else {
          result = result.sort('createdAt');
        }
      
        if (fields) {
          const fieldsList = fields.split(',').join(' ');
          result = result.select(fieldsList);
        }
      
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const skip = (page - 1) * limit;
      
        result = result.skip(skip).limit(limit);
        const response = await result.exec(); 
    
        const numOfPages = Math.ceil(response.length / limit);
        return {
          activities: response,
          count: response.length,
          numOfPages,
        };
       }
       
      
   
 


  async getSingleActivity(data : any) {
      const activity = await this.activityModel.findOne(data)
      
      if(!activity) {
          throw new Error('Activity not found');
      }

      return activity;
  }
  
  async updateActivity(search : any, data : any) {
      return await this.activityModel.findOneAndUpdate(search, data, {
          new: true,
      });
  }
  
  public async deleteSingleActivity(data: any) : Promise<void> {
      
      const activity =  await this.activityModel.findOne(data).exec()

      if(!activity) {
          throw new Error('Activity not found');
      }

      await activity.deleteOne();
  }
}