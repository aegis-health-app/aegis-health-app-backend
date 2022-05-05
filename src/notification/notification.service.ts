import { BadRequestException, Injectable } from '@nestjs/common';
import * as firestoreAdmin from 'firebase-admin/firestore';
import { messaging } from 'firebase-admin';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import { Device, NotificationMessage } from './interface/notification.interface';
import { BatchResponse, Message, MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
@Injectable()
export class NotificationService {
  private collection: firestoreAdmin.CollectionReference;
  private messenger: Messaging;
  constructor() {
    this.collection = firestoreAdmin.getFirestore().collection('aegis-notification');
    this.messenger = messaging();
  }
  async validateRegistrationToken(registrationToken: string): Promise<boolean> {
    try {
      return !!(await this.messenger.send({ token: registrationToken }, true));
    } catch (err) {
      return false;
    }
  }
  async registerDevice(uid: number, registrationToken: string): Promise<firestoreAdmin.WriteResult> {
    const validation = await this.validateRegistrationToken(registrationToken);
    if (!validation) throw new BadRequestException('Invalid token');
    const deviceRef = this.collection.doc(uid.toString());
    const res = await deviceRef.set({
      token: registrationToken,
      timestamp: Date.now(),
    });
    return res;
  }
  async findDeviceByUid(uid: number): Promise<Device> {
    const ref = await this.collection.doc(uid.toString()).get();
    return ref.data() as Device;
  }
  async findManyDevicesByUids(uids: number[]) {
    const stringUids = uids.map((uid) => uid.toString());
    const results = [];
    //query uids array in a chunk of 10 uid because firestore only limit 10 per query
    for (let i = 0; i < stringUids.length; i += 10) {
      const chunk = stringUids.slice(i, i + 10);
      const ref = await this.collection.where(firestoreAdmin.FieldPath.documentId(), 'in', chunk).get();
      Array.prototype.push.apply(results, ref.docs);
    }
    return results.map((doc) => doc.data()).filter((device) => !!device) as Device[];
  }
  async createPayload(receiverUids: number[], message: NotificationMessage): Promise<Message | MulticastMessage> {
    if (receiverUids.length > 1) {
      const receiverDevices = await this.findManyDevicesByUids(receiverUids);
      if (!receiverDevices || !receiverDevices.length) throw new BadRequestException('Unregistered Caretaker Device');
      const tokens = receiverDevices.map((device) => device.token);
      return { data: message.data, tokens: tokens, notification: message.notification };
    }
    const receiverDevice = await this.findDeviceByUid(receiverUids[0]);
    if (!receiverDevice || !receiverDevice.token) throw new BadRequestException('Unregistered Caretaker Device');
    return { data: message.data, token: receiverDevice.token, notification: message.notification };
  }
  async notifyOne(receiverUid: number, message: NotificationMessage): Promise<string> {
    const payload = await this.createPayload([receiverUid], message);
    const res = await this.messenger.send(payload as Message);
    return res;
  }
  async notifyMany(receiverUids: number[], message: NotificationMessage): Promise<BatchResponse> {
    const payload = await this.createPayload(receiverUids, message);
    const res = await this.messenger.sendMulticast(payload as MulticastMessage);
    return res;
  }
}
