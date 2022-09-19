import { Router } from 'express';
import { sessions, sessionStore } from "./database";
import axios from 'axios';
import debug from 'debug';

export const authRouter = Router();
authRouter.use(sessionStore);

const dbg = debug("ironman:authenticator");
let isLocalAuthEnabled = true;

function getRedirectURI(): string {
    return encodeURIComponent(`${process.env.PUBLIC_ORIGIN}/auth/discord_callback`);
}

authRouter.get("/discord_login", (req, res) => {
    const discordRedirect = "https://discord.com/api/oauth2/authorize" +
                            "?response_type=code" +
                            `&client_id=${process.env.DISCORD_ID}` +
                            "&scope=identify%20guilds.members.read" +
                            `&state=${req.sessionID}` +
                            `&redirect_uri=${getRedirectURI()}`
    res.redirect(discordRedirect);
})

authRouter.get("/discord_callback", async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    if (state !== req.sessionID) {
        dbg("Discord callback - bad state");
        res.sendStatus(400);
        return;
    }
    const data = `client_id=${process.env.DISCORD_ID}&` +
                `client_secret=${process.env.DISCORD_SECRET}&` +
                `grant_type=authorization_code&` +
                `code=${code}&` +
                `redirect_uri=${getRedirectURI()}`
    const request = await axios.post("https://discord.com/api/oauth2/token", data, { validateStatus: () => { return true } });
    if (request.status !== 200) {
        dbg("Discord callback - non 200 token code: %d: %o", request.status, request.data);
        res.sendStatus(400);
        return;
    }
    let hasAccess = false;
    let username = "";
    let avatar = "";
    const token = request.data.access_token;
    for (const guild of (process.env.DISCORD_GUILDS as string).split(";")) {
        const user = await axios.get(`https://discord.com/api/v10/users/@me/guilds/${guild}/member`, { headers: {"Authorization": `Bearer ${token}`}, validateStatus: () => { return true } });
        if (user.status === 200) {
            for (const role of (process.env.DISCORD_ROLES as string).split(";")) {
                if (user.data.roles.includes(role)) {
                    hasAccess = true;
                    username = user.data.user.username + "#" + user.data.user.discriminator;
                    avatar = `https://cdn.discordapp.com/avatars/${user.data.user.id}/${user.data.user.avatar}.png`
                }
            }
        }
    }
    if (hasAccess) {
        dbg("Discord callback - User %s login successful", username);
        req.session.isAdmin = true;
        req.session.username = username;
        req.session.avatarURI = avatar;
    }
    res.redirect("/");
})

authRouter.post("/local_login", (req, res) => {
    if (req.body.password === process.env.LOCAL_PASSWORD && process.env.LOCAL_PASSWORD !== undefined && isLocalAuthEnabled) {
        dbg("Local login - successful");
        req.session.isAdmin = true;
        req.session.username = "local_root";
        req.session.avatarURI = "";
        res.sendStatus(204);
        return;
    }
    dbg("Local login - failed");
    res.sendStatus(403);
    return;
});

authRouter.get("/super_secret_localauth_toggle", (req, res) => {
    if (isLocalAuthEnabled) {
        // Disabling local auth, invalidating any local sessions that existed
        isLocalAuthEnabled = false;

        let disabled = 0;
        if (req.session.isAdmin && req.session.username === "local_root" && req.session.avatarURI === "") {
            req.session.destroy((err) => {
                if (err) {
                    dbg("Error destroying caller session %o", err);
                }
            });
            disabled++;
        }

        sessions.all((err, allSessions) => {
            if (err) {
                dbg("Local_auth toggle - %s", err);
            }
            if (allSessions === null || allSessions === undefined) {
                dbg("local_auth toggle - no sessions to invalidate");
            }
            const promises = [] as Promise<void>[];
            for (const sid in allSessions) {
                const session = allSessions[sid];
                if (session.isAdmin && session.username === "local_root" && session.avatarURI === "") {
                    dbg("%s", sid);
                    promises.push(new Promise<void>((resolve, reject) => { sessions.destroy(sid, (err) => {
                        if (err) {
                            dbg("Err in sessions.destroy: %o", err);
                            reject();
                        } else {
                            resolve();
                        }
                    })}));
                    disabled++;
                }
            }
            Promise.all(promises).then(() => {
                dbg("Local auth deactivated & %d local sessions invalidated.", disabled);
                res.send("Local auth deactivated & all local sessions invalidated.");
            });
        });
    } else {
        // We're just reactivating local auth
        isLocalAuthEnabled = true;
        dbg("Local auth re-enabled.");
        res.send("Local auth re-enabled.");
    }
});