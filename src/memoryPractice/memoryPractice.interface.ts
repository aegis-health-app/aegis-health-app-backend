export interface Question {
  mid: string,
  question: string,
  isSelected: boolean,
  imageid: string,
  uid: number
}

export interface AllQuestionsCaretaker {
  questions: Question[]
}

export interface QuestionDetails {
  question: string,
  imageid: string
  isMCQ: boolean,
  choice1?: string,
  choice2?: string,
  choice3?: string,
  choice4?: string,
  correctAnswer?: string
}