import Client from "@snapshot-labs/snapshot.js/src/client";

const hubUrl: string = "https://hub.snapshot.org";
const client = new Client(hubUrl);

export default client;
