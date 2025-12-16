export const extractZoneNo = (zone: string) => {
    return zone.replace(/\D/g, "");
};