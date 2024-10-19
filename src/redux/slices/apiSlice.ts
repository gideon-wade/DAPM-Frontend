import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { ApiState, Organization, Repository, Resource } from "../states/apiState";
import { backendAPIEndpoints } from "../../services/backendAPI";
import { NoAssociatedRepositoriesToOrganizationsError, NoCurrentOrganizationsError } from "../../utils/Errors";

export const initialState: ApiState = {
    organizations: [],
    repositories: [{
      organizationId: "",
      name: "Repository 1",
      id: ""
  },
  {
      organizationId: "",
      name: "Repository 2",
      id: ""
  },],
    resources: [{
      id: "",
      name: "resource 1",
      organizationId: "",
      repositoryId: "",
      type: "eventLog"
  },]
  }

const apiSlice = createSlice({
    name: 'api',
    initialState: initialState,
    reducers: {},
      extraReducers(builder) {
        builder
          .addCase(organizationThunk.pending, (state, action) => {
          })
          .addCase(organizationThunk.fulfilled, (state, action) => {
            // Add any fetched posts to the array
            state.organizations = action.payload.organizations
          })
          .addCase(organizationThunk.rejected, (state, action) => {
            console.log("org thunk failed")
          })
          .addCase(repositoryThunk.pending, (state, action) => {
          })
          .addCase(repositoryThunk.fulfilled, (state, action) => {
            // Add any fetched posts to the array
            state.repositories = action.payload
          })
          .addCase(repositoryThunk.rejected, (state, action) => {
            console.log("repo thunk failed")
          })
          .addCase(resourceThunk.pending, (state, action) => {
          })
          .addCase(resourceThunk.fulfilled, (state, action) => {
            // Add any fetched posts to the array
            state.resources = action.payload
          })
          .addCase(resourceThunk.rejected, (state, action) => {
            console.log("resorce thunk failed")
          })
      }
    
})

export default apiSlice.reducer 

// Define the return type of the thunk
interface FetchOrganizationsResponse {
  organizations: Organization[]; // Update this type based on your actual organization type
}

interface FetchRepositoriesResponse {
  repositories: Repository[]; // Update this type based on your actual organization type
}

// Define the thunk action creator
export const organizationThunk = createAsyncThunk<
  FetchOrganizationsResponse
>("api/fetchOrganizations", async (_, thunkAPI) => {
  const { fetchOrganisations } = backendAPIEndpoints();

  try {
    const organizations = await fetchOrganisations(); // Fetch organizations from the backend API
    return organizations.result; // Return data fetched from the API
  } catch (error) {
    console.log("organization thunk error")
    return thunkAPI.rejectWithValue(error); // Handle error
  }
});

export const repositoryThunk = createAsyncThunk<
  Repository[],
  Organization[]
>("api/fetchRespositories", async (organizations: Organization[], thunkAPI) => {
  const { fetchOrganisationRepositories } = backendAPIEndpoints();

  try {
    if (organizations.length == 0) {
      throw new NoCurrentOrganizationsError();
    }
    const repositories = [];
      for (const organization of organizations) {
        const repos = await fetchOrganisationRepositories(organization.id);
        if (repos === undefined) throw new NoAssociatedRepositoriesToOrganizationsError(organization.id);
        repositories.push(...repos.result.repositories);
      }
      return repositories;
  } catch (error) {
    console.log("repository thunk error")
    return thunkAPI.rejectWithValue(error); // Handle error
  }
});

export const resourceThunk = createAsyncThunk<
  Resource[],
  { organizations: Organization[]; repositories: Repository[] }
>("api/fetchResources", async ({organizations, repositories}, thunkAPI) => {
  const { fetchRepositoryResources } = backendAPIEndpoints();

  try {
    const resources: Resource[] = [];
    for (const org of organizations) {
      for (const repo of repositories) {
        if (org.id === repo.organizationId) {
          const res = await fetchRepositoryResources(org.id, repo.id);
          resources.push(...res.result.resources);
        }
      }
    }

    return await Promise.all(resources);
  } catch (error) {
    console.log("resource thunk error")
    return thunkAPI.rejectWithValue(error); // Handle error
  }
});