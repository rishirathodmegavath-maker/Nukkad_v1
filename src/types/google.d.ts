interface GoogleCodeResponse {
  code?: string
  error?: string
}

interface GoogleCodeClient {
  requestCode: () => void
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
    }
  }
}
