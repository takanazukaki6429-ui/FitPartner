-- Session Notes Feature: Add notes column to training_logs
-- Run this in Supabase SQL Editor

ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS notes TEXT;
