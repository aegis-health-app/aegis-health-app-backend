export interface ElderlyCode {
    code: string;
}

export interface CaretakerInfo{
    uid: number;
    phone: string;
    imageid?: string;
    fname: string;
    lname: string;
    dname?: string;
    bday: Date;
    gender: string;
}

export interface ElderlyProfile{
    uid: number;
    imageid?: string;
    fname: string;
    lname: string;
    dname?: string;
}
