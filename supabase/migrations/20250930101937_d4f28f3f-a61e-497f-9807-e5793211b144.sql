-- Update all job listings to have Durban location
UPDATE job_listings 
SET location = 'Durban, ZA' 
WHERE location != 'Durban, ZA';