export interface DiscordAuth {
    token_type: 'Bearer'
    access_token: string
    expires_in: number
    scope: 'identify'
    state: string
    expires_at: Date
}