-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Trainers Table
CREATE TABLE trainers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Clients Table
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE, -- Optional: link to trainer
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    current_weight NUMERIC(5, 2), -- e.g., 60.50
    target_weight NUMERIC(5, 2),
    tickets_remaining INTEGER DEFAULT 0 NOT NULL,
    notes TEXT,
    last_visit TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Sessions (Ticket Usage History / Appointments)
CREATE TABLE sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Appointment time
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled' NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE, -- Filled when ticket is digested
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create Policies (Test Mode: Allow All Operations)
-- WARNING: These policies allow ANYONE to read/write. Do not use in production.

-- Trainers Policies
CREATE POLICY "Allow All Access for Trainers" ON trainers
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Clients Policies
CREATE POLICY "Allow All Access for Clients" ON clients
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Sessions Policies
CREATE POLICY "Allow All Access for Sessions" ON sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert Dummy Data (Mock Data)
INSERT INTO trainers (id, name, email) 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Trainer', 'trainer@fitpartner.com');

INSERT INTO clients (id, trainer_id, name, age, gender, current_weight, target_weight, tickets_remaining, notes, last_visit)
VALUES 
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '田中 優子', 32, 'female', 58.5, 52.0, 3, '膝に違和感あり。スクワット軽めに。', '2023-10-25 10:00:00+09'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '佐藤 健太', 28, 'male', 75.0, 68.0, 0, '増量期終了。これから絞りたい。', '2023-10-28 13:00:00+09'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '鈴木 愛', 45, 'female', 62.0, 55.0, 12, '週2回のペースを維持できていて順調。', '2023-11-01 18:30:00+09');

INSERT INTO sessions (client_id, scheduled_at, status)
VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', NOW()::date + TIME '10:00:00', 'scheduled'), -- Today 10:00
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', NOW()::date + TIME '13:00:00', 'scheduled'), -- Today 13:00
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', NOW()::date + TIME '18:30:00', 'scheduled'); -- Today 18:30
