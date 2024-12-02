DROP DATABASE IF EXISTS calculation_variables_db;
CREATE DATABASE calculation_variables_db;

\c calculation_variables_db;

CREATE TABLE user_types(
  user_type_id SERIAL PRIMARY KEY,
  user_type VARCHAR(10) NOT NULL,
  user_description VARCHAR(50) NOT NULL
);

CREATE TABLE dwelling_types(
  dwelling_type_id SERIAL PRIMARY KEY,
  
  dwelling_type VARCHAR(20),
  
  buyer_description VARCHAR(255) not NULL,
  agent_description VARCHAR(255) not NULL,
  owner_description VARCHAR(255) not NULL,
  
  data_collection_base_time DECIMAL(5, 2),
  data_collection_rate_over_base_time DECIMAL(5, 2),
  data_collection_base_fee DECIMAL(5, 2),
  data_collection_rate_over_base_fee DECIMAL(5, 2),
  
  report_writing_on_site BOOLEAN,  report_writing_base_time DECIMAL(5, 2),
  report_writing_rate_over_base_time DECIMAL(5, 2),
  report_writing_base_fee DECIMAL(5, 2),
  report_writing_rate_over_base_fee DECIMAL(5, 2),
  
  client_presentation_base_time DECIMAL(5, 2),
  client_presentation_rate_over_base_time DECIMAL(5, 2),
  client_presentation_base_fee DECIMAL(5, 2),
  client_presentation_rate_over_base_fee DECIMAL(5, 2)
);

CREATE TABLE services (
  service_id SERIAL PRIMARY KEY,
  
  title VARCHAR(100) not NULL,
  
  can_be_scheduled BOOLEAN,
  
  buyer_description VARCHAR(255) not NULL,
  agent_description VARCHAR(255) not NULL,
  owner_description VARCHAR(255) not NULL,
  
  differential_scheduling BOOLEAN,
  
  early_arrival_base_time DECIMAL(5, 2),
  early_arrival_rate_over_base_time DECIMAL(5, 2),
  early_arrival_base_fee DECIMAL(5, 2),
  early_arrival_rate_over_base_fee DECIMAL(5, 2),
  
  data_collection_base_time DECIMAL(5, 2),
  data_collection_rate_over_base_time DECIMAL(5, 2),
  data_collection_base_fee DECIMAL(5, 2),
  data_collection_rate_over_base_fee DECIMAL(5, 2),
  
  report_writing_on_site BOOLEAN,
  report_writing_base_time DECIMAL(5, 2),
  report_writing_rate_over_base_time DECIMAL(5, 2),
  report_writing_base_fee DECIMAL(5, 2),
  report_writing_rate_over_base_fee DECIMAL(5, 2),
  
  client_presentation_base_time DECIMAL(5, 2),
  client_presentation_rate_over_base_time DECIMAL(5, 2),
  client_presentation_base_fee DECIMAL(5, 2),
  client_presentation_rate_over_base_fee DECIMAL(5, 2)
);

CREATE TABLE additional_services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) not NULL,
  
  can_be_scheduled BOOLEAN,
  
  buyer_description VARCHAR(255) not NULL,
  agent_description VARCHAR(255) not NULL,
  owner_description VARCHAR(255) not NULL,
  
  early_arrival_base_time DECIMAL(5, 2),
  early_arrival_rate_over_base_time DECIMAL(5, 2),
  early_arrival_base_fee DECIMAL(5, 2),
  early_arrival_rate_over_base_fee DECIMAL(5, 2),
  
  data_collection_base_time DECIMAL(5, 2),
  data_collection_rate_over_base_time DECIMAL(5, 2),
  data_collection_base_fee DECIMAL(5, 2),
  data_collection_rate_over_base_fee DECIMAL(5, 2),
  
  report_writing_on_site BOOLEAN,
  report_writing_base_time DECIMAL(5, 2),
  report_writing_rate_over_base_time DECIMAL(5, 2),
  report_writing_base_fee DECIMAL(5, 2),
  report_writing_rate_over_base_fee DECIMAL(5, 2),
  
  client_presentation_base_time DECIMAL(5, 2),
  client_presentation_rate_over_base_time DECIMAL(5, 2),
  client_presentation_base_fee DECIMAL(5, 2),
  client_presentation_rate_over_base_fee DECIMAL(5, 2)
);

CREATE TABLE availability_options (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) not NULL,
  
  can_be_scheduled BOOLEAN,
  
  differential_scheduling_override BOOLEAN,
  
  buyer_description VARCHAR(255) not NULL,
  agent_description VARCHAR(255) not NULL,
  owner_description VARCHAR(255) not NULL,
  
  early_arrival_base_time DECIMAL(5, 2),
  early_arrival_rate_over_base_time DECIMAL(5, 2),
  early_arrival_base_fee DECIMAL(5, 2),
  early_arrival_rate_over_base_fee DECIMAL(5, 2),
  
  data_collection_base_time DECIMAL(5, 2),
  data_collection_rate_over_base_time DECIMAL(5, 2),
  data_collection_base_fee DECIMAL(5, 2),
  data_collection_rate_over_base_fee DECIMAL(5, 2),
  
  report_writing_on_site BOOLEAN,
  report_writing_base_time DECIMAL(5, 2),
  report_writing_rate_over_base_time DECIMAL(5, 2),
  report_writing_base_fee DECIMAL(5, 2),
  report_writing_rate_over_base_fee DECIMAL(5, 2),
  
  client_presentation_base_time DECIMAL(5, 2),
  client_presentation_rate_over_base_time DECIMAL(5, 2),
  client_presentation_base_fee DECIMAL(5, 2),
  client_presentation_rate_over_base_fee DECIMAL(5, 2)
);
  
  -- base_service_ids INTEGER,
  -- FOREIGN KEY (base_service_ids) REFERENCES services(service_id)