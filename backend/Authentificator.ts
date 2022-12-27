declare module 'express-session' {
    interface SessionData {
        isAdmin: boolean;
        username: string;
        avatarURI: string;
    }
}