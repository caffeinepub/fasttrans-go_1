import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  module RideRequest {
    public type Status = {
      #pending;
      #accepted;
      #inProgress;
      #completed;
      #cancelled;
    };
    public type FareStatus = { #pending ; #counterProposed ; #accepted };

    public type RideRequest = {
      id : Nat;
      passenger : Principal;
      driver : ?Principal;
      pickupLocation : Text;
      dropoffLocation : Text;
      proposedFare : Nat;
      counterFare : ?Nat;
      fareStatus : FareStatus;
      status : Status;
      timestamp : Time.Time;
      completionTime : ?Time.Time;
    };
  };

  public type UserRole = {
    #admin;
    #passenger;
    #driver;
  };

  public type Location = {
    latitude : Text;
    longitude : Text;
  };

  public type UserProfile = {
    name : Text;
    phoneNumber : Text;
    isDriver : Bool;
    location : ?Location;
    rating : Nat;
    ratingCount : Nat;
    createdAt : Time.Time;
  };

  // ID generation
  module IdCounters {
    public type IdCounters = {
      var nextRideId : Nat;
    };

    public func nextRideId(counters : IdCounters) : Nat {
      let id = counters.nextRideId;
      counters.nextRideId += 1;
      id;
    };
  };
  let idCounters : IdCounters.IdCounters = {
    var nextRideId = 1;
  };

  // Actors state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let profiles = Map.empty<Principal, UserProfile>();

  module RideStore {
    public type RideStore = Map.Map<Nat, RideRequest.RideRequest>;
    public func get(rideStore : RideStore, rideId : Nat) : RideRequest.RideRequest {
      switch (rideStore.get(rideId)) {
        case (null) { Runtime.trap("Ride request not found") };
        case (?rideRequest) { rideRequest };
      };
    };
  };
  let rides : RideStore.RideStore = Map.empty<Nat, RideRequest.RideRequest>();
  let ratingsData = Map.empty<Principal, [Nat]>();

  module Profile {
    public func compareByRating(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Nat.compare(profile2.rating, profile1.rating);
    };
  };

  // Required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let newProfile = {
      profile with
      createdAt = Time.now();
      rating = 0;
      ratingCount = 0;
    };

    profiles.add(caller, newProfile);
  };

  public shared ({ caller }) func createRideRequest(ride : RideRequest.RideRequest) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create ride requests");
    };

    let rideId = IdCounters.nextRideId(idCounters);
    let newRide = {
      ride with
      id = rideId;
      passenger = caller;
      driver = null;
      status = #pending;
      fareStatus = #pending;
      timestamp = Time.now();
      counterFare = null;
      completionTime = null;
    };

    rides.add(rideId, newRide);
    rideId;
  };

  public shared ({ caller }) func acceptRide(rideId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can accept rides");
    };

    // Verify caller is a driver
    let callerProfile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };
    if (not callerProfile.isDriver) {
      Runtime.trap("Unauthorized: Only drivers can accept rides");
    };

    let rideRequest = rides.get(rideId);
    if (rideRequest == null) {
      Runtime.trap("Ride request does not exist");
    };
    let updatedRide = switch (rideRequest) {
      case (?ride) {
        if (ride.status == #pending) {
          {
            ride with
            driver = ?caller;
            status = #accepted;
            fareStatus = #pending;
          };
        } else {
          Runtime.trap("Ride not available for acceptance");
        };
      };
      case (null) { Runtime.trap("Ride not available for acceptance") };
    };
    rides.add(rideId, updatedRide);
  };

  public shared ({ caller }) func getActiveRideForUser() : async ?RideRequest.RideRequest {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view active rides");
    };
    rides.values().toArray().find(func(r) { r.passenger == caller and r.status != #completed });
  };

  public shared ({ caller }) func updateLocation(location : Location) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update location");
    };

    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?p) { p };
    };

    // Verify caller is a driver
    if (not profile.isDriver) {
      Runtime.trap("Unauthorized: Only drivers can update location");
    };

    let driverProfile = {
      profile with
      location = ?location;
    };
    profiles.add(caller, driverProfile);
  };

  public query ({ caller }) func getAllTrips() : async [RideRequest.RideRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all trips");
    };
    rides.values().toArray();
  };

  public shared ({ caller }) func cancelRide(rideId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can cancel rides");
    };

    let rideRequest = rides.get(rideId);
    let updatedRide = switch (rideRequest) {
      case (?ride) {
        // Only the passenger can cancel their own ride
        if (caller != ride.passenger) {
          Runtime.trap("Unauthorized: Only the passenger can cancel this ride");
        };
        // Can only cancel pending rides
        if (ride.status != #pending) {
          Runtime.trap("Can only cancel pending rides");
        };
        { ride with status = #cancelled };
      };
      case (null) { Runtime.trap("Ride request does not exist") };
    };
    rides.add(rideId, updatedRide);
  };

  public query ({ caller }) func getPendingTrips() : async [RideRequest.RideRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view pending trips");
    };

    // Verify caller is a driver
    let callerProfile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };
    if (not callerProfile.isDriver) {
      Runtime.trap("Unauthorized: Only drivers can view pending trips");
    };

    rides.values().toArray().filter(func(r) { r.status == #pending or r.status == #accepted });
  };

  public shared ({ caller }) func startTrip(rideId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can start trips");
    };

    let rideRequest = rides.get(rideId);
    let updatedRide = switch (rideRequest) {
      case (?ride) {
        // Only the assigned driver can start the trip
        if (ride.driver != ?caller) {
          Runtime.trap("Unauthorized: Only the assigned driver can start this trip");
        };
        if (ride.status != #accepted) {
          Runtime.trap("Trip must be in accepted status to start");
        };
        { ride with status = #inProgress };
      };
      case (null) { Runtime.trap("Trip does not exist, unable to start") };
    };
    rides.add(rideId, updatedRide);
  };

  public shared ({ caller }) func completeTrip(rideId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can complete trips");
    };

    let rideRequest = rides.get(rideId);
    let updatedRide = switch (rideRequest) {
      case (?ride) {
        // Only the assigned driver can complete the trip
        if (ride.driver != ?caller) {
          Runtime.trap("Unauthorized: Only the assigned driver can complete the trip");
        };
        if (ride.status != #inProgress) {
          Runtime.trap("Trip must be in progress to complete");
        };

        { ride with status = #completed; completionTime = ?Time.now() };
      };
      case (null) { Runtime.trap("Trip does not exist, cannot mark as completed") };
    };
    rides.add(rideId, updatedRide);
  };

  public shared ({ caller }) func rateDriver(driver : Principal, rating : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can rate drivers");
    };

    // Verify the caller has completed a ride with this driver
    let hasCompletedRide = rides.values().toArray().find(
      func(ride) {
        ride.passenger == caller and ride.driver == ?driver and ride.status == #completed
      }
    );

    switch (hasCompletedRide) {
      case (null) {
        Runtime.trap("Unauthorized: You can only rate drivers you've completed rides with");
      };
      case (?_) {
        // Proceed with rating
      };
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let currentRatings = switch (ratingsData.get(driver)) {
      case (null) { [] };
      case (?ratings) { ratings };
    };
    let updatedRatings = currentRatings.concat([rating]);
    ratingsData.add(driver, updatedRatings);

    let ratingSum = updatedRatings.foldLeft(
      0,
      func(acc, x) { acc + x },
    );
    let newAverage = ratingSum / updatedRatings.size();

    let driverProfile = switch (profiles.get(driver)) {
      case (?profile) {
        {
          profile with
          rating = newAverage;
          ratingCount = updatedRatings.size();
        };
      };
      case (null) { Runtime.trap("Driver not found") };
    };

    profiles.add(driver, driverProfile);
  };

  public query ({ caller }) func getActiveRides() : async [RideRequest.RideRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view active rides");
    };

    // Return only rides where caller is passenger or driver
    rides.values().toArray().filter(
      func(ride) {
        (ride.passenger == caller or ride.driver == ?caller) and
        ride.status != #completed and ride.status != #cancelled
      }
    );
  };

  public query ({ caller }) func getDriverTrips(driver : Principal) : async [RideRequest.RideRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view driver trips");
    };

    // Can only view your own trips or admin can view all
    if (caller != driver and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own trips");
    };

    rides.values().toArray().filter(func(ride) { ride.driver == ?driver });
  };

  public query ({ caller }) func getRiders() : async [UserProfile] {
    // Public information - drivers are publicly visible
    profiles.values().toArray().filter(func(profile) { profile.isDriver });
  };

  public shared ({ caller }) func proposeCounterFare(rideId : Nat, counterFare : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can propose counter fares");
    };

    let rideRequest = rides.get(rideId);
    let updatedRide = switch (rideRequest) {
      case (?ride) {
        // Only the assigned driver can propose a counter fare
        if (ride.driver != ?caller) {
          Runtime.trap("Unauthorized: Only the assigned driver can propose a counter fare");
        };
        if (ride.status != #accepted and ride.status != #pending) {
          Runtime.trap("Can only propose counter fare on pending or accepted rides");
        };
        {
          ride with
          counterFare = ?counterFare;
          fareStatus = #counterProposed;
        };
      };
      case (null) { Runtime.trap("Trip not found, cannot propose counter fare") };
    };
    rides.add(rideId, updatedRide);
  };

  public shared ({ caller }) func acceptCounterFare(rideId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can accept counter fares");
    };

    let rideRequest = rides.get(rideId);
    let updatedRide = switch (rideRequest) {
      case (?ride) {
        if (caller != ride.passenger) {
          Runtime.trap("Unauthorized: Only the passenger can accept the counter fare");
        };
        switch (ride.counterFare) {
          case (null) { Runtime.trap("No counter fare proposed"); };
          case (?counterFare) {
            {
              ride with
              proposedFare = counterFare;
              fareStatus = #accepted;
              counterFare = null;
            };
          };
        };
      };
      case (null) { Runtime.trap("Trip not found, cannot accept counter fare") };
    };
    rides.add(rideId, updatedRide);
  };

  public query ({ caller }) func getBestRatedDrivers() : async [UserProfile] {
    // Public information - driver ratings are publicly visible
    profiles.values().toArray().sort(Profile.compareByRating);
  };

  public query ({ caller }) func getProfileByPhone(phoneNumber : Text) : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can search by phone");
    };

    let result = profiles.values().toArray().find(func(p) { p.phoneNumber == phoneNumber });
    switch (result) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Phone number is not associated with any valid account") };
    };
  };

  public shared ({ caller }) func updateProfilePhone(phoneNumber : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update phone");
    };

    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?p) { p };
    };
    profiles.add(
      caller,
      {
        profile with
        phoneNumber;
      },
    );
  };

  public shared ({ caller }) func updateProfileName(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update name");
    };

    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?p) { p };
    };
    profiles.add(caller, { profile with name });
  };

  public shared ({ caller }) func switchRole() : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can switch roles");
    };

    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };
    let newProfile = {
      profile with
      isDriver = not profile.isDriver;
    };
    profiles.add(caller, newProfile);
    newProfile;
  };

  public query ({ caller }) func getUsers() : async [UserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    profiles.values().toArray();
  };

  public query ({ caller }) func getAvailableDrivers() : async [UserProfile] {
    // Public information - available drivers are publicly visible
    profiles.values().toArray().filter(func(user) { user.isDriver });
  };
};
