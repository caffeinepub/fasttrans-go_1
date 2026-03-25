import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Location, RideRequest, UserProfile } from "../backend.d";
import { FareStatus, Status } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useUpdateProfileName() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProfileName(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useUpdateProfilePhone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (phone: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProfilePhone(phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useSwitchRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.switchRole();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useGetActiveRideForUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<RideRequest | null>({
    queryKey: ["activeRide"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveRideForUser();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10000,
  });
}

export function useGetActiveRides() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<RideRequest[]>({
    queryKey: ["activeRides"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveRides();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
  });
}

export function useGetAllTrips() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<RideRequest[]>({
    queryKey: ["allTrips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrips();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateRideRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ride: RideRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createRideRequest(ride);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeRide"] });
      qc.invalidateQueries({ queryKey: ["allTrips"] });
    },
  });
}

export function useCancelRide() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelRide(rideId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeRide"] });
      qc.invalidateQueries({ queryKey: ["allTrips"] });
    },
  });
}

export function useGetPendingRides() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<RideRequest[]>({
    queryKey: ["pendingRides"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingTrips();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10000,
  });
}

export function useGetDriverTrips(driver: string | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<RideRequest[]>({
    queryKey: ["driverTrips", driver],
    queryFn: async () => {
      if (!actor || !driver) return [];
      const { Principal } = await import("@dfinity/principal");
      return actor.getDriverTrips(Principal.fromText(driver));
    },
    enabled: !!actor && !isFetching && !!identity && !!driver,
  });
}

export function useAcceptRide() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.acceptRide(rideId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRides"] });
      qc.invalidateQueries({ queryKey: ["activeRide"] });
    },
  });
}

export function useStartTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.startTrip(rideId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeRide"] }),
  });
}

export function useCompleteTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rideId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.completeTrip(rideId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeRide"] });
      qc.invalidateQueries({ queryKey: ["driverTrips"] });
      qc.invalidateQueries({ queryKey: ["allTrips"] });
    },
  });
}

export function useUpdateLocation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLocation(location);
    },
  });
}

export function useRateDriver() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      driver,
      rating,
    }: {
      driver: Principal;
      rating: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rateDriver(driver, rating);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeRide"] });
    },
  });
}

export { Status, FareStatus };
