export interface EmotionRecord{
    date: Date;
    emotionLevel: string;
}

export interface EmotionHistory{
    count: number;
    records: EmotionRecord[];
}