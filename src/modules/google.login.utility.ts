import { OAuth2Client } from "google-auth-library";

let googleClient: OAuth2Client | null = null;

export const googleLoginUtility = async (token: string, clientId: string) => {
  if (!googleClient) {
    googleClient = new OAuth2Client(clientId);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: clientId,
  });

  return ticket.getPayload();
};
