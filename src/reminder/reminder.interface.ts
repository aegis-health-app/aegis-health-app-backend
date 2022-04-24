export enum ImportanceLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}
export interface Recurring {
  recurringDateOfMonth: number;
  recurringDay: number;
}

export interface GetReminder {
  rid: number;
  startingDateTime: Date;
  title: string;
  note: string;
  isRemindCaretaker: boolean;
  importanceLevel: string;
  imageid: string;
  isDone: boolean;
  recurrings: Recurring[];
}

export interface ModifiedReminder {
  rid: number;
  title: string;
  note: string;
  isRemindCaretaker: boolean;
  importanceLevel: string;
  imageid: string;
  hour: number;
  minute: number;
}

export interface ListReminderEachDate {
  date: Date;
  reminder: ModifiedReminder[];
}

export interface ListUnfinishedReminder {
  overdue: ListReminderEachDate[];
  future: ListReminderEachDate[];
}
