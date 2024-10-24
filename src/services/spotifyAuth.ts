import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface AuthConfig {
    clientId: string;
    clientSecret: string;
}

class SpotifyAuthService {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiration: Date | null = null;

    constructor(config: AuthConfig) {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
    }

    private isTokenExpired(): boolean {
        if (!this.tokenExpiration || !this.accessToken) return true;
        // Add 1-minute buffer before actual expiration
        return new Date() >= new Date(this.tokenExpiration.getTime() - 60000);
    }

    public async getAccessToken(): Promise<string> {
        try {
            if (this.accessToken && !this.isTokenExpired()) {
                return this.accessToken;
            }

            const authBuffer = Buffer.from(
                `${this.clientId}:${this.clientSecret}`
            ).toString('base64');

            const response = await axios.post<SpotifyTokenResponse>(
                'https://accounts.spotify.com/api/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        Authorization: `Basic ${authBuffer}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiration = new Date(
                Date.now() + response.data.expires_in * 1000
            );

            return this.accessToken;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    `Spotify authentication failed: ${error.response?.data?.error_description || error.message}`
                );
            }
            throw error;
        }
    }

    public async getAuthenticatedHeaders(): Promise<Record<string, string>> {
        const token = await this.getAccessToken();
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }
}

export default SpotifyAuthService;
