// Comment 모델 정의
export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userProfileImage?: string;
    content: string;
    createdAt: string;
}