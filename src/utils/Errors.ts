export class NoCurrentOrganizationsError extends Error {
    constructor(message = "Organization data is empty.") {
        super(message);
        this.name = "NoCurrentOrganizationsError";
    }
}