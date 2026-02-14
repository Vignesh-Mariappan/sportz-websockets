import { Router } from 'express';
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js';
import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { getMatchStatus } from '../utils/match-status.js';
import { desc } from 'drizzle-orm';

export const matchRouter = Router();

matchRouter.get('/', async (req, res) => {
  // Fetch matches from the database
  const parsedMatchesList = listMatchesQuerySchema.safeParse(req.query);
  if (!parsedMatchesList.success) {
    return res.status(400).json({
      message: 'Invalid query parameters',
      details: JSON.stringify(parsedMatchesList.error),
    });
  }

  const limit = Math.min(parsedMatchesList.data.limit ?? 50, 100); // Default to 20 if not provided, max 100

  try {
    const matchesList = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);
    
    res.status(200).json({ message: 'List of matches', data: matchesList });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', details: JSON.stringify(error) });
  }
});

matchRouter.post('/', async (req, res) => {
  const parsedMatchData = createMatchSchema.safeParse(req.body);

  if (!parsedMatchData.success) {
    return res.status(400).json({
      message: 'Invalid match data',
      details: JSON.stringify(parsedMatchData.error),
    });
  }

  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsedMatchData;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsedMatchData.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(new Date(startTime), new Date(endTime)),
      })
      .returning();
    // Validate and create the match using the parsedMatchData
    res.status(201).json({ message: 'Match created', data: event });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating match', details: JSON.stringify(error) });
  }

});
