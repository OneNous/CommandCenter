import Store from 'electron-store'
import type { ConnectionProfile } from './types'

type Schema = {
  profiles: ConnectionProfile[]
  activeProfileId: string | null
}

export const appStore = new Store<Schema>({
  name: 'iccp-desktop',
  defaults: {
    profiles: [],
    activeProfileId: null,
  },
})
