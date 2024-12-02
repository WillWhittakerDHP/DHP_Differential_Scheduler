DO $$
DECLARE
BEGIN

INSERT INTO ui_description_sets (buyer_description,agent_description, owner_description)
VALUES
        ('Im buying a home', 'My client is buying a home', 'I own a home'),
        ('condo for buyers', 'condo for agents', 'condo for owners'),
        ('co-op for buyers', 'co-op for agents', 'co-op for owners'),
        ('townhouse for buyers', 'townhouse for agents', 'townhouse for owners'),
        ('single family home for buyers', 'single family home for agents', 'single family home for owners'),
        ('multi-family home for buyers', 'multi-family home for agents', 'multi-family home for owners'),
        ('Buyers Inspection for buyers','Buyers Inspection for agents','Not for you'),
        ('Investors Inspection for buyers', 'Investors Inspection for agents', 'Investors Inspection for owners'),
        ('Walk and Talk for buyers', 'Walk and Talk for agents', 'Not for you'),
        ('Not for you', 'Home Check-up and Maintenance Planning for agents', 'Home Check-up and Maintenance Planning for owners'),
        ('Not for you', 'Pre-sale Walkthrough for agents', 'Pre-sale Walkthrough for owners'),
        ('Not for you', 'Developers Warranty Inspection for agents', 'Developers Warranty Inspection for owners'),
        ('Reinspection for buyers', 'Reinspection for agents', 'Reinspection for owners'),
        ('Blue Tape for buyer', 'Blue Tape for Agents', 'Not for you'),
        ('Radon for buyer', 'Radon for Agents', 'Radon for owners'),
        ('Reinspection for buyers', 'Reinspection for agents', 'Not for you'),
        ('Accessory Dwelling Units for buyers', 'Accessory Dwelling Units for agents', 'accessory Dwelling Units for owners'), 
        ('Minimize Time On-site for buyers', 'Minimize Time On-site for agents', 'Minimize Time On-site for owners'),
        ('Additional Client Time for buyers', 'Additional Client Time for agents', 'Additional Client Time for owners'),
        ('Client will not be present for buyers', 'Client will not be present for agents', 'Client will not be present for owners'),
        ('First-time buyers for buyers', 'First-time buyers for agents', 'Not for you');

INSERT INTO user_types (user_type, user_description, visibility)
VALUES  ('Buyer', 1, true), 
        ('Agent', 1, true), 
        ('Owner', 1, true),
        ('Inspector', 1, false);

INSERT INTO time_block_sets (base_time, rate_over_base_time, base_fee, rate_over_base_fee)
VALUES  
        (0, 0, 0, 0),
        (15, 100, 0, 10),
        (30, 100, 50, 10),
        (30, 100, 75, 10),
        (15, 100, 50, 10),
        (45, 100, 75, 50),
        (60, 100, 50, 10),
        (60, 150, 50, 100),
        (75, 100, 125, 200),
        (175, 0, 0, 0),
        (30, 50, 50, 120),
        (100, 100, 100, 100);

INSERT INTO appointment_part_types (appointment_part_name)
VALUES  
        ('early_arrival'), 
        ('data_collection'), 
        ('report_writing'), 
        ('client_presentation');

INSERT INTO appointment_parts (appointment_part_type_id, on_site, time_block_set)
VALUES
        (1, true, 1),
        (1, true, 2),
        (2, true, 3),
        (3, true, 4),
        (3, false, 5),
        (4, true, 6),
        (4, false, 7),
        (2, true, 8);

INSERT INTO dwelling_types (dwelling_type, ui_description_set)
VALUES  
        ('Condo', 2),
        ('Co-op', 3), 
        ('Townhouse', 4), 
        ('Single Family', 5), 
        ('Multi Family', 6);


INSERT INTO dwelling_adjustments (dwelling_type, ui_description_set, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4)
VALUES  
        (1, 1, 3, 4, 6),
        (2, 1, 3, 4, 6), 
        (3, 1, 3, 4, 6), 
        (4, 1, 3, 4, 6), 
        (5, 1, 3, 4, 6);

INSERT INTO 
services (title, can_be_scheduled, differential_scheduling,  ui_description_set, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4)
VALUES  
        ('Buyers Inspection', true, true, 7, 1, 3, 4, 6),
        ('Investors Inspection', true, true, 8, 1, 3, 4, 6),
        ('Walk and Talk', true, false, 9, 1, 3, 5, 7),
        ('Home Check-up and Maintenance Planning', true, true, 10, 1, 3, 4, 6),
        ('Pre-sale Walkthrough', true, false, 11, 1, 3, 5, 7),
        ('Developers Warranty Inspection', true, false, 12, 1, 3, 4, 6),
        ('Reinspection', true, false, 13, 1, 3, 4, 6);


INSERT INTO additional_services (title, can_be_scheduled, ui_description_set, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4)
VALUES  
        ('Blue Tape', true, 14, 1, 9, 1, 1),
        ('Radon', true, 15, 1, 10, 1, 1),
        ('Reinspection', true, 16, 1, 11, 1, 1),
        ('Accessory Dwelling Units', true, 17, 1, 12, 1, 1);

INSERT INTO availability_options (title, can_be_scheduled, differential_scheduling_override, ui_description_set, appointment_part_1, appointment_part_2, appointment_part_3, appointment_part_4)
VALUES 
        ('Minimize Time On-site', true, false, 18, 1, 3, 5, 6),
        ('Additional Client Time', true, false, 19, 1, 3, 4, 7),
        ('Client will not be present', true, false, 20, 1, 3, 5, 7),
        ('First-time buyers', true, false, 21, 2, 3, 5, 6);
        

RAISE NOTICE 'DHP Services database created';

EXCEPTION
WHEN OTHERS THEN
RAISE NOTICE 'An error occurred:%', SQLERRM;
ROLLBACK;

END $$;

--Additional Client Time: client_presentation*(variable)
-- Client will not be present: client_presentation*0)
-- First-time buyers: client_presentation*(variable))
