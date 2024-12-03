-- DO $$
-- DECLARE
-- BEGIN

-- INSERT INTO user_types (user_type, user_description, visibility)
-- VALUES  ('Buyer', 'Buyer _description', true), 
--         ('Agent', 'Agent _description', true), 
--         ('Owner', 'Owner _description', true),
--         ('Inspector', 'inspector _description', false);

-- INSERT INTO dwelling_types (dwelling_type, 
-- buyer_description, agent_description, owner_description, data_collection_base_time, data_collection_rate_over_base_time, data_collection_base_fee, data_collection_rate_over_base_fee, 
-- report_writing_on_site,report_writing_base_time, report_writing_rate_over_base_time, report_writing_base_fee, report_writing_rate_over_base_fee, 
-- client_presentation_base_time, client_presentation_rate_over_base_time, client_presentation_base_fee, client_presentation_rate_over_base_fee)
-- VALUES  
--         ('Condo', 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',15,1,25,100, true,15,1,25,100, 15,1,25,100),
--         ( 'Co-op', 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',15,1,25,100, true,15,1,25,100, 15,1,25,100), 
--         ('Townhouse', 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',15,1,25,100, true,15,1,25,100, 15,1,25,100), 
--         ('Single Family Home', 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',15,1,25,100, true,15,1,25,100, 15,1,25,100), 
--         ('Multi Family Home', 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',15,1,25,100, true,15,1,25,100, 15,1,25,100);

-- INSERT INTO 
-- services (title, can_be_scheduled, buyer_description, agent_description, owner_description, differential_scheduling, 
-- early_arrival_base_time, early_arrival_rate_over_base_time, early_arrival_base_fee, early_arrival_rate_over_base_fee, 
-- data_collection_base_time, data_collection_rate_over_base_time, data_collection_base_fee, data_collection_rate_over_base_fee, 
-- report_writing_on_site,report_writing_base_time, report_writing_rate_over_base_time, report_writing_base_fee, report_writing_rate_over_base_fee, 
-- client_presentation_base_time, client_presentation_rate_over_base_time, client_presentation_base_fee, client_presentation_rate_over_base_fee)
-- VALUES  
--         ('Buyers Inspection', true, 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', true, 0,0,0,0, 45,60,100,100, true, 45,60,100,100, 30,45,100,100),
--         ('Investors Inspection', true, 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', true, 0,0,0,0, 45,60,100,100, true,45,60,100,100, 30,45,100,100),
--         ('Walk and Talk', true, 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', false, 0,0,0,0, 45,60,100,100, true,15,30,25,100, 30,45,100,100),
--         ('Home Check-up and Maintenance Planning', true, 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', true, 0,0,0,0, 45,60,100,100, true,45,60,100,100, 30,45,100,100),
--         ('Pre-sale Walkthrough', true, 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', false, 0,0,0,0, 45,60,100,100, true,45,60,100,100, 30,45,100,100),
--         ('Developers Warranty Inspection', true, 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', false, 0,0,0,0, 45,60,100,100, true,45,60,100,100, 30,45,100,100),
--         ('Reinspection', true, 'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', false, 0,0,0,0, 45,60,100,100, true,45,60,100,100, 0,0,0,0);


-- INSERT INTO additional_services (title, 

-- can_be_scheduled, 

-- buyer_description, agent_description, owner_description, 

-- early_arrival_base_time, early_arrival_rate_over_base_time, early_arrival_base_fee, early_arrival_rate_over_base_fee, 

-- data_collection_base_time, data_collection_rate_over_base_time, data_collection_base_fee, data_collection_rate_over_base_fee, 

-- report_writing_on_site,report_writing_base_time, report_writing_rate_over_base_time, report_writing_base_fee, report_writing_rate_over_base_fee, 

-- client_presentation_base_time, client_presentation_rate_over_base_time, client_presentation_base_fee, client_presentation_rate_over_base_fee
-- )
-- VALUES  
--         ('Blue Tape', 
--         true, 
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', 
        
--         0,0,0,0, 
--         0,0,0,0, 
--         true,0,0,0,0, 
--         0,0,0,0
--         ),
--         ('Radon', 
--         true, 
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', 
--         0,0,0,0, 
--         0,0,0,0, 
--         true,0,0,0,0, 
--         0,0,0,0
--         ),
--         ('Reinspection', 
--         true, 
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', 
--         0,0,0,0, 
--         0,0,0,0, 
--         true,0,0,0,0, 
--         0,0,0,0
--         ),
--         ('Accessory Dwelling Units', 
--         true, 
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', 
--         0,0,0,0, 
--         0,0,0,0, 
--         true,0,0,0,0, 
--         0,0,0,0
--         );

-- INSERT INTO availability_options (title, can_be_scheduled, differential_scheduling_override, buyer_description, agent_description, owner_description, 
-- early_arrival_base_time, early_arrival_rate_over_base_time, early_arrival_base_fee, early_arrival_rate_over_base_fee, 
-- data_collection_base_time, data_collection_rate_over_base_time, data_collection_base_fee, data_collection_rate_over_base_fee, 
-- report_writing_on_site, report_writing_base_time, report_writing_rate_over_base_time, report_writing_base_fee, report_writing_rate_over_base_fee, client_presentation_base_time, client_presentation_rate_over_base_time, client_presentation_base_fee, client_presentation_rate_over_base_fee)
-- VALUES 
--         ('Minimize Time On-site', 
--         true, 
--         false,
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know', 
--         0,0,0,0, 
--         0,0,0,0, 
--         true, 
--         0,0,0,0, 
--         0,0,0,0 
--         ),
--         ('Additional Client Time', 
--         true, 
--         false,
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',  
--         0,0,0,0, 
--         0,0,0,0, 
--         true, 
--         0,0,0,0, 
--         0,0,0,0
--         ),
        
--         ('Client will not be present', 
--         true, 
--         false,
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',  
--         0,0,0,0, 
--         0,0,0,0, 
--         true, 
--         0,0,0,0, 
--         0,0,0,0
--         ),
        
--         ('First-time buyers', 
--         true, 
--         false,
--         'what a buyer needs to know', 'what an agent needs to know', 'what an owner needs to know',  
--         0,0,0,0, 
--         0,0,0,0, 
--         true, 
--         0,0,0,0, 
--         0,0,0,0
--         );
        

-- RAISE NOTICE 'DHP Services database created';

-- EXCEPTION
-- WHEN OTHERS THEN
-- RAISE NOTICE 'An error occurred:%', SQLERRM;
-- ROLLBACK;

-- END $$;

-- --Additional Client Time: client_presentation*(variable)
-- -- Client will not be present: client_presentation*0)
-- -- First-time buyers: client_presentation*(variable))