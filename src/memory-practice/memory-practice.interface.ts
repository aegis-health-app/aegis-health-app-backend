export interface MultipleChoiceQuestion{
    choice1: string;
    choice2: string;
    choice3: string;
    choice4: string;
    correctAnswer: string;
}

export interface MemoryPracticeQuestion{
    mid: number;
    question: string;
    imageid: string;
    multipleChoiceQuestion: MultipleChoiceQuestion;
    isMultipleChoice: boolean
}

export interface MemoryPracticeQuestionSet{
    questions: MemoryPracticeQuestion[];
}

