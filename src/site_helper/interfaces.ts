export interface GetFollowsResponse {
    id: string;
    service: string;
    name: string;
}

export abstract class SiteHelper {
    abstract GetFollows(access_token?: string): Promise<GetFollowsResponse[]>;
    abstract GetOauthUrl(): string;
    abstract get OAuthSettingsKey(): string;

    getAccessToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get([this.OAuthSettingsKey], (values) => {
                resolve(values[this.OAuthSettingsKey]);
            });
        });
    }

    protected revokeAccessToken() {
        chrome.storage.sync.remove(this.OAuthSettingsKey);
    }
}
