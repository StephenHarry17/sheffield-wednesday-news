import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const REQUIRED_SECRETS = [
  'DATABASE_URL',
  'CRON_SECRET',
  'FOOTBALL_DATA_API_KEY',
  'NEWSAPI_KEY',
  'GEMINI_API_KEY',
];

let loadingPromise: Promise<void> | null = null;

async function fetchSecret(
  client: SecretsManagerClient,
  secretName: string
): Promise<string | null> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return response.SecretString ?? null;
  } catch (error: unknown) {
    const code = (error as { name?: string }).name;
    if (code !== 'ResourceNotFoundException' && code !== 'NoSuchEntity') {
      console.error(`[env-loader] Unexpected error fetching secret "${secretName}":`, error);
    }
    return null;
  }
}

async function loadSecretsFromAWS(): Promise<void> {
  if (!process.env.AWS_REGION && !process.env.AWS_EXECUTION_ENV) {
    return;
  }

  const region = process.env.AWS_REGION || 'us-east-1';
  const client = new SecretsManagerClient({ region });
  const appId = process.env.AWS_APP_ID;
  const branch = process.env.AWS_BRANCH;

  for (const name of REQUIRED_SECRETS) {
    if (process.env[name]) {
      continue;
    }

    // Try plain secret name first, then Amplify-prefixed path
    const candidateNames = [name];
    if (appId && branch) {
      candidateNames.push(`${appId}/${branch}/${name}`);
    }

    for (const secretName of candidateNames) {
      const value = await fetchSecret(client, secretName);
      if (value !== null) {
        process.env[name] = value;
        break;
      }
    }
  }
}

export async function ensureEnvLoaded(): Promise<void> {
  if (!loadingPromise) {
    loadingPromise = loadSecretsFromAWS().then(() => {
      const missing = REQUIRED_SECRETS.filter((name) => !process.env[name]);
      if (missing.length > 0) {
        console.warn(
          `[env-loader] The following environment variables are still unset after loading: ${missing.join(', ')}`
        );
      }
    }).catch((error) => {
      console.error('[env-loader] Failed to load secrets from AWS Secrets Manager:', error);
    });
  }
  return loadingPromise;
}
