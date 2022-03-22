export interface ElderlyCode {
    code: string;
}

export interface UserInfo{
    uid: number;
    phone: string;
    imageid?: string;
    fname: string;
    lname: string;
    dname?: string;
    bday: Date;
    gender: string;
    isElderly: boolean;
    healthCondition?: string;
    bloodType?: string;
    personalMedication?: string;
    allergy?: string;
    vaccine?: string;
}
