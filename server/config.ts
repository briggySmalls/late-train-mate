export interface INationalRailCredentials {
  password: string;
  username: string;
}

export const serverPort = 4300;
export const secret = process.env.SERVER_SECRET || "";
export const length = 128;
export const digest = "sha256";
export const nationalRailCredentials: INationalRailCredentials = {
  password: process.env.NAT_RAIL_PASSWORD || "Manunited14!",
  username: process.env.NAT_RAIL_USERNAME || "sjbriggs14@gmail.com",
};
export const isStubHspApi = false;
