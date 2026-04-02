import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, integer, unique } from "drizzle-orm/pg-core";

// ─── Better Auth tables (generated via @better-auth/cli generate) ───

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  city: text("city"),
  role: text("role"),
  level: text("level"),
  preferredLocale: text("preferred_locale"),
  tosAcceptedAt: timestamp("tos_accepted_at"),
  bio: text("bio"),
  skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
  isJamHost: boolean("is_jam_host").default(false).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ─── Custom tables ───

export const tosAcceptances = pgTable("tos_acceptances", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  tosVersion: text("tos_version").notNull().default("v1"),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  reviewerId: text("reviewer_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  revieweeId: text("reviewee_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  jamSessionId: text("jam_session_id"), // nullable — links to jam_sessions once Phase 4 applies
  thumbsUp: boolean("thumbs_up").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("reviews_reviewee_idx").on(table.revieweeId),
  index("reviews_reviewer_idx").on(table.reviewerId),
]);

// ─── Phase 4: Jam Sessions ───

export const jamSessions = pgTable(
  "jam_sessions",
  {
    id: text("id").primaryKey(),
    hostId: text("host_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    location: text("location").notNull(),
    capacity: integer("capacity").notNull(),
    level: text("level").notNull(), // 'beginner' | 'intermediate' | 'advanced' | 'all'
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("jam_sessions_scheduled_at_idx").on(table.scheduledAt),
    index("jam_sessions_host_id_idx").on(table.hostId),
  ],
);

export const jamAttendees = pgTable(
  "jam_attendees",
  {
    id: text("id").primaryKey(),
    jamId: text("jam_id").notNull().references(() => jamSessions.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull(), // 'confirmed' | 'waitlist' | 'cancelled'
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    index("jam_attendees_jam_id_idx").on(table.jamId),
    index("jam_attendees_user_id_idx").on(table.userId),
    unique("jam_attendees_unique").on(table.jamId, table.userId),
  ],
);

// ─── Phase 4: Direct Messaging ───

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    participantA: text("participant_a").notNull().references(() => user.id, { onDelete: "cascade" }),
    participantB: text("participant_b").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  },
  (table) => [
    index("conversations_participants_idx").on(table.participantA, table.participantB),
    unique("conversations_pair_unique").on(table.participantA, table.participantB),
  ],
);

export const directMessages = pgTable(
  "direct_messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [
    index("direct_messages_conversation_id_idx").on(table.conversationId),
    index("direct_messages_sent_at_idx").on(table.sentAt),
  ],
);

export const conversationReads = pgTable(
  "conversation_reads",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at").defaultNow().notNull(),
  },
  (table) => [
    unique("conversation_reads_unique").on(table.conversationId, table.userId),
  ],
);

// ─── Quiz tables ───

export const quizLeads = pgTable("quiz_leads", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  quizType: text("quiz_type").notNull(), // 'challenge' | 'workshop'
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  answers: text("answers").notNull(), // JSON string of answer map
  resultType: text("result_type"),    // null for workshop
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizEvents = pgTable("quiz_events", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  quizType: text("quiz_type").notNull(),
  questionId: text("question_id").notNull(),
  answer: text("answer"),
  eventType: text("event_type").notNull(), // 'view' | 'answer' | 'abandon'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quiz_events_session_idx").on(table.sessionId),
  index("quiz_events_quiz_type_idx").on(table.quizType),
]);

// ─── Phase 6: Payment + Enrollments ───

export const challengeEnrollments = pgTable("challenge_enrollments", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),       // matches quiz_leads.session_id
  giDocumentId: text("gi_document_id").notNull().unique(),
  giDocumentNumber: text("gi_document_number"),   // GI's sequential invoice number (text for safety)
  amountPaid: integer("amount_paid").notNull(),    // in NIS (integer, e.g. 299)
  currency: text("currency").notNull().default("ILS"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  status: text("status").notNull().default("confirmed"),  // 'confirmed' | 'refunded'
  cohortStartDate: timestamp("cohort_start_date"),
  paidAt: timestamp("paid_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("challenge_enrollments_session_idx").on(table.sessionId),
  index("challenge_enrollments_status_idx").on(table.status),
]);

// ─── Relations ───

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  reviewsGiven: many(reviews, { relationName: 'reviewsGiven' }),
  reviewsReceived: many(reviews, { relationName: 'reviewsReceived' }),
  jamsHosted: many(jamSessions),
  jamAttendances: many(jamAttendees),
  conversationsAsA: many(conversations, { relationName: 'conversationsAsA' }),
  conversationsAsB: many(conversations, { relationName: 'conversationsAsB' }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(user, { fields: [reviews.reviewerId], references: [user.id], relationName: 'reviewsGiven' }),
  reviewee: one(user, { fields: [reviews.revieweeId], references: [user.id], relationName: 'reviewsReceived' }),
}));

export const jamSessionsRelations = relations(jamSessions, ({ one, many }) => ({
  host: one(user, {
    fields: [jamSessions.hostId],
    references: [user.id],
  }),
  attendees: many(jamAttendees),
}));

export const jamAttendeesRelations = relations(jamAttendees, ({ one }) => ({
  jam: one(jamSessions, {
    fields: [jamAttendees.jamId],
    references: [jamSessions.id],
  }),
  user: one(user, {
    fields: [jamAttendees.userId],
    references: [user.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participantAUser: one(user, {
    fields: [conversations.participantA],
    references: [user.id],
    relationName: 'conversationsAsA',
  }),
  participantBUser: one(user, {
    fields: [conversations.participantB],
    references: [user.id],
    relationName: 'conversationsAsB',
  }),
  messages: many(directMessages),
  reads: many(conversationReads),
}));

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [directMessages.conversationId],
    references: [conversations.id],
  }),
  sender: one(user, {
    fields: [directMessages.senderId],
    references: [user.id],
  }),
}));

export const conversationReadsRelations = relations(conversationReads, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationReads.conversationId],
    references: [conversations.id],
  }),
  user: one(user, {
    fields: [conversationReads.userId],
    references: [user.id],
  }),
}));
