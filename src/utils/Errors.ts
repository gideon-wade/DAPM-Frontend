export class NoCurrentOrganizationsError extends Error {
    constructor(message = "Organization data is empty.") {
        super(message);
        this.name = "NoCurrentOrganizationsError";
    }
}
export class NoAssociatedRepositoriesToOrganizationsError extends Error {
    constructor(orgId : string) {
        super("Organization " + orgId + " does not have any associated repositories");
        this.name = "NoAssociatedRepositoriesToOrganizationsError";
    }
}
