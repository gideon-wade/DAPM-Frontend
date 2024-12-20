import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

import {ApiState, Organization, Repository, Resource} from "../states/apiState";
import {fetchOrganizationRepositories, fetchOrganizations, fetchRepositoryResources} from "../../services/backendAPI";
import {NoAssociatedRepositoriesToOrganizationsError} from "../../utils/Errors";

export const initialState: ApiState = {
    organizations: [],
    repositories: [],
    resources: [],
    pipelines: []
  }

/**
 * All new changes are made by:
 * @Author: s204423, s204452, s204197, and s205339
 */

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

  try {
    const organizations = await fetchOrganizations(); // Fetch organizations from the backend API
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

  try {
    const repositories = [];
      for (const organization of organizations) {
        const repos = await fetchOrganizationRepositories(organization.id);
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

