-- CVR Analysis Feature: Database Migration
-- Run this in Supabase SQL Editor

-- Add status column to track client lifecycle
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'member';

-- Add joined_at to track when trial converts to member
ALTER TABLE clients ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ;

-- Add lost_reason to understand why trials don't convert
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Update existing clients to 'member' status (they are already members)
UPDATE clients SET status = 'member' WHERE status IS NULL;

-- Add check constraint for valid status values
ALTER TABLE clients ADD CONSTRAINT valid_status CHECK (status IN ('trial', 'member', 'lost'));

-- Add check constraint for valid lost_reason values
ALTER TABLE clients ADD CONSTRAINT valid_lost_reason CHECK (
    lost_reason IS NULL OR 
    lost_reason IN ('price', 'schedule', 'competitor', 'considering', 'other')
);
