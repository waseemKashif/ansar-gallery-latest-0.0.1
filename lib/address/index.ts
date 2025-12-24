// Address module exports

export {
  getAddressesFromProfile,
  getDefaultAddressFromProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "./address.service";

export { useAddress, clearStoredAddress, emptyAddress } from "./useAddress";
export { useMapLocation, clearStoredLocation } from "./useMapLocation";
