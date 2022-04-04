import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { NotificationMessage } from '../interface/notification.interface';
import { NotificationService } from '../notification.service';
import { CreateEmergencyRequest } from './dto/create-emergency.dto';

import { EmergencyData, Geolocation } from './emergency.interface';

@Injectable()
export class EmergencyService {
  constructor(private notificationService: NotificationService, private userService: UserService) {}
  async notifyEmergency(createEmergencyRequest: CreateEmergencyRequest) {
    const caretakers = await this.userService.findCaretakerByElderlyId(createEmergencyRequest.eid);
    const message = await this.createEmergencyMessage(createEmergencyRequest.eid, createEmergencyRequest.location);
    return await this.notificationService.notifyMany(
      caretakers.map((c) => c.uid),
      message
    );
  }
  private async createEmergencyMessage(eid: number, location: Geolocation): Promise<NotificationMessage> {
    const elderly = await this.userService.findElderlyById(eid);
    const elderlyName = `${elderly.fname} ${elderly.lname}`;
    const emergencyData: EmergencyData = {
      elderlyImageId: elderly.imageid,
      elderlyName: elderlyName,
      location: location,
      timestamp: new Date(),
      elderlyPhone: elderly.phone,
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
