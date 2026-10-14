CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    floor INTEGER NOT NULL,
    amenities TEXT[]
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    title TEXT NOT NULL,
    organizer_email TEXT NOT NULL,
    attendees INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO rooms (name, capacity, floor, amenities) VALUES
    ('Atlas', 4, 1, ARRAY['Monitor']),
    ('Borealis', 8, 1, ARRAY['Projector', 'Whiteboard']),
    ('Cascade', 12, 2, ARRAY['Projector', 'Video-conferencing']),
    ('Delta', 20, 3, ARRAY['Projector', 'Video-conferencing', 'Whiteboard']),
    ('Ember', 2, 2, ARRAY[]::TEXT[])
ON CONFLICT (name) DO NOTHING;
