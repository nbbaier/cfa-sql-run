import { Inbound } from "inboundemail";

export const inbound = new Inbound({ apiKey: process.env.INBOUND_API_KEY });

// const mail = await inbound.mail.list({ address: "sql@nicobaier.com" });

const email = await inbound.emails.retrieve("inbnd_3e066154b535fe79");
console.dir(email.thread_id);
