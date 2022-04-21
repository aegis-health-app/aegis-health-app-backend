export interface Recurring {
    recurringDateOfMonth: number
    recurringDay: number
}


export interface AddReminder {
    rid: number
    startingDate: Date
    title: string
    note: string
    isRemindCaretaker: boolean
    importanceLevel: string
    imageid: string
    isDone: boolean
    recurrings: Recurring[]
}