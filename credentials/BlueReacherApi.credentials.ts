import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class BlueReacherApi implements ICredentialType {
  name = "blueReacherApi";

  displayName = "Blue Reacher API";

  documentationUrl = "https://docs.bluereacher.com";

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      description:
        "Your Blue Reacher API key. Test keys (brk_test_) hit a simulator and never send a real message; live keys start with brk_live_.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://api.bluereacher.com",
      url: "/v1/devices",
    },
  };
}
