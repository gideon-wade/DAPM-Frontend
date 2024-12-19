// const path = `se2-e.compute.dtu.dk`
//const path = `http://localhost:5000`;

/**
 * All new changes are made by:
 * @Author: s204423, s204452, and s205339
 */

const vmPath = `se2-e.compute.dtu.dk:5000`
const localPath = `localhost:5000`

const path = localPath

const get = async (endpoint: string) => {
    console.log("Calling get endpoint", `http://${path}${endpoint}`);
    try {
        const response = await fetch(`http://${path}${endpoint}`);
        if (!response.ok) return;

        let json = await response.json();
        console.log("Response json: ", json);
        return json;
    } catch (e) {
        console.error(`Error fetching data from ${endpoint}: `, e);
    }
};

const post = async (endpoint: string, body?: any) => {
    console.log("Calling post endpoint", `http://${path}${endpoint} with data ${body} / ${JSON.stringify(body)}`);
    try {
        const response = await fetch(`http://${path}${endpoint}`, {
            method: "POST",
            body: (body instanceof FormData) ? body : JSON.stringify(body),
            headers: (body instanceof FormData) ? {} : {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (!response.ok) return;
        let json = await response.json();
        console.log("Response json: ", json);
        return json;
    } catch (e) {
        console.error(`Error posting data to ${endpoint}: `, e);
    }
};
const del = async (endpoint: string) => {
    console.log("Calling delete endpoint", `http://${path}${endpoint}`);
    try {
        const response = await fetch(`http://${path}${endpoint}/`, {
            method: "DELETE",
        });
        if (!response.ok) return;
        let json = await response.json();
        console.log("Response json: ", json);
        return json;
    } catch (e) {
        console.error(`Error posting data to ${endpoint}: `, e);
    }
};

// Fetch additional data recursively
const getData = async (ticketId: string): Promise<any> => {
    console.log("Getting data for ticket: " + ticketId);
    const maxRetries = 10;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let retries = 0; retries < maxRetries; retries++) {
        try {
            const data = await fetchStatus(ticketId);
            if (data.status) {
                return data;
            }
            await delay(2000); // Wait for 2 second before retrying
        } catch (error) {
            if (retries === maxRetries - 1) {
                throw new Error('Max retries reached');
            }
        }
    }
    throw new Error('Failed to fetch data');
};

const getFile = async (ticketId: string): Promise<any> => {
    console.log("Getting file for ticket: " + ticketId);
    const maxRetries = 10;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
    for (let retries = 0; retries < maxRetries; retries++) {
        try {
            const data = await fetch(`http://${path}/status/${ticketId}`);
            if (data.status) {
                return data;
            }
            await delay(2000); // Wait for 2 second before retrying
        } catch (error) {
            if (retries === maxRetries - 1) {
                throw new Error('Max retries reached');
            }
        }
    }
    throw new Error('Failed to fetch data');
};

export async function checkAuthorization(userId: string): Promise<boolean> {
    try {
      const response = await post('/authorized', { user_id: userId });
      if (response && typeof response.authorized === 'boolean') {
        return response.authorized;
      }
      return false;
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  }




export async function PostNewPeer (domainName: string) {
    let response = await post(`/system/collab-handshake`, { targetPeerDomain: domainName });
	return await getData(response.ticketId);
}

export async function fetchStatus (ticket: string) {
    let response = await get(`/status/${ticket}`);
	return await response;
}

export async function fetchOrganizations () {
    let response = await get(`/Organizations`);
	return await getData(response.ticketId);
}

export async function fetchOrganization (orgId: string) {
    let response = await get(`/Organizations/${orgId}`);
	return await getData(response.ticketId);
}

export async function fetchOrganizationRepositories (orgId: string) {
    let response = await get(`/Organizations/${orgId}/repositories`);
	return await getData(response.ticketId);
}

export async function fetchRepository (orgId: string, repId: string) {
    let response = await get(`/Organizations/${orgId}/repositories/${repId}`);
	return await getData(response.ticketId);
}

export async function fetchRepositoryResources (orgId: string, repId: string) {
    let response = await get(`/Organizations/${orgId}/repositories/${repId}/resources`);
	return await getData(response.ticketId);
}

export async function fetchResource (orgId: string, repId: string, resId: string) {
    let response = await get(`/Organizations/${orgId}/repositories/${repId}/resources/${resId}`);
	return await getData(response.ticketId);
}

export async function fetchRepositoryPipelines (orgId: string, repId: string) {
    let response = await get(`/Organizations/${orgId}/repositories/${repId}/pipelines`);
	return await getData(response.ticketId);
}

export async function fetchPipeline (orgId: string, repId: string, pipId: string) {
    let response = await get(`/Organizations/${orgId}/repositories/${repId}/pipelines/${pipId}`);
	return await getData(response.ticketId);
}

export async function executionStatus (orgId: string, repId: string, pipeId: string, exeId: string) {
    let response = await get(`/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/executions/${exeId}/status`);
    return await getData(response.ticketId);
}

export async function createOperator (orgId: string, repId: string, formData: FormData) {
    let response = await post(`/Organizations/${orgId}/repositories/${repId}/resources/operators`, formData);
	return await getData(response.ticketId);
}

export async function downloadResource (orgId: string, repId: string, resId: string) {
    let response = await get(`/Organizations/${orgId}/repositories/${repId}/resources/${resId}/file`);
	return await getFile(response.ticketId);
}

export async function putRepository(orgId: string, repositoryName: string) {
    let response = await post(`/Organizations/${orgId}/repositories`, { name: repositoryName });
    return await getData(response.ticketId);
}

export async function putResource(orgId: string, repId: string, formData: FormData) {
    let response = await post(`/Organizations/${orgId}/repositories/${repId}/resources`, formData);
    return await get(`/status/${response.ticketId}`);
}

export async function putPipeline(orgId: string, repId: string, pipelineData: any) {
    let response = await post(`/Organizations/${orgId}/repositories/${repId}/pipelines`, pipelineData);
    return (await getData(response.ticketId)).result.itemIds.pipelineId;
}

export async function putExecution(orgId: string, repId: string, pipeId: string) {
    let response = await post(`/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/executions`);
    return (await getData(response.ticketId)).result.itemIds.executionId;
}

export async function putCommandStart(orgId: string, repId: string, pipeId: string, exeId:string) {
    let response = await post(`/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/executions/${exeId}/commands/start`);
    return response;//await getData(response.ticketId);
}
export async function deleteRepository(orgId: string, repId: string) {
    let response = await del(`/Organizations/${orgId}/repositories/${repId}`);
    return await getData(response.ticketId);
}
export async function deletePipeline(orgId: string, repId: string, pipeId: string) {
    let response = await del(`/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}`);
    return await getData(response.ticketId);
}



export async function putOperator(orgId: string, repId: string, formData: FormData) {
    try {
        const response = await fetch(`http://` + path + `/Organizations/${orgId}/repositories/${repId}/resources/operators`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error('put res, Network response was not ok');
        }

        const jsonData = await response.json();

        // Fetch additional data recursively
        const getData = async (ticketId: string): Promise<any> => {
            const maxRetries = 10;
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            for (let retries = 0; retries < maxRetries; retries++) {
                try {
                    const data = await fetchStatus(ticketId);
                    if (data.status) {
                        return data;
                    }
                    await delay(1000); // Wait for 1 second before retrying
                } catch (error) {
                    if (retries === maxRetries - 1) {
                        throw new Error('Max retries reached');
                    }
                }
            }
            throw new Error('Failed to fetch data');
        };

        // Call getData function with the ticketId obtained from fetchOrganizations
        return await getData(jsonData.ticketId);
    } catch (error) {
        console.error('put res, Error fetching data:', error);
        throw error; // Propagate error to the caller
    }
}
