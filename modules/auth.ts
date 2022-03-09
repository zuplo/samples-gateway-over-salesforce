import env from "@app/environment";
import {
  importPKCS8,
  SignJWT,
} from "@zuplo/runtime";

const SFDC_CONSUMER_KEY = env.SFDC_CONSUMER_KEY;
const SFDC_USERNAME = env.SFDC_USERNAME;
const SFDC_AUDIENCE = env.SFDC_AUDIENCE;
const SFDC_PRIVATE_KEY = env.SFDC_PRIVATE_KEY;

export interface RefreshTokenResponse {
  id: string;
  instance_url: string;
  access_token: string;
  scope: string;
  token_type: string;
}

export async function getAccessToken(): Promise<RefreshTokenResponse> {
  const ALG = "RS256";
  const JWT_EXPIRATION_TIME = "1h";
  const ecPrivateKey = await importPKCS8(SFDC_PRIVATE_KEY, ALG);

  // Create the JWT assertion
  const token = await new SignJWT({ scope: "api refresh_token" })
    .setProtectedHeader({ alg: ALG, typ: "JWT" })
    .setAudience(SFDC_AUDIENCE)
    .setIssuer(SFDC_CONSUMER_KEY)
    .setSubject(SFDC_USERNAME)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .sign(ecPrivateKey);

  const res = await fetch(`${SFDC_AUDIENCE}/services/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      assertion: token,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
  });

  const resJSON: RefreshTokenResponse = await res.json();
  return resJSON;
}