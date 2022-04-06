export interface EmotionRecord{
    date: Date;
    emotionLevel: Emotion;
}

export interface EmotionHistory{
    count: number;
    records: EmotionRecord[];
}

export enum Emotion{
    HAPPY = 1,
    NEUTRAL,
    BAD,
    NA
}

