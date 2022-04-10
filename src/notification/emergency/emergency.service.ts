import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { NotificationMessage } from '../interface/notification.interface';
import { NotificationService } from '../notification.service';
import { CreateEmergencyRequest } from './dto/create-emergency.dto';

import { EmergencyData, Geolocation } from './emergency.interface';

@Injectable()
export class EmergencyService {
  constructor(private notificationService: NotificationService, private userService: UserService) {}
  async notifyEmergency(createEmergencyRequest: CreateEmergencyRequest, eid: number) {
    const elderly = await this.userService.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true });
    const location: Geolocation = {
      latitude: createEmergencyRequest.latitude,
      longtitude: createEmergencyRequest.longtitude,
      address: createEmergencyRequest.address,
    };
    const message = await this.createEmergencyMessage(elderly, location);
    return await this.notificationService.notifyMany(
      elderly.takenCareBy.map((c) => c.uid),
      message
    );
  }
  async cancelEmergencyNotification(eid: number) {
    const elderly = await this.userService.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true });
    const elderlyName = `${elderly.fname} ${elderly.lname}`;
    const message = {
      data: {
        uid: eid.toString(),
        elderlyName: elderlyName,
        isCancelled: 'true',
      },
      notification: {
        title: 'Emergency Cancelled',
        body: `${elderlyName} cancelled the emergency`,
      },
    };
    return await this.notificationService.notifyMany(
      elderly.takenCareBy.map((c) => c.uid),
      message
    );
  }
  private async createEmergencyMessage(elderly: User, location: Geolocation): Promise<NotificationMessage> {
    const elderlyName = `${elderly.fname} ${elderly.lname}`;
    const emergencyData: EmergencyData = {
      uid: elderly.uid.toString(),
      elderlyImageId: elderly.imageid,
      elderlyName: elderlyName,
      address: location.address,
      timestamp: new Date().toISOString(),
      elderlyPhone: elderly.phone,
      latitude: location.latitude.toString(),
      longtitude: location.longtitude.toString(),
    };
    return {
      data: emergencyData,
      notification: {
        title: 'Emergency',
        body: `${elderlyName} has an emergency`,
      },
    };
  }
}
