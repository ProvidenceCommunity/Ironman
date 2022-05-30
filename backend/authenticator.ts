import { Router } from 'express';
import { sessionStore } from "./database";

export const authRouter = Router();
authRouter.use(sessionStore);

authRouter.get("/discord_login", (req, res) => {
    // TODO - Redirect
})

authRouter.get("/discord_callback", (req, res) => {
    // TODO - Checking & logging in
})

authRouter.post("/local_login", (req, res) => {
    // TODO - Checking of local credentials
});

authRouter.get("/local_login", (req, res) => {
    // TODO - Remove me, I'm a debug route!
    req.session.isAdmin = true;
    req.session.username = "root";
    req.session.avatarURI = "";
    res.sendStatus(204);
});
