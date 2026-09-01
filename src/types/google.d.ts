interface GoogleCodeResponse {
  code?: string
  error?: string
}

interface GoogleCodeClient {
  requestCode: () => void
}

interface GoogleCredentialResponse {
  credential: string
}

interface Window {
  google?: {
    accounts: {
      oauth2: {
        initCodeClient: (config: {
          client_id: string
          scope: string
          ux_mode: 'redirect'
          redirect_uri: string
          state?: string
        }) => GoogleCodeClient
      }
      id: {
        initialize: (config: {
          client_id: string
          callback: (response: GoogleCredentialResponse) => void
        }) => void
        renderButton: (
          parent: HTMLElement,
          options: { theme?: string; size?: string; width?: number; text?: string },
        ) => void
      }
    }
  }
}
