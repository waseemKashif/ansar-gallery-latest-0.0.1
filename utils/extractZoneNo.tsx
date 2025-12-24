export const extractZoneNo = (zone: string) => {
    // here need to check if the zone is valid no or not.
    // the incoming zone must contain number along with text so we need to extract the number from the zone. else return 56.
    if (!zone) return "56";
    const zoneNo = zone.replace(/\D/g, "");
    // zone can be a single no or two no so we need to check if the zone is valid or not.
    if (zoneNo.length < 1 || parseInt(zoneNo) <= 1) return "56";
    return zoneNo;
};