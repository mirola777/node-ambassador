import admin from "firebase-admin";
import NodeCache from "node-cache";

const account = require("../firebase_account_key.json");

admin.initializeApp({
  credential: admin.credential.cert(account),
});

const cache = new NodeCache({ stdTTL: 60 });

async function getRemoteConfigGroup(group: string) {
  const cacheKey = `template_${group}`;

  let parameters = cache.get(cacheKey) as { [key: string]: string };

  if (!parameters) {
    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();

    const groupParameters = template.parameterGroups[group].parameters;

    parameters = Object.keys(groupParameters).reduce(
      (acc, key) => ({
        ...acc,
        [key]: (groupParameters[key]?.defaultValue as any)?.value || "",
      }),
      {}
    );

    cache.set(cacheKey, parameters);
  }

  return parameters;
}

export async function getRemoteConfigValue<T>(key: string) {
  const cacheKey = `value_${key}`;

  let value = cache.get(cacheKey) as T;

  if (!value) {
    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();

    value = (template.parameters[key]?.defaultValue as any).value as T;

    cache.set(cacheKey, value);
  }

  return value;
}

export const getMicroserviceUrl = async (
  microservice: string
): Promise<string | undefined> => {
  const template = await getRemoteConfigGroup("microservices-urls");

  return template[microservice];
};
