--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: appointment_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appointment_status_enum AS ENUM (
    'started',
    'held',
    'rescheduling',
    'quoted',
    'submitted',
    'confirmed',
    'cancelled',
    'deleted'
);


--
-- Name: basement_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.basement_type_enum AS ENUM (
    'basement',
    'crawlspace',
    'slab'
);


--
-- Name: block_shape_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.block_shape_type AS ENUM (
    'user',
    'service',
    'property',
    'option',
    'coupon'
);


--
-- Name: change_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.change_type_enum AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'ACTIVATE',
    'DEACTIVATE',
    'REORDER'
);


--
-- Name: data_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.data_type_enum AS ENUM (
    'string',
    'number',
    'boolean',
    'array',
    'reference'
);


--
-- Name: differential_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.differential_role_enum AS ENUM (
    'major',
    'minor',
    'moveable'
);


--
-- Name: entity_key_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.entity_key_enum AS ENUM (
    'blockProfile',
    'blockType',
    'partProfile',
    'partType'
);


--
-- Name: enum_active_events_ternary_value; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_active_events_ternary_value AS ENUM (
    'true',
    'false',
    'override'
);


--
-- Name: enum_admin_metadata_config_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_config_type AS ENUM (
    'entity',
    'event',
    'annotation'
);


--
-- Name: enum_admin_metadata_data_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_data_type AS ENUM (
    'string',
    'number',
    'boolean',
    'array',
    'reference',
    'ternary'
);


--
-- Name: enum_admin_metadata_entity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_entity_type AS ENUM (
    'blockShape',
    'partShape',
    'blockInstance',
    'partInstance',
    'eventShape',
    'eventInstance',
    'annotationShape',
    'annotationInstance'
);


--
-- Name: enum_admin_metadata_layout; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_layout AS ENUM (
    'inline',
    'stacked'
);


--
-- Name: enum_admin_metadata_metadata_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_metadata_type AS ENUM (
    'primitive',
    'relationship'
);


--
-- Name: enum_admin_metadata_panel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_panel AS ENUM (
    'none',
    'parts',
    'relationships',
    'annotations',
    'composition',
    'events'
);


--
-- Name: enum_admin_metadata_render_as; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_render_as AS ENUM (
    'text',
    'number',
    'select',
    'multiselect',
    'reference',
    'statusButton',
    'iconSelect',
    'partsCollection',
    'relationshipCollection'
);


--
-- Name: enum_admin_metadata_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_metadata_visibility AS ENUM (
    'titleRow',
    'staticAsTitle',
    'expandedDirect',
    'expandedPanel',
    'hidden',
    'notConfigured'
);


--
-- Name: enum_appointment_attendees_invitation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_appointment_attendees_invitation_status AS ENUM (
    'pending',
    'sent',
    'accepted',
    'declined',
    'failed'
);


--
-- Name: enum_appointments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_appointments_status AS ENUM (
    'draft',
    'quote',
    'booked',
    'completed',
    'cancelled'
);


--
-- Name: enum_event_assignments_parent_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_event_assignments_parent_kind AS ENUM (
    'partInstance',
    'blockInstance'
);


--
-- Name: enum_properties_basement_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_properties_basement_type AS ENUM (
    'basement',
    'crawlspace',
    'slab'
);


--
-- Name: enum_property_details_foundation_access; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_property_details_foundation_access AS ENUM (
    'basement',
    'crawlspace',
    'slab'
);


--
-- Name: enum_property_details_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_property_details_source AS ENUM (
    'api',
    'manual',
    'client'
);


--
-- Name: enum_shape_field_metadata_control_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shape_field_metadata_control_type AS ENUM (
    'text',
    'number',
    'toggle',
    'select',
    'multiselect',
    'reference'
);


--
-- Name: enum_shape_field_metadata_data_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shape_field_metadata_data_type AS ENUM (
    'string',
    'number',
    'boolean',
    'array',
    'reference'
);


--
-- Name: enum_shape_layout_config_layout; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shape_layout_config_layout AS ENUM (
    'inline',
    'stacked'
);


--
-- Name: enum_shape_layout_config_panel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shape_layout_config_panel AS ENUM (
    'parts',
    'relationships',
    'annotations',
    'none'
);


--
-- Name: enum_shape_layout_config_render_as; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shape_layout_config_render_as AS ENUM (
    'field',
    'statusButton'
);


--
-- Name: enum_shape_layout_config_shape_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shape_layout_config_shape_type AS ENUM (
    'block',
    'part',
    'blockShape',
    'partShape'
);


--
-- Name: enum_shape_layout_config_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shape_layout_config_visibility AS ENUM (
    'alwaysVisible',
    'expandedDirect',
    'expandedPanel',
    'hidden'
);


--
-- Name: enum_users_user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_user_role AS ENUM (
    'client',
    'agent',
    'transaction_manager',
    'seller'
);


--
-- Name: foundation_access_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.foundation_access_enum AS ENUM (
    'basement',
    'crawlspace',
    'slab'
);


--
-- Name: property_details_source_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.property_details_source_enum AS ENUM (
    'api',
    'manual',
    'client'
);


--
-- Name: ternary_boolean; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ternary_boolean AS ENUM (
    'true',
    'false',
    'override'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_enum AS ENUM (
    'client',
    'agent',
    'transaction_manager',
    'seller',
    'inspector'
);


--
-- Name: cleanup_booking_cascades_on_valid_cascade_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_booking_cascades_on_valid_cascade_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        DELETE FROM booking_cascades bc
        USING block_instances parent_inst,
              block_instances child_inst
        WHERE bc.parent_id = parent_inst.id
          AND bc.child_id  = child_inst.id
          AND parent_inst.block_shape_ref = OLD.parent_id
          AND child_inst.block_shape_ref  = OLD.child_id;
        RETURN OLD;
      END;
      $$;


--
-- Name: cleanup_part_assignments_on_valid_part_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_part_assignments_on_valid_part_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        DELETE FROM part_assignments pa
        USING block_instances parent_inst,
              part_instances  child_inst
        WHERE pa.parent_id = parent_inst.id
          AND pa.child_id  = child_inst.id
          AND parent_inst.block_shape_ref = OLD.parent_id
          AND child_inst.part_shape_ref   = OLD.child_id;
        RETURN OLD;
      END;
      $$;


--
-- Name: validate_property_version_type(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_property_version_type() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      DECLARE
        block_shape_name TEXT;
      BEGIN
        SELECT bs.name INTO block_shape_name
        FROM block_instances bi
        JOIN block_shapes bs ON bi.block_shape_ref = bs.id
        WHERE bi.id = NEW.block_instance_id;
        
        IF block_shape_name IS NULL OR block_shape_name != 'Properties' THEN
          RAISE EXCEPTION 'block_instance_id must reference a block_instance with block_shape "Properties". Got: %', COALESCE(block_shape_name, 'NULL');
        END IF;
        
        RETURN NEW;
      END;
      $$;


SET default_tablespace = '';

SET default_table_access_method = heap;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id uuid NOT NULL,
    address character varying(255) NOT NULL,
    unit character varying(255),
    city character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    zip_code character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    place_id character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8)
);


--
-- Name: admin_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_metadata (
    id uuid NOT NULL,
    metadata_type public.enum_admin_metadata_metadata_type NOT NULL,
    entity_type public.enum_admin_metadata_entity_type,
    entity_id uuid,
    field_key character varying(255) NOT NULL,
    data_type public.enum_admin_metadata_data_type NOT NULL,
    label character varying(255) NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    visibility public.enum_admin_metadata_visibility DEFAULT 'notConfigured'::public.enum_admin_metadata_visibility NOT NULL,
    layout public.enum_admin_metadata_layout DEFAULT 'stacked'::public.enum_admin_metadata_layout NOT NULL,
    display_order integer DEFAULT 999 NOT NULL,
    render_as public.enum_admin_metadata_render_as DEFAULT 'text'::public.enum_admin_metadata_render_as NOT NULL,
    status_button_color character varying(255),
    panel public.enum_admin_metadata_panel DEFAULT 'none'::public.enum_admin_metadata_panel NOT NULL,
    bulk_edit boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    block_shape_ref uuid,
    ic_target_mode character varying(32),
    ic_select_mode character varying(32),
    ic_select_type character varying(64),
    ic_target_key character varying(128),
    ic_global_field character varying(128),
    ic_placeholder text,
    ic_group_by_key character varying(128),
    ic_selected_child_key character varying(64),
    ic_candidate_child_key character varying(64),
    ic_selected_parent_key character varying(64),
    ic_candidate_parent_key character varying(64),
    ic_selected_child_path text[],
    ic_candidate_child_path text[],
    ic_candidate_parent_path text[]
);


--
-- Name: admin_metadata_select_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_metadata_select_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_metadata_id uuid NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    label text NOT NULL,
    value_payload text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: annotation_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annotation_assignments (
    id uuid NOT NULL,
    block_instance_id uuid NOT NULL,
    annotation_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_type_block_instance_id uuid,
    disabled boolean DEFAULT false NOT NULL
);


--
-- Name: annotation_instance_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annotation_instance_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annotation_instance_id uuid NOT NULL,
    user_type_block_instance_id uuid,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: annotation_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annotation_instances (
    id uuid NOT NULL,
    text text NOT NULL,
    user_type character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type uuid NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: annotation_shapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annotation_shapes (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    ui_slot character varying(50)
);


--
-- Name: appointment_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_attendees (
    id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    user_type_block_instance_id uuid,
    should_receive_invitation boolean DEFAULT true NOT NULL,
    invitation_status public.enum_appointment_attendees_invitation_status DEFAULT 'pending'::public.enum_appointment_attendees_invitation_status NOT NULL,
    google_event_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: appointment_fee_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_fee_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fee_summary_id uuid NOT NULL,
    block_instance_id uuid NOT NULL,
    block_name text NOT NULL,
    block_shape_ref uuid NOT NULL,
    base_fee numeric DEFAULT 0 NOT NULL,
    overage_fee numeric DEFAULT 0 NOT NULL,
    total_fee numeric DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: appointment_fee_summaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_fee_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    base_fee_total numeric DEFAULT 0 NOT NULL,
    overage_fee_total numeric DEFAULT 0 NOT NULL,
    total_fee numeric DEFAULT 0 NOT NULL,
    square_footage numeric DEFAULT 0 NOT NULL,
    adu_count integer DEFAULT 1 NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    calculated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: appointment_selection_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_selection_lines (
    id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    line_kind text NOT NULL,
    sort_order integer NOT NULL,
    block_instance_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    snapshot_version_id uuid,
    CONSTRAINT appointment_selection_lines_line_kind_check CHECK ((line_kind = ANY (ARRAY['service'::text, 'property'::text, 'option'::text]))),
    CONSTRAINT appointment_selection_lines_quantity_check CHECK ((quantity >= 1))
);


--
-- Name: appointment_time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_time_slots (
    id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    sort_order integer NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    duration_minutes integer,
    slot_metadata jsonb
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid NOT NULL,
    user_type_id uuid,
    selected_date date,
    selected_date_range_end date,
    is_quote_mode boolean DEFAULT false NOT NULL,
    quote_pdf_url character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    property_version_id uuid NOT NULL,
    status public.appointment_status_enum DEFAULT 'started'::public.appointment_status_enum NOT NULL,
    scheduled_by_id uuid,
    service_snapshots jsonb,
    property_snapshots jsonb,
    option_snapshots jsonb,
    held_by uuid,
    held_until timestamp with time zone,
    submitted_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    confirmed_by uuid,
    override_constraint_capacity boolean DEFAULT false NOT NULL,
    override_constraint_buffer boolean DEFAULT false NOT NULL,
    override_constraint_blackout boolean DEFAULT false NOT NULL,
    override_constraint_business_hours boolean DEFAULT false NOT NULL
);


--
-- Name: availability_buffers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_buffers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    availability_settings_id uuid NOT NULL,
    buffer_kind text NOT NULL,
    minutes integer,
    enforcement text,
    placement text,
    apply_to text,
    CONSTRAINT availability_buffers_buffer_kind_check CHECK ((buffer_kind = ANY (ARRAY['appointment'::text, 'drive_to_candidate'::text, 'drive_from_candidate'::text, 'lunch'::text])))
);


--
-- Name: availability_business_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_business_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    availability_settings_id uuid NOT NULL,
    day_of_week smallint NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    CONSTRAINT availability_business_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: availability_differential_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_differential_attendees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    availability_settings_id uuid CONSTRAINT availability_differential_att_availability_settings_id_not_null NOT NULL,
    role text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    value text NOT NULL,
    CONSTRAINT availability_differential_attendees_role_check CHECK ((role = ANY (ARRAY['major'::text, 'minor'::text])))
);


--
-- Name: availability_max_income; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_max_income (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    availability_settings_id uuid NOT NULL,
    scope text NOT NULL,
    max_income double precision NOT NULL,
    enforcement text NOT NULL,
    rolling_direction text,
    CONSTRAINT availability_max_income_scope_check CHECK ((scope = ANY (ARRAY['day'::text, 'calendar_week'::text, 'rolling_week'::text])))
);


--
-- Name: availability_max_work_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_max_work_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    availability_settings_id uuid NOT NULL,
    scope text NOT NULL,
    max_hours double precision NOT NULL,
    enforcement text NOT NULL,
    rolling_direction text,
    CONSTRAINT availability_max_work_hours_scope_check CHECK ((scope = ANY (ARRAY['day'::text, 'calendar_week'::text, 'rolling_week'::text])))
);


--
-- Name: availability_range_constraint_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_range_constraint_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    range_constraint_id uuid CONSTRAINT availability_range_constraint_hour_range_constraint_id_not_null NOT NULL,
    day_of_week smallint NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    CONSTRAINT availability_range_constraint_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: availability_range_constraints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_range_constraints (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    availability_settings_id uuid CONSTRAINT availability_range_constraint_availability_settings_id_not_null NOT NULL,
    range_type text NOT NULL,
    enforcement text NOT NULL,
    lead_time_minutes integer,
    date_range_start timestamp with time zone,
    date_range_end timestamp with time zone,
    CONSTRAINT availability_range_constraints_range_type_check CHECK ((range_type = ANY (ARRAY['businessHours'::text, 'leadTime'::text, 'dateRange'::text])))
);


--
-- Name: availability_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    minute_increment integer DEFAULT 15 NOT NULL,
    timezone text,
    default_location_place_id text,
    default_location_label text,
    default_location_lat double precision,
    default_location_lng double precision,
    duration_rounding_enabled boolean DEFAULT false NOT NULL,
    duration_rounding_increment integer,
    duration_rounding_method text,
    overlap_out_of_office_enforcement text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    drive_time_fee_complimentary_minutes integer DEFAULT 0 CONSTRAINT availability_settings_drive_time_fee_complimentary_min_not_null NOT NULL,
    drive_time_fee_rate_per_hour double precision DEFAULT 0 NOT NULL,
    drive_time_fee_rounding_minutes integer DEFAULT 15 NOT NULL
);


--
-- Name: beta_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beta_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_name character varying(100) NOT NULL,
    reporter_email character varying(255),
    category character varying(50) NOT NULL,
    severity character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    page_url character varying(500),
    browser_info character varying(500),
    screen_size character varying(50),
    steps_to_reproduce text,
    expected_behavior text,
    actual_behavior text,
    status character varying(30) DEFAULT 'new'::character varying NOT NULL,
    resolution_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: beta_feedback_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beta_feedback_tags (
    id integer NOT NULL,
    feedback_id uuid NOT NULL,
    tag character varying(100) NOT NULL
);


--
-- Name: beta_feedback_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.beta_feedback_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: beta_feedback_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.beta_feedback_tags_id_seq OWNED BY public.beta_feedback_tags.id;


--
-- Name: block_instance_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.block_instance_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    block_instance_id uuid NOT NULL,
    name text NOT NULL,
    icon text,
    base_sq_ft integer,
    allow_multiple boolean DEFAULT false NOT NULL,
    differential public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pre_closing boolean DEFAULT false NOT NULL
);


--
-- Name: block_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.block_instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    order_index integer NOT NULL,
    block_shape_ref uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    icon character varying(255),
    base_sq_ft integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    composite boolean DEFAULT false NOT NULL,
    differential public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL,
    allow_multiple boolean DEFAULT false NOT NULL,
    requires_unit_number boolean DEFAULT false NOT NULL,
    booking_mode public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL,
    is_multi_family boolean DEFAULT false NOT NULL,
    requires_agent boolean DEFAULT false NOT NULL,
    pre_closing boolean DEFAULT false NOT NULL,
    agent_permissions public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL,
    differential_event_role_overrides jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: block_shapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.block_shapes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    order_index integer NOT NULL,
    allow_multiple_blocks boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    composable boolean DEFAULT false NOT NULL,
    can_have_parts boolean DEFAULT false NOT NULL,
    type public.block_shape_type NOT NULL,
    is_state_control boolean DEFAULT false NOT NULL,
    CONSTRAINT check_state_control_mutual_exclusivity CHECK ((NOT ((is_state_control = true) AND (can_have_parts = true))))
);


--
-- Name: booking_cascades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_cascades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: business_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    block_instance_id uuid NOT NULL,
    rule_type character varying(50) NOT NULL,
    rule_config jsonb NOT NULL,
    validation_message_annotation_id uuid,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: calendar_setting_calendars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_setting_calendars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    calendar_settings_id uuid NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    email text NOT NULL,
    label text,
    read_from boolean DEFAULT false NOT NULL,
    write_to boolean DEFAULT false NOT NULL
);


--
-- Name: calendar_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    provider character varying(32) DEFAULT 'none'::character varying NOT NULL,
    hold_duration_minutes integer DEFAULT 15 NOT NULL,
    hold_duration_min integer DEFAULT 1 NOT NULL,
    hold_duration_max integer DEFAULT 60 NOT NULL,
    hold_duration_fallback integer DEFAULT 15 NOT NULL,
    admin_entry_timeout_value integer DEFAULT 30 NOT NULL,
    admin_entry_timeout_unit character varying(16) DEFAULT 'days'::character varying NOT NULL,
    auto_confirm_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: constraint_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.constraint_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    overridden_violations text[] DEFAULT '{}'::text[] NOT NULL,
    authorized_by_id uuid,
    reason text,
    slot_start timestamp with time zone NOT NULL,
    slot_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: dependent_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dependent_instances (
    id uuid NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: entity_layout_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_layout_config (
    id uuid NOT NULL,
    entity_id uuid NOT NULL,
    entity_type public.enum_shape_layout_config_shape_type NOT NULL,
    field_key character varying(255) NOT NULL,
    visibility public.enum_shape_layout_config_visibility NOT NULL,
    layout public.enum_shape_layout_config_layout NOT NULL,
    "order" integer NOT NULL,
    section character varying(255),
    render_as public.enum_shape_layout_config_render_as DEFAULT 'field'::public.enum_shape_layout_config_render_as NOT NULL,
    status_button_color character varying(255),
    panel public.enum_shape_layout_config_panel DEFAULT 'none'::public.enum_shape_layout_config_panel NOT NULL,
    bulk_edit boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: event_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_assignments (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    parent_id uuid NOT NULL,
    parent_kind public.enum_event_assignments_parent_kind NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL
);


--
-- Name: event_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_instances (
    id uuid NOT NULL,
    event_shape_ref uuid NOT NULL,
    name character varying(255) NOT NULL,
    title_template text,
    description_template text,
    location_template text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    visibility character varying(20) DEFAULT 'default'::character varying NOT NULL,
    transparency character varying(12) DEFAULT 'opaque'::character varying NOT NULL,
    guests_can_modify boolean DEFAULT false NOT NULL,
    guests_can_invite_others boolean DEFAULT true NOT NULL,
    guests_can_see_other_guests boolean DEFAULT true NOT NULL,
    add_conference_link boolean DEFAULT false NOT NULL,
    send_updates character varying(16) DEFAULT 'all'::character varying NOT NULL,
    color_id character varying(4) DEFAULT NULL::character varying,
    status character varying(12) DEFAULT 'confirmed'::character varying NOT NULL,
    reminder_overrides jsonb
);


--
-- Name: event_shape_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_shape_attendees (
    id uuid NOT NULL,
    event_shape_id uuid NOT NULL,
    user_type_block_instance_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    disabled boolean DEFAULT false NOT NULL
);


--
-- Name: event_shapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_shapes (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    is_ternary boolean DEFAULT false NOT NULL,
    ternary_default character varying(10),
    differential_role public.differential_role_enum,
    include_reschedule_link boolean DEFAULT true NOT NULL,
    include_cancel_link boolean DEFAULT true NOT NULL,
    CONSTRAINT check_ternary_default_valid CHECK (((ternary_default IS NULL) OR ((ternary_default)::text = ANY (ARRAY[('true'::character varying)::text, ('false'::character varying)::text, ('override'::character varying)::text]))))
);


--
-- Name: instance_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instance_components (
    id uuid NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_index integer DEFAULT 0 NOT NULL
);


--
-- Name: part_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: part_instance_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_instance_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    block_instance_version_id uuid NOT NULL,
    part_instance_id uuid NOT NULL,
    name text,
    base_fee integer NOT NULL,
    base_time integer NOT NULL,
    rate_over_base_fee integer NOT NULL,
    rate_over_base_time integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: part_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    order_index integer NOT NULL,
    part_shape_ref uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    base_fee integer,
    rate_over_base_fee integer,
    base_time integer,
    rate_over_base_time integer,
    active boolean DEFAULT true NOT NULL,
    zero_out_part boolean DEFAULT false NOT NULL
);


--
-- Name: part_shapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_shapes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    order_index integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: pricing_cascades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_cascades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_details (
    id uuid NOT NULL,
    property_version_id uuid NOT NULL,
    source public.enum_property_details_source DEFAULT 'client'::public.enum_property_details_source NOT NULL,
    mls_number character varying(255),
    square_footage integer,
    bedrooms integer,
    bathrooms numeric(5,2),
    foundation_access public.enum_property_details_foundation_access,
    additional_units integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_feature_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_feature_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    data_source character varying(50) DEFAULT 'bright_mls'::character varying NOT NULL,
    source_field character varying(100) NOT NULL,
    match_type character varying(30) NOT NULL,
    match_value text,
    block_instance_id uuid NOT NULL,
    active boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_field_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_field_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    data_source character varying(50) DEFAULT 'bright_mls'::character varying NOT NULL,
    source_field character varying(100) NOT NULL,
    target_field character varying(100) NOT NULL,
    value_mapping jsonb,
    fallback_value text,
    active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_version_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_version_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_version_id uuid NOT NULL,
    block_instance_id uuid NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: property_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_versions (
    id uuid NOT NULL,
    address_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    user_role public.enum_users_user_role NOT NULL,
    login_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: valid_annotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valid_annotations (
    id uuid NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: valid_cascades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valid_cascades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: valid_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valid_events (
    id uuid NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: valid_parts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valid_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: valid_pricing_cascades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valid_pricing_cascades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: wizard_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wizard_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    show_apply_coupon boolean DEFAULT false NOT NULL,
    use_brand_colors boolean DEFAULT false NOT NULL,
    major_label text,
    minor_label text,
    moveable_fallback_label text,
    differential_graph_default_label text,
    major_state_label text,
    minor_state_label text,
    select_time_slot_label text,
    sub_step_label_pick_day text,
    sub_step_label_options text,
    sub_step_label_pick_time text,
    sub_step_label_confirm_moveable text
);


--
-- Name: beta_feedback_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback_tags ALTER COLUMN id SET DEFAULT nextval('public.beta_feedback_tags_id_seq'::regclass);



--
-- Name: booking_cascades active_blocks_parent_id_child_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_cascades
    ADD CONSTRAINT active_blocks_parent_id_child_id_key UNIQUE (parent_id, child_id);


--
-- Name: booking_cascades active_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_cascades
    ADD CONSTRAINT active_blocks_pkey PRIMARY KEY (id);


--
-- Name: instance_components active_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_components
    ADD CONSTRAINT active_components_pkey PRIMARY KEY (id);


--
-- Name: event_assignments active_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT active_events_pkey PRIMARY KEY (id);


--
-- Name: part_assignments active_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_assignments
    ADD CONSTRAINT active_parts_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: admin_metadata admin_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_metadata
    ADD CONSTRAINT admin_metadata_pkey PRIMARY KEY (id);


--
-- Name: admin_metadata_select_options admin_metadata_select_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_metadata_select_options
    ADD CONSTRAINT admin_metadata_select_options_pkey PRIMARY KEY (id);


--
-- Name: annotation_instance_content annotation_instance_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_instance_content
    ADD CONSTRAINT annotation_instance_content_pkey PRIMARY KEY (id);


--
-- Name: annotation_shapes annotation_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_shapes
    ADD CONSTRAINT annotation_types_name_key UNIQUE (name);


--
-- Name: annotation_shapes annotation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_shapes
    ADD CONSTRAINT annotation_types_pkey PRIMARY KEY (id);


--
-- Name: appointment_attendees appointment_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_attendees
    ADD CONSTRAINT appointment_attendees_pkey PRIMARY KEY (id);


--
-- Name: appointment_fee_entries appointment_fee_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_fee_entries
    ADD CONSTRAINT appointment_fee_entries_pkey PRIMARY KEY (id);


--
-- Name: appointment_fee_summaries appointment_fee_summaries_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_fee_summaries
    ADD CONSTRAINT appointment_fee_summaries_appointment_id_key UNIQUE (appointment_id);


--
-- Name: appointment_fee_summaries appointment_fee_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_fee_summaries
    ADD CONSTRAINT appointment_fee_summaries_pkey PRIMARY KEY (id);


--
-- Name: appointment_selection_lines appointment_selection_lines_appointment_kind_order_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_selection_lines
    ADD CONSTRAINT appointment_selection_lines_appointment_kind_order_uniq UNIQUE (appointment_id, line_kind, sort_order);


--
-- Name: appointment_selection_lines appointment_selection_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_selection_lines
    ADD CONSTRAINT appointment_selection_lines_pkey PRIMARY KEY (id);


--
-- Name: appointment_time_slots appointment_time_slots_appointment_sort_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_time_slots
    ADD CONSTRAINT appointment_time_slots_appointment_sort_uniq UNIQUE (appointment_id, sort_order);


--
-- Name: appointment_time_slots appointment_time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_time_slots
    ADD CONSTRAINT appointment_time_slots_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: availability_buffers availability_buffers_availability_settings_id_buffer_kind_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_buffers
    ADD CONSTRAINT availability_buffers_availability_settings_id_buffer_kind_key UNIQUE (availability_settings_id, buffer_kind);


--
-- Name: availability_buffers availability_buffers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_buffers
    ADD CONSTRAINT availability_buffers_pkey PRIMARY KEY (id);


--
-- Name: availability_business_hours availability_business_hours_availability_settings_id_day_of_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_business_hours
    ADD CONSTRAINT availability_business_hours_availability_settings_id_day_of_key UNIQUE (availability_settings_id, day_of_week);


--
-- Name: availability_business_hours availability_business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_business_hours
    ADD CONSTRAINT availability_business_hours_pkey PRIMARY KEY (id);


--
-- Name: availability_differential_attendees availability_differential_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_differential_attendees
    ADD CONSTRAINT availability_differential_attendees_pkey PRIMARY KEY (id);


--
-- Name: availability_max_income availability_max_income_availability_settings_id_scope_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_max_income
    ADD CONSTRAINT availability_max_income_availability_settings_id_scope_key UNIQUE (availability_settings_id, scope);


--
-- Name: availability_max_income availability_max_income_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_max_income
    ADD CONSTRAINT availability_max_income_pkey PRIMARY KEY (id);


--
-- Name: availability_max_work_hours availability_max_work_hours_availability_settings_id_scope_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_max_work_hours
    ADD CONSTRAINT availability_max_work_hours_availability_settings_id_scope_key UNIQUE (availability_settings_id, scope);


--
-- Name: availability_max_work_hours availability_max_work_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_max_work_hours
    ADD CONSTRAINT availability_max_work_hours_pkey PRIMARY KEY (id);


--
-- Name: availability_range_constraints availability_range_constraint_availability_settings_id_rang_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_range_constraints
    ADD CONSTRAINT availability_range_constraint_availability_settings_id_rang_key UNIQUE (availability_settings_id, range_type);


--
-- Name: availability_range_constraint_hours availability_range_constraint_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_range_constraint_hours
    ADD CONSTRAINT availability_range_constraint_hours_pkey PRIMARY KEY (id);


--
-- Name: availability_range_constraint_hours availability_range_constraint_range_constraint_id_day_of_we_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_range_constraint_hours
    ADD CONSTRAINT availability_range_constraint_range_constraint_id_day_of_we_key UNIQUE (range_constraint_id, day_of_week);


--
-- Name: availability_range_constraints availability_range_constraints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_range_constraints
    ADD CONSTRAINT availability_range_constraints_pkey PRIMARY KEY (id);


--
-- Name: availability_settings availability_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_settings
    ADD CONSTRAINT availability_settings_pkey PRIMARY KEY (id);


--
-- Name: beta_feedback beta_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback
    ADD CONSTRAINT beta_feedback_pkey PRIMARY KEY (id);


--
-- Name: beta_feedback_tags beta_feedback_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback_tags
    ADD CONSTRAINT beta_feedback_tags_pkey PRIMARY KEY (id);


--
-- Name: annotation_assignments block_instance_descriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_assignments
    ADD CONSTRAINT block_instance_descriptions_pkey PRIMARY KEY (id);


--
-- Name: block_instance_versions block_instance_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.block_instance_versions
    ADD CONSTRAINT block_instance_versions_pkey PRIMARY KEY (id);


--
-- Name: block_instances block_profiles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.block_instances
    ADD CONSTRAINT block_profiles_name_key UNIQUE (name);


--
-- Name: block_instances block_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.block_instances
    ADD CONSTRAINT block_profiles_pkey PRIMARY KEY (id);


--
-- Name: block_shapes block_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.block_shapes
    ADD CONSTRAINT block_types_name_key UNIQUE (name);


--
-- Name: block_shapes block_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.block_shapes
    ADD CONSTRAINT block_types_pkey PRIMARY KEY (id);


--
-- Name: business_rules business_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_rules
    ADD CONSTRAINT business_rules_pkey PRIMARY KEY (id);


--
-- Name: calendar_setting_calendars calendar_setting_calendars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_setting_calendars
    ADD CONSTRAINT calendar_setting_calendars_pkey PRIMARY KEY (id);


--
-- Name: calendar_settings calendar_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_settings
    ADD CONSTRAINT calendar_settings_pkey PRIMARY KEY (id);


--
-- Name: constraint_overrides constraint_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.constraint_overrides
    ADD CONSTRAINT constraint_overrides_pkey PRIMARY KEY (id);


--
-- Name: annotation_instances descriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_instances
    ADD CONSTRAINT descriptions_pkey PRIMARY KEY (id);


--
-- Name: event_instances event_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_instances
    ADD CONSTRAINT event_instances_pkey PRIMARY KEY (id);


--
-- Name: event_shape_attendees event_shape_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shape_attendees
    ADD CONSTRAINT event_shape_attendees_pkey PRIMARY KEY (id);


--
-- Name: event_shapes event_shapes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shapes
    ADD CONSTRAINT event_shapes_name_key UNIQUE (name);


--
-- Name: event_shapes event_shapes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shapes
    ADD CONSTRAINT event_shapes_pkey PRIMARY KEY (id);


--
-- Name: part_instance_versions part_instance_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_instance_versions
    ADD CONSTRAINT part_instance_versions_pkey PRIMARY KEY (id);


--
-- Name: part_instances part_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_instances
    ADD CONSTRAINT part_profiles_pkey PRIMARY KEY (id);


--
-- Name: part_shapes part_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_shapes
    ADD CONSTRAINT part_types_name_key UNIQUE (name);


--
-- Name: part_shapes part_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_shapes
    ADD CONSTRAINT part_types_pkey PRIMARY KEY (id);


--
-- Name: pricing_cascades pricing_cascades_parent_id_child_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_cascades
    ADD CONSTRAINT pricing_cascades_parent_id_child_id_key UNIQUE (parent_id, child_id);


--
-- Name: pricing_cascades pricing_cascades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_cascades
    ADD CONSTRAINT pricing_cascades_pkey PRIMARY KEY (id);


--
-- Name: property_details property_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_details_pkey PRIMARY KEY (id);


--
-- Name: property_feature_mappings property_feature_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_feature_mappings
    ADD CONSTRAINT property_feature_mappings_pkey PRIMARY KEY (id);


--
-- Name: property_field_mappings property_field_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_field_mappings
    ADD CONSTRAINT property_field_mappings_pkey PRIMARY KEY (id);


--
-- Name: property_version_types property_version_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_version_types
    ADD CONSTRAINT property_version_types_pkey PRIMARY KEY (id);


--
-- Name: property_version_types property_version_types_property_version_id_block_instance_id_ke; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_version_types
    ADD CONSTRAINT property_version_types_property_version_id_block_instance_id_ke UNIQUE (property_version_id, block_instance_id);


--
-- Name: property_versions property_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_versions
    ADD CONSTRAINT property_versions_pkey PRIMARY KEY (id);


--
-- Name: entity_layout_config shape_layout_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_layout_config
    ADD CONSTRAINT shape_layout_config_pkey PRIMARY KEY (id);


--
-- Name: appointment_attendees unique_appointment_attendee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_attendees
    ADD CONSTRAINT unique_appointment_attendee UNIQUE (appointment_id, user_id);


--
-- Name: annotation_assignments unique_block_instance_annotation_user_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_assignments
    ADD CONSTRAINT unique_block_instance_annotation_user_type UNIQUE (block_instance_id, annotation_id, user_type_block_instance_id);


--
-- Name: event_assignments unique_event_assignments_parent_child; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT unique_event_assignments_parent_child UNIQUE (parent_id, child_id);


--
-- Name: event_shape_attendees unique_event_shape_attendee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shape_attendees
    ADD CONSTRAINT unique_event_shape_attendee UNIQUE (event_shape_id, user_type_block_instance_id);


--
-- Name: part_assignments unique_part_assignment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_assignments
    ADD CONSTRAINT unique_part_assignment UNIQUE (parent_id, child_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: valid_annotations valid_annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_annotations
    ADD CONSTRAINT valid_annotations_pkey PRIMARY KEY (id);


--
-- Name: valid_cascades valid_blocks_parent_id_child_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_cascades
    ADD CONSTRAINT valid_blocks_parent_id_child_id_key UNIQUE (parent_id, child_id);


--
-- Name: valid_cascades valid_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_cascades
    ADD CONSTRAINT valid_blocks_pkey PRIMARY KEY (id);


--
-- Name: valid_events valid_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_events
    ADD CONSTRAINT valid_events_pkey PRIMARY KEY (id);


--
-- Name: dependent_instances valid_independent_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dependent_instances
    ADD CONSTRAINT valid_independent_components_pkey PRIMARY KEY (id);


--
-- Name: valid_parts valid_parts_parent_id_child_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_parts
    ADD CONSTRAINT valid_parts_parent_id_child_id_key UNIQUE (parent_id, child_id);


--
-- Name: valid_parts valid_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_parts
    ADD CONSTRAINT valid_parts_pkey PRIMARY KEY (id);


--
-- Name: valid_pricing_cascades valid_pricing_cascades_parent_id_child_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_pricing_cascades
    ADD CONSTRAINT valid_pricing_cascades_parent_id_child_id_key UNIQUE (parent_id, child_id);


--
-- Name: valid_pricing_cascades valid_pricing_cascades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_pricing_cascades
    ADD CONSTRAINT valid_pricing_cascades_pkey PRIMARY KEY (id);


--
-- Name: wizard_settings wizard_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wizard_settings
    ADD CONSTRAINT wizard_settings_pkey PRIMARY KEY (id);


--
-- Name: active_blocks_child_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX active_blocks_child_id_idx ON public.booking_cascades USING btree (child_id);


--
-- Name: active_blocks_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX active_blocks_parent_id_idx ON public.booking_cascades USING btree (parent_id);


--
-- Name: active_parts_child_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX active_parts_child_id_idx ON public.part_assignments USING btree (child_id);


--
-- Name: active_parts_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX active_parts_parent_id_idx ON public.part_assignments USING btree (parent_id);


--
-- Name: admin_metadata_blockshape_ref_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_metadata_blockshape_ref_idx ON public.admin_metadata USING btree (entity_type, block_shape_ref, field_key) WHERE (block_shape_ref IS NOT NULL);


--
-- Name: admin_metadata_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_metadata_entity_idx ON public.admin_metadata USING btree (entity_type, entity_id);


--
-- Name: admin_metadata_entity_metadata_field_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_metadata_entity_metadata_field_unique ON public.admin_metadata USING btree (entity_type, entity_id, metadata_type, field_key, block_shape_ref) NULLS NOT DISTINCT;


--
-- Name: admin_metadata_field_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_metadata_field_key_idx ON public.admin_metadata USING btree (field_key);


--
-- Name: admin_metadata_metadata_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_metadata_metadata_type_idx ON public.admin_metadata USING btree (metadata_type);


--
-- Name: admin_metadata_select_options_meta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_metadata_select_options_meta_idx ON public.admin_metadata_select_options USING btree (admin_metadata_id);


--
-- Name: block_instance_versions_block_instance_id_created_at_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX block_instance_versions_block_instance_id_created_at_unique ON public.block_instance_versions USING btree (block_instance_id, created_at);


--
-- Name: block_profiles_block_type_ref_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX block_profiles_block_type_ref_idx ON public.block_instances USING btree (block_shape_ref);


--
-- Name: block_profiles_order_index_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX block_profiles_order_index_idx ON public.block_instances USING btree (order_index);


--
-- Name: block_types_order_index_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX block_types_order_index_idx ON public.block_shapes USING btree (order_index);


--
-- Name: entity_layout_config_entity_field_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX entity_layout_config_entity_field_unique ON public.entity_layout_config USING btree (entity_id, entity_type, field_key);


--
-- Name: entity_layout_config_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_layout_config_entity_idx ON public.entity_layout_config USING btree (entity_id, entity_type);


--
-- Name: entity_layout_config_field_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_layout_config_field_key_idx ON public.entity_layout_config USING btree (field_key);


--
-- Name: idx_active_components_child; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_active_components_child ON public.instance_components USING btree (child_id);


--
-- Name: idx_active_components_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_active_components_parent ON public.instance_components USING btree (parent_id);


--
-- Name: idx_addresses_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addresses_city ON public.addresses USING btree (city);


--
-- Name: idx_addresses_full_address; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addresses_full_address ON public.addresses USING btree (address, city, state, zip_code);


--
-- Name: idx_addresses_place_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addresses_place_id ON public.addresses USING btree (place_id) WHERE (place_id IS NOT NULL);


--
-- Name: idx_addresses_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addresses_state ON public.addresses USING btree (state);


--
-- Name: idx_addresses_zip_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_addresses_zip_code ON public.addresses USING btree (zip_code);


--
-- Name: idx_annotation_assignments_annotation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_annotation_assignments_annotation_id ON public.annotation_assignments USING btree (annotation_id);


--
-- Name: idx_annotation_assignments_block_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_annotation_assignments_block_instance_id ON public.annotation_assignments USING btree (block_instance_id);


--
-- Name: idx_annotation_assignments_user_type_block_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_annotation_assignments_user_type_block_instance_id ON public.annotation_assignments USING btree (user_type_block_instance_id);


--
-- Name: idx_annotation_instance_content_annotation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_annotation_instance_content_annotation_id ON public.annotation_instance_content USING btree (annotation_instance_id);


--
-- Name: idx_annotation_instances_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_annotation_instances_type ON public.annotation_instances USING btree (type);


--
-- Name: idx_annotation_instances_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_annotation_instances_user_type ON public.annotation_instances USING btree (user_type);


--
-- Name: idx_annotation_shapes_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_annotation_shapes_name_unique ON public.annotation_shapes USING btree (name);


--
-- Name: idx_appointment_attendees_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_attendees_appointment_id ON public.appointment_attendees USING btree (appointment_id);


--
-- Name: idx_appointment_attendees_invitation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_attendees_invitation_status ON public.appointment_attendees USING btree (invitation_status);


--
-- Name: idx_appointment_attendees_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_attendees_user_id ON public.appointment_attendees USING btree (user_id);


--
-- Name: idx_appointment_attendees_user_type_block_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_attendees_user_type_block_instance_id ON public.appointment_attendees USING btree (user_type_block_instance_id);


--
-- Name: idx_appointment_selection_lines_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_selection_lines_appointment_id ON public.appointment_selection_lines USING btree (appointment_id);


--
-- Name: idx_appointment_selection_lines_block_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_selection_lines_block_instance_id ON public.appointment_selection_lines USING btree (block_instance_id);


--
-- Name: idx_appointment_selection_lines_snapshot_version_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_selection_lines_snapshot_version_id ON public.appointment_selection_lines USING btree (snapshot_version_id);


--
-- Name: idx_appointment_time_slots_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_time_slots_appointment_id ON public.appointment_time_slots USING btree (appointment_id);


--
-- Name: idx_appointments_is_quote_mode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_is_quote_mode ON public.appointments USING btree (is_quote_mode);


--
-- Name: idx_appointments_property_version_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_property_version_id ON public.appointments USING btree (property_version_id);


--
-- Name: idx_appointments_scheduled_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_scheduled_by_id ON public.appointments USING btree (scheduled_by_id);


--
-- Name: idx_appointments_user_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_user_type_id ON public.appointments USING btree (user_type_id);


--
-- Name: idx_block_instance_versions_block_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_block_instance_versions_block_instance_id ON public.block_instance_versions USING btree (block_instance_id);


--
-- Name: idx_block_instance_versions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_block_instance_versions_created_at ON public.block_instance_versions USING btree (created_at);


--
-- Name: idx_block_instances_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_block_instances_active ON public.block_instances USING btree (active);


--
-- Name: idx_block_types_poolable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_block_types_poolable ON public.block_shapes USING btree (composable);


--
-- Name: idx_business_rules_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_rules_active ON public.business_rules USING btree (active);


--
-- Name: idx_business_rules_block_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_rules_block_instance_id ON public.business_rules USING btree (block_instance_id);


--
-- Name: idx_business_rules_rule_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_rules_rule_type ON public.business_rules USING btree (rule_type);


--
-- Name: idx_constraint_overrides_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_constraint_overrides_appointment_id ON public.constraint_overrides USING btree (appointment_id);


--
-- Name: idx_event_assignments_child_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_assignments_child_id ON public.event_assignments USING btree (child_id);


--
-- Name: idx_event_assignments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_assignments_parent_id ON public.event_assignments USING btree (parent_id);


--
-- Name: idx_event_shape_attendees_event_shape_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_shape_attendees_event_shape_id ON public.event_shape_attendees USING btree (event_shape_id);


--
-- Name: idx_event_shape_attendees_user_type_block_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_shape_attendees_user_type_block_instance_id ON public.event_shape_attendees USING btree (user_type_block_instance_id);


--
-- Name: idx_event_shapes_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_event_shapes_name_unique ON public.event_shapes USING btree (name);


--
-- Name: idx_fee_entries_block_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fee_entries_block_instance ON public.appointment_fee_entries USING btree (block_instance_id);


--
-- Name: idx_fee_entries_block_shape_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fee_entries_block_shape_ref ON public.appointment_fee_entries USING btree (block_shape_ref);


--
-- Name: idx_fee_entries_summary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fee_entries_summary ON public.appointment_fee_entries USING btree (fee_summary_id);


--
-- Name: idx_fee_summaries_appointment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fee_summaries_appointment ON public.appointment_fee_summaries USING btree (appointment_id);


--
-- Name: idx_fee_summaries_total_fee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fee_summaries_total_fee ON public.appointment_fee_summaries USING btree (total_fee);


--
-- Name: idx_part_instance_versions_block_instance_version_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_part_instance_versions_block_instance_version_id ON public.part_instance_versions USING btree (block_instance_version_id);


--
-- Name: idx_part_instance_versions_part_instance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_part_instance_versions_part_instance_id ON public.part_instance_versions USING btree (part_instance_id);


--
-- Name: idx_part_instances_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_part_instances_active ON public.part_instances USING btree (active);


--
-- Name: idx_property_details_mls_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_details_mls_number ON public.property_details USING btree (mls_number);


--
-- Name: idx_property_details_property_version_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_details_property_version_id ON public.property_details USING btree (property_version_id);


--
-- Name: idx_property_details_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_details_source ON public.property_details USING btree (source);


--
-- Name: idx_property_feature_mappings_data_source_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_feature_mappings_data_source_active ON public.property_feature_mappings USING btree (data_source, active);


--
-- Name: idx_property_field_mappings_data_source_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_field_mappings_data_source_active ON public.property_field_mappings USING btree (data_source, active);


--
-- Name: idx_property_versions_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_versions_address_id ON public.property_versions USING btree (address_id);


--
-- Name: idx_users_user_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_user_role ON public.users USING btree (user_role);


--
-- Name: idx_valid_annotations_child_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valid_annotations_child_id ON public.valid_annotations USING btree (child_id);


--
-- Name: idx_valid_annotations_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valid_annotations_parent_id ON public.valid_annotations USING btree (parent_id);


--
-- Name: idx_valid_events_child_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valid_events_child_id ON public.valid_events USING btree (child_id);


--
-- Name: idx_valid_events_parent_child_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_valid_events_parent_child_unique ON public.valid_events USING btree (parent_id, child_id);


--
-- Name: idx_valid_events_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valid_events_parent_id ON public.valid_events USING btree (parent_id);


--
-- Name: idx_valid_independent_components_child; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valid_independent_components_child ON public.dependent_instances USING btree (child_id);


--
-- Name: idx_valid_independent_components_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valid_independent_components_parent ON public.dependent_instances USING btree (parent_id);


--
-- Name: part_instance_versions_block_instance_version_id_part_instance_; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX part_instance_versions_block_instance_version_id_part_instance_ ON public.part_instance_versions USING btree (block_instance_version_id, part_instance_id);


--
-- Name: part_profiles_order_index_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX part_profiles_order_index_idx ON public.part_instances USING btree (order_index);


--
-- Name: part_profiles_part_type_ref_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX part_profiles_part_type_ref_idx ON public.part_instances USING btree (part_shape_ref);


--
-- Name: part_types_order_index_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX part_types_order_index_idx ON public.part_shapes USING btree (order_index);


--
-- Name: pricing_cascades_child_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pricing_cascades_child_id_idx ON public.pricing_cascades USING btree (child_id);


--
-- Name: pricing_cascades_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pricing_cascades_parent_id_idx ON public.pricing_cascades USING btree (parent_id);


--
-- Name: property_version_types_block_instance_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_version_types_block_instance_id_idx ON public.property_version_types USING btree (block_instance_id);


--
-- Name: property_version_types_property_version_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_version_types_property_version_id_idx ON public.property_version_types USING btree (property_version_id);


--
-- Name: unique_active_component_parent_child; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_active_component_parent_child ON public.instance_components USING btree (parent_id, child_id);


--
-- Name: unique_valid_independent_component_parent_child; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_valid_independent_component_parent_child ON public.dependent_instances USING btree (parent_id, child_id);


--
-- Name: uq_annotation_instance_content_generic; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_annotation_instance_content_generic ON public.annotation_instance_content USING btree (annotation_instance_id) WHERE (user_type_block_instance_id IS NULL);


--
-- Name: uq_annotation_instance_content_typed; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_annotation_instance_content_typed ON public.annotation_instance_content USING btree (annotation_instance_id, user_type_block_instance_id) WHERE (user_type_block_instance_id IS NOT NULL);


--
-- Name: valid_annotations_parent_id_child_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX valid_annotations_parent_id_child_id_unique ON public.valid_annotations USING btree (parent_id, child_id);


--
-- Name: valid_blocks_child_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX valid_blocks_child_id_idx ON public.valid_cascades USING btree (child_id);


--
-- Name: valid_blocks_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX valid_blocks_parent_id_idx ON public.valid_cascades USING btree (parent_id);


--
-- Name: valid_parts_child_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX valid_parts_child_id_idx ON public.valid_parts USING btree (child_id);


--
-- Name: valid_parts_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX valid_parts_parent_id_idx ON public.valid_parts USING btree (parent_id);


--
-- Name: valid_pricing_cascades_child_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX valid_pricing_cascades_child_id_idx ON public.valid_pricing_cascades USING btree (child_id);


--
-- Name: valid_pricing_cascades_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX valid_pricing_cascades_parent_id_idx ON public.valid_pricing_cascades USING btree (parent_id);


--
-- Name: valid_cascades trg_cleanup_booking_cascades; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cleanup_booking_cascades AFTER DELETE ON public.valid_cascades FOR EACH ROW EXECUTE FUNCTION public.cleanup_booking_cascades_on_valid_cascade_delete();


--
-- Name: valid_parts trg_cleanup_part_assignments; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cleanup_part_assignments AFTER DELETE ON public.valid_parts FOR EACH ROW EXECUTE FUNCTION public.cleanup_part_assignments_on_valid_part_delete();


--
-- Name: property_version_types trg_validate_property_version_type; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_property_version_type BEFORE INSERT OR UPDATE ON public.property_version_types FOR EACH ROW EXECUTE FUNCTION public.validate_property_version_type();


--
-- Name: dependent_instances additional_service_options_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dependent_instances
    ADD CONSTRAINT additional_service_options_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dependent_instances additional_service_options_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dependent_instances
    ADD CONSTRAINT additional_service_options_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: admin_metadata admin_metadata_block_shape_ref_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_metadata
    ADD CONSTRAINT admin_metadata_block_shape_ref_fkey FOREIGN KEY (block_shape_ref) REFERENCES public.block_shapes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: admin_metadata_select_options admin_metadata_select_options_admin_metadata_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_metadata_select_options
    ADD CONSTRAINT admin_metadata_select_options_admin_metadata_id_fkey FOREIGN KEY (admin_metadata_id) REFERENCES public.admin_metadata(id) ON DELETE CASCADE;


--
-- Name: annotation_assignments annotation_assignments_annotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_assignments
    ADD CONSTRAINT annotation_assignments_annotation_id_fkey FOREIGN KEY (annotation_id) REFERENCES public.annotation_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: annotation_assignments annotation_assignments_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_assignments
    ADD CONSTRAINT annotation_assignments_block_instance_id_fkey FOREIGN KEY (block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: annotation_assignments annotation_assignments_user_type_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_assignments
    ADD CONSTRAINT annotation_assignments_user_type_block_instance_id_fkey FOREIGN KEY (user_type_block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: annotation_instance_content annotation_instance_content_annotation_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_instance_content
    ADD CONSTRAINT annotation_instance_content_annotation_instance_id_fkey FOREIGN KEY (annotation_instance_id) REFERENCES public.annotation_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: annotation_instance_content annotation_instance_content_user_type_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_instance_content
    ADD CONSTRAINT annotation_instance_content_user_type_block_instance_id_fkey FOREIGN KEY (user_type_block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: annotation_instances annotation_instances_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.annotation_instances
    ADD CONSTRAINT annotation_instances_type_fkey FOREIGN KEY (type) REFERENCES public.annotation_shapes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointment_attendees appointment_attendees_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_attendees
    ADD CONSTRAINT appointment_attendees_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointment_attendees appointment_attendees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_attendees
    ADD CONSTRAINT appointment_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointment_attendees appointment_attendees_user_type_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_attendees
    ADD CONSTRAINT appointment_attendees_user_type_block_instance_id_fkey FOREIGN KEY (user_type_block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointment_fee_entries appointment_fee_entries_fee_summary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_fee_entries
    ADD CONSTRAINT appointment_fee_entries_fee_summary_id_fkey FOREIGN KEY (fee_summary_id) REFERENCES public.appointment_fee_summaries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointment_fee_summaries appointment_fee_summaries_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_fee_summaries
    ADD CONSTRAINT appointment_fee_summaries_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointment_selection_lines appointment_selection_lines_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_selection_lines
    ADD CONSTRAINT appointment_selection_lines_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointment_selection_lines appointment_selection_lines_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_selection_lines
    ADD CONSTRAINT appointment_selection_lines_block_instance_id_fkey FOREIGN KEY (block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointment_selection_lines appointment_selection_lines_snapshot_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_selection_lines
    ADD CONSTRAINT appointment_selection_lines_snapshot_version_id_fkey FOREIGN KEY (snapshot_version_id) REFERENCES public.block_instance_versions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointment_time_slots appointment_time_slots_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_time_slots
    ADD CONSTRAINT appointment_time_slots_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_confirmed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_held_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_held_by_fkey FOREIGN KEY (held_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_property_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_property_version_id_fkey FOREIGN KEY (property_version_id) REFERENCES public.property_versions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_scheduled_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_scheduled_by_id_fkey FOREIGN KEY (scheduled_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appointments appointments_user_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_user_type_id_fkey FOREIGN KEY (user_type_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: availability_buffers availability_buffers_availability_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_buffers
    ADD CONSTRAINT availability_buffers_availability_settings_id_fkey FOREIGN KEY (availability_settings_id) REFERENCES public.availability_settings(id) ON DELETE CASCADE;


--
-- Name: availability_business_hours availability_business_hours_availability_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_business_hours
    ADD CONSTRAINT availability_business_hours_availability_settings_id_fkey FOREIGN KEY (availability_settings_id) REFERENCES public.availability_settings(id) ON DELETE CASCADE;


--
-- Name: availability_differential_attendees availability_differential_attende_availability_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_differential_attendees
    ADD CONSTRAINT availability_differential_attende_availability_settings_id_fkey FOREIGN KEY (availability_settings_id) REFERENCES public.availability_settings(id) ON DELETE CASCADE;


--
-- Name: availability_max_income availability_max_income_availability_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_max_income
    ADD CONSTRAINT availability_max_income_availability_settings_id_fkey FOREIGN KEY (availability_settings_id) REFERENCES public.availability_settings(id) ON DELETE CASCADE;


--
-- Name: availability_max_work_hours availability_max_work_hours_availability_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_max_work_hours
    ADD CONSTRAINT availability_max_work_hours_availability_settings_id_fkey FOREIGN KEY (availability_settings_id) REFERENCES public.availability_settings(id) ON DELETE CASCADE;


--
-- Name: availability_range_constraint_hours availability_range_constraint_hours_range_constraint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_range_constraint_hours
    ADD CONSTRAINT availability_range_constraint_hours_range_constraint_id_fkey FOREIGN KEY (range_constraint_id) REFERENCES public.availability_range_constraints(id) ON DELETE CASCADE;


--
-- Name: availability_range_constraints availability_range_constraints_availability_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_range_constraints
    ADD CONSTRAINT availability_range_constraints_availability_settings_id_fkey FOREIGN KEY (availability_settings_id) REFERENCES public.availability_settings(id) ON DELETE CASCADE;


--
-- Name: beta_feedback_tags beta_feedback_tags_feedback_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback_tags
    ADD CONSTRAINT beta_feedback_tags_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.beta_feedback(id) ON DELETE CASCADE;


--
-- Name: block_instances block_instances_block_shape_ref_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.block_instances
    ADD CONSTRAINT block_instances_block_shape_ref_fkey FOREIGN KEY (block_shape_ref) REFERENCES public.block_shapes(id) ON DELETE RESTRICT;


--
-- Name: booking_cascades booking_cascades_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_cascades
    ADD CONSTRAINT booking_cascades_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: booking_cascades booking_cascades_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_cascades
    ADD CONSTRAINT booking_cascades_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_rules business_rules_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_rules
    ADD CONSTRAINT business_rules_block_instance_id_fkey FOREIGN KEY (block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_rules business_rules_validation_message_annotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_rules
    ADD CONSTRAINT business_rules_validation_message_annotation_id_fkey FOREIGN KEY (validation_message_annotation_id) REFERENCES public.annotation_instances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: calendar_setting_calendars calendar_setting_calendars_calendar_settings_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_setting_calendars
    ADD CONSTRAINT calendar_setting_calendars_calendar_settings_id_fkey FOREIGN KEY (calendar_settings_id) REFERENCES public.calendar_settings(id) ON DELETE CASCADE;


--
-- Name: constraint_overrides constraint_overrides_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.constraint_overrides
    ADD CONSTRAINT constraint_overrides_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: constraint_overrides constraint_overrides_authorized_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.constraint_overrides
    ADD CONSTRAINT constraint_overrides_authorized_by_id_fkey FOREIGN KEY (authorized_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: event_assignments event_assignments_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_assignments
    ADD CONSTRAINT event_assignments_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.event_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_instances event_instances_event_shape_ref_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_instances
    ADD CONSTRAINT event_instances_event_shape_ref_fkey FOREIGN KEY (event_shape_ref) REFERENCES public.event_shapes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: event_shape_attendees event_shape_attendees_event_shape_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shape_attendees
    ADD CONSTRAINT event_shape_attendees_event_shape_id_fkey FOREIGN KEY (event_shape_id) REFERENCES public.event_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_shape_attendees event_shape_attendees_user_type_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_shape_attendees
    ADD CONSTRAINT event_shape_attendees_user_type_block_instance_id_fkey FOREIGN KEY (user_type_block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: instance_components instance_components_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_components
    ADD CONSTRAINT instance_components_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: instance_components instance_components_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_components
    ADD CONSTRAINT instance_components_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: part_assignments part_assignments_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_assignments
    ADD CONSTRAINT part_assignments_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.part_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: part_assignments part_assignments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_assignments
    ADD CONSTRAINT part_assignments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: part_instance_versions part_instance_versions_block_instance_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_instance_versions
    ADD CONSTRAINT part_instance_versions_block_instance_version_id_fkey FOREIGN KEY (block_instance_version_id) REFERENCES public.block_instance_versions(id) ON DELETE CASCADE;


--
-- Name: part_instances part_instances_part_shape_ref_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_instances
    ADD CONSTRAINT part_instances_part_shape_ref_fkey FOREIGN KEY (part_shape_ref) REFERENCES public.part_shapes(id) ON DELETE RESTRICT;


--
-- Name: pricing_cascades pricing_cascades_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_cascades
    ADD CONSTRAINT pricing_cascades_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.part_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pricing_cascades pricing_cascades_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_cascades
    ADD CONSTRAINT pricing_cascades_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.part_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: property_details property_details_property_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_details_property_version_id_fkey FOREIGN KEY (property_version_id) REFERENCES public.property_versions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: property_feature_mappings property_feature_mappings_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_feature_mappings
    ADD CONSTRAINT property_feature_mappings_block_instance_id_fkey FOREIGN KEY (block_instance_id) REFERENCES public.block_instances(id) ON DELETE CASCADE;


--
-- Name: property_version_types property_version_types_block_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_version_types
    ADD CONSTRAINT property_version_types_block_instance_id_fkey FOREIGN KEY (block_instance_id) REFERENCES public.block_instances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: property_version_types property_version_types_property_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_version_types
    ADD CONSTRAINT property_version_types_property_version_id_fkey FOREIGN KEY (property_version_id) REFERENCES public.property_versions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: property_versions property_versions_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_versions
    ADD CONSTRAINT property_versions_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: valid_annotations valid_annotations_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_annotations
    ADD CONSTRAINT valid_annotations_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.annotation_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valid_annotations valid_annotations_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_annotations
    ADD CONSTRAINT valid_annotations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valid_cascades valid_cascades_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_cascades
    ADD CONSTRAINT valid_cascades_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.block_shapes(id) ON DELETE CASCADE;


--
-- Name: valid_cascades valid_cascades_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_cascades
    ADD CONSTRAINT valid_cascades_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_shapes(id) ON DELETE CASCADE;


--
-- Name: valid_events valid_events_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_events
    ADD CONSTRAINT valid_events_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.event_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valid_events valid_events_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_events
    ADD CONSTRAINT valid_events_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valid_parts valid_parts_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_parts
    ADD CONSTRAINT valid_parts_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.part_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valid_parts valid_parts_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_parts
    ADD CONSTRAINT valid_parts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.block_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valid_pricing_cascades valid_pricing_cascades_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_pricing_cascades
    ADD CONSTRAINT valid_pricing_cascades_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.part_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valid_pricing_cascades valid_pricing_cascades_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valid_pricing_cascades
    ADD CONSTRAINT valid_pricing_cascades_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.part_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



