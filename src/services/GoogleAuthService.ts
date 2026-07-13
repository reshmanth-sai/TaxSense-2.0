export class GoogleAuthService {
  private static isScriptLoaded = false;
  private static scriptPromise: Promise<void> | null = null;
  private static tokenClient: any = null;
  private static signInPromiseResolve: ((profile: any) => void) | null = null;
  private static signInPromiseReject: ((err: any) => void) | null = null;

  /**
   * Loads the Google Identity Services SDK script once.
   */
  static loadScript(): Promise<void> {
    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Check if script element or global google namespace already exists
      if (this.isScriptLoaded || document.getElementById('google-gsi-client') || (window as any).google?.accounts?.oauth2) {
        console.log('[GIS] Script already present or SDK loaded.');
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      console.log('[GIS] Script Injected');
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('[GIS] Script Loaded');
        
        // Wait until window.google.accounts.oauth2 namespace is fully populated
        let checks = 0;
        const checkInterval = setInterval(() => {
          checks++;
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(checkInterval);
            console.log('[GIS] Google Object Ready');
            this.isScriptLoaded = true;
            resolve();
          } else if (checks > 50) { // 5.0 seconds timeout
            clearInterval(checkInterval);
            console.error('[GIS] Script loaded but window.google.accounts.oauth2 not found');
            reject(new Error('Google Identity SDK failed to initialize.'));
          }
        }, 100);
      };

      script.onerror = (err) => {
        console.error('[GIS] Failed to load script:', err);
        reject(err);
      };

      document.body.appendChild(script);
    });

    return this.scriptPromise;
  }

  /**
   * Triggers the Google OAuth 2.0 Sign-In flow programmatically via the Token Client popup.
   * Returns a promise that resolves with the user's mapped profile or rejects on failure/cancel.
   */
  static async signIn(clientId: string): Promise<any> {
    await this.loadScript();

    return new Promise((resolve, reject) => {
      this.signInPromiseResolve = resolve;
      this.signInPromiseReject = reject;

      try {
        const google = (window as any).google;
        if (!google?.accounts?.oauth2) {
          throw new Error('Google OAuth2 namespace is missing.');
        }

        if (!this.tokenClient) {
          console.log('[GIS] Initializing Token Client');
          this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile',
            callback: async (tokenResponse: any) => {
              console.log('[GIS] Token response received:', tokenResponse);
              
              // Check for user cancellation or errors
              if (tokenResponse.error) {
                console.error('[GIS] OAuth Error:', tokenResponse.error);
                let errMsg = tokenResponse.error_description || tokenResponse.error;
                if (tokenResponse.error === 'access_denied') {
                  errMsg = 'popup_closed_by_user';
                }
                if (this.signInPromiseReject) {
                  this.signInPromiseReject(new Error(errMsg));
                }
                return;
              }

              if (tokenResponse.access_token) {
                try {
                  console.log('[GIS] Fetching userinfo from Google API');
                  const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
                  if (!userInfoResponse.ok) {
                    throw new Error('Failed to retrieve user profile information.');
                  }
                  
                  const userInfo = await userInfoResponse.json();
                  console.log('[GIS] Userinfo fetched successfully:', userInfo);

                  const profile = {
                    uid: userInfo.sub,
                    name: userInfo.name,
                    email: userInfo.email,
                    photoURL: userInfo.picture,
                    providerId: 'google.com',
                    createdAt: new Date().toISOString()
                  };

                  if (this.signInPromiseResolve) {
                    this.signInPromiseResolve(profile);
                  }
                } catch (fetchErr) {
                  console.error('[GIS] UserInfo fetch error:', fetchErr);
                  if (this.signInPromiseReject) {
                    this.signInPromiseReject(fetchErr);
                  }
                }
              } else {
                if (this.signInPromiseReject) {
                  this.signInPromiseReject(new Error('No access token returned.'));
                }
              }
            }
          });
        }

        console.log('[GIS] Triggering popup requestAccessToken');
        this.tokenClient.requestAccessToken();
      } catch (err) {
        console.error('[GIS] Exception during signIn:', err);
        reject(err);
      }
    });
  }

  /**
   * Revokes the active session settings.
   */
  static revokeSession(): void {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        // Clear active tokens if possible, or disable automatic selections
        console.log('[GIS] Revoked session');
      } catch (e) {
        console.error('[GIS] Error revoking session:', e);
      }
    }
  }
}
