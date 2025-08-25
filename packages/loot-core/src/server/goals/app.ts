import { createApp } from '../app';
import * as db from '../db';
import { mutator } from '../mutators';
import { undoable } from '../undo';
import { v4 as uuidv4 } from 'uuid';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  tag_pattern: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  target_amount: number;
  target_date?: string;
  tag_pattern: string;
  color?: string;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  id: string;
}

export type GoalsHandlers = {
  'goals-get': typeof getGoals;
  'goals-create': typeof createGoal;
  'goals-update': typeof updateGoal;
  'goals-delete': typeof deleteGoal;
  'goals-recalculate': typeof recalculateAllGoals;
  'goals-get-transactions': typeof getGoalTransactions;
};

export const app = createApp<GoalsHandlers>();
app.method('goals-get', getGoals);
app.method('goals-create', mutator(undoable(createGoal)));
app.method('goals-update', mutator(undoable(updateGoal)));
app.method('goals-delete', mutator(undoable(deleteGoal)));
app.method('goals-recalculate', recalculateAllGoals);
app.method('goals-get-transactions', getGoalTransactions);

// Get all goals
async function getGoals(): Promise<Goal[]> {
  return db.runQuery(
    'SELECT * FROM goals WHERE tombstone = 0 ORDER BY created_at DESC',
    [],
    true
  );
}

// Create a new goal
async function createGoal({ goal }: { goal: CreateGoalRequest }): Promise<Goal> {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const newGoal: Goal = {
    id,
    name: goal.name,
    description: goal.description || null,
    target_amount: goal.target_amount,
    current_amount: 0,
    target_date: goal.target_date || null,
    tag_pattern: goal.tag_pattern,
    color: goal.color || '#3b82f6',
    created_at: now,
    updated_at: now,
  };

  await db.runQuery(
    `INSERT INTO goals (id, name, description, target_amount, current_amount, target_date, tag_pattern, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newGoal.id,
      newGoal.name,
      newGoal.description,
      newGoal.target_amount,
      newGoal.current_amount,
      newGoal.target_date,
      newGoal.tag_pattern,
      newGoal.color,
      newGoal.created_at,
      newGoal.updated_at,
    ]
  );

  // Calculate initial progress
  await calculateGoalProgress(newGoal.id);
  
  return newGoal;
}

// Update an existing goal
async function updateGoal({ goal }: { goal: UpdateGoalRequest }): Promise<Goal | null> {
  const existing = await getGoal(goal.id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updates: string[] = [];
  const values: any[] = [];

  if (goal.name !== undefined) {
    updates.push('name = ?');
    values.push(goal.name);
  }
  if (goal.description !== undefined) {
    updates.push('description = ?');
    values.push(goal.description);
  }
  if (goal.target_amount !== undefined) {
    updates.push('target_amount = ?');
    values.push(goal.target_amount);
  }
  if (goal.target_date !== undefined) {
    updates.push('target_date = ?');
    values.push(goal.target_date);
  }
  if (goal.tag_pattern !== undefined) {
    updates.push('tag_pattern = ?');
    values.push(goal.tag_pattern);
  }
  if (goal.color !== undefined) {
    updates.push('color = ?');
    values.push(goal.color);
  }

  updates.push('updated_at = ?');
  values.push(now);
  values.push(goal.id);

  await db.runQuery(
    `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Recalculate progress if tag pattern changed
  if (goal.tag_pattern !== undefined) {
    await calculateGoalProgress(goal.id);
  }

  return getGoal(goal.id);
}

// Delete a goal (soft delete)
async function deleteGoal({ id }: { id: string }): Promise<boolean> {
  const result = await db.runQuery(
    'UPDATE goals SET tombstone = 1, updated_at = ? WHERE id = ?',
    [new Date().toISOString(), id]
  );
  return result.changes > 0;
}

// Get a single goal by ID
async function getGoal(id: string): Promise<Goal | null> {
  const goals = await db.runQuery(
    'SELECT * FROM goals WHERE id = ? AND tombstone = 0',
    [id],
    true
  );
  return goals[0] || null;
}

// Calculate current amount for a goal based on transactions with matching tags
async function calculateGoalProgress(goalId: string): Promise<number> {
  const goal = await getGoal(goalId);
  if (!goal) return 0;

  // Get all transactions that have the goal tag in notes OR imported_description
  // This includes transfers that might have the tag in imported_description
  const transactions = await db.runQuery(
    `SELECT amount 
     FROM transactions 
     WHERE (notes LIKE ? OR imported_description LIKE ?) 
     AND tombstone = 0`,
    [`%#${goal.tag_pattern}%`, `%#${goal.tag_pattern}%`],
    true
  );

  // Sum only POSITIVE amounts (contributions TO the goal)
  // Negative amounts are outflows (like the source side of transfers) and shouldn't count
  const totalAmount = transactions.reduce((sum: number, tx: any) => {
    const amount = tx.amount || 0;
    return sum + (amount > 0 ? amount : 0);
  }, 0);

  // Update the goal's current amount
  await db.runQuery(
    'UPDATE goals SET current_amount = ?, updated_at = ? WHERE id = ?',
    [totalAmount, new Date().toISOString(), goalId]
  );

  return totalAmount;
}

// Get transactions for a specific goal
async function getGoalTransactions({ goalId, tagPattern }: { goalId?: string; tagPattern: string }) {
  try {
    // Get all transactions with account information using correct column name 'acct'
    const transactions = await db.runQuery(
      `SELECT 
        t.id,
        t.date,
        t.amount,
        t.notes,
        t.imported_description,
        t.acct as account_id,
        a.name as account_name
       FROM transactions t
       LEFT JOIN accounts a ON t.acct = a.id
       WHERE (t.notes LIKE ? OR t.imported_description LIKE ?) 
       AND t.tombstone = 0
       ORDER BY t.date DESC`,
      [`%#${tagPattern}%`, `%#${tagPattern}%`],
      true
    );

    return transactions.map((tx: any) => {
      const notes = tx.notes || '';
      const description = tx.imported_description || '';
      
      // Extract the description part (everything before the tag or the whole thing if no tag)
      const goalTag = `#${tagPattern}`;
      let displayDescription = notes || description;
      
      // If the notes contain the tag, try to extract the description part
      if (notes.includes(goalTag)) {
        displayDescription = notes.split(goalTag)[0].trim();
        if (!displayDescription) {
          displayDescription = notes;
        }
      } else if (description.includes(goalTag)) {
        displayDescription = description.split(goalTag)[0].trim();
        if (!displayDescription) {
          displayDescription = description;
        }
      }
      
      return {
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        notes: notes || description, // Keep full notes for display
        account: tx.account_name || 'Unknown Account',
      };
    });
  } catch (error) {
    console.error('Error fetching goal transactions:', error);
    return [];
  }
}

// Recalculate all goals progress
async function recalculateAllGoals(): Promise<void> {
  const goals = await getGoals();
  
  for (const goal of goals) {
    await calculateGoalProgress(goal.id);
  }
}
