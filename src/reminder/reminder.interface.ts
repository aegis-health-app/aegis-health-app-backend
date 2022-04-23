export interface Recurring {
    recurringDateOfMonth: number
    recurringDay: number
}

export interface Reminder {
    rid: number
    startingDate: Date
    title: string
    note: string
    isRemindCaretaker: boolean
    importanceLevel: string
    imageid: string
    isDone: boolean
}

export interface GetReminder extends Reminder {
    recurrings: Recurring[]
}

export interface FinishedReminder  {
    rid: number
    title: string
    note: string
    isRemindCaretaker: boolean
    importanceLevel: string
    imageid: string
    hour: number
    minute: number
}

export interface ListFinishedReminder {
    date: Date
    reminder: FinishedReminder[]
}