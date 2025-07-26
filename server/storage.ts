import { 
  users, 
  storageLocations, 
  storageUnits, 
  reservations,
  type User, 
  type InsertUser,
  type StorageLocation,
  type InsertStorageLocation,
  type StorageUnit,
  type InsertStorageUnit,
  type Reservation,
  type InsertReservation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserApprovalStatus(userId: number, isApproved: boolean): Promise<User>;
  updateUserSuperUserStatus(userId: number, isSuperUser: boolean): Promise<User>;
  updatePartnerId(userId: number, partnerId: string): Promise<User>;
  getFranchisePendingApprovals(): Promise<User[]>;
  getApprovedFranchises(): Promise<User[]>;

  // Storage location operations
  getStorageLocations(): Promise<StorageLocation[]>;
  getStorageLocation(id: number): Promise<StorageLocation | undefined>;
  createStorageLocation(location: InsertStorageLocation): Promise<StorageLocation>;
  getStorageLocationsByOwnerId(ownerId: number): Promise<StorageLocation[]>;

  // Storage unit operations
  getStorageUnits(locationId: number): Promise<StorageUnit[]>;
  getStorageUnit(id: number): Promise<StorageUnit | undefined>;
  getAvailableStorageUnits(locationId: number): Promise<StorageUnit[]>;
  createStorageUnit(unit: InsertStorageUnit): Promise<StorageUnit>;

  // Reservation operations
  getReservations(userId: number): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservationStatus(id: number, status: string): Promise<Reservation>;
  getReservation(id: number): Promise<Reservation | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserApprovalStatus(userId: number, isApproved: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isApproved })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSuperUserStatus(userId: number, isSuperUser: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isSuperUser })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updatePartnerId(userId: number, partnerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ partnerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getFranchisePendingApprovals(): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        eq(users.userType, 'franchise'),
        eq(users.isApproved, false)
      )
    );
  }

  async getApprovedFranchises(): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        eq(users.userType, 'franchise'),
        eq(users.isApproved, true)
      )
    );
  }

  async getStorageLocations(): Promise<StorageLocation[]> {
    return await db.select().from(storageLocations).where(eq(storageLocations.isActive, true));
  }

  async getStorageLocation(id: number): Promise<StorageLocation | undefined> {
    const [location] = await db.select().from(storageLocations).where(eq(storageLocations.id, id));
    return location || undefined;
  }

  async createStorageLocation(insertLocation: InsertStorageLocation): Promise<StorageLocation> {
    const [location] = await db
      .insert(storageLocations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async getStorageLocationsByOwnerId(ownerId: number): Promise<StorageLocation[]> {
    return await db.select().from(storageLocations).where(eq(storageLocations.ownerId, ownerId));
  }

  async getStorageUnits(locationId: number): Promise<StorageUnit[]> {
    return await db.select().from(storageUnits).where(eq(storageUnits.locationId, locationId));
  }

  async getStorageUnit(id: number): Promise<StorageUnit | undefined> {
    const [unit] = await db.select().from(storageUnits).where(eq(storageUnits.id, id));
    return unit || undefined;
  }

  async getAvailableStorageUnits(locationId: number): Promise<StorageUnit[]> {
    return await db.select().from(storageUnits).where(
      and(
        eq(storageUnits.locationId, locationId),
        eq(storageUnits.isAvailable, true)
      )
    );
  }

  async createStorageUnit(insertUnit: InsertStorageUnit): Promise<StorageUnit> {
    const [unit] = await db
      .insert(storageUnits)
      .values(insertUnit)
      .returning();
    return unit;
  }

  async getReservations(userId: number): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.userId, userId));
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const [reservation] = await db
      .insert(reservations)
      .values(insertReservation)
      .returning();
    return reservation;
  }

  async updateReservationStatus(id: number, status: string): Promise<Reservation> {
    const [reservation] = await db
      .update(reservations)
      .set({ status })
      .where(eq(reservations.id, id))
      .returning();
    return reservation;
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }
}

export const storage = new DatabaseStorage();
