export interface GetFollowsResponse {
    id: string;
    service: string;
    name: string;
}

export abstract class SiteHelper {
    abstract GetFollows(access_token?: string): Promise<GetFollowsResponse[]>;
    abstract GetOauthUrl(): string;
}
