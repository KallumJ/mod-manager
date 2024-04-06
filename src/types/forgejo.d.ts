export interface ForgejoPackage {
    id: number
    owner: Owner
    repository: Repository
    creator: Creator
    type: string
    name: string
    version: string
    html_url: string
    created_at: string
  }
  
  export interface Owner {
    id: number
    login: string
    login_name: string
    full_name: string
    email: string
    avatar_url: string
    language: string
    is_admin: boolean
    last_login: string
    created: string
    restricted: boolean
    active: boolean
    prohibit_login: boolean
    location: string
    website: string
    description: string
    visibility: string
    followers_count: number
    following_count: number
    starred_repos_count: number
    username: string
  }
  
  export interface Repository {
    id: number
    owner: Owner2
    name: string
    full_name: string
    description: string
    empty: boolean
    private: boolean
    fork: boolean
    template: boolean
    parent: any
    mirror: boolean
    size: number
    language: string
    languages_url: string
    html_url: string
    url: string
    link: string
    ssh_url: string
    clone_url: string
    original_url: string
    website: string
    stars_count: number
    forks_count: number
    watchers_count: number
    open_issues_count: number
    open_pr_counter: number
    release_counter: number
    default_branch: string
    archived: boolean
    created_at: string
    updated_at: string
    archived_at: string
    permissions: Permissions
    has_issues: boolean
    internal_tracker: InternalTracker
    has_wiki: boolean
    has_pull_requests: boolean
    has_projects: boolean
    has_releases: boolean
    has_packages: boolean
    has_actions: boolean
    ignore_whitespace_conflicts: boolean
    allow_merge_commits: boolean
    allow_rebase: boolean
    allow_rebase_explicit: boolean
    allow_squash_merge: boolean
    allow_rebase_update: boolean
    default_delete_branch_after_merge: boolean
    default_merge_style: string
    default_allow_maintainer_edit: boolean
    avatar_url: string
    internal: boolean
    mirror_interval: string
    mirror_updated: string
    repo_transfer: any
  }
  
  export interface Owner2 {
    id: number
    login: string
    login_name: string
    full_name: string
    email: string
    avatar_url: string
    language: string
    is_admin: boolean
    last_login: string
    created: string
    restricted: boolean
    active: boolean
    prohibit_login: boolean
    location: string
    website: string
    description: string
    visibility: string
    followers_count: number
    following_count: number
    starred_repos_count: number
    username: string
  }
  
  export interface Permissions {
    admin: boolean
    push: boolean
    pull: boolean
  }
  
  export interface InternalTracker {
    enable_time_tracker: boolean
    allow_only_contributors_to_track_time: boolean
    enable_issue_dependencies: boolean
  }
  
  export interface Creator {
    id: number
    login: string
    login_name: string
    full_name: string
    email: string
    avatar_url: string
    language: string
    is_admin: boolean
    last_login: string
    created: string
    restricted: boolean
    active: boolean
    prohibit_login: boolean
    location: string
    website: string
    description: string
    visibility: string
    followers_count: number
    following_count: number
    starred_repos_count: number
    username: string
  }
  
export type ForgejoFiles = ForgejoFile[]

export interface ForgejoFile {
  id: number
  Size: number
  name: string
  md5: string
  sha1: string
  sha256: string
  sha512: string
}
