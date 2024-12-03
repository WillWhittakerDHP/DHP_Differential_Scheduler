DROP DATABASE IF EXISTS scheduler_variables_db;
CREATE DATABASE scheduler_variables_db;

\c scheduler_variables_db;

CREATE TABLE ui_description_sets(
  ui_description_set_id SERIAL PRIMARY KEY,
  buyer_description VARCHAR (100),
  agent_description VARCHAR (100),
  owner_description VARCHAR (100)
);

CREATE TABLE user_types(
  user_type_id SERIAL PRIMARY KEY,
  user_type VARCHAR(10) NOT NULL,
  user_description VARCHAR(50) NOT NULL,
  visibility BOOLEAN
);

CREATE TABLE time_block_sets(
  time_block_set_id SERIAL PRIMARY KEY,
  base_time DECIMAL(5, 2),
  rate_over_base_time DECIMAL(5, 2),
  base_fee DECIMAL(5, 2),
  rate_over_base_fee DECIMAL(5, 2)
);

CREATE TABLE appointment_part_types(
  appointment_part_type_id SERIAL PRIMARY KEY,
  appointment_part_name VARCHAR(30) NOT NULL
);

CREATE TABLE appointment_parts(
  appointment_part_id SERIAL PRIMARY KEY,
  appointment_part_type_id INTEGER,
  FOREIGN KEY (appointment_part_type_id) REFERENCES appointment_part_types(appointment_part_type_id),
  on_site BOOLEAN,
  time_block_set INTEGER,
  FOREIGN KEY (time_block_set)  REFERENCES time_block_sets(
  time_block_set_id)
);

CREATE TABLE dwelling_types(
  dwelling_type_id SERIAL PRIMARY KEY,
  dwelling_type VARCHAR (30) NOT NULL,
  ui_description_set INTEGER,
  FOREIGN KEY (ui_description_set) REFERENCES ui_description_sets(ui_description_set_id)
);

CREATE TABLE dwelling_adjustments(
  dwelling_adjustment_id SERIAL PRIMARY KEY,

  dwelling_type INTEGER,
  FOREIGN KEY (dwelling_type) REFERENCES dwelling_types(dwelling_type_id),

  appointment_part_1 INTEGER,
  FOREIGN KEY (appointment_part_1) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_2 INTEGER,
  FOREIGN KEY (appointment_part_2) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_3 INTEGER,
  FOREIGN KEY (appointment_part_3) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_4 INTEGER,
  FOREIGN KEY (appointment_part_4) REFERENCES appointment_parts(appointment_part_id)
);

CREATE TABLE services(
  service_id SERIAL PRIMARY KEY,
  
  title VARCHAR(100) not NULL,
  
  can_be_scheduled BOOLEAN,
  
  differential_scheduling BOOLEAN,
  
  ui_description_set INTEGER,
  FOREIGN KEY (ui_description_set) REFERENCES ui_description_sets(ui_description_set_id),
  
  appointment_part_1 INTEGER,
  FOREIGN KEY (appointment_part_1) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_2 INTEGER,
  FOREIGN KEY (appointment_part_2) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_3 INTEGER,
  FOREIGN KEY (appointment_part_3) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_4 INTEGER,
  FOREIGN KEY (appointment_part_4) REFERENCES appointment_parts(appointment_part_id)
);

CREATE TABLE additional_services(
  additional_service_id SERIAL PRIMARY KEY,

  title VARCHAR(100) not NULL,
  
  can_be_scheduled BOOLEAN,
  
  ui_description_set INTEGER,
  FOREIGN KEY (ui_description_set) REFERENCES ui_description_sets(ui_description_set_id),
  
  appointment_part_1 INTEGER,
  FOREIGN KEY (appointment_part_1) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_2 INTEGER,
  FOREIGN KEY (appointment_part_2) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_3 INTEGER,
  FOREIGN KEY (appointment_part_3) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_4 INTEGER,
  FOREIGN KEY (appointment_part_4) REFERENCES appointment_parts(appointment_part_id)
);

CREATE TABLE availability_options(
  availability_option_id SERIAL PRIMARY KEY,
  
  title VARCHAR(100) not NULL,
  
  can_be_scheduled BOOLEAN,
  
  differential_scheduling_override BOOLEAN,
  
  ui_description_set INTEGER,
  FOREIGN KEY (ui_description_set) REFERENCES ui_description_sets(ui_description_set_id),
  
  appointment_part_1 INTEGER,
  FOREIGN KEY (appointment_part_1) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_2 INTEGER,
  FOREIGN KEY (appointment_part_2) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_3 INTEGER,
  FOREIGN KEY (appointment_part_3) REFERENCES appointment_parts(appointment_part_id),
  
  appointment_part_4 INTEGER,
  FOREIGN KEY (appointment_part_4) REFERENCES appointment_parts(appointment_part_id)
);
  -- TODO: connect adds&avails to services with one has many
  -- base_service_ids INTEGER,
  -- FOREIGN KEY (base_service_ids) REFERENCES services(service_id)