interface GoogleCredentialResponse {
  credential: string
}

interface Window {
  google?: {
    accounts: {
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
