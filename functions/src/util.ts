import { IS_EMULATOR } from "./config";
import { GoogleAuth } from "google-auth-library";

export async function uploadFileToStorage(bucket: any, filePath: string, destination: string) {
    await bucket.upload(filePath, {
      destination,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log(`${filePath} uploaded to ${destination}`);
    return `gs://${bucket.name}/${destination}`;
  }

  // Helper function to get the function URL
export async function getFunctionUrl(name: string, location = "us-central1") {
  if (IS_EMULATOR) {
    return `http://127.0.0.1:5001/smarthome-d6e27/${location}/${name}`;
  }

  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const projectId = await auth.getProjectId();
  const url = `https://cloudfunctions.googleapis.com/v2beta/projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  interface FunctionResponse {
    serviceConfig: { uri: string }
  }
  const res = await client.request<FunctionResponse>({ url });
  const uri = res.data?.serviceConfig?.uri;
  if (!uri) {
    throw new Error(`Unable to retrieve uri for function at ${url}`);
  }
  return uri;
}