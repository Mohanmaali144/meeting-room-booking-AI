import { pool } from "../config/db";
import type { Room } from "../types";

export async function getAllRooms(): Promise<Room[]> {
  const result = await pool.query("SELECT * FROM rooms ORDER BY capacity ASC, name ASC");
  return result.rows;
}

export async function getRoomById(id: number): Promise<Room | undefined> {
  const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
  return result.rows[0];
}
