export interface ApiState {
    organizations: Organization[],
    repositories: Repository[],
    resources: Resource[],
    pipelines: Pipeline[],
}

export interface Organization {
    name: string,
    id: string
    domain: string
}

export interface Repository {
    id: string,
    name: string,
    organizationId: string

}

export interface Resource {
    id: string,
    name: string,
    organizationId: string,
    repositoryId: string,
    type: string

}

export interface Pipeline {
    id: string,
    name: string,
    organizationId: string,
    repositoryId: string,
    timestamp: number
}