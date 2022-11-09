export interface AzureAccessType {
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
}

export interface MicrosoftUserType {
  businessPhones: any;
  displayName: string;
  givenName: string;
  jobTitle: string;
  mail: string;
  mobilePhone: string;
  officeLocation: string;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
  id: string;
}

export interface MicrosoftUsersType {
  value: MicrosoftUserType[];
}
