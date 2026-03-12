import { pgTable, serial, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  details: jsonb('details').notNull(), // Array of meal details
});
