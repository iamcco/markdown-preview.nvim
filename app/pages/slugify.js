import { slug as githubSlug } from 'github-slugger'

export function createGithubSlugify() {
  return (value) => githubSlug(value)
}
