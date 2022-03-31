export class Device {
  token: string;
  timestamp: Date;
}

export class NotificationMessage {
  data?: { [key: string]: any };
  notification?: {
    title: string;
    body: string;
  };
}
