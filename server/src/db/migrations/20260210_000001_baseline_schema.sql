--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
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
    'option'
);


--
-- Name: booking_mode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_mode_enum AS ENUM (
    'standalone',
    'addOn',
    'both'
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
-- Name: COLUMN addresses.address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.addresses.address IS 'Street address';


--
-- Name: COLUMN addresses.unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.addresses.unit IS 'Unit/apartment number';


--
-- Name: COLUMN addresses.place_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.addresses.place_id IS 'Google Place ID for accurate location identification';


--
-- Name: COLUMN addresses.latitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.addresses.latitude IS 'Latitude coordinate from Google Places API';


--
-- Name: COLUMN addresses.longitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.addresses.longitude IS 'Longitude coordinate from Google Places API';


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
    input_config jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    block_shape_ref uuid
);


--
-- Name: COLUMN admin_metadata.metadata_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.metadata_type IS 'Discriminator: primitive or relationship metadata';


--
-- Name: COLUMN admin_metadata.entity_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.entity_type IS 'Entity type for this metadata entry (NULL for non-entities)';


--
-- Name: COLUMN admin_metadata.entity_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.entity_id IS 'Entity ID or sentinel UUID for global configs (NULL for non-entities)';


--
-- Name: COLUMN admin_metadata.field_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.field_key IS 'Field name/key (unified - replaces both field_key and relationship_key)';


--
-- Name: COLUMN admin_metadata.data_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.data_type IS 'Field data type';


--
-- Name: COLUMN admin_metadata.label; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.label IS 'Human-readable label';


--
-- Name: COLUMN admin_metadata.is_required; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.is_required IS 'Whether field is required';


--
-- Name: COLUMN admin_metadata.visibility; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.visibility IS 'Field visibility setting';


--
-- Name: COLUMN admin_metadata.layout; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.layout IS 'Layout within section';


--
-- Name: COLUMN admin_metadata.display_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.display_order IS 'Display order (lower = first). 999 = not configured.';


--
-- Name: COLUMN admin_metadata.render_as; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.render_as IS 'How to render the field';


--
-- Name: COLUMN admin_metadata.status_button_color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.status_button_color IS 'Color for statusButton rendering (Vuetify color name)';


--
-- Name: COLUMN admin_metadata.panel; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.panel IS 'Panel name for expandedPanel visibility';


--
-- Name: COLUMN admin_metadata.bulk_edit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.bulk_edit IS 'Whether field can be bulk edited';


--
-- Name: COLUMN admin_metadata.input_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.input_config IS 'Input configuration for select/multiselect/reference/partsCollection fields';


--
-- Name: COLUMN admin_metadata.block_shape_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.admin_metadata.block_shape_ref IS 'BlockShape ID for BlockShape-specific instance metadata (NULL = global config)';


--
-- Name: annotation_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annotation_assignments (
    id uuid NOT NULL,
    block_instance_id uuid NOT NULL,
    annotation_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_type_block_instance_id uuid
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
-- Name: COLUMN annotation_instances.user_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.annotation_instances.user_type IS 'User type filter: buyer, agent, owner, or null for generic descriptions';


--
-- Name: COLUMN annotation_instances.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.annotation_instances.order_index IS 'Order index for UI drag-and-drop ordering';


--
-- Name: COLUMN annotation_instances.active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.annotation_instances.active IS 'Whether this annotation instance is active/enabled';


--
-- Name: annotation_shapes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.annotation_shapes (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: COLUMN annotation_shapes.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.annotation_shapes.name IS 'Annotation type name (e.g., frontPage, description, tooltip)';


--
-- Name: COLUMN annotation_shapes.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.annotation_shapes.order_index IS 'Order index for UI drag-and-drop ordering';


--
-- Name: COLUMN annotation_shapes.active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.annotation_shapes.active IS 'Whether this annotation shape is active/enabled';


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
-- Name: COLUMN appointment_attendees.appointment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_attendees.appointment_id IS 'Foreign key to appointments table';


--
-- Name: COLUMN appointment_attendees.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_attendees.user_id IS 'Foreign key to users table (actual person with email)';


--
-- Name: COLUMN appointment_attendees.user_type_block_instance_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_attendees.user_type_block_instance_id IS 'Foreign key to block_instances table (UserTypeBlock - their role: Buyer, Agent, etc.)';


--
-- Name: COLUMN appointment_attendees.should_receive_invitation; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_attendees.should_receive_invitation IS 'Whether this attendee should receive calendar invitation';


--
-- Name: COLUMN appointment_attendees.invitation_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_attendees.invitation_status IS 'Status of calendar invitation for this attendee';


--
-- Name: COLUMN appointment_attendees.google_event_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_attendees.google_event_id IS 'Google Calendar event ID for tracking invitation status';


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid NOT NULL,
    user_type_id uuid,
    selected_option_ids jsonb,
    selected_date date,
    selected_date_range_end date,
    selected_time_slots jsonb,
    is_quote_mode boolean DEFAULT false NOT NULL,
    quote_pdf_url character varying(255),
    property_details jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    property_version_id uuid NOT NULL,
    selected_service_ids jsonb,
    selected_property_ids jsonb,
    status public.appointment_status_enum DEFAULT 'started'::public.appointment_status_enum NOT NULL,
    scheduled_by_id uuid,
    service_quantities jsonb,
    property_quantities jsonb,
    option_quantities jsonb,
    service_snapshots jsonb,
    property_snapshots jsonb,
    option_snapshots jsonb,
    service_snapshot_ids uuid[],
    property_snapshot_ids uuid[],
    option_snapshot_ids uuid[]
);


--
-- Name: COLUMN appointments.selected_option_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.selected_option_ids IS 'Array of block instance IDs for availability options';


--
-- Name: COLUMN appointments.selected_time_slots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.selected_time_slots IS 'Array of time slot data objects';


--
-- Name: COLUMN appointments.property_details; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.property_details IS 'Object with square footage, bedrooms, etc.';


--
-- Name: COLUMN appointments.selected_service_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.selected_service_ids IS 'Array of block instance IDs for selected services (replaces base_service_id)';


--
-- Name: COLUMN appointments.selected_property_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.selected_property_ids IS 'Array of block instance IDs for selected dwelling adjustments (replaces dwelling_adjustment_id)';


--
-- Name: COLUMN appointments.service_quantities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.service_quantities IS 'Quantity multipliers for selected services (item_id -> quantity mapping)';


--
-- Name: COLUMN appointments.property_quantities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.property_quantities IS 'Quantity multipliers for selected dwelling adjustments (item_id -> quantity mapping)';


--
-- Name: COLUMN appointments.option_quantities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.option_quantities IS 'Quantity multipliers for selected availability options (item_id -> quantity mapping)';


--
-- Name: COLUMN appointments.service_snapshots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.service_snapshots IS 'Snapshots of selected services at booking time (preserves pricing/names)';


--
-- Name: COLUMN appointments.property_snapshots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.property_snapshots IS 'Snapshots of selected dwelling adjustments at booking time (preserves pricing/names)';


--
-- Name: COLUMN appointments.option_snapshots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.option_snapshots IS 'Snapshots of selected availability options at booking time (preserves pricing/names)';


--
-- Name: COLUMN appointments.service_snapshot_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.service_snapshot_ids IS 'Array of block_instance_version IDs for selected services';


--
-- Name: COLUMN appointments.property_snapshot_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.property_snapshot_ids IS 'Array of block_instance_version IDs for selected property type blocks';


--
-- Name: COLUMN appointments.option_snapshot_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.option_snapshot_ids IS 'Array of block_instance_version IDs for selected availability options';


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
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: COLUMN block_instance_versions.block_instance_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.block_instance_versions.block_instance_id IS 'References block_instances(id) but no FK constraint to allow instance deletion while preserving history';


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
    base_sq_ft integer,
    particle_required boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    composite boolean DEFAULT false NOT NULL,
    differential public.ternary_boolean DEFAULT 'false'::public.ternary_boolean NOT NULL,
    allow_multiple boolean DEFAULT false NOT NULL,
    requires_unit_number boolean,
    available_days jsonb,
    booking_mode public.booking_mode_enum DEFAULT 'standalone'::public.booking_mode_enum NOT NULL,
    is_multi_family boolean DEFAULT false NOT NULL,
    requires_agent boolean DEFAULT false NOT NULL
);


--
-- Name: COLUMN block_instances.allow_multiple; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.block_instances.allow_multiple IS 'Whether this block instance can be multiplied by ADU count or number';


--
-- Name: COLUMN block_instances.requires_unit_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.block_instances.requires_unit_number IS 'If true, this block instance requires a unit number (e.g., condo/co-op). Nullable by design.';


--
-- Name: COLUMN block_instances.available_days; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.block_instances.available_days IS 'Array of day indices (0-6) when this service is available. Null means all days.';


--
-- Name: COLUMN block_instances.is_multi_family; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.block_instances.is_multi_family IS 'Property type is multi-family (requires numberOfUnits field)';


--
-- Name: COLUMN block_instances.requires_agent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.block_instances.requires_agent IS 'Service requires agent/client contact information';


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
-- Name: COLUMN block_shapes.is_state_control; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.block_shapes.is_state_control IS 'If true, block instances of this shape act as state selectors in the wizard (like User Types). Mutually exclusive with can_have_parts.';


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
-- Name: COLUMN business_rules.block_instance_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules.block_instance_id IS 'Block instance this rule applies to (service, dwelling adjustment, etc.)';


--
-- Name: COLUMN business_rules.rule_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules.rule_type IS 'Rule type: required_fields, requires_agent, conditional_validation, validation_message';


--
-- Name: COLUMN business_rules.rule_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules.rule_config IS 'JSONB configuration for the rule (schema depends on rule_type)';


--
-- Name: COLUMN business_rules.validation_message_annotation_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules.validation_message_annotation_id IS 'Optional link to annotation instance for validation message';


--
-- Name: COLUMN business_rules.active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_rules.active IS 'Whether this business rule is active/enabled';


--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying(255) NOT NULL,
    setting_value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: COLUMN business_settings.setting_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.setting_key IS 'Unique key identifying the setting (e.g., "availability_settings")';


--
-- Name: COLUMN business_settings.setting_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_settings.setting_value IS 'JSONB object containing the setting configuration';


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
-- Name: COLUMN entity_layout_config.entity_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.entity_id IS 'Foreign key to block_shapes.id or part_shapes.id';


--
-- Name: COLUMN entity_layout_config.entity_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.entity_type IS 'Shape type: block for BlockShape, part for PartShape';


--
-- Name: COLUMN entity_layout_config.field_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.field_key IS 'Field name/key (must exist in shape_field_metadata)';


--
-- Name: COLUMN entity_layout_config.visibility; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.visibility IS 'Field visibility setting';


--
-- Name: COLUMN entity_layout_config.layout; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.layout IS 'Layout within section';


--
-- Name: COLUMN entity_layout_config."order"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config."order" IS 'Display order (overrides canonical display_order)';


--
-- Name: COLUMN entity_layout_config.section; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.section IS 'Section/group name for organization';


--
-- Name: COLUMN entity_layout_config.render_as; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.render_as IS 'How to render the field';


--
-- Name: COLUMN entity_layout_config.status_button_color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.status_button_color IS 'Color for statusButton rendering (Vuetify color name)';


--
-- Name: COLUMN entity_layout_config.panel; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.panel IS 'Panel name for expandedPanel visibility';


--
-- Name: COLUMN entity_layout_config.bulk_edit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.entity_layout_config.bulk_edit IS 'Whether field can be bulk edited';


--
-- Name: event_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_assignments (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    parent_id uuid NOT NULL,
    parent_kind public.enum_event_assignments_parent_kind NOT NULL,
    child_id uuid NOT NULL
);


--
-- Name: COLUMN event_assignments.parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_assignments.parent_id IS 'Foreign key to parent instance (partInstance or blockInstance)';


--
-- Name: COLUMN event_assignments.child_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_assignments.child_id IS 'Foreign key to event_instances table';


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
    active boolean DEFAULT true NOT NULL
);


--
-- Name: COLUMN event_instances.event_shape_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_instances.event_shape_ref IS 'Foreign key to event_shapes table';


--
-- Name: COLUMN event_instances.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_instances.name IS 'Event instance name/template name';


--
-- Name: COLUMN event_instances.title_template; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_instances.title_template IS 'Template for event title (e.g., "{service} on {propertyType}")';


--
-- Name: COLUMN event_instances.description_template; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_instances.description_template IS 'Template for event description (e.g., "{clientName} - {propertyAddress}")';


--
-- Name: COLUMN event_instances.location_template; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_instances.location_template IS 'Template for event location (e.g., "{propertyAddress}")';


--
-- Name: COLUMN event_instances.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_instances.order_index IS 'Order index for UI drag-and-drop ordering';


--
-- Name: COLUMN event_instances.active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_instances.active IS 'Whether this event instance is active/enabled';


--
-- Name: event_shape_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_shape_attendees (
    id uuid NOT NULL,
    event_shape_id uuid NOT NULL,
    user_type_block_instance_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: COLUMN event_shape_attendees.event_shape_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_shape_attendees.event_shape_id IS 'Foreign key to event_shapes table';


--
-- Name: COLUMN event_shape_attendees.user_type_block_instance_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_shape_attendees.user_type_block_instance_id IS 'Foreign key to block_instances table (UserTypeBlock representing attendee type)';


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
    CONSTRAINT check_ternary_default_valid CHECK (((ternary_default IS NULL) OR ((ternary_default)::text = ANY ((ARRAY['true'::character varying, 'false'::character varying, 'override'::character varying])::text[]))))
);


--
-- Name: COLUMN event_shapes.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_shapes.name IS 'Event shape name (e.g., OnSite, Moveable, ClientPresent)';


--
-- Name: COLUMN event_shapes.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_shapes.order_index IS 'Order index for UI drag-and-drop ordering';


--
-- Name: COLUMN event_shapes.active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_shapes.active IS 'Whether this event shape is active/enabled';


--
-- Name: COLUMN event_shapes.is_ternary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_shapes.is_ternary IS 'Indicates if this event shape uses ternary logic (true/false/override)';


--
-- Name: COLUMN event_shapes.ternary_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_shapes.ternary_default IS 'Default ternary value to use when value cannot be determined (null means fail gracefully). Valid values: "true", "false", "override", or NULL';


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
-- Name: COLUMN instance_components.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.instance_components.order_index IS 'Order in which components should be displayed';


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
-- Name: COLUMN property_details.property_version_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.property_details.property_version_id IS 'Foreign key to property_versions table';


--
-- Name: COLUMN property_details.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.property_details.source IS 'Source of data: api (MLS API), manual (admin input), client (booking wizard)';


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
-- Name: COLUMN property_version_types.order_index; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.property_version_types.order_index IS 'Order in which property types should be displayed';


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
-- Name: COLUMN property_versions.address_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.property_versions.address_id IS 'Foreign key to addresses table';


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
-- Name: COLUMN valid_annotations.parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.valid_annotations.parent_id IS 'Foreign key to block_shapes table';


--
-- Name: COLUMN valid_annotations.child_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.valid_annotations.child_id IS 'Foreign key to annotation_shapes table';


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
-- Name: COLUMN valid_events.parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.valid_events.parent_id IS 'Foreign key to part_shapes table';


--
-- Name: COLUMN valid_events.child_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.valid_events.child_id IS 'Foreign key to event_shapes table';


--
-- Name: COLUMN valid_events.disabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.valid_events.disabled IS 'Whether this relationship is disabled';


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
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


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
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_setting_key_key UNIQUE (setting_key);


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
-- Name: property_details property_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_details_pkey PRIMARY KEY (id);


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
-- Name: idx_appointments_selected_dwelling_adjustment_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_selected_dwelling_adjustment_ids ON public.appointments USING gin (selected_property_ids);


--
-- Name: idx_appointments_selected_service_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_selected_service_ids ON public.appointments USING gin (selected_service_ids);


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
-- Name: idx_business_settings_setting_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_business_settings_setting_key ON public.business_settings USING btree (setting_key);


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
-- Name: property_details property_details_property_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_details_property_version_id_fkey FOREIGN KEY (property_version_id) REFERENCES public.property_versions(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
    ADD CONSTRAINT valid_events_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.part_shapes(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- PostgreSQL database dump complete
--

