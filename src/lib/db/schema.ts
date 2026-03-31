// Better Auth automatically generates: user, session, account, verification tables
// with additionalFields (city, role, level, preferredLocale, tosAcceptedAt) added to user table.
//
// To push auth tables to the database after setting DATABASE_URL:
//   npx @better-auth/cli generate   <- generates migration SQL
//   npx drizzle-kit push            <- or use drizzle-kit push for development
//
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// TOS acceptance history table — tracks which version was accepted and when.
// The primary tosAcceptedAt timestamp is stored as an additionalField on the user table.
// This table provides full version audit history if needed in future versions.
export const tosAcceptances = pgTable("tos_acceptances", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tosVersion: text("tos_version").notNull().default("v1"),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
});
