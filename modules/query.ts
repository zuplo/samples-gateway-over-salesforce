import { ZuploRequest, ZuploContext } from "@zuplo/runtime";
import { getAccessToken } from "./auth";
import env from "@app/environment";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const { access_token } = await getAccessToken();

  const queryRes = await fetch(
    `${env.SFDC_INSTANCE_URL}/services/data/v54.0/query/?q=Select Id, Name from Account`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "content-type": "application/json;charset=UTF-8",
      },
    }
  );

  return queryRes;
}