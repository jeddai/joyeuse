export interface ManifestItem {
  name: string
  path?: string
  children?: ManifestItem[]
  type: 'section' | 'doc'
}
