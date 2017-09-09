export const serverPort = 4300;
export const secret = process.env.SERVER_SECRET || '';
export const length = 128;
export const digest = "sha256";
export const nationalRailCredentials = {
  'username': process.env.NAT_RAIL_USERNAME || '',
  'password': process.env.NAT_RAIL_PASSWORD || ''
};
export const isStubHspApi = false;
