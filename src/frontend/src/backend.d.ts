import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: string;
    longitude: string;
}
export type Time = bigint;
export interface RideRequest {
    id: bigint;
    status: Status;
    passenger: Principal;
    completionTime?: Time;
    dropoffLocation: string;
    counterFare?: bigint;
    proposedFare: bigint;
    timestamp: Time;
    fareStatus: FareStatus;
    driver?: Principal;
    pickupLocation: string;
}
export interface UserProfile {
    ratingCount: bigint;
    isDriver: boolean;
    name: string;
    createdAt: Time;
    rating: bigint;
    phoneNumber: string;
    location?: Location;
}
export enum FareStatus {
    pending = "pending",
    accepted = "accepted",
    counterProposed = "counterProposed"
}
export enum Status {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptCounterFare(rideId: bigint): Promise<void>;
    acceptRide(rideId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelRide(rideId: bigint): Promise<void>;
    completeTrip(rideId: bigint): Promise<void>;
    createRideRequest(ride: RideRequest): Promise<bigint>;
    getActiveRideForUser(): Promise<RideRequest | null>;
    getActiveRides(): Promise<Array<RideRequest>>;
    getAllTrips(): Promise<Array<RideRequest>>;
    getAvailableDrivers(): Promise<Array<UserProfile>>;
    getBestRatedDrivers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDriverTrips(driver: Principal): Promise<Array<RideRequest>>;
    getPendingTrips(): Promise<Array<RideRequest>>;
    getProfileByPhone(phoneNumber: string): Promise<UserProfile>;
    getRiders(): Promise<Array<UserProfile>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(): Promise<Array<UserProfile>>;
    isCallerAdmin(): Promise<boolean>;
    proposeCounterFare(rideId: bigint, counterFare: bigint): Promise<void>;
    rateDriver(driver: Principal, rating: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startTrip(rideId: bigint): Promise<void>;
    switchRole(): Promise<UserProfile>;
    updateLocation(location: Location): Promise<void>;
    updateProfileName(name: string): Promise<void>;
    updateProfilePhone(phoneNumber: string): Promise<void>;
}
