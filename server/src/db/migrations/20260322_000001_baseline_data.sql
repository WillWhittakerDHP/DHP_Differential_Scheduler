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
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.addresses (id, address, unit, city, state, zip_code, created_at, updated_at, place_id, latitude, longitude) FROM stdin;
87e1435a-9ac6-494e-a069-6540fa0ce8cc	3439 Woodburn Rd	\N	Annandale	VA	22003	2026-01-03 16:37:37.769-05	2026-01-03 16:37:37.769-05	ChIJ3SVd0o1MtokRPQRhy5Ivvew	38.85045730	-77.23169310
b3613851-4727-426c-ae39-a2551437443a	730 24th St NW 803	\N	Washington	DC	20037	2026-01-03 16:37:37.78-05	2026-01-03 16:37:37.78-05	Ei43MzAgMjR0aCBTdCBOVyAjODAzLCBXYXNoaW5ndG9uLCBEQyAyMDAzNywgVVNBIh8aHQoWChQKEglXcdATsre3iREI_IAd7zCcYhIDODAz	38.89893360	-77.05172410
3f92f8dc-0991-4196-85e3-8ec657a2ce73	4921 Chevy Chase Blvd	\N	Chevy Chase	MD		2026-01-03 16:37:37.797-05	2026-01-03 16:37:37.797-05	ChIJ73O8A4LJt4kRMq3d-ZVkTBs	38.97424580	-77.09649010
9b2df3f0-a4dc-430a-aecf-7409ddb95d4c	2815 Laurel Ave	\N	Hyattsville	MD	20785	2026-01-03 16:37:37.804-05	2026-01-03 16:37:37.804-05	ChIJgUjTHbHAt4kRAe5jMDEMg-s	38.92631450	-76.90974160
be6ff537-cfea-4772-919b-ea74aa3b7150	1013 17th Pl NE 6	\N	Washington	DC	20002	2026-01-03 16:37:37.811-05	2026-01-03 16:37:37.811-05	Ei0xMDEzIDE3dGggUGwgTkUgIzYsIFdhc2hpbmd0b24sIERDIDIwMDAyLCBVU0EiHRobChYKFAoSCc8U0g1puLeJER3PafJ4e5VZEgE2	38.90300760	-76.97984920
ed180e43-41f6-47b9-b9ac-47ad35d6a874	3925 Fulton St NW 4	\N	Washington	DC	20007	2026-01-03 16:37:37.815-05	2026-01-03 16:37:37.815-05	Ei8zOTI1IEZ1bHRvbiBTdCBOVyAjNCwgV2FzaGluZ3RvbiwgREMgMjAwMDcsIFVTQSIdGhsKFgoUChIJ6dgLHiK2t4kRMOYTuLCskzkSATQ	38.92639220	-77.07834770
1f88ca40-1fbc-4a78-b3bd-765fb4b40bae	601 Sugarland Run Dr	\N	Sterling	VA	20164	2026-01-03 16:37:37.817-05	2026-01-03 16:37:37.817-05	ChIJWRsE1FE3tokRjn1L9cgsT7Y	39.03837470	-77.36723290
238965d2-1ed0-404b-85f4-5eee106cb1a7	3601 Connecticut Ave NW	\N	Washington	DC	20008	2026-01-03 16:37:37.822-05	2026-01-03 16:37:37.822-05	ChIJAYhq7tLJt4kRItJ7WcbXaUM	38.93787470	-77.05853620
48fe339a-e141-4490-8a4a-85018ac1d340	1304 F St NE 2	\N	Washington	DC	20002	2026-01-03 16:37:37.826-05	2026-01-03 16:37:37.826-05	EioxMzA0IEYgU3QgTkUgIzIsIFdhc2hpbmd0b24sIERDIDIwMDAyLCBVU0EiHRobChYKFAoSCW3nbmU_uLeJEWBqIZMQEMpJEgEy	38.89755430	-76.98800020
0ab7580c-b685-4866-b039-dabccf0149d6	2325 42nd St NW 412	\N	Washington	DC	20007	2026-01-03 16:37:37.831-05	2026-01-03 16:37:37.831-05	Ei8yMzI1IDQybmQgU3QgTlcgIzQxMiwgV2FzaGluZ3RvbiwgREMgMjAwMDcsIFVTQSIfGh0KFgoUChIJSUBCLxi2t4kRjdfTw0UmNSsSAzQxMg	38.92207230	-77.08166690
e1a6084c-6070-4a67-af0a-97aa7700bbde	1867 Park Rd NW 3	\N	Washington	DC	20010	2026-01-03 16:37:37.836-05	2026-01-03 16:37:37.836-05	Ei0xODY3IFBhcmsgUmQgTlcgIzMsIFdhc2hpbmd0b24sIERDIDIwMDEwLCBVU0EiHRobChYKFAoSCSl6vAomyLeJEbxNO5eQ0QEbEgEz	38.93276400	-77.04354460
e6e6eed5-9e65-46c3-b5c4-4ab0261da11b	1500 17th St NW 1	\N	Washington	DC	20036	2026-01-03 16:37:37.839-05	2026-01-03 16:37:37.839-05	Ei0xNTAwIDE3dGggU3QgTlcgIzEsIFdhc2hpbmd0b24sIERDIDIwMDM2LCBVU0EiHRobChYKFAoSCUsLujrBt7eJEVVZB_TvBM31EgEx	38.90983140	-77.03873570
f09f5136-0d22-47bb-9a3e-53e3eb7b4d59	20751 Heron Landing Dr	\N	Sterling	VA	20166	2026-01-03 16:37:37.842-05	2026-01-03 16:37:37.842-05	ChIJmXs9hm85tokRfhE-V9lOdKY	39.04293830	-77.43792780
35a85294-3528-46d0-bb2b-3d1bde2eb1b2	5210 Saratoga Ave	\N	Chevy Chase	MD	20815	2026-01-03 16:37:37.844-05	2026-01-03 16:37:37.844-05	ChIJ23Qn647Jt4kRT75wsljM8mE	38.96045890	-77.09510950
8aa0866c-ffb2-4717-8a38-66ae679101be	647 G St SE 4	\N	Washington	DC	20003	2026-01-03 16:37:37.846-05	2026-01-03 16:37:37.846-05	Eik2NDcgRyBTdCBTRSAjNCwgV2FzaGluZ3RvbiwgREMgMjAwMDMsIFVTQSIdGhsKFgoUChIJn9nyLc25t4kRkxTiSwvfE_ISATQ	38.88107860	-76.99669170
18e46410-6125-4783-bda8-c3fae01c2e38	2145 California St NW 103	\N	Washington	DC	20008	2026-01-03 16:37:37.85-05	2026-01-03 16:37:37.85-05	EjUyMTQ1IENhbGlmb3JuaWEgU3QgTlcgIzEwMywgV2FzaGluZ3RvbiwgREMgMjAwMDgsIFVTQSIfGh0KFgoUChIJY3ZvSM63t4kRMOvf-WmILSwSAzEwMw	38.91654120	-77.04845210
2048e6c8-f918-4d4a-811d-7c0e01341ec6	1006 Florida Ave NE 402	\N	Washington	DC	20002	2026-01-03 16:37:37.856-05	2026-01-03 16:37:37.856-05	EjMxMDA2IEZsb3JpZGEgQXZlIE5FICM0MDIsIFdhc2hpbmd0b24sIERDIDIwMDAyLCBVU0EiHxodChYKFAoSCRVjFS0UuLeJEb3L_xXNJYc1EgM0MDI	38.90402130	-76.99249550
379f6903-af39-40ec-adcb-c7380074d2da	1002 9th St NE	\N	Washington	DC	20002	2026-01-03 16:37:37.862-05	2026-01-03 16:37:37.862-05	ChIJQSIZbRa4t4kR1cA4QrTWKhk	38.90291350	-76.99397360
424a3cc2-15cf-4b48-9312-9479d827d26c	2506 S Arlington Mill Dr E-5	\N	Arlington	VA	22206	2026-01-03 16:37:37.867-05	2026-01-03 16:37:37.867-05	EjYyNTA2IFMgQXJsaW5ndG9uIE1pbGwgRHIgZSA1LCBBcmxpbmd0b24sIFZBIDIyMjA2LCBVU0EiHxodChYKFAoSCeEejD5RsbeJEcACr_1vvZCREgNlIDU	38.84459670	-77.09549930
790de681-c6d8-4572-ad1d-3f8a857f869f	8319 Carnegie Dr	\N	Vienna	VA	22180	2026-01-03 16:37:37.869-05	2026-01-03 16:37:37.869-05	ChIJEQ26N3JLtokRI9l9Wjmp4V8	38.88301960	-77.23130970
0ccc0f89-79cc-4885-a0b3-c60d2c1540f7	730 24th St NW 406	\N	Washington	DC	20037	2026-01-03 16:37:37.874-05	2026-01-03 16:37:37.874-05	Ei43MzAgMjR0aCBTdCBOVyAjNDA2LCBXYXNoaW5ndG9uLCBEQyAyMDAzNywgVVNBIh8aHQoWChQKEglXcdATsre3iREI_IAd7zCcYhIDNDA2	38.89893360	-77.05172410
a8534a27-be05-4305-a616-ae9bd2424a3b	2001 12th St NW 412	\N	Washington	DC	20009	2026-01-03 16:37:37.879-05	2026-01-03 16:37:37.879-05	Ei8yMDAxIDEydGggU3QgTlcgIzQxMiwgV2FzaGluZ3RvbiwgREMgMjAwMDksIFVTQSIfGh0KFgoUChIJoWaVeOa3t4kR5vB1g6qkmhQSAzQxMg	38.91761770	-77.02787990
6003c3e9-f984-42f4-b93c-4d787fa17a26	4388 Queens Chapel Terrace NE	\N	Washington	DC	20018	2026-01-03 16:37:37.883-05	2026-01-03 16:37:37.883-05	Ejg0Mzg4IFF1ZWVucyBDaGFwZWwgVGVycmFjZSBORSwgV2FzaGluZ3RvbiwgREMgMjAwMTgsIFVTQSIxEi8KFAoSCVvcsX28x7eJETi9hGaXkAj2EKQiKhQKEgnftO_lu8e3iREQhxvMT--2UQ	38.94548670	-76.97870960
f08a1d47-ecc3-4355-a734-bda075961e8d	2020 12th St NW 214	\N	Washington	DC	20009	2026-01-03 16:37:37.887-05	2026-01-03 16:37:37.887-05	Ei8yMDIwIDEydGggU3QgTlcgIzIxNCwgV2FzaGluZ3RvbiwgREMgMjAwMDksIFVTQSIfGh0KFgoUChIJDw5ZSg63t4kRKFKLkeeks0ISAzIxNA	38.91760370	-77.02839520
aa3b0ece-0438-48ac-8af4-f8baf69f3686	1744 U St NW G	\N	Washington	DC	20009	2026-01-03 16:37:37.89-05	2026-01-03 16:37:37.89-05	EikxNzQ0IFUgU3QgTlcgZywgV2FzaGluZ3RvbiwgREMgMjAwMDksIFVTQSIdGhsKFgoUChIJs0JitMS3t4kRpatlQajMLkESAWc	38.91684490	-77.04026320
88d9593e-c5f1-4a7c-8af0-63d2b67e937b	400 massachusetts ave  720	\N	washington	DC	20001	2026-01-03 16:37:37.894-05	2026-01-03 16:37:37.894-05	EkI0MDAgTWFzc2FjaHVzZXR0cyBBdmVudWUgTm9ydGh3ZXN0ICM3MjAsIFdhc2hpbmd0b24sIERDIDIwMDAxLCBVU0EiHxodChYKFAoSCR2eXFXSt7eJEQQSkfeo-lrqEgM3MjA	38.90022290	-77.01705760
af04e87f-ab45-45d8-baa3-5db6d9a89b4c	4522 Garrison St NW	\N	Washington	DC	20016	2026-01-03 16:37:37.896-05	2026-01-03 16:37:37.896-05	ChIJoWT6ipLJt4kR41zUuxh2u5I	38.95582650	-77.08968980
e45bb90e-bd47-43d4-805a-e9ff269f7a74	1705 Euclid St NW 1	\N	Washington	DC	20009	2026-01-03 16:37:37.9-05	2026-01-03 16:37:37.9-05	Ei8xNzA1IEV1Y2xpZCBTdCBOVyAjMSwgV2FzaGluZ3RvbiwgREMgMjAwMDksIFVTQSIdGhsKFgoUChIJ6Ux8Ndm3t4kRLcKMUQSDVbQSATE	38.92336040	-77.03931500
a108f0af-83c7-4da6-a0c6-6088cdcc84a4	4201 Cathedral Ave NW 602W	\N	Washington	DC	20016	2026-01-03 16:37:37.902-05	2026-01-03 16:37:37.902-05	EjY0MjAxIENhdGhlZHJhbCBBdmUgTlcgIzYwMncsIFdhc2hpbmd0b24sIERDIDIwMDE2LCBVU0EiIBoeChYKFAoSCa1_GkgetreJEWdnzx2GE4SUEgQ2MDJ3	38.93082920	-77.08297530
ce9dcefc-6c1f-4535-b92a-6ded51542a72	6514 Western Ave	\N	Chevy Chase	MD	20815	2026-01-03 16:37:37.907-05	2026-01-03 16:37:37.907-05	Eiw2NTE0IFdlc3Rlcm4gQXZlLCBDaGV2eSBDaGFzZSwgTUQgMjA4MTUsIFVTQSIuKiwKFAoSCQfYDyeiybeJETYAEFW7m95bEhQKEgkPGmYYcsm3iRGeDebirKhC0A	38.97963020	-77.06163350
8b2338ba-9485-4013-9c61-ef17b6b46417	1940 Biltmore Street Northwest	61	Washington	DC	20009	2026-02-02 09:54:33.726487-05	2026-02-02 09:54:33.726487-05	\N	\N	\N
dd5026f8-d3bc-4345-822e-8f0d77e6c458	1705 Euclid St NW	1	Washington	DC	20009	2026-02-25 20:26:04.276154-05	2026-02-25 20:26:04.276154-05	Ei8xNzA1IEV1Y2xpZCBTdCBOVyAjMSwgV2FzaGluZ3RvbiwgREMgMjAwMDksIFVTQSIdGhsKFgoUChIJ6Ux8Ndm3t4kRLcKMUQSDVbQSATE	38.92336040	-77.03931500
b02e7a8e-a864-4bda-ade7-c564d7ef0f39	2325 42nd St NW	412	Washington	DC	20007	2026-02-25 20:27:19.922824-05	2026-02-25 20:27:19.922824-05	Ei8yMzI1IDQybmQgU3QgTlcgIzQxMiwgV2FzaGluZ3RvbiwgREMgMjAwMDcsIFVTQSIfGh0KFgoUChIJSUBCLxi2t4kRjdfTw0UmNSsSAzQxMg	38.92207230	-77.08166690
\.


--
-- Data for Name: block_shapes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.block_shapes (id, name, order_index, allow_multiple_blocks, created_at, updated_at, composable, can_have_parts, type, is_state_control) FROM stdin;
c9d53a2f-fbbd-4a93-bb84-48c828617af4	Property	2	t	2025-10-27 11:38:35.91	2025-10-27 11:38:35.91	f	f	property	f
c3e2fbe7-5201-4151-8355-14ebe8741b48	Option	3	t	2025-10-27 15:38:35.91	2025-10-27 15:38:35.91	f	f	option	f
9acd044e-4470-4916-83fe-ac254eb6e7fe	Coupon	4	f	2026-03-06 05:27:50.559	2026-03-06 05:27:50.559	f	f	coupon	f
26d66957-e7a1-40a7-829e-b68a5ca49b8e	Service	1	f	2025-10-28 03:38:35.91	2025-10-28 03:38:35.91	t	t	service	f
c6e7ec8a-ed79-4280-b54c-3e8b75155168	User	0	f	2025-10-31 07:38:35.91	2025-10-31 07:38:35.91	f	f	user	t
\.


--
-- Data for Name: admin_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_metadata (id, metadata_type, entity_type, entity_id, field_key, data_type, label, is_required, visibility, layout, display_order, render_as, status_button_color, panel, bulk_edit, created_at, updated_at, block_shape_ref, ic_target_mode, ic_select_mode, ic_select_type, ic_target_key, ic_global_field, ic_placeholder, ic_group_by_key, ic_selected_child_key, ic_candidate_child_key, ic_selected_parent_key, ic_candidate_parent_key, ic_selected_child_path, ic_candidate_child_path, ic_candidate_parent_path) FROM stdin;
a0eeade6-9871-41e9-a848-b75a52c9895a	primitive	annotationShape	00000000-0000-0000-0000-000000000011	active	boolean	Active	f	titleRow	stacked	999	statusButton	purple	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a039f855-6962-4c34-b80a-8cbd6e5fc4ef	primitive	annotationShape	00000000-0000-0000-0000-000000000011	id	string	Id	f	hidden	stacked	999	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
82ed0f34-87ca-42cd-b733-d6fe628259db	primitive	annotationShape	00000000-0000-0000-0000-000000000011	name	string	Name	f	staticAsTitle	stacked	999	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8827f81b-1d9e-4630-a4f8-2613b43aadd8	primitive	annotationShape	00000000-0000-0000-0000-000000000011	orderIndex	number	Order Index	f	hidden	stacked	999	number	\N	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f28d4953-59b5-4199-bd70-2dd1d8484e73	primitive	eventInstance	00000000-0000-0000-0000-000000000012	descriptionTemplate	string	Description Template	f	expandedDirect	stacked	2	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e1dbfb04-dde4-4dcb-8d6c-45f57a4161bd	primitive	eventInstance	00000000-0000-0000-0000-000000000012	eventShapeRef	string	Event Shape Ref	f	hidden	stacked	3	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
0bd04ae9-82ba-4cfa-a0b0-e28174d24630	primitive	eventInstance	00000000-0000-0000-0000-000000000012	locationTemplate	string	Location Template	f	expandedDirect	stacked	5	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5b0428a5-fc5f-4e7f-a5f8-fd486514209b	primitive	blockShape	00000000-0000-0000-0000-000000000001	type	string	Type	f	notConfigured	stacked	999	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2acbd5cd-61d2-488f-9089-879ec9b7aafc	primitive	eventInstance	00000000-0000-0000-0000-000000000012	titleTemplate	string	Title Template	f	expandedDirect	stacked	7	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-01-31 10:41:05.03-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e8a77f8e-a863-4eca-8673-750fec1b1ba8	primitive	eventShape	00000000-0000-0000-0000-000000000010	isTernary	boolean	Is Ternary	t	titleRow	stacked	3	statusButton	secondary	none	f	2026-01-31 13:35:10.184293-05	2026-01-31 13:35:10.184293-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4d98499a-82ae-4431-9e4a-120e4851fb9e	primitive	blockInstance	00000000-0000-0000-0000-000000000004	allowMultiple	boolean	Allow Multiple	f	hidden	stacked	999	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
af586998-4fd0-4bd5-a3e9-5af4e9fcbed9	primitive	blockInstance	00000000-0000-0000-0000-000000000004	active	boolean	Active	f	titleRow	stacked	999	statusButton	primary	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3bec2592-77bb-4b40-bd66-e28a56f27f56	primitive	blockInstance	00000000-0000-0000-0000-000000000004	icon	string	Icon	f	expandedDirect	inline	999	iconSelect	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9f4da5d9-8cad-476e-b346-7e9c98343e6a	primitive	blockInstance	00000000-0000-0000-0000-000000000004	composite	boolean	Composite	f	expandedDirect	stacked	10	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8b509a3f-803d-4630-98f7-6db93e4c45c5	primitive	blockInstance	00000000-0000-0000-0000-000000000004	name	string	Name	f	staticAsTitle	stacked	999	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3f879a46-671a-43e2-81c7-269afcb85e19	primitive	blockInstance	00000000-0000-0000-0000-000000000004	requiresUnitNumber	boolean	Requires Unit Number	f	hidden	stacked	999	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fbbd730b-cf2f-428f-a349-ddc59b296bc2	primitive	partInstance	00000000-0000-0000-0000-000000000003	name	string	Name	f	staticAsTitle	stacked	0	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7fd81947-9eb3-431d-9cb1-a9f2b83b2de3	primitive	partInstance	00000000-0000-0000-0000-000000000003	baseFee	number	Base Fee	f	expandedDirect	inline	9	number	\N	none	t	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3f6b6397-1ad8-4e32-b7be-5237e898cddd	primitive	partInstance	00000000-0000-0000-0000-000000000003	rateOverBaseFee	number	Rate Over Base Fee	f	expandedDirect	inline	10	number	\N	none	t	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5d3dd63b-825e-48ab-ba40-5fbffd7a95a9	primitive	partInstance	00000000-0000-0000-0000-000000000003	baseTime	number	Base Time	f	expandedDirect	inline	7	number	\N	none	t	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c688f5df-04d9-437a-b6c7-a4c71e66231e	primitive	partInstance	00000000-0000-0000-0000-000000000003	rateOverBaseTime	number	Rate Over Base Time	f	expandedDirect	inline	8	number	\N	none	t	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7576f968-9f63-4e81-9724-8ce2cf13bc4e	primitive	partInstance	00000000-0000-0000-0000-000000000003	zeroOutPart	boolean	Zero Out Part	f	titleRow	stacked	6	statusButton	purple	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2dde79b0-5d95-4187-abe1-621f7afc2486	primitive	partShape	00000000-0000-0000-0000-000000000002	name	string	Name	f	staticAsTitle	stacked	999	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e15c681b-34de-462e-9adb-b7c9e1827224	primitive	blockShape	00000000-0000-0000-0000-000000000001	canHaveParts	boolean	Can Have Parts	f	titleRow	stacked	999	statusButton	primary	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
728763d0-9c60-4ad5-a4ab-58949d8b0781	primitive	blockShape	00000000-0000-0000-0000-000000000001	name	string	Name	f	staticAsTitle	stacked	999	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d08b5d11-cc3e-4b22-9dc9-eb02432f067a	primitive	partInstance	00000000-0000-0000-0000-000000000003	active	boolean	Active	f	titleRow	stacked	1	statusButton	primary	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
bc64e59c-d17d-41ab-b626-510848f40a44	primitive	blockShape	00000000-0000-0000-0000-000000000001	composable	boolean	Composable	f	titleRow	stacked	999	statusButton	secondary	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
da5447ac-ca45-4188-93a0-b435d1fbdcf6	primitive	eventInstance	00000000-0000-0000-0000-000000000012	guestsCanModify	boolean	Guests Can Modify	f	expandedDirect	inline	20	statusButton	success	none	f	2026-02-20 20:48:58.155827-05	2026-02-20 20:48:58.155827-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
aa8c6960-b977-47fb-9722-6e140a0e589e	primitive	eventShape	00000000-0000-0000-0000-000000000010	ternaryDefault	string	Ternary Default	f	expandedDirect	stacked	4	select	\N	none	f	2026-01-31 13:35:10.188427-05	2026-01-31 13:35:10.188427-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
72bfa0f8-0553-4bf7-88c9-a4461188e1d2	relationship	blockShape	00000000-0000-0000-0000-000000000001	validParts	reference	Valid Parts	f	expandedDirect	stacked	2	multiselect	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-30 17:14:15.691276-05	\N	relationship	multiple	validPartSelect	validParts	validParts	No parts selected	\N	partShape	partShape	blockShape	blockShape	{validParts}	\N	\N
03261047-6584-4d48-8700-9dff4049b8f1	primitive	eventInstance	00000000-0000-0000-0000-000000000012	visibility	string	Visibility	f	expandedDirect	inline	10	select	\N	none	f	2026-02-20 20:48:58.142135-05	2026-02-21 14:28:08.742046-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4d5c8de2-7225-4c79-a9ca-ca154eb8a8b7	primitive	annotationInstance	00000000-0000-0000-0000-000000000013	text	string	Text	f	expandedDirect	stacked	10	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-03-21 16:46:31.528762-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
745b167f-8c5f-4c55-8047-de7efa911872	primitive	annotationInstance	00000000-0000-0000-0000-000000000013	type	string	Type	f	notConfigured	stacked	999	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-03-21 16:46:31.534374-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
362c6990-1e4a-4697-8f99-92fa8ff24202	primitive	annotationInstance	00000000-0000-0000-0000-000000000013	userTypeBlock	string	User Type Block	f	hidden	stacked	999	text	\N	none	f	2026-01-31 10:41:05.03-05	2026-03-21 16:46:31.534374-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
492f3dea-fc0f-4a1f-ba26-d6c2341f8be1	relationship	blockInstance	00000000-0000-0000-0000-000000000004	instanceComponents	reference	{blockShapeName} Components	f	hidden	stacked	2	relationshipCollection	\N	relationships	f	2026-01-20 11:13:08.092-05	2026-03-21 21:27:43.320368-04	\N	relationship	multiple	instanceComponentSelect	instanceComponents	instanceComponents	Select components...	\N	blockInstance	blockInstance	blockInstance	blockInstance	{instanceComponents}	{}	{dependentInstanceOptions}
78ca1947-d998-48fc-aac4-ae911f49501e	primitive	blockInstance	00000000-0000-0000-0000-000000000004	baseSqFt	number	Base Sq Ft	f	expandedDirect	inline	3	number	\N	none	f	2026-01-20 12:27:09.895219-05	2026-01-20 12:27:09.895219-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
414aa2ed-0436-4f88-a3c4-d6ec14c23500	primitive	blockInstance	00000000-0000-0000-0000-000000000004	baseSqFt	number	Base Sq Ft	f	expandedDirect	inline	3	number	\N	none	f	2026-01-20 12:27:09.907201-05	2026-01-20 12:27:09.907201-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ec522deb-c2de-4886-8e62-6bb56dbd8ae3	primitive	blockInstance	00000000-0000-0000-0000-000000000004	allowMultiple	boolean	Allow Multiple	f	hidden	stacked	999	text	\N	none	f	2026-01-20 12:27:09.907922-05	2026-01-20 12:27:09.907922-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d36b940a-c688-4c35-a262-ebb6ccd9748c	primitive	blockInstance	00000000-0000-0000-0000-000000000004	active	boolean	Active	f	titleRow	stacked	999	statusButton	primary	none	f	2026-01-20 12:27:09.908647-05	2026-01-20 12:27:09.908647-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
82093a58-9c91-4a3b-b606-f2eaf08f78e1	primitive	blockInstance	00000000-0000-0000-0000-000000000004	icon	string	Icon	f	expandedDirect	inline	999	iconSelect	\N	none	f	2026-01-20 12:27:09.913451-05	2026-01-20 12:27:09.913451-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
09ec1784-1b57-4cf5-ac91-fb82cc24f64e	primitive	eventInstance	00000000-0000-0000-0000-000000000012	reminderOverrides	string	Reminder Overrides	f	expandedDirect	stacked	40	text	\N	none	f	2026-02-20 20:48:58.160058-05	2026-02-20 20:48:58.160058-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6c33ee6c-a1e2-4f9b-bdd8-e3983bdcc36e	primitive	blockInstance	00000000-0000-0000-0000-000000000004	icon	string	Icon	f	expandedDirect	inline	10	iconSelect	\N	none	f	2026-01-20 12:27:09.901719-05	2026-01-20 12:27:09.901719-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
18e58597-8b26-4316-8cff-9d73a8ffaef8	primitive	blockInstance	00000000-0000-0000-0000-000000000004	active	boolean	Active	f	titleRow	stacked	7	statusButton	primary	none	f	2026-01-20 12:27:09.896695-05	2026-01-20 12:27:09.896695-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
df785050-12ea-4562-ab69-d316907bebdb	primitive	blockInstance	00000000-0000-0000-0000-000000000004	requiresUnitNumber	boolean	Requires Unit Number	f	hidden	stacked	12	statusButton	purple	none	f	2026-01-20 12:27:09.90453-05	2026-01-20 12:27:09.90453-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a4a52be4-d1f6-4087-9053-e7beaf330e54	primitive	blockInstance	00000000-0000-0000-0000-000000000004	composite	boolean	Composite	f	expandedDirect	stacked	10	text	\N	none	f	2026-01-20 12:27:09.90934-05	2026-01-20 12:27:09.90934-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
33be1717-c547-4236-9d77-2694bc21cbdb	primitive	blockInstance	00000000-0000-0000-0000-000000000004	allowMultiple	boolean	Allow Multiple	f	hidden	stacked	8	statusButton	purple	none	f	2026-01-20 12:27:09.895989-05	2026-01-20 12:27:09.895989-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5ea6665c-bef0-4298-8b28-5347490cd6d6	primitive	blockInstance	00000000-0000-0000-0000-000000000004	name	string	Name	f	staticAsTitle	stacked	11	text	\N	none	f	2026-01-20 12:27:09.903453-05	2026-01-20 12:27:09.903453-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
76d7562d-056d-432d-8a5e-9d9fc19c2ed2	primitive	blockInstance	00000000-0000-0000-0000-000000000004	composite	boolean	Composite	f	expandedDirect	stacked	6	statusButton	secondary	none	f	2026-01-20 12:27:09.897397-05	2026-01-20 12:27:09.897397-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ccd404fd-e809-4c6d-b3ca-abf1878c12c8	primitive	eventInstance	00000000-0000-0000-0000-000000000012	scheduledBy	string	Scheduled By	f	expandedDirect	stacked	50	text	\N	none	f	2026-03-05 10:29:10.043183-05	2026-03-05 10:29:10.043183-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b994a8a1-f47a-4e4a-9318-3ffb5c5931db	primitive	eventInstance	00000000-0000-0000-0000-000000000012	addConferenceLink	boolean	Google Meet	f	expandedDirect	inline	31	statusButton	purple	none	f	2026-02-20 20:48:58.159601-05	2026-02-20 20:48:58.159601-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2df768cb-a4c9-47bc-80bb-8a0f37b59f55	primitive	eventInstance	00000000-0000-0000-0000-000000000012	guestsCanSeeOtherGuests	boolean	Guests Can See Guests	f	expandedDirect	inline	22	statusButton	primary	none	f	2026-02-20 20:48:58.157823-05	2026-02-20 20:48:58.157823-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3244a356-d35c-49a9-b43a-07c2c4269522	primitive	eventInstance	00000000-0000-0000-0000-000000000012	guestsCanInviteOthers	boolean	Guests Can Invite Others	f	expandedDirect	inline	21	statusButton	info	none	f	2026-02-20 20:48:58.156822-05	2026-02-20 20:48:58.156822-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
975203ac-d540-4adc-a77a-da2a60e4cacd	relationship	blockInstance	00000000-0000-0000-0000-000000000004	bookingCascades	reference	Booking Cascade	f	expandedDirect	stacked	1	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.910073-05	2026-03-21 21:27:43.320368-04	c9d53a2f-fbbd-4a93-bb84-48c828617af4	relationship	multiple	bookingCascadeSelect	bookingCascades	bookingCascades	No cascades selected	blockShapeRef	blockInstance	blockInstance	blockInstance	blockShape	{bookingCascades}	{}	{blockShapeRef}
132b05ce-f486-4d3d-be5d-211b13a7ee9d	primitive	eventShape	00000000-0000-0000-0000-000000000010	differentialRole	string	Differential Role	f	notConfigured	stacked	999	select	\N	none	f	2026-02-22 17:23:15.759264-05	2026-02-22 17:23:15.759264-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
49e055bd-33dc-4cfe-94f3-1b197c7f0d14	relationship	partShape	00000000-0000-0000-0000-000000000002	validPricingCascades	reference	Valid Pricing Cascades	f	expandedPanel	stacked	20	multiselect	\N	relationships	f	2026-02-12 08:15:21.054217-05	2026-03-21 21:27:43.324626-04	\N	relationship	multiple	validPricingCascadeSelect	validPricingCascades	validPricingCascades	No valid pricing cascades	\N	partShape	partShape	partShape	partShape	{validPricingCascades}	{}	{}
823170cc-cf7d-4a69-b1d5-87a51b4b169b	relationship	blockShape	00000000-0000-0000-0000-000000000001	validEvents	reference	Valid Events	f	expandedDirect	stacked	1	multiselect	\N	none	f	2026-01-31 11:51:57.125-05	2026-03-21 21:42:09.533876-04	\N	relationship	multiple	validEventSelect	validEvents	validEvents	No valid events defined	\N	eventShape	eventShape	blockShape	blockShape	{validEvents}	\N	\N
4fe60644-7f9f-4c0f-9807-eb9e462f96e3	primitive	blockInstance	00000000-0000-0000-0000-000000000004	baseSqFt	number	Base Sq Ft	f	expandedDirect	inline	3	number	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
084953cd-56ba-44d4-a63c-8b04bfdbdd12	primitive	blockInstance	00000000-0000-0000-0000-000000000004	allowMultiple	boolean	Allow Multiple	f	hidden	stacked	999	text	\N	none	f	2026-01-20 12:27:09.88247-05	2026-01-20 12:27:09.88247-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
75fada77-eedd-4690-b6b8-cff5b861d582	primitive	blockInstance	00000000-0000-0000-0000-000000000004	active	boolean	Active	f	titleRow	stacked	999	statusButton	primary	none	f	2026-01-20 12:27:09.883311-05	2026-01-20 12:27:09.883311-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d7aba02b-1b6a-4fb9-a725-929fbb058bb1	primitive	blockInstance	00000000-0000-0000-0000-000000000004	icon	string	Icon	f	expandedDirect	inline	999	iconSelect	\N	none	f	2026-01-20 12:27:09.889536-05	2026-01-20 12:27:09.889536-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
afd8131a-a252-4be3-988f-99ec88e82740	primitive	blockInstance	00000000-0000-0000-0000-000000000004	name	string	Name	f	staticAsTitle	stacked	999	text	\N	none	f	2026-01-20 12:27:09.890954-05	2026-01-20 12:27:09.890954-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
be3a9b67-3b78-4ea0-bff2-faa9039d6bd2	primitive	blockInstance	00000000-0000-0000-0000-000000000004	requiresUnitNumber	boolean	Requires Unit Number	f	hidden	stacked	999	text	\N	none	f	2026-01-20 12:27:09.891612-05	2026-01-20 12:27:09.891612-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fa6a7768-8b31-4eb8-941a-d24d3bd126e1	primitive	blockInstance	00000000-0000-0000-0000-000000000004	composite	boolean	Composite	f	expandedDirect	stacked	10	text	\N	none	f	2026-01-20 12:27:09.884095-05	2026-01-20 12:27:09.884095-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
849a884e-e7e1-4357-a0b2-c297ee35f273	primitive	blockInstance	00000000-0000-0000-0000-000000000004	icon	string	Icon	f	hidden	inline	7	iconSelect	\N	none	f	2026-01-20 12:27:09.874663-05	2026-01-20 12:27:09.874663-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7742d714-f36b-4897-a999-3952ba774101	primitive	blockInstance	00000000-0000-0000-0000-000000000004	active	boolean	Active	f	titleRow	stacked	8	statusButton	primary	none	f	2026-01-20 12:27:09.867001-05	2026-01-20 12:27:09.867001-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7c17ae1c-8755-46da-a02c-9ec230d7e7e0	primitive	blockInstance	00000000-0000-0000-0000-000000000004	requiresUnitNumber	boolean	Requires Unit Number	f	hidden	stacked	11	statusButton	\N	none	f	2026-01-20 12:27:09.876821-05	2026-01-20 12:27:09.876821-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fca36385-6a10-416c-9d44-79a41ce3eff8	primitive	blockInstance	00000000-0000-0000-0000-000000000004	allowMultiple	boolean	Allow Multiple	f	hidden	stacked	12	statusButton	\N	none	f	2026-01-20 12:27:09.861365-05	2026-01-20 12:27:09.861365-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a1650a1c-fe9f-4143-99ba-a895a6f20477	primitive	blockInstance	00000000-0000-0000-0000-000000000004	baseSqFt	number	Base Sq Ft	f	hidden	inline	1	number	\N	none	f	2026-01-20 12:27:09.881534-05	2026-01-20 12:27:09.881534-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1a9f28b0-fe07-45cb-afc0-95b04382a64b	primitive	blockInstance	00000000-0000-0000-0000-000000000004	name	string	Name	f	staticAsTitle	stacked	0	text	\N	none	f	2026-01-20 12:27:09.876047-05	2026-01-20 12:27:09.876047-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b36d5a66-d5df-4025-b54f-5ab2e1aa2580	primitive	blockInstance	00000000-0000-0000-0000-000000000004	name	string	Name	f	staticAsTitle	stacked	999	text	\N	none	f	2026-01-20 12:27:09.915522-05	2026-01-20 12:27:09.915522-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
991997c3-a9fb-4b17-a01d-a2ddbf22bc2a	primitive	blockInstance	00000000-0000-0000-0000-000000000004	requiresUnitNumber	boolean	Requires Unit Number	f	hidden	stacked	999	text	\N	none	f	2026-01-20 12:27:09.916477-05	2026-01-20 12:27:09.916477-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
755abbe2-3a0e-42de-864f-685ab34ce70d	primitive	eventShape	00000000-0000-0000-0000-000000000010	name	string	Name	f	staticAsTitle	stacked	0	text	\N	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
441dfe34-61c1-4f76-97a3-0f9f470074fd	primitive	eventInstance	00000000-0000-0000-0000-000000000012	active	boolean	Active	f	titleRow	stacked	1	statusButton	yellow	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
058f96f7-c30a-4c01-b81b-c6f43041ab1a	primitive	blockInstance	00000000-0000-0000-0000-000000000004	baseSqFt	number	Base Sq Ft	f	expandedDirect	inline	3	number	\N	none	f	2026-01-20 12:27:09.921012-05	2026-01-20 12:27:09.921012-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c0159bb6-b619-4d67-8b6d-93e710800427	primitive	eventShape	00000000-0000-0000-0000-000000000010	id	string	Id	f	hidden	stacked	2	text	\N	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
090acc91-baed-4be6-91d4-618060036df5	primitive	eventShape	00000000-0000-0000-0000-000000000010	orderIndex	number	Order Index	f	hidden	stacked	3	number	\N	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5b88709a-20c3-4e07-a1b9-3c02108373af	primitive	eventInstance	00000000-0000-0000-0000-000000000012	id	string	Id	f	hidden	stacked	4	text	\N	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
789513a9-0824-4af1-b409-7c3bb3436a08	primitive	eventInstance	00000000-0000-0000-0000-000000000012	name	string	Name	f	staticAsTitle	stacked	0	text	\N	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fa832b27-f462-4b95-a985-babd263d9389	primitive	blockInstance	00000000-0000-0000-0000-000000000004	bookingMode	ternary	Booking Mode	t	expandedDirect	stacked	10	statusButton	secondary	none	t	2026-01-25 16:26:21.67804-05	2026-01-25 16:26:21.67804-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
90d3a6a5-a3f1-4b7b-811d-238f13750f2d	primitive	blockInstance	00000000-0000-0000-0000-000000000004	bookingMode	ternary	Booking Mode	t	expandedDirect	stacked	10	statusButton	secondary	none	t	2026-01-25 16:30:28.965058-05	2026-01-25 16:30:28.965058-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b71a3d19-dbe6-4913-a4cf-5affda30cb30	primitive	blockInstance	00000000-0000-0000-0000-000000000004	bookingMode	ternary	Booking Mode	t	expandedDirect	stacked	10	statusButton	secondary	none	t	2026-01-25 16:30:28.969047-05	2026-01-25 16:30:28.969047-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
aa4e0aa6-968f-4f4a-b878-0c79b6a135bc	primitive	blockInstance	00000000-0000-0000-0000-000000000004	differential	ternary	Differential	f	titleRow	stacked	999	statusButton	secondary	none	f	2026-01-20 12:27:09.888843-05	2026-01-20 12:27:09.888843-05	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e2797277-d858-4e6c-bad7-64f55c28cfbd	primitive	blockInstance	00000000-0000-0000-0000-000000000004	agentPermissions	ternary	Agent Permissions	f	expandedDirect	stacked	11	statusButton	info	none	t	2026-03-21 09:35:16.751951-04	2026-03-21 09:35:16.751951-04	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c59197b2-3f43-44fe-b5b9-08524bf74945	primitive	blockInstance	00000000-0000-0000-0000-000000000004	agentPermissions	ternary	Agent Permissions	f	expandedDirect	stacked	11	statusButton	info	none	t	2026-03-21 09:35:16.751951-04	2026-03-21 09:35:16.751951-04	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
22e6a7ef-2e43-4219-88a2-558d899b4b6b	primitive	blockInstance	00000000-0000-0000-0000-000000000004	agentPermissions	ternary	Agent Permissions	f	expandedDirect	stacked	11	statusButton	info	none	t	2026-03-21 09:35:16.754353-04	2026-03-21 09:35:16.754353-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3e6e95f0-1bab-4678-9335-b73cbdd4ee9d	primitive	eventInstance	00000000-0000-0000-0000-000000000012	transparency	string	Show As	f	expandedDirect	inline	11	select	\N	none	f	2026-02-20 20:48:58.153374-05	2026-02-21 14:28:08.750732-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fa0b2dfe-913d-4fd4-a0a1-6cea21e7e167	primitive	eventInstance	00000000-0000-0000-0000-000000000012	status	string	Event Status	f	expandedDirect	inline	12	select	\N	none	f	2026-02-20 20:48:58.154171-05	2026-02-21 14:28:08.751698-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f60cdd0c-bcd9-4dea-bc88-7270e7e33907	primitive	eventInstance	00000000-0000-0000-0000-000000000012	sendUpdates	string	Send Invitations	f	expandedDirect	inline	30	select	\N	none	f	2026-02-20 20:48:58.158777-05	2026-02-21 14:28:08.752579-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
672e7666-a69b-46e1-a96e-030ccb89715d	primitive	eventInstance	00000000-0000-0000-0000-000000000012	colorId	string	Event Color	f	expandedDirect	inline	13	select	\N	none	f	2026-02-20 20:48:58.154955-05	2026-02-21 14:28:08.753372-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dbc9b73e-baa1-458b-a738-8e3405d8f5ca	relationship	blockInstance	00000000-0000-0000-0000-000000000004	bookingCascades	reference	Booking Cascade	f	expandedDirect	stacked	1	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.885008-05	2026-03-21 21:27:43.320368-04	c3e2fbe7-5201-4151-8355-14ebe8741b48	relationship	multiple	bookingCascadeSelect	bookingCascades	bookingCascades	No cascades selected	blockShapeRef	blockInstance	blockInstance	blockInstance	blockShape	{bookingCascades}	{}	{blockShapeRef}
c1a7fea1-d53a-4721-bac4-ffd1ada1e705	primitive	blockInstance	00000000-0000-0000-0000-000000000004	composite	boolean	Composite	f	titleRow	stacked	10	statusButton	info	none	f	2026-01-20 12:27:09.868555-05	2026-01-20 12:27:09.868555-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9d30e456-0a7e-4e3f-a77f-dae67edc47c3	primitive	eventInstance	00000000-0000-0000-0000-000000000012	orderIndex	number	Order Index	f	hidden	stacked	6	number	\N	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
91affc95-140f-4550-8e60-3844c44422fe	primitive	eventShape	00000000-0000-0000-0000-000000000010	active	boolean	Active	f	titleRow	stacked	1	statusButton	primary	none	f	2026-01-31 10:51:30.674-05	2026-01-31 10:51:30.674-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
acb2ee76-dc52-4645-adad-004d02eba048	primitive	blockShape	00000000-0000-0000-0000-000000000001	isStateControl	boolean	State Control	f	titleRow	stacked	4	statusButton	yellow	none	f	2026-01-29 13:41:14.842-05	2026-01-29 13:41:14.842-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9e7c93b9-46d2-469b-b2ad-be1a08262219	primitive	blockInstance	00000000-0000-0000-0000-000000000004	bookingMode	ternary	Booking Mode	t	expandedDirect	inline	4	statusButton	secondary	none	f	2026-01-25 16:30:28.96754-05	2026-01-25 16:30:28.96754-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4f5043b5-25ef-4f09-8993-7611771a0c85	primitive	blockInstance	00000000-0000-0000-0000-000000000004	differential	ternary	Differential	f	titleRow	stacked	9	statusButton	secondary	none	f	2026-01-20 12:27:09.873673-05	2026-01-20 12:27:09.873673-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e0ad5a65-3817-43eb-bd52-b45cf05812ab	primitive	blockInstance	00000000-0000-0000-0000-000000000004	bookingMode	ternary	Booking Mode	t	titleRow	inline	2	statusButton	secondary	none	t	2026-01-25 16:30:28.961469-05	2026-01-25 16:30:28.961469-05	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
35e03a6f-e236-4499-a745-7dc7dc216f8f	relationship	blockInstance	00000000-0000-0000-0000-000000000004	partAssignments	reference	Part Assignments	f	hidden	stacked	1	relationshipCollection	\N	parts	f	2026-01-20 12:27:09.90643-05	2026-03-21 15:56:40.73214-04	c6e7ec8a-ed79-4280-b54c-3e8b75155168	relationship	\N	partAssignmentSelect	partAssignments	partAssignments	No parts selected	\N	partInstance	partInstance	blockInstance	blockShape	{partAssignments}	{}	{blockShapeRef}
9c4fbc7e-7954-452e-ba2f-b9d0012b7033	primitive	eventShape	00000000-0000-0000-0000-000000000010	includeRescheduleLink	boolean	Include reschedule link in invites	f	expandedDirect	stacked	5	statusButton	secondary	none	f	2026-03-21 12:29:40.077815-04	2026-03-21 12:29:40.077815-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ce02db2d-4210-4c86-9ab8-164b03d9f51e	primitive	eventShape	00000000-0000-0000-0000-000000000010	includeCancelLink	boolean	Include cancel link in invites	f	expandedDirect	stacked	6	statusButton	secondary	none	f	2026-03-21 12:29:40.080898-04	2026-03-21 12:29:40.080898-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
23d7346f-ee23-4210-828f-90ccda833223	relationship	blockShape	00000000-0000-0000-0000-000000000001	validAnnotations	reference	Valid Annotations	f	expandedDirect	stacked	3	multiselect	\N	none	f	2026-01-30 12:17:05.468-05	2026-03-21 14:02:53.491131-04	\N	relationship	multiple	\N	validAnnotations	\N	No annotation shapes selected	\N	\N	annotationShape	\N	\N	\N	\N	\N
d8978918-0fc2-40bc-a005-60d97e6ebe43	relationship	blockInstance	00000000-0000-0000-0000-000000000004	bookingCascades	reference	Booking Cascade	f	expandedPanel	stacked	4	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.869897-05	2026-03-21 21:27:43.320368-04	26d66957-e7a1-40a7-829e-b68a5ca49b8e	relationship	multiple	bookingCascadeSelect	bookingCascades	bookingCascades	No cascades selected	blockShapeRef	blockInstance	blockInstance	blockInstance	blockShape	{bookingCascades}	{}	{blockShapeRef}
64ad2798-2b17-47a8-b347-da47e94bc0f3	relationship	blockInstance	00000000-0000-0000-0000-000000000004	bookingCascades	reference	Booking Cascade	f	expandedDirect	stacked	1	relationshipCollection	\N	relationships	f	2026-01-20 11:13:08.092-05	2026-03-21 21:27:43.320368-04	\N	relationship	multiple	bookingCascadeSelect	bookingCascades	bookingCascades	No cascades selected	blockShapeRef	blockInstance	blockInstance	blockInstance	blockShape	{bookingCascades}	{}	{blockShapeRef}
98a9d8cd-f0b7-49c3-ae38-5e41656b9663	relationship	blockInstance	00000000-0000-0000-0000-000000000004	dependentInstances	reference	Dependent Instance Options	f	hidden	stacked	3	relationshipCollection	\N	relationships	f	2026-01-20 11:13:08.092-05	2026-03-21 21:27:43.320368-04	\N	relationship	multiple	dependentInstanceOptionSelect	dependentInstanceOptions	dependentInstanceOptions	No dependent instance options	\N	blockInstance	blockInstance	blockInstance	blockInstance	{dependentInstanceOptions}	{blockShapeRef}	{}
64f493be-60df-4a72-978d-2996c28c150f	primitive	blockInstance	00000000-0000-0000-0000-000000000004	differential	ternary	Differential	f	hidden	stacked	999	text	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8f7f5482-7fdb-41db-b4b0-bab0137bad17	primitive	blockInstance	00000000-0000-0000-0000-000000000004	differential	ternary	Differential	f	hidden	stacked	999	text	\N	none	f	2026-01-20 12:27:09.912631-05	2026-01-20 12:27:09.912631-05	c9d53a2f-fbbd-4a93-bb84-48c828617af4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a96e20cb-d8e1-40ec-a59b-92afdfc96b23	primitive	blockInstance	00000000-0000-0000-0000-000000000004	differential	ternary	Differential	f	hidden	stacked	9	statusButton	purple	none	f	2026-01-20 12:27:09.900963-05	2026-01-20 12:27:09.900963-05	c6e7ec8a-ed79-4280-b54c-3e8b75155168	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
344fd195-69a8-4476-94e9-53d7c15aa7ad	primitive	blockInstance	00000000-0000-0000-0000-000000000004	agentPermissions	ternary	Agent Permissions	f	expandedDirect	stacked	11	statusButton	info	none	t	2026-03-21 09:35:16.751951-04	2026-03-21 09:35:16.751951-04	26d66957-e7a1-40a7-829e-b68a5ca49b8e	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
655b0956-aac4-4afc-bf04-baa142c90b68	primitive	blockInstance	00000000-0000-0000-0000-000000000004	agentPermissions	ternary	Agent Permissions	f	expandedDirect	stacked	11	statusButton	info	none	t	2026-03-21 09:35:16.751951-04	2026-03-21 09:35:16.751951-04	c3e2fbe7-5201-4151-8355-14ebe8741b48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
43db7178-13de-4287-a8b3-cffe6ba427d3	relationship	blockInstance	00000000-0000-0000-0000-000000000004	partAssignments	reference	Part Assignments	f	expandedPanel	stacked	3	relationshipCollection	\N	parts	f	2026-01-20 12:27:09.880618-05	2026-03-21 15:56:40.73214-04	26d66957-e7a1-40a7-829e-b68a5ca49b8e	relationship	\N	partAssignmentSelect	partAssignments	partAssignments	No parts selected	\N	partInstance	partInstance	blockInstance	blockShape	{partAssignments}	{}	{blockShapeRef}
b6916fa8-5fc5-4051-a6b5-a958c5fee98c	relationship	blockInstance	00000000-0000-0000-0000-000000000004	partAssignments	reference	Part Assignments	f	hidden	stacked	2	relationshipCollection	\N	parts	f	2026-01-20 12:27:09.918385-05	2026-03-21 15:56:40.73214-04	c9d53a2f-fbbd-4a93-bb84-48c828617af4	relationship	\N	partAssignmentSelect	partAssignments	partAssignments	No parts selected	\N	partInstance	partInstance	blockInstance	blockShape	{partAssignments}	{}	{blockShapeRef}
e7ef7123-a863-4b63-8db0-e9a3fd32c7a1	relationship	blockInstance	00000000-0000-0000-0000-000000000004	dependentInstances	reference	Dependent Instance Options	f	hidden	stacked	3	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.88739-05	2026-03-21 21:27:43.320368-04	c3e2fbe7-5201-4151-8355-14ebe8741b48	relationship	multiple	dependentInstanceOptionSelect	dependentInstanceOptions	dependentInstanceOptions	No dependent instance options	\N	blockInstance	blockInstance	blockInstance	blockInstance	{dependentInstanceOptions}	{blockShapeRef}	{}
e9b10c10-2d9d-4c3d-a90a-48ed2803413c	relationship	blockInstance	00000000-0000-0000-0000-000000000004	instanceComponents	reference	{blockShapeName} Components	f	hidden	stacked	2	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.890171-05	2026-03-21 21:27:43.320368-04	c3e2fbe7-5201-4151-8355-14ebe8741b48	relationship	multiple	instanceComponentSelect	instanceComponents	instanceComponents	Select components...	\N	blockInstance	blockInstance	blockInstance	blockInstance	{instanceComponents}	{}	{dependentInstanceOptions}
1fe9745a-c483-4c02-904a-5c11427b642f	relationship	blockInstance	00000000-0000-0000-0000-000000000004	dependentInstances	reference	Dependent Instance Options	f	hidden	stacked	3	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.911881-05	2026-03-21 21:27:43.320368-04	c9d53a2f-fbbd-4a93-bb84-48c828617af4	relationship	multiple	dependentInstanceOptionSelect	dependentInstanceOptions	dependentInstanceOptions	No dependent instance options	\N	blockInstance	blockInstance	blockInstance	blockInstance	{dependentInstanceOptions}	{blockShapeRef}	{}
d4202e0b-2bd7-4abd-8538-2342c2882b82	relationship	blockInstance	00000000-0000-0000-0000-000000000004	partAssignments	reference	Part Assignments	f	expandedPanel	stacked	2	relationshipCollection	\N	parts	f	2026-01-20 11:13:08.092-05	2026-03-21 15:56:40.73214-04	\N	relationship	\N	partAssignmentSelect	partAssignments	partAssignments	No parts selected	\N	partInstance	partInstance	blockInstance	blockShape	{partAssignments}	{}	{blockShapeRef}
7d4a6599-b189-4f46-9035-94391e9d0f1d	relationship	blockInstance	00000000-0000-0000-0000-000000000004	partAssignments	reference	Part Assignments	f	expandedPanel	stacked	2	relationshipCollection	\N	parts	f	2026-01-20 12:27:09.893327-05	2026-03-21 15:56:40.73214-04	c3e2fbe7-5201-4151-8355-14ebe8741b48	relationship	\N	partAssignmentSelect	partAssignments	partAssignments	No parts selected	\N	partInstance	partInstance	blockInstance	blockShape	{partAssignments}	{}	{blockShapeRef}
63b7134b-16f1-4e5b-812c-fb64bef2b1d2	relationship	blockShape	00000000-0000-0000-0000-000000000001	validCascades	reference	Valid Cascades	f	expandedDirect	stacked	1	multiselect	\N	none	f	2026-01-20 11:13:08.092-05	2026-01-20 11:13:08.092-05	\N	relationship	multiple	validCascadeSelect	validCascades	validCascades	No cascades selected	\N	blockShape	blockShape	blockShape	blockShape	{validCascades}	\N	\N
78fb9f2c-f431-4baa-af51-31efcccd4099	relationship	blockInstance	00000000-0000-0000-0000-000000000004	annotationAssignments	reference	Annotation Assignments	f	expandedPanel	stacked	5	relationshipCollection	\N	annotations	f	2026-01-30 12:17:05.468-05	2026-03-21 15:56:40.734548-04	\N	relationship	Multiple	annotationAssignmentSelect	annotationAssignments	annotationAssignments	No annotations selected	\N	annotationInstance	annotationInstance	blockInstance	blockShape	{annotationAssignments}	{}	{blockShapeRef}
f498d4ae-1b5f-41cc-a0da-3bbe23f10555	relationship	partInstance	00000000-0000-0000-0000-000000000003	pricingCascades	reference	Pricing Cascade	f	expandedPanel	stacked	20	relationshipCollection	\N	relationships	f	2026-02-12 08:15:21.054217-05	2026-03-21 21:27:43.320368-04	\N	relationship	multiple	pricingCascadeSelect	pricingCascades	pricingCascades	No pricing cascades selected	partShapeRef	partInstance	partInstance	partInstance	partShape	{pricingCascades}	{}	{partShapeRef}
b71f384c-b021-4ec0-a606-1c24d7cbe1e8	relationship	eventShape	00000000-0000-0000-0000-000000000010	attendeeAssignments	reference	Attendees	f	expandedDirect	stacked	1	relationshipCollection	\N	none	f	2026-01-31 15:41:00.255-05	2026-03-21 21:27:43.320368-04	\N	relationship	multiple	attendeeSelect	attendeeAssignments	attendees	No attendees selected	\N	blockInstance	blockInstance	eventShape	eventShape	{attendees}	{}	{}
bd35afc2-044c-4f29-97a8-e71d99be308c	relationship	blockInstance	00000000-0000-0000-0000-000000000004	bookingCascades	reference	Booking Cascade	f	expandedDirect	stacked	0	relationshipCollection	\N	none	f	2026-01-20 12:27:09.898051-05	2026-03-21 21:27:43.320368-04	c6e7ec8a-ed79-4280-b54c-3e8b75155168	relationship	multiple	bookingCascadeSelect	bookingCascades	bookingCascades	No cascades selected	blockShapeRef	blockInstance	blockInstance	blockInstance	blockShape	{bookingCascades}	{}	{blockShapeRef}
76a0a4d2-07aa-4178-bdbf-8e5d771898bb	relationship	blockInstance	00000000-0000-0000-0000-000000000004	instanceComponents	reference	{blockShapeName} Components	f	hidden	stacked	2	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.91422-05	2026-03-21 21:27:43.320368-04	c9d53a2f-fbbd-4a93-bb84-48c828617af4	relationship	multiple	instanceComponentSelect	instanceComponents	instanceComponents	Select components...	\N	blockInstance	blockInstance	blockInstance	blockInstance	{instanceComponents}	{}	{dependentInstanceOptions}
20be551b-1380-4825-8a47-c4e36aed6f4a	primitive	annotationShape	00000000-0000-0000-0000-000000000011	uiSlot	string	Wizard UI slot	f	expandedDirect	stacked	4	select	\N	none	f	2026-03-21 15:12:18.369425-04	2026-03-21 15:12:18.369425-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cdea2a8c-c1d7-424b-be58-16a1d0bce945	relationship	blockInstance	00000000-0000-0000-0000-000000000004	dependentInstances	reference	Dependent Instance Options	f	hidden	stacked	3	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.900255-05	2026-03-21 21:27:43.320368-04	c6e7ec8a-ed79-4280-b54c-3e8b75155168	relationship	multiple	dependentInstanceOptionSelect	dependentInstanceOptions	dependentInstanceOptions	No dependent instance options	\N	blockInstance	blockInstance	blockInstance	blockInstance	{dependentInstanceOptions}	{blockShapeRef}	{}
19dadf6d-8818-4560-b5cd-d4090ae9fb12	primitive	annotationInstance	00000000-0000-0000-0000-000000000013	active	boolean	Active	f	titleRow	stacked	1	statusButton	primary	none	f	2026-03-21 16:46:31.535034-04	2026-03-21 16:46:31.535034-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
769f3ea9-3579-49df-b2c2-a9ec58e2f5fb	relationship	blockInstance	00000000-0000-0000-0000-000000000004	eventAssignments	reference	Event Assignments	f	expandedPanel	stacked	42	relationshipCollection	\N	events	f	2026-03-21 21:07:28.54376-04	2026-03-21 21:07:28.54376-04	\N	relationship	multiple	eventAssignmentSelect	eventAssignments	eventAssignments	No events selected	eventShapeRef	eventInstance	eventInstance	blockInstance	blockShape	{eventAssignments}	{}	{blockShapeRef}
580f307e-7500-4f1a-9b2f-bb491bf056f7	primitive	blockInstance	00000000-0000-0000-0000-000000000004	differentialEventRoleOverrides	string	Differential roles	f	expandedPanel	stacked	5	text	\N	events	f	2026-03-21 19:19:06.553989-04	2026-03-21 21:09:40.048107-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ddd9757d-d77c-41ed-b655-2a806553a504	relationship	blockInstance	00000000-0000-0000-0000-000000000004	instanceComponents	reference	{blockShapeName} Components	f	expandedPanel	stacked	5	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.875401-05	2026-03-21 21:27:43.320368-04	26d66957-e7a1-40a7-829e-b68a5ca49b8e	relationship	multiple	instanceComponentSelect	instanceComponents	instanceComponents	Select components...	\N	blockInstance	blockInstance	blockInstance	blockInstance	{instanceComponents}	{}	{dependentInstanceOptions}
e545bf03-433c-421a-a0a2-a05c8e5d7d04	relationship	blockInstance	00000000-0000-0000-0000-000000000004	dependentInstances	reference	Dependent Instance Options	f	expandedDirect	stacked	3	relationshipCollection	\N	none	f	2026-01-20 12:27:09.872609-05	2026-03-21 21:27:43.320368-04	26d66957-e7a1-40a7-829e-b68a5ca49b8e	relationship	multiple	dependentInstanceOptionSelect	dependentInstanceOptions	dependentInstanceOptions	No dependent instance options	\N	blockInstance	blockInstance	blockInstance	blockInstance	{dependentInstanceOptions}	{blockShapeRef}	{}
3cebb935-19ee-4adc-aae5-4f937b79dbf4	relationship	blockInstance	00000000-0000-0000-0000-000000000004	instanceComponents	reference	{blockShapeName} Components	f	hidden	stacked	2	relationshipCollection	\N	relationships	f	2026-01-20 12:27:09.902559-05	2026-03-21 21:27:43.320368-04	c6e7ec8a-ed79-4280-b54c-3e8b75155168	relationship	multiple	instanceComponentSelect	instanceComponents	instanceComponents	Select components...	\N	blockInstance	blockInstance	blockInstance	blockInstance	{instanceComponents}	{}	{dependentInstanceOptions}
74963914-01c2-4977-b97d-8ac5e98d1299	relationship	blockInstance	00000000-0000-0000-0000-000000000004	eventAssignments	reference	Event Assignments	f	hidden	stacked	42	relationshipCollection	\N	events	f	2026-03-21 21:18:26.634913-04	2026-03-21 21:27:43.320368-04	26d66957-e7a1-40a7-829e-b68a5ca49b8e	relationship	multiple	eventAssignmentSelect	eventAssignments	eventAssignments	No events selected	eventShapeRef	eventInstance	eventInstance	blockInstance	blockShape	{eventAssignments}	\N	{blockShapeRef}
\.


--
-- Data for Name: admin_metadata_select_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_metadata_select_options (id, admin_metadata_id, display_order, label, value_payload, created_at, updated_at) FROM stdin;
fc0ca212-de2e-4a1a-ae40-0dab0c899c4d	aa8c6960-b977-47fb-9722-6e140a0e589e	0	None (Fail Gracefully)	null	2026-03-21 13:38:36.772834-04	2026-03-21 13:38:36.772834-04
93d3b4d0-7c77-4285-bc1e-41c2665b748c	aa8c6960-b977-47fb-9722-6e140a0e589e	1	True	"true"	2026-03-21 13:38:36.773828-04	2026-03-21 13:38:36.773828-04
b4045726-729f-4aaa-8cdb-c7cf603be87b	aa8c6960-b977-47fb-9722-6e140a0e589e	2	False	"false"	2026-03-21 13:38:36.774207-04	2026-03-21 13:38:36.774207-04
95eadb58-0bf5-4002-8367-02736b95789d	aa8c6960-b977-47fb-9722-6e140a0e589e	3	Override	"override"	2026-03-21 13:38:36.774463-04	2026-03-21 13:38:36.774463-04
0a247127-3504-4f19-a57e-dcda4974e5f2	03261047-6584-4d48-8700-9dff4049b8f1	0	Default	"default"	2026-03-21 13:38:36.776064-04	2026-03-21 13:38:36.776064-04
e16b9268-abc9-4cd6-bdba-2b0a7ee227b0	03261047-6584-4d48-8700-9dff4049b8f1	1	Public	"public"	2026-03-21 13:38:36.776406-04	2026-03-21 13:38:36.776406-04
c37225a2-2b28-481d-aa22-93ab916d6d1f	03261047-6584-4d48-8700-9dff4049b8f1	2	Private	"private"	2026-03-21 13:38:36.776642-04	2026-03-21 13:38:36.776642-04
bc4fdd1b-eb9b-4fb9-a3f9-9004dffafadf	03261047-6584-4d48-8700-9dff4049b8f1	3	Confidential	"confidential"	2026-03-21 13:38:36.776838-04	2026-03-21 13:38:36.776838-04
7f3c989b-93cf-43bb-a70c-59eb7502046e	132b05ce-f486-4d3d-be5d-211b13a7ee9d	0	None	null	2026-03-21 13:38:36.77998-04	2026-03-21 13:38:36.77998-04
fd70dd64-4b4b-4b26-97c0-cb0761ddad88	132b05ce-f486-4d3d-be5d-211b13a7ee9d	1	Major	"major"	2026-03-21 13:38:36.780225-04	2026-03-21 13:38:36.780225-04
f8579e96-dac4-4e44-8a7d-1d9a2f6cbc41	132b05ce-f486-4d3d-be5d-211b13a7ee9d	2	Minor	"minor"	2026-03-21 13:38:36.780451-04	2026-03-21 13:38:36.780451-04
b1f3ea01-430a-4b7d-bbee-af55106aa4a7	132b05ce-f486-4d3d-be5d-211b13a7ee9d	3	Moveable	"moveable"	2026-03-21 13:38:36.780681-04	2026-03-21 13:38:36.780681-04
f3e6556c-dbf6-4c87-bac3-ef9fa8ed27fb	3e6e95f0-1bab-4678-9335-b73cbdd4ee9d	0	Busy	"opaque"	2026-03-21 13:38:36.781268-04	2026-03-21 13:38:36.781268-04
6c237da5-a33b-49f0-8c99-25ee61857ad7	3e6e95f0-1bab-4678-9335-b73cbdd4ee9d	1	Free	"transparent"	2026-03-21 13:38:36.78147-04	2026-03-21 13:38:36.78147-04
146ee840-20ca-48db-98a7-26009ceba520	fa0b2dfe-913d-4fd4-a0a1-6cea21e7e167	0	Confirmed	"confirmed"	2026-03-21 13:38:36.7819-04	2026-03-21 13:38:36.7819-04
888aa66c-4620-45de-ac1b-253a421f33a3	fa0b2dfe-913d-4fd4-a0a1-6cea21e7e167	1	Tentative	"tentative"	2026-03-21 13:38:36.782081-04	2026-03-21 13:38:36.782081-04
75601807-3104-41cc-81f3-1f76da32fb02	f60cdd0c-bcd9-4dea-bc88-7270e7e33907	0	All Attendees	"all"	2026-03-21 13:38:36.782545-04	2026-03-21 13:38:36.782545-04
1594c01d-06b8-4615-af4f-ffbc03fc2fda	f60cdd0c-bcd9-4dea-bc88-7270e7e33907	1	External Only	"externalOnly"	2026-03-21 13:38:36.782745-04	2026-03-21 13:38:36.782745-04
769b3690-c1a7-4157-b536-e3f35b33008f	f60cdd0c-bcd9-4dea-bc88-7270e7e33907	2	None	"none"	2026-03-21 13:38:36.782973-04	2026-03-21 13:38:36.782973-04
70b38dff-79f9-4ade-90af-4762739468ba	672e7666-a69b-46e1-a96e-030ccb89715d	0	Lavender	"1"	2026-03-21 13:38:36.783441-04	2026-03-21 13:38:36.783441-04
743cfaf9-3221-4fff-9d86-e9e951f3e43f	672e7666-a69b-46e1-a96e-030ccb89715d	1	Sage	"2"	2026-03-21 13:38:36.783748-04	2026-03-21 13:38:36.783748-04
d68cbf5e-12fe-4ecd-9133-cfffd36bb3f6	672e7666-a69b-46e1-a96e-030ccb89715d	2	Grape	"3"	2026-03-21 13:38:36.783949-04	2026-03-21 13:38:36.783949-04
8337b500-240d-4e87-89d8-6651ad04e455	672e7666-a69b-46e1-a96e-030ccb89715d	3	Flamingo	"4"	2026-03-21 13:38:36.784126-04	2026-03-21 13:38:36.784126-04
11fd0538-e4d9-484d-903a-ee3bca25eb77	672e7666-a69b-46e1-a96e-030ccb89715d	4	Banana	"5"	2026-03-21 13:38:36.784316-04	2026-03-21 13:38:36.784316-04
fb5d62b3-a2eb-44e0-a979-3af420d3854c	672e7666-a69b-46e1-a96e-030ccb89715d	5	Tangerine	"6"	2026-03-21 13:38:36.784475-04	2026-03-21 13:38:36.784475-04
6bf420d8-ce1c-419e-8d07-a557450ac8f0	672e7666-a69b-46e1-a96e-030ccb89715d	6	Peacock	"7"	2026-03-21 13:38:36.784627-04	2026-03-21 13:38:36.784627-04
e73b9a51-e598-4d1b-926c-3d1588fc5cac	672e7666-a69b-46e1-a96e-030ccb89715d	7	Graphite	"8"	2026-03-21 13:38:36.784779-04	2026-03-21 13:38:36.784779-04
887aba2c-1af3-4017-825a-28342c715f9d	672e7666-a69b-46e1-a96e-030ccb89715d	8	Blueberry	"9"	2026-03-21 13:38:36.784934-04	2026-03-21 13:38:36.784934-04
7479881b-32d0-4e0c-9511-7a2ec43e3913	672e7666-a69b-46e1-a96e-030ccb89715d	9	Basil	"10"	2026-03-21 13:38:36.785096-04	2026-03-21 13:38:36.785096-04
3d0c479b-9932-487f-8ec7-ee0b9a5db731	672e7666-a69b-46e1-a96e-030ccb89715d	10	Tomato	"11"	2026-03-21 13:38:36.785242-04	2026-03-21 13:38:36.785242-04
526d922c-49d1-434a-9380-822f20acba6e	20be551b-1380-4825-8a47-c4e36aed6f4a	0	No wizard slot	\N	2026-03-21 15:12:18.372896-04	2026-03-21 15:12:18.372896-04
8699b4a4-5955-4aab-a8f4-9c8e7b6ac8c7	20be551b-1380-4825-8a47-c4e36aed6f4a	1	Card Description	"cardDescription"	2026-03-21 15:12:18.373408-04	2026-03-21 15:12:18.373408-04
35a1e759-e84c-4ba8-b36d-b7c92ed775b6	20be551b-1380-4825-8a47-c4e36aed6f4a	2	Card Tooltip	"cardTooltip"	2026-03-21 15:12:18.373719-04	2026-03-21 15:12:18.373719-04
1064424c-317c-4135-af2a-13e7badcf5ca	20be551b-1380-4825-8a47-c4e36aed6f4a	3	Color Label	"cardColorLabel"	2026-03-21 15:12:18.374062-04	2026-03-21 15:12:18.374062-04
1329fcec-0877-4360-99ba-8223ec7ad570	20be551b-1380-4825-8a47-c4e36aed6f4a	4	Section Header	"sectionHeader"	2026-03-21 15:12:18.374328-04	2026-03-21 15:12:18.374328-04
7d16457c-6a91-42ee-b0c2-0f83934d6bd6	20be551b-1380-4825-8a47-c4e36aed6f4a	5	Grid Overlay	"gridOverlay"	2026-03-21 15:12:18.374563-04	2026-03-21 15:12:18.374563-04
15cd6e7b-c3c3-4002-9f0b-43c07a4ba0d2	20be551b-1380-4825-8a47-c4e36aed6f4a	6	Confirmation Note	"confirmationNote"	2026-03-21 15:12:18.374871-04	2026-03-21 15:12:18.374871-04
1f9f42c5-7789-46ed-9ed9-9af4d13b01fb	20be551b-1380-4825-8a47-c4e36aed6f4a	7	Validation Message	"validationMessage"	2026-03-21 15:12:18.375124-04	2026-03-21 15:12:18.375124-04
\.


--
-- Data for Name: annotation_shapes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.annotation_shapes (id, name, created_at, updated_at, order_index, active, ui_slot) FROM stdin;
41d03419-d871-4a80-9d52-b240fd869f6c	Color Description	2026-03-04 18:28:04.538619-05	2026-03-04 18:28:04.538619-05	101	t	\N
11a08e86-5e4e-4f28-b1f5-15d26e8aed35	validation_message	2026-01-31 19:08:31.444-05	2026-01-31 19:08:31.444-05	100	t	validationMessage
e4dd3170-4524-4074-9872-46d93fea6c65	Top-line Description	2025-12-02 15:57:08.112-05	2025-12-02 15:57:08.112-05	0	t	cardDescription
3a1ddad9-4627-44fb-9394-074bc4a67763	Tool Tip	2025-12-04 10:59:18.152-05	2025-12-04 10:59:18.152-05	1	t	cardTooltip
\.


--
-- Data for Name: annotation_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.annotation_instances (id, text, user_type, created_at, updated_at, type, order_index, active) FROM stdin;
bc8f2e30-f2e4-4123-8985-183f5f209ac9	I already own a property but need to understand it better	owner	2025-12-01 00:13:13.616451-05	2025-12-01 00:13:13.616451-05	e4dd3170-4524-4074-9872-46d93fea6c65	0	t
a5f86098-1e84-4929-b7ed-fd1e02add376	I need an inspection to help me understand a property that I am trying to buy	buyer	2025-12-01 00:13:13.619-05	2025-12-01 00:13:13.619-05	e4dd3170-4524-4074-9872-46d93fea6c65	1	t
33668c33-1d05-4db4-b01e-9673c1b1fb8b	I am a real estate agent helping a buyer with their inspection needs	agent	2025-12-01 00:13:13.620159-05	2025-12-01 00:13:13.620159-05	e4dd3170-4524-4074-9872-46d93fea6c65	2	t
7490090a-0cb0-4c06-b58a-36d5fb3765ac	Number of units is required for multi-family properties	\N	2026-01-31 19:08:31.444-05	2026-01-31 19:08:31.444-05	11a08e86-5e4e-4f28-b1f5-15d26e8aed35	0	t
d8d436d4-3d08-4d5b-aa2b-b3c84edd944e	Please select at least one property type	\N	2026-01-31 19:08:31.444-05	2026-01-31 19:08:31.444-05	11a08e86-5e4e-4f28-b1f5-15d26e8aed35	1	t
ec97b834-e509-499e-ad56-836c5e926813	This service requires agent and client contact information	\N	2026-01-31 19:08:31.444-05	2026-01-31 19:08:31.444-05	11a08e86-5e4e-4f28-b1f5-15d26e8aed35	2	t
5a4bcb05-791a-46d1-bd9c-d31224834d77	I'm buying a house!	\N	2026-03-21 17:09:18.950001-04	2026-03-21 17:09:18.950001-04	e4dd3170-4524-4074-9872-46d93fea6c65	3	t
5cefdfba-7739-40c4-8e84-d35badbcdc3d	This is what the buyer sees when they look at Buyer's Inspection	\N	2026-03-21 17:12:06.397649-04	2026-03-21 17:12:06.397649-04	e4dd3170-4524-4074-9872-46d93fea6c65	4	t
2d3c1ff4-7b6b-4e3c-84cf-2d06474452e3	My client needs more information	\N	2026-03-21 22:12:27.292508-04	2026-03-21 22:12:27.292508-04	e4dd3170-4524-4074-9872-46d93fea6c65	5	t
2a49773f-53f9-4551-8f9c-caae29ddf68c	I already own my home, and I have questions I need answered	\N	2026-03-21 22:13:47.016967-04	2026-03-21 22:13:47.016967-04	e4dd3170-4524-4074-9872-46d93fea6c65	6	t
\.


--
-- Data for Name: block_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.block_instances (id, name, order_index, block_shape_ref, created_at, updated_at, icon, base_sq_ft, active, composite, differential, allow_multiple, requires_unit_number, booking_mode, is_multi_family, requires_agent, pre_closing, agent_permissions, differential_event_role_overrides) FROM stdin;
f48a2b12-3de8-4f61-951b-779dbdc7b3cc	Condo/Co-op	8	c9d53a2f-fbbd-4a93-bb84-48c828617af4	2026-01-09 02:46:11.293147	2026-01-09 02:46:11.293147		0	t	f	false	f	t	false	f	f	f	false	{}
925ff678-2d75-47b0-adaa-23bff4c6e1e6	No Presentation	12	c3e2fbe7-5201-4151-8355-14ebe8741b48	2026-01-09 07:46:45.749	2026-01-09 07:46:45.749		0	t	f	override	f	f	false	f	f	f	false	{}
9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	Single Family Home	10	c9d53a2f-fbbd-4a93-bb84-48c828617af4	2026-01-09 02:46:21.151703	2026-02-23 21:18:00.689382		200	t	f	false	f	f	false	f	f	f	false	{}
bf374191-f440-447b-8b0f-b9f991031237	Extra Presentation Time	13	c3e2fbe7-5201-4151-8355-14ebe8741b48	2026-01-09 02:46:53.737148	2026-02-23 21:18:00.689382		200	t	f	false	f	f	false	f	f	f	false	{}
d8ac1b8d-60a1-44da-a953-c065fab9648a	Townhouse	9	c9d53a2f-fbbd-4a93-bb84-48c828617af4	2026-01-09 02:46:15.736263	2026-02-23 21:18:00.689382		0	t	f	false	f	f	false	f	f	f	false	{}
db3942c3-8d49-4a92-a2dd-73ac142d5701	Minimize Time-on-site	14	c3e2fbe7-5201-4151-8355-14ebe8741b48	2026-01-09 02:47:03.933061	2026-02-23 21:18:00.689382		0	t	f	false	f	f	false	f	f	f	false	{}
8f0d9ac5-3215-4eca-ae9c-7ba6ee60e533	Additional Presentation	15	c3e2fbe7-5201-4151-8355-14ebe8741b48	2026-01-09 02:47:16.674292	2026-02-23 21:18:00.689382		0	t	f	false	f	f	false	f	f	f	false	{}
a8f3b5ee-1918-468f-b62e-902ba39444a4	Public Servant	21	9acd044e-4470-4916-83fe-ac254eb6e7fe	2026-03-06 01:26:41.719964	2026-03-06 01:26:41.719964		0	t	f	false	f	f	false	f	f	f	false	{}
ff79708b-4edf-4981-bb2a-8ba9cd24fc5b	Multi Family Home	11	c9d53a2f-fbbd-4a93-bb84-48c828617af4	2026-01-09 07:46:29.229	2026-02-23 21:18:00.689382		0	t	f	false	f	f	false	t	f	f	false	{}
61352ee6-603f-4ede-85bb-fc45a6220d01	Friends and Family	22	9acd044e-4470-4916-83fe-ac254eb6e7fe	2026-03-06 01:26:55.183049	2026-03-06 01:26:55.183049		0	t	f	false	f	f	false	f	f	f	false	{}
053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	Negotiated Discount	23	9acd044e-4470-4916-83fe-ac254eb6e7fe	2026-03-06 01:27:07.903391	2026-03-06 01:27:07.903391		0	t	f	false	f	f	false	f	f	f	false	{}
93df4a57-a05f-4e25-a189-5f938da61c7e	Public Benefit Recipient	24	9acd044e-4470-4916-83fe-ac254eb6e7fe	2026-03-06 01:27:22.889189	2026-03-06 01:27:22.889189		0	t	f	false	f	f	false	f	f	f	false	{}
7e9e1f0a-2c8d-4b1e-9f6a-3d2c1b0a9e8f	Drive time	999	c3e2fbe7-5201-4151-8355-14ebe8741b48	2026-03-21 13:35:16.756105	2026-03-21 13:35:16.756105		0	t	f	false	f	f	true	f	f	f	false	{}
169b7f30-3091-4f80-9a93-7603ff06a359	Equipment Testing	2	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 20:51:44.825507	2026-02-23 21:18:00.689382		0	f	f	false	f	f	true	f	f	f	false	{}
d8a2f79e-938f-472a-9da6-d414c695aaec	Cosmetic Documentation	4	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 22:25:46.288576	2026-02-23 21:18:00.689382		0	t	f	false	f	f	true	f	f	f	false	{}
925a88dc-8f7c-40da-927f-79d46a794b9a	Buyer	0	c6e7ec8a-ed79-4280-b54c-3e8b75155168	2026-01-11 14:44:56.693	2026-01-11 14:44:56.693	tabler-currency-dollar	207	t	t	false	f	f	false	f	f	f	false	{}
1c6346af-469d-4b40-8cc9-1e48f2594f80	Cosmetic Observations	5	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 22:25:29.550444	2026-02-23 21:18:00.689382		0	t	f	false	f	f	true	f	f	f	false	{}
b35eb056-d45a-4f77-b1c8-41007edb1383	Visual Observations	6	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 20:57:54.845537	2026-02-23 21:18:00.689382		0	f	f	false	f	f	true	f	f	f	false	{}
c932a979-0337-4de9-83ac-a605f2ca1341	Owner	2	c6e7ec8a-ed79-4280-b54c-3e8b75155168	2026-01-09 02:45:05.78414	2026-02-23 21:18:00.689382	tabler-home	207	t	f	false	f	f	false	f	f	f	false	{}
d0ff7f22-8d37-4658-be60-01fba9a0bbd4	Developer	3	c6e7ec8a-ed79-4280-b54c-3e8b75155168	2026-01-09 10:51:01.846024	2026-01-09 10:51:01.846024		207	f	f	false	f	f	false	f	f	f	false	{}
309ee11d-5df3-4b65-a30c-bb47b2743613	Utility Testing	9	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 22:26:28.170632	2026-02-23 21:18:00.689382		0	f	f	false	f	f	true	f	f	f	false	{}
2c4cc469-8f51-4066-8ad2-75c790277e42	Equipment Observations	3	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 21:06:02.548754	2026-02-23 21:18:00.689382		0	f	f	false	f	f	true	f	f	f	false	{}
e411fa45-c892-4291-a8f8-6a9a6d42b240	Utility Observation	8	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 22:26:21.390253	2026-02-23 21:18:00.689382		0	f	f	false	f	f	true	f	f	f	false	{}
71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection	0	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-01-10 23:45:20.461	2026-01-10 23:45:20.461		200	t	t	true	f	f	false	f	f	t	false	{}
6bf75af9-8a55-415f-9ae4-c038a1f34e61	Walk & Talk	1	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-01-09 17:45:27.614	2026-01-09 17:45:27.614		205	t	t	false	f	f	false	f	f	f	false	{}
06ebc6fb-c582-4377-9e16-6d989b0536aa	Blue Tape	1000	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-03-21 22:54:08.043	2026-03-21 22:54:08.043		0	t	t	false	f	f	true	f	f	f	false	{}
20d52207-ae48-4552-9078-75c0b94abc4d	Infrared Observations	7	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-02-10 21:05:22.741992	2026-02-23 21:18:00.689382		0	f	f	false	f	f	true	f	f	f	false	{}
30b9bf19-373b-4c52-a672-cf8953559b2b	Radon	1001	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2026-03-21 18:54:44.372871	2026-03-21 18:54:44.372871		0	t	f	false	f	f	true	f	f	f	false	{}
40b16b79-d5df-4f30-9dec-509e2a65d7f3	Agent	1	c6e7ec8a-ed79-4280-b54c-3e8b75155168	2026-01-09 07:45:02.088	2026-02-24 02:18:00.689	tabler-briefcase	207	t	f	false	f	f	false	f	f	f	false	{}
\.


--
-- Data for Name: annotation_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.annotation_assignments (id, block_instance_id, annotation_id, created_at, updated_at, user_type_block_instance_id, disabled) FROM stdin;
e6cce2f1-fba5-4199-8e3f-76a7328227a5	925a88dc-8f7c-40da-927f-79d46a794b9a	5a4bcb05-791a-46d1-bd9c-d31224834d77	2026-03-21 17:09:19.036891-04	2026-03-21 17:09:19.036891-04	\N	f
782d29ed-e4d3-49f8-8b78-bb94614b57f5	71d4e133-0007-40b5-b249-7f1c9d2f7772	5cefdfba-7739-40c4-8e84-d35badbcdc3d	2026-03-21 17:12:06.502017-04	2026-03-21 17:12:06.502017-04	\N	f
55869307-0fe8-404e-b3a3-0f3a448cd90a	40b16b79-d5df-4f30-9dec-509e2a65d7f3	2d3c1ff4-7b6b-4e3c-84cf-2d06474452e3	2026-03-21 22:12:27.360508-04	2026-03-21 22:12:27.360508-04	\N	f
1de0458b-d08b-4bab-976a-28411f4596ee	c932a979-0337-4de9-83ac-a605f2ca1341	2a49773f-53f9-4551-8f9c-caae29ddf68c	2026-03-21 22:13:47.107631-04	2026-03-21 22:13:47.107631-04	\N	f
\.


--
-- Data for Name: annotation_instance_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.annotation_instance_content (id, annotation_instance_id, user_type_block_instance_id, text, created_at, updated_at) FROM stdin;
e3ab6dd6-975f-4ff4-befc-b409a902c508	bc8f2e30-f2e4-4123-8985-183f5f209ac9	\N	I already own a property but need to understand it better	2026-03-21 12:02:50.755626-04	2026-03-21 12:02:50.755626-04
864b388e-9154-4df3-b994-236306b6c7ac	a5f86098-1e84-4929-b7ed-fd1e02add376	\N	I need an inspection to help me understand a property that I am trying to buy	2026-03-21 12:02:50.755626-04	2026-03-21 12:02:50.755626-04
4d75767b-10c9-44f1-b6e5-c95c2a5498eb	33668c33-1d05-4db4-b01e-9673c1b1fb8b	\N	I am a real estate agent helping a buyer with their inspection needs	2026-03-21 12:02:50.755626-04	2026-03-21 12:02:50.755626-04
dcc17e66-4174-44df-92cd-2d106c4bb2d6	7490090a-0cb0-4c06-b58a-36d5fb3765ac	\N	Number of units is required for multi-family properties	2026-03-21 12:02:50.755626-04	2026-03-21 12:02:50.755626-04
442a903a-e05c-447a-8d3a-f4fb6737b290	d8d436d4-3d08-4d5b-aa2b-b3c84edd944e	\N	Please select at least one property type	2026-03-21 12:02:50.755626-04	2026-03-21 12:02:50.755626-04
8a9e0be2-9f4e-4c27-8512-f64f063970db	ec97b834-e509-499e-ad56-836c5e926813	\N	This service requires agent and client contact information	2026-03-21 12:02:50.755626-04	2026-03-21 12:02:50.755626-04
e8d10924-1491-4f77-a8c4-af96b03f8b19	5a4bcb05-791a-46d1-bd9c-d31224834d77	\N	I'm buying a house!	2026-03-21 17:09:18.957286-04	2026-03-21 17:09:18.957286-04
6cb9dbd2-1ef6-493c-afff-1b83dd0bc2fb	5cefdfba-7739-40c4-8e84-d35badbcdc3d	\N	This is what the buyer sees when they look at Buyer's Inspection	2026-03-21 17:12:06.404384-04	2026-03-21 17:12:06.404384-04
7188b8dc-2842-4e9f-ad7a-a950926fc48e	5cefdfba-7739-40c4-8e84-d35badbcdc3d	925a88dc-8f7c-40da-927f-79d46a794b9a	This is what the buyer sees when they look at Buyer's Inspection	2026-03-21 17:12:06.405682-04	2026-03-21 17:12:06.405682-04
1f13ad82-a022-43c6-a1f9-93e72184415a	5cefdfba-7739-40c4-8e84-d35badbcdc3d	40b16b79-d5df-4f30-9dec-509e2a65d7f3	Agents see this when they look at the Buyer's Inspection	2026-03-21 17:12:06.40728-04	2026-03-21 17:12:06.40728-04
3dea78d5-dd36-4b9a-b421-7db90b5bb60f	5cefdfba-7739-40c4-8e84-d35badbcdc3d	c932a979-0337-4de9-83ac-a605f2ca1341	owner's shouldn't see buyer's inspection	2026-03-21 17:12:06.407978-04	2026-03-21 17:12:06.407978-04
d3d0125c-69ee-4d8b-b6f8-a37475e8095a	2d3c1ff4-7b6b-4e3c-84cf-2d06474452e3	\N	My client needs more information	2026-03-21 22:12:27.300235-04	2026-03-21 22:12:27.300235-04
71ead676-0c63-4c69-b048-58cbe8e978e1	2a49773f-53f9-4551-8f9c-caae29ddf68c	\N	I already own my home, and I have questions I need answered	2026-03-21 22:13:47.020664-04	2026-03-21 22:13:47.020664-04
\.


--
-- Data for Name: property_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_versions (id, address_id, created_at, updated_at) FROM stdin;
36be7202-7369-4e25-bef8-5604e55450ec	87e1435a-9ac6-494e-a069-6540fa0ce8cc	2026-01-03 16:37:37.769-05	2026-01-03 16:37:37.769-05
bce735b7-2d99-4399-a200-05bde624319b	b3613851-4727-426c-ae39-a2551437443a	2026-01-03 16:37:37.78-05	2026-01-03 16:37:37.78-05
a3b82dd7-dd39-43a5-a9a3-592732d47153	3f92f8dc-0991-4196-85e3-8ec657a2ce73	2026-01-03 16:37:37.797-05	2026-01-03 16:37:37.797-05
60e1c91a-3ac0-4369-931a-5f030083c2c1	9b2df3f0-a4dc-430a-aecf-7409ddb95d4c	2026-01-03 16:37:37.804-05	2026-01-03 16:37:37.804-05
dfde6ac8-80aa-447a-b6ce-e0f024107cd2	be6ff537-cfea-4772-919b-ea74aa3b7150	2026-01-03 16:37:37.811-05	2026-01-03 16:37:37.811-05
aaed68b3-769d-494f-9d46-066a12c75d18	ed180e43-41f6-47b9-b9ac-47ad35d6a874	2026-01-03 16:37:37.815-05	2026-01-03 16:37:37.815-05
08f60b0f-90c2-4a03-a7c7-08b4702d1924	1f88ca40-1fbc-4a78-b3bd-765fb4b40bae	2026-01-03 16:37:37.817-05	2026-01-03 16:37:37.817-05
0324a23f-1404-4fa6-91b2-7ba1e6d1bf3f	238965d2-1ed0-404b-85f4-5eee106cb1a7	2026-01-03 16:37:37.822-05	2026-01-03 16:37:37.822-05
95b26d9b-f284-4792-942b-ce2fe5f0f990	48fe339a-e141-4490-8a4a-85018ac1d340	2026-01-03 16:37:37.826-05	2026-01-03 16:37:37.826-05
d6b91b78-b3cb-43cc-b4f1-2a883efb8d1b	0ab7580c-b685-4866-b039-dabccf0149d6	2026-01-03 16:37:37.831-05	2026-01-03 16:37:37.831-05
db6b1800-b430-415f-9f9f-d99b95d80af3	e1a6084c-6070-4a67-af0a-97aa7700bbde	2026-01-03 16:37:37.836-05	2026-01-03 16:37:37.836-05
6db6520e-0dd9-42da-9df6-275c54d8c50f	e6e6eed5-9e65-46c3-b5c4-4ab0261da11b	2026-01-03 16:37:37.839-05	2026-01-03 16:37:37.839-05
837ce8a9-c2ff-43fa-8c89-a6396a46c2e3	f09f5136-0d22-47bb-9a3e-53e3eb7b4d59	2026-01-03 16:37:37.842-05	2026-01-03 16:37:37.842-05
e2086f8b-e311-4654-90e6-8a6c657cf472	35a85294-3528-46d0-bb2b-3d1bde2eb1b2	2026-01-03 16:37:37.844-05	2026-01-03 16:37:37.844-05
6d491803-198a-406e-8095-17339e94d520	8aa0866c-ffb2-4717-8a38-66ae679101be	2026-01-03 16:37:37.846-05	2026-01-03 16:37:37.846-05
a5073149-fc1d-43dc-b39e-b6417d8dc492	18e46410-6125-4783-bda8-c3fae01c2e38	2026-01-03 16:37:37.85-05	2026-01-03 16:37:37.85-05
d8eed4a4-a1c6-4f22-9cd7-e9370f3e2fc4	2048e6c8-f918-4d4a-811d-7c0e01341ec6	2026-01-03 16:37:37.856-05	2026-01-03 16:37:37.856-05
98e669c4-d073-4418-94ad-6d5e0c53d015	379f6903-af39-40ec-adcb-c7380074d2da	2026-01-03 16:37:37.862-05	2026-01-03 16:37:37.862-05
a7c6151f-766d-429d-9807-1e0bc4bfcac7	424a3cc2-15cf-4b48-9312-9479d827d26c	2026-01-03 16:37:37.867-05	2026-01-03 16:37:37.867-05
b6405afd-534e-41a3-bc02-cb1ae7ec1771	790de681-c6d8-4572-ad1d-3f8a857f869f	2026-01-03 16:37:37.869-05	2026-01-03 16:37:37.869-05
88aea53d-8d90-41de-bf78-8be96271c03b	0ccc0f89-79cc-4885-a0b3-c60d2c1540f7	2026-01-03 16:37:37.874-05	2026-01-03 16:37:37.874-05
2c63ca4b-dd41-4b97-9ff4-5439ed2d7b03	a8534a27-be05-4305-a616-ae9bd2424a3b	2026-01-03 16:37:37.879-05	2026-01-03 16:37:37.879-05
4d66b65e-66ea-42bc-a190-3adf79070217	6003c3e9-f984-42f4-b93c-4d787fa17a26	2026-01-03 16:37:37.883-05	2026-01-03 16:37:37.883-05
23cc1b89-c880-4675-ba43-232b003a8e67	f08a1d47-ecc3-4355-a734-bda075961e8d	2026-01-03 16:37:37.887-05	2026-01-03 16:37:37.887-05
702e1655-6b78-4aac-bda7-5411410d2ad1	aa3b0ece-0438-48ac-8af4-f8baf69f3686	2026-01-03 16:37:37.89-05	2026-01-03 16:37:37.89-05
07461c33-c3d2-4d40-a214-f1db5c3197fd	88d9593e-c5f1-4a7c-8af0-63d2b67e937b	2026-01-03 16:37:37.894-05	2026-01-03 16:37:37.894-05
c5e45412-6ee9-4a1a-b109-e12fd8db4a2c	af04e87f-ab45-45d8-baa3-5db6d9a89b4c	2026-01-03 16:37:37.896-05	2026-01-03 16:37:37.896-05
909cd25a-b36b-4ab5-861d-e78005060be0	e45bb90e-bd47-43d4-805a-e9ff269f7a74	2026-01-03 16:37:37.9-05	2026-01-03 16:37:37.9-05
59b57f05-e653-41bf-a66e-36cacfd6b3b3	a108f0af-83c7-4da6-a0c6-6088cdcc84a4	2026-01-03 16:37:37.902-05	2026-01-03 16:37:37.902-05
14395b07-44ed-439d-bb1c-1ce0dd48b6f7	ce9dcefc-6c1f-4535-b92a-6ded51542a72	2026-01-03 16:37:37.907-05	2026-01-03 16:37:37.907-05
b01ac9c8-9eba-4bd4-af4c-c8bce81d9ff2	87e1435a-9ac6-494e-a069-6540fa0ce8cc	2026-01-09 01:48:39.15894-05	2026-01-09 01:48:39.15894-05
a4babe1c-2a42-46c0-bc1e-682c120a3d3a	aa3b0ece-0438-48ac-8af4-f8baf69f3686	2026-01-27 21:36:12.622276-05	2026-01-27 21:36:12.622276-05
f03f10fa-d9c3-4cb3-8f84-472be69ff03e	ce9dcefc-6c1f-4535-b92a-6ded51542a72	2026-01-29 19:26:48.617208-05	2026-01-29 19:26:48.617208-05
5f0d6c40-3b9f-4754-a053-abcf92eb745d	0ccc0f89-79cc-4885-a0b3-c60d2c1540f7	2026-02-01 14:31:46.278713-05	2026-02-01 14:31:46.278713-05
a1abfb4f-57e8-4621-9c09-367b6940da05	b3613851-4727-426c-ae39-a2551437443a	2026-02-01 14:38:07.868498-05	2026-02-01 14:38:07.868498-05
1402674b-6479-49cb-bc1b-2c8733de7840	b3613851-4727-426c-ae39-a2551437443a	2026-02-01 14:41:49.672767-05	2026-02-01 14:41:49.672767-05
1755fbfc-ac6e-45e2-aafa-f467fb69b04c	6003c3e9-f984-42f4-b93c-4d787fa17a26	2026-02-01 14:45:40.412176-05	2026-02-01 14:45:40.412176-05
514855ac-cc9b-4b53-b242-1590cd2cb6e4	6003c3e9-f984-42f4-b93c-4d787fa17a26	2026-02-01 14:48:30.566991-05	2026-02-01 14:48:30.566991-05
cc0583c4-b9ce-4d31-a768-23821b406698	b3613851-4727-426c-ae39-a2551437443a	2026-02-01 14:54:31.216076-05	2026-02-01 14:54:31.216076-05
6cdfd9d3-0688-4a21-bb02-8a6296cb3d9d	6003c3e9-f984-42f4-b93c-4d787fa17a26	2026-02-01 15:08:04.95642-05	2026-02-01 15:08:04.95642-05
a7369ade-7bbc-497a-9823-81740e60b941	6003c3e9-f984-42f4-b93c-4d787fa17a26	2026-02-01 15:09:52.377004-05	2026-02-01 15:09:52.377004-05
4b263c34-755a-452c-904e-9bca9f80b23d	be6ff537-cfea-4772-919b-ea74aa3b7150	2026-02-01 15:13:30.594019-05	2026-02-01 15:13:30.594019-05
11724304-9569-4e52-a81b-c441741bc37e	be6ff537-cfea-4772-919b-ea74aa3b7150	2026-02-01 15:14:23.924105-05	2026-02-01 15:14:23.924105-05
315e8bd4-a5b9-48dd-bce7-375e87a9e151	48fe339a-e141-4490-8a4a-85018ac1d340	2026-02-01 15:25:32.634841-05	2026-02-01 15:25:32.634841-05
22566be7-37a9-408a-8d34-35addf7e7708	379f6903-af39-40ec-adcb-c7380074d2da	2026-02-01 15:33:46.971258-05	2026-02-01 15:33:46.971258-05
57aa2c13-8b9c-441b-8fe8-1eb2b613285f	8b2338ba-9485-4013-9c61-ef17b6b46417	2026-02-02 09:54:33.707681-05	2026-02-02 09:54:33.707681-05
14d1dcee-0651-48db-b6c3-455e18c1c6e8	dd5026f8-d3bc-4345-822e-8f0d77e6c458	2026-02-25 20:26:04.244259-05	2026-02-25 20:26:04.244259-05
9f0dad4e-2551-4065-b1bc-92dec2e5d3d2	dd5026f8-d3bc-4345-822e-8f0d77e6c458	2026-02-25 20:26:55.191821-05	2026-02-25 20:26:55.191821-05
bb353343-e842-4bef-991c-ae1490e34660	b02e7a8e-a864-4bda-ade7-c564d7ef0f39	2026-02-25 20:27:19.90465-05	2026-02-25 20:27:19.90465-05
20580e85-d3b3-4abc-b06e-56a27ee7d762	424a3cc2-15cf-4b48-9312-9479d827d26c	2026-02-26 17:53:12.94704-05	2026-02-26 17:53:12.94704-05
e0101dab-faa5-4c3a-b0a1-c9cebd76958f	2048e6c8-f918-4d4a-811d-7c0e01341ec6	2026-02-26 22:39:15.705724-05	2026-02-26 22:39:15.705724-05
7b64ebb2-579b-48e2-a5e4-a517bf55c152	424a3cc2-15cf-4b48-9312-9479d827d26c	2026-02-27 16:50:46.433047-05	2026-02-27 16:50:46.433047-05
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, first_name, last_name, email, phone, user_role, login_id, created_at, updated_at) FROM stdin;
14c91ba6-cf1b-489b-8058-6efafc204602	Me	ButForPlayPlay	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 14:31:46.344752-05	2026-02-01 14:31:46.344752-05
69624d6b-d7b5-47fd-96f2-64a5dddfe70e	Michael	Newowner	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 14:45:40.512467-05	2026-02-01 14:45:40.512467-05
ca64b1c8-b1f7-443a-b07b-8f40bded4995	Michael	Newowner	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 14:48:30.878337-05	2026-02-01 14:48:30.878337-05
e07b2c01-f484-49ae-9238-acab765129c9	Emily	Houseseeker	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 14:54:31.308951-05	2026-02-01 14:54:31.308951-05
0f3f994b-4b02-49ff-b21a-a5f0e099134e	Michael	Newowner	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 15:08:05.164821-05	2026-02-01 15:08:05.164821-05
05f19688-5e46-4a67-9ad9-61075baa9177	Michael	Newowner	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 15:09:52.542888-05	2026-02-01 15:09:52.542888-05
505a3d50-5dca-4ceb-8972-09941d851f28	Emily	Houseseeker	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 15:13:30.673148-05	2026-02-01 15:13:30.673148-05
0e3c727e-014e-4529-aef8-652ac09f7d6a	David	Park	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 15:13:30.70117-05	2026-02-01 15:13:30.70117-05
0d209db0-60eb-4219-ac81-3472a01c75aa	Michael	Newowner	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 15:25:32.714669-05	2026-02-01 15:25:32.714669-05
6c05ed33-e4ce-4924-b54f-9e35b3c53e0d	David	Means	david.means1975@gmail.com	\N	client	\N	2026-02-01 15:33:47.050934-05	2026-02-01 15:33:47.050934-05
c265adb6-6980-4c45-b669-50545c12c43d	David	Means	david.means1975@gmail.com	\N	client	\N	2026-02-02 09:54:33.805032-05	2026-02-02 09:54:33.805032-05
6f19abbc-4918-4a06-bfd2-03448b9607e6	Amanda	Realestateclient	test.client.amanda.realestateclient.8@districthomepro.com	\N	client	\N	2026-02-25 20:26:04.36983-05	2026-02-25 20:26:04.36983-05
ca4f64b5-b653-44b1-b4f2-6210edb7ec10	Amanda	Realestateclient	test.client.amanda.realestateclient.8@districthomepro.com	\N	client	\N	2026-02-25 20:26:55.284415-05	2026-02-25 20:26:55.284415-05
77693625-2417-4f6a-8971-947da698b072	David	Propertybuyer	test.client.david.propertybuyer.5@districthomepro.com	\N	client	\N	2026-02-25 20:27:19.984508-05	2026-02-25 20:27:19.984508-05
cb293813-9d2b-48c3-8cc1-49373c1f10fc	Sarah	Purchaser	test.client.sarah.purchaser.2@districthomepro.com	\N	client	\N	2026-02-26 17:53:13.058254-05	2026-02-26 17:53:13.058254-05
ba470a2b-f40a-4151-8763-4db05627100c	Sarah	Purchaser	test.client.sarah.purchaser.2@districthomepro.com	\N	client	\N	2026-02-26 22:39:15.817697-05	2026-02-26 22:39:15.817697-05
7d3f3796-def8-49fd-829e-57a3f8a2cd85	Sarah	Purchaser	test.client.sarah.purchaser.2@districthomepro.com	\N	client	\N	2026-02-27 16:50:46.57927-05	2026-02-27 16:50:46.57927-05
64f88721-05fb-49e4-a413-abb9aa9af7db	Todd	Litchfield	test.agent.todd.litchfield.64f887@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.643942-05	2026-01-03 16:37:37.643942-05
4aa824a1-7612-40fa-829d-ad5588660f95	Tom	Miller	test.agent.tom.miller.4aa824@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.776879-05	2026-01-03 16:37:37.776879-05
5332f171-1509-4c56-8284-22023d8ae132	Lucciola	Client	test.agent.lucciola.client.5332f1@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.784935-05	2026-01-03 16:37:37.784935-05
bfa05983-97a4-4122-bf7f-585fa9825d65	Eddie	Suarez	test.agent.eddie.suarez.bfa059@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.788683-05	2026-01-03 16:37:37.788683-05
b51bd652-a9dd-48fd-8b13-5b44239e2695	Royi	Client	test.agent.royi.client.b51bd6@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.792105-05	2026-01-03 16:37:37.792105-05
efac2245-fc02-4742-8c7d-189de7eb5f04	Jenn	Client	test.agent.jenn.client.efac22@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.795285-05	2026-01-03 16:37:37.795285-05
2e535fe7-f48b-4abe-be5d-aef513a6d91a	Eddie	Suarez	test.agent.eddie.suarez.2e535f@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.800224-05	2026-01-03 16:37:37.800224-05
f0966d91-1f50-428b-8cb4-cce2de9a923a	Thomas	Snow	test.agent.thomas.snow.f0966d@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.802066-05	2026-01-03 16:37:37.802066-05
6f3b5c25-0e29-46ee-b41a-82a624e76d17	David	Park	test.agent.david.park.6f3b5c@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.809001-05	2026-01-03 16:37:37.809001-05
f5340528-e901-42b5-9067-db445e5a57b5	Jen	Angotti	test.agent.jen.angotti.f53405@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.814116-05	2026-01-03 16:37:37.814116-05
63c8c882-01d0-4442-a151-4653ce1bb804	Monique	Van Blaricom	test.agent.monique.van.blaricom.63c8c8@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.819804-05	2026-01-03 16:37:37.819804-05
1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	Ryan	Tyndall	test.agent.ryan.tyndall.1671ae@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.829325-05	2026-01-03 16:37:37.829325-05
9f1b0054-3548-4461-aacf-333640ee3f4a	Emma	Mac	test.agent.emma.mac.9f1b00@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.833964-05	2026-01-03 16:37:37.833964-05
a8b9c58e-5ce9-42dd-9000-2ef1373e2435	Fernando	Garcia	test.agent.fernando.garcia.a8b9c5@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.848579-05	2026-01-03 16:37:37.848579-05
187964a9-29b7-4347-8479-191d1f3980ac	Leslie	Brenowitz	test.agent.leslie.brenowitz.187964@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.85317-05	2026-01-03 16:37:37.85317-05
03d484a3-cabe-43d6-b1c7-5ef65d449d06	George	Lima	test.agent.george.lima.03d484@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.860033-05	2026-01-03 16:37:37.860033-05
b1f3c908-ad01-41f1-ae7b-e566ac5eb5f8	Jason	Townsend	test.agent.jason.townsend.b1f3c9@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.865178-05	2026-01-03 16:37:37.865178-05
2f70b8ab-9b68-4d11-a560-2762939aef77	Nezam	Hamiki	test.agent.nezam.hamiki.2f70b8@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.872388-05	2026-01-03 16:37:37.872388-05
5c505f36-a4d6-4e9c-82ae-8f93c170b03b	Renee	Peres	test.agent.renee.peres.5c505f@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.877248-05	2026-01-03 16:37:37.877248-05
a2bbb9a1-feed-4485-a6cf-bf08fa9b2e42	Jill	Judge	test.agent.jill.judge.a2bbb9@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.881573-05	2026-01-03 16:37:37.881573-05
511e125a-1e5b-4ffb-a2c1-a436d06adc41	John	Murray	test.agent.john.murray.511e12@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.885116-05	2026-01-03 16:37:37.885116-05
24cee186-4fde-4baa-8a74-b17561ee9584	Alex	Fox	test.agent.alex.fox.24cee1@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.892649-05	2026-01-03 16:37:37.892649-05
277178f0-6c51-4393-8cc9-e0cd29249230	Alison	Scimeca	test.agent.alison.scimeca.277178@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.898611-05	2026-01-03 16:37:37.898611-05
1e9e4ff0-e5df-4dd2-9dcb-380e15174d03	Jay	Fazio	test.agent.jay.fazio.1e9e4f@districthomepro.com	\N	agent	\N	2026-01-03 16:37:37.904737-05	2026-01-03 16:37:37.904737-05
ae7655cb-af0f-4ce5-9065-c57612ab7fda	John	Homebuyer	test.client.john.homebuyer.1@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
2767dbe2-895a-42f4-a9d0-4adcdbc6b26d	Sarah	Purchaser	test.client.sarah.purchaser.2@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
02c183db-00b9-4939-a24e-5faee6536cc3	Michael	Newowner	test.client.michael.newowner.3@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
e6fdf898-9460-4129-ad5d-0e4f0d980036	Emily	Houseseeker	test.client.emily.houseseeker.4@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
180c9ceb-68a2-44f7-a3c8-a4a854c720a8	David	Propertybuyer	test.client.david.propertybuyer.5@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
c77cfe76-f691-4151-9d3a-d88902762ee3	Jessica	Homeshopper	test.client.jessica.homeshopper.6@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
e8a01f0b-ee5f-48f5-9cdc-c8ad1a78b5c8	Robert	Estateclient	test.client.robert.estateclient.7@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
fe7140bf-1416-4b1d-91dd-fe0d165784fe	Amanda	Realestateclient	test.client.amanda.realestateclient.8@districthomepro.com	555-0100	client	\N	2026-01-07 11:53:08.988287-05	2026-01-07 11:53:08.988287-05
86eb24ea-2ef2-4862-b09a-d0d3430f3658	WhoNeeds	AnAgentAnyways	scheduling@districthomepro.com	\N	agent	\N	2026-02-01 14:31:46.371579-05	2026-02-01 14:31:46.371579-05
7fb454f1-f8f3-425a-92ce-052efd9091e0	Emily	Houseseeker	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 14:41:49.840631-05	2026-02-01 14:41:49.840631-05
d5c629d0-6c89-4b77-a297-02a7a921e361	Tom	Miller	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 14:41:49.894068-05	2026-02-01 14:41:49.894068-05
ce555229-1ec3-4e01-aaef-6386185a069c	Jill	Judge	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 14:45:40.544011-05	2026-02-01 14:45:40.544011-05
1f884ac2-de2f-4a99-bd80-bd8d0afbf8dc	Jill	Judge	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 14:48:31.036613-05	2026-02-01 14:48:31.036613-05
50b7b93f-1535-4d22-bb01-9dc54a5ee92f	Tom	Miller	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 14:54:31.368633-05	2026-02-01 14:54:31.368633-05
0e140beb-6ce8-428d-9e71-8ce380b391ed	Jill	Judge	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 15:08:05.382263-05	2026-02-01 15:08:05.382263-05
ca9559eb-3bae-4a0a-a2b1-1205103ed256	Jill	Judge	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 15:09:52.665936-05	2026-02-01 15:09:52.665936-05
d327338f-4efb-46e2-9cf4-91480af3ef9d	Emily	Houseseeker	hcearwick1132@gmail.com	\N	client	\N	2026-02-01 15:14:23.988747-05	2026-02-01 15:14:23.988747-05
84603f01-2755-4329-9701-ca20ba1d43d0	David	Park	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 15:14:24.01849-05	2026-02-01 15:14:24.01849-05
bffbf0a4-9c85-44e9-85d9-2844bf4b4afa	Tom	Miller	will.b.whittaker@gmail.com	\N	agent	\N	2026-02-01 15:25:32.750726-05	2026-02-01 15:25:32.750726-05
2336039b-8785-4e86-81fd-bc36545cce45	Ken	Rub	krub@ttrsir.com	\N	agent	\N	2026-02-01 15:33:47.092345-05	2026-02-01 15:33:47.092345-05
d154468c-564f-4c94-91df-c844b2b13381	Ken	Rub	krub@ttrsir.com	\N	agent	\N	2026-02-02 09:54:33.833047-05	2026-02-02 09:54:33.833047-05
3f428b3f-6d9c-4d4f-8e9d-8b58e97edaed	Alison	Scimeca	test.agent.alison.scimeca.277178@districthomepro.com	\N	agent	\N	2026-02-25 20:26:04.370486-05	2026-02-25 20:26:04.370486-05
c38f3ded-8cbb-4083-a1d3-909d5940b661	Alison	Scimeca	test.agent.alison.scimeca.277178@districthomepro.com	\N	agent	\N	2026-02-25 20:26:55.286793-05	2026-02-25 20:26:55.286793-05
b4bc58cc-ddff-4ba8-8d81-f61ce86a6efe	Ryan	Tyndall	test.agent.ryan.tyndall.1671ae@districthomepro.com	\N	agent	\N	2026-02-25 20:27:19.984965-05	2026-02-25 20:27:19.984965-05
e58fdd91-ad0f-42f4-b566-2e726ed3caa1	Jason	Townsend	test.agent.jason.townsend.b1f3c9@districthomepro.com	\N	agent	\N	2026-02-26 17:53:13.059167-05	2026-02-26 17:53:13.059167-05
620843ad-a6e4-46c7-89ac-41f8bcf5ef4c	Leslie	Brenowitz	test.agent.leslie.brenowitz.187964@districthomepro.com	\N	agent	\N	2026-02-26 22:39:15.818394-05	2026-02-26 22:39:15.818394-05
fc76fac3-1549-4bb1-9136-1388f46998a7	Jason	Townsend	test.agent.jason.townsend.b1f3c9@districthomepro.com	\N	agent	\N	2026-02-27 16:50:46.580003-05	2026-02-27 16:50:46.580003-05
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, user_type_id, selected_date, selected_date_range_end, is_quote_mode, quote_pdf_url, created_at, updated_at, property_version_id, status, scheduled_by_id, service_snapshots, property_snapshots, option_snapshots, held_by, held_until, submitted_at, confirmed_at, confirmed_by, override_constraint_capacity, override_constraint_buffer, override_constraint_blackout, override_constraint_business_hours) FROM stdin;
d9d83e3b-9c40-4bc6-8b1e-51c4e00b63a7	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-18	\N	f	\N	2026-01-03 16:46:30.384633-05	2026-02-23 12:46:25.392703-05	dfde6ac8-80aa-447a-b6ce-e0f024107cd2	submitted	24cee186-4fde-4baa-8a74-b17561ee9584	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
b4b7b66a-9bf6-47d5-94de-74e6df1bfc33	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-06	\N	f	\N	2026-01-03 16:46:30.375661-05	2026-02-23 12:46:25.392703-05	a3b82dd7-dd39-43a5-a9a3-592732d47153	submitted	b51bd652-a9dd-48fd-8b13-5b44239e2695	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
495cbe96-a981-4479-8fb8-c4373ebe50d0	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-09	\N	f	\N	2026-01-03 16:46:30.381635-05	2026-02-23 12:46:25.392703-05	60e1c91a-3ac0-4369-931a-5f030083c2c1	submitted	e6fdf898-9460-4129-ad5d-0e4f0d980036	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
b53c2681-2168-4ecc-bf9e-39e14dbd6791	\N	2026-02-01	\N	f	\N	2026-02-01 15:13:30.740849-05	2026-02-01 15:13:30.740849-05	4b263c34-755a-452c-904e-9bca9f80b23d	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
ae839f86-4045-49cf-b8ca-fb459580cbb6	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-23	\N	f	\N	2026-01-03 16:46:30.410061-05	2026-02-23 12:46:25.392703-05	837ce8a9-c2ff-43fa-8c89-a6396a46c2e3	submitted	9f1b0054-3548-4461-aacf-333640ee3f4a	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
fbfd8373-4275-4be8-bc9a-2b4520b37db9	\N	2026-02-01	\N	f	\N	2026-02-01 14:31:46.424176-05	2026-02-01 14:31:46.424176-05	5f0d6c40-3b9f-4754-a053-abcf92eb745d	started	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
391cb75e-a359-43ff-9a6b-0b044ae1dda1	\N	2026-02-01	\N	f	\N	2026-02-01 15:14:24.056142-05	2026-02-01 15:14:24.056142-05	11724304-9569-4e52-a81b-c441741bc37e	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
dbf3af56-1b65-4742-b46e-da6cd034898e	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-22	\N	f	\N	2026-01-03 16:46:30.405773-05	2026-02-23 12:46:25.392703-05	6db6520e-0dd9-42da-9df6-275c54d8c50f	submitted	6f3b5c25-0e29-46ee-b41a-82a624e76d17	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
2e112b1d-9b25-4e3f-a554-07a4350730ea	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-02	\N	f	\N	2026-01-03 16:46:30.418882-05	2026-02-23 12:46:25.392703-05	a5073149-fc1d-43dc-b39e-b6417d8dc492	submitted	2767dbe2-895a-42f4-a9d0-4adcdbc6b26d	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
66021dd6-7fdc-4b46-abe5-03a255328cbe	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-04	\N	f	\N	2026-01-03 16:46:30.421267-05	2026-02-23 12:46:25.392703-05	d8eed4a4-a1c6-4f22-9cd7-e9370f3e2fc4	submitted	9f1b0054-3548-4461-aacf-333640ee3f4a	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
645fdf36-7af9-4f55-affd-b8a27f68f77b	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-19	\N	f	\N	2026-01-03 16:46:30.390768-05	2026-02-23 12:46:25.392703-05	08f60b0f-90c2-4a03-a7c7-08b4702d1924	submitted	e6fdf898-9460-4129-ad5d-0e4f0d980036	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
9ab351cb-4480-4732-99fd-7eff9a976f4c	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-04	\N	f	\N	2026-01-03 16:46:30.369387-05	2026-02-23 12:46:25.392703-05	bce735b7-2d99-4399-a200-05bde624319b	submitted	efac2245-fc02-4742-8c7d-189de7eb5f04	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
2886ae5e-491e-4a1f-918c-6caeb3307305	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-02	\N	f	\N	2026-01-03 16:46:30.358667-05	2026-02-23 12:46:25.392703-05	36be7202-7369-4e25-bef8-5604e55450ec	submitted	a8b9c58e-5ce9-42dd-9000-2ef1373e2435	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
408b7c91-61dd-4303-8d56-d8c1da071372	\N	2026-02-01	\N	f	\N	2026-02-01 14:41:49.94716-05	2026-02-01 14:41:49.94716-05	1402674b-6479-49cb-bc1b-2c8733de7840	started	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
c77385ac-b1f8-4d0f-84c7-226feb6556bf	\N	2026-02-01	\N	f	\N	2026-02-01 15:25:32.798303-05	2026-02-01 15:25:32.798303-05	315e8bd4-a5b9-48dd-bce7-375e87a9e151	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
719da0db-d0ab-48ab-9acc-5ad6481569ec	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-05	\N	f	\N	2026-01-03 16:46:30.423977-05	2026-02-23 12:46:25.392703-05	98e669c4-d073-4418-94ad-6d5e0c53d015	submitted	4aa824a1-7612-40fa-829d-ad5588660f95	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
5d2b8fb4-64ac-4b1d-97ad-f61e1a3c7b8e	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-27	\N	f	\N	2026-01-03 16:46:30.451103-05	2026-02-23 12:46:25.392703-05	59b57f05-e653-41bf-a66e-36cacfd6b3b3	submitted	9f1b0054-3548-4461-aacf-333640ee3f4a	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
c12a5aed-3e0b-4a9f-ab72-d7af2675f58b	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-29	\N	f	\N	2026-01-03 16:46:30.453874-05	2026-02-23 12:46:25.392703-05	14395b07-44ed-439d-bb1c-1ce0dd48b6f7	submitted	a8b9c58e-5ce9-42dd-9000-2ef1373e2435	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
a9c0ed3b-00dc-4baa-bfdd-d1fe61f9a10b	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-21	\N	f	\N	2026-01-03 16:46:30.402963-05	2026-02-23 12:46:25.392703-05	db6b1800-b430-415f-9f9f-d99b95d80af3	submitted	1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
abb89c40-8d24-4e8f-9608-582bb797ca53	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-05	\N	f	\N	2026-01-03 16:46:30.426563-05	2026-02-23 12:46:25.392703-05	a7c6151f-766d-429d-9807-1e0bc4bfcac7	submitted	bfa05983-97a4-4122-bf7f-585fa9825d65	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
62f208a6-da63-4761-9a31-521472968d75	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-20	\N	f	\N	2026-01-03 16:46:30.440166-05	2026-02-23 12:46:25.392703-05	23cc1b89-c880-4675-ba43-232b003a8e67	submitted	fe7140bf-1416-4b1d-91dd-fe0d165784fe	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
459f956f-ee55-44e9-a3c5-bd8409b25b8e	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-21	\N	f	\N	2026-01-03 16:46:30.442296-05	2026-02-23 12:46:25.392703-05	702e1655-6b78-4aac-bda7-5411410d2ad1	submitted	24cee186-4fde-4baa-8a74-b17561ee9584	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
333df34d-bb2f-46a7-9692-623b6f1af71a	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-18	\N	f	\N	2026-01-03 16:46:30.437655-05	2026-02-23 12:46:25.392703-05	4d66b65e-66ea-42bc-a190-3adf79070217	submitted	b51bd652-a9dd-48fd-8b13-5b44239e2695	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
c89e8915-4267-41ac-8610-1eae01a7c563	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-26	\N	f	\N	2026-01-03 16:46:30.448921-05	2026-02-23 12:46:25.392703-05	909cd25a-b36b-4ab5-861d-e78005060be0	submitted	511e125a-1e5b-4ffb-a2c1-a436d06adc41	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
67e6ab84-f309-4209-8c24-c2c47aa02f86	\N	2026-02-01	\N	f	\N	2026-02-01 14:45:40.601609-05	2026-02-01 14:45:40.601609-05	1755fbfc-ac6e-45e2-aafa-f467fb69b04c	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
3809b9ce-f4b7-4b04-a141-5d2b0a198dc8	\N	2026-02-01	\N	f	\N	2026-02-01 15:33:47.135837-05	2026-02-01 15:33:47.135837-05	22566be7-37a9-408a-8d34-35addf7e7708	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
5e0d0ee7-34bb-4a3c-bb04-0068b73f3137	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-26	\N	f	\N	2026-01-03 16:46:30.413752-05	2026-02-23 12:46:25.392703-05	e2086f8b-e311-4654-90e6-8a6c657cf472	submitted	63c8c882-01d0-4442-a151-4653ce1bb804	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
5554fb9c-f51d-4fc1-89f4-6394ba2cb679	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-29	\N	f	\N	2026-01-03 16:46:30.416112-05	2026-02-23 12:46:25.392703-05	6d491803-198a-406e-8095-17339e94d520	submitted	02c183db-00b9-4939-a24e-5faee6536cc3	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
c180552a-62c1-4c94-9303-af74111f6ef2	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-20	\N	f	\N	2026-01-03 16:46:30.394454-05	2026-02-23 12:46:25.392703-05	0324a23f-1404-4fa6-91b2-7ba1e6d1bf3f	submitted	1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
338f5d02-3e7c-4bff-b9fb-a07089bba5ab	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-20	\N	f	\N	2026-01-03 16:46:30.397335-05	2026-02-23 12:46:25.392703-05	95b26d9b-f284-4792-942b-ce2fe5f0f990	submitted	b51bd652-a9dd-48fd-8b13-5b44239e2695	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
7ad47cd9-e283-4500-a58a-5e64ebbd484b	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-16	\N	f	\N	2026-01-03 16:46:30.432773-05	2026-02-23 12:46:25.392703-05	88aea53d-8d90-41de-bf78-8be96271c03b	submitted	63c8c882-01d0-4442-a151-4653ce1bb804	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
b8619364-e3f5-42c8-ae37-0123dcc66dec	\N	2026-02-01	\N	f	\N	2026-02-01 14:48:31.402821-05	2026-02-01 14:48:31.402821-05	514855ac-cc9b-4b53-b242-1590cd2cb6e4	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
6e2c56ab-30a6-4645-bbf5-a79125402fa9	\N	2026-02-02	\N	f	\N	2026-02-02 09:54:33.889564-05	2026-02-02 09:54:33.889564-05	57aa2c13-8b9c-441b-8fe8-1eb2b613285f	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
7083881a-f018-4c81-ac15-0030a35044d5	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-16	\N	f	\N	2026-01-03 16:46:30.429889-05	2026-02-23 12:46:25.392703-05	b6405afd-534e-41a3-bc02-cb1ae7ec1771	submitted	e6fdf898-9460-4129-ad5d-0e4f0d980036	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
d26591cb-d82e-4086-8192-b0acfe87c3e4	\N	2026-02-26	\N	f	\N	2026-02-26 17:53:13.130777-05	2026-02-26 17:53:13.130777-05	20580e85-d3b3-4abc-b06e-56a27ee7d762	submitted	\N	\N	\N	\N	\N	\N	2026-02-26 17:53:13.127-05	\N	\N	f	f	f	f
3b928e19-ee3c-4104-a444-336e7401ef57	\N	2026-02-27	\N	f	\N	2026-02-26 22:39:15.885381-05	2026-02-26 22:39:15.885381-05	e0101dab-faa5-4c3a-b0a1-c9cebd76958f	submitted	\N	\N	\N	\N	\N	\N	2026-02-26 22:39:15.878-05	\N	\N	f	f	f	f
e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	\N	2026-02-28	\N	f	\N	2026-02-27 16:50:46.716699-05	2026-02-27 16:50:46.716699-05	7b64ebb2-579b-48e2-a5e4-a517bf55c152	submitted	\N	\N	\N	\N	\N	\N	2026-02-27 16:50:46.708-05	\N	\N	f	f	f	f
32340655-21a5-4d4c-a396-ba67492519fb	\N	2026-02-01	\N	f	\N	2026-02-01 14:54:31.405308-05	2026-02-01 14:54:31.405308-05	cc0583c4-b9ce-4d31-a768-23821b406698	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
176ffe98-ae00-4305-84f6-0134fc36241b	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-17	\N	f	\N	2026-01-03 16:46:30.435004-05	2026-02-23 12:46:25.392703-05	2c63ca4b-dd41-4b97-9ff4-5439ed2d7b03	submitted	a2bbb9a1-feed-4485-a6cf-bf08fa9b2e42	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
98d6d66f-3815-44a2-8398-e7ad6c3b7780	\N	2026-02-01	\N	f	\N	2026-02-01 15:08:05.68451-05	2026-02-01 15:08:05.68451-05	6cdfd9d3-0688-4a21-bb02-8a6296cb3d9d	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
a11d375b-f1cb-47dc-955b-25d10323dff3	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-18	\N	f	\N	2026-01-03 16:46:30.387853-05	2026-02-23 12:46:25.392703-05	aaed68b3-769d-494f-9d46-066a12c75d18	submitted	2f70b8ab-9b68-4d11-a560-2762939aef77	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
e0355561-bc59-4cc3-8f24-463f97cde2a4	925a88dc-8f7c-40da-927f-79d46a794b9a	2024-12-21	\N	f	\N	2026-01-03 16:46:30.399707-05	2026-02-23 12:46:25.392703-05	d6b91b78-b3cb-43cc-b4f1-2a883efb8d1b	submitted	03d484a3-cabe-43d6-b1c7-5ef65d449d06	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
772ef051-ab72-4132-a6c2-464b24fcbf90	\N	2026-02-01	\N	f	\N	2026-02-01 15:09:52.891031-05	2026-02-01 15:09:52.891031-05	a7369ade-7bbc-497a-9823-81740e60b941	submitted	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f
77be6a53-b18a-42fc-bf61-c11121c1f36c	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-22	\N	f	\N	2026-01-03 16:46:30.444218-05	2026-02-23 12:46:25.392703-05	07461c33-c3d2-4d40-a214-f1db5c3197fd	submitted	f0966d91-1f50-428b-8cb4-cce2de9a923a	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
2da693d3-a101-4efb-9599-fedd5c011db0	925a88dc-8f7c-40da-927f-79d46a794b9a	2025-01-26	\N	f	\N	2026-01-03 16:46:30.446349-05	2026-02-23 12:46:25.392703-05	c5e45412-6ee9-4a1a-b109-e12fd8db4a2c	submitted	f5340528-e901-42b5-9067-db445e5a57b5	{"71d4e133-0007-40b5-b249-7f1c9d2f7772": {"id": "71d4e133-0007-40b5-b249-7f1c9d2f7772", "icon": "", "name": "Buyer's Inspection", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	{"9ed2de4d-b90c-4c4c-bf62-6225ec8cda28": {"id": "9ed2de4d-b90c-4c4c-bf62-6225ec8cda28", "icon": "", "name": "Single Family Home", "baseSqFt": 0, "differential": false, "allowMultiple": false, "partInstances": []}}	\N	\N	\N	\N	\N	\N	f	f	f	f
\.


--
-- Data for Name: appointment_attendees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment_attendees (id, appointment_id, user_id, user_type_block_instance_id, should_receive_invitation, invitation_status, google_event_id, created_at, updated_at) FROM stdin;
b196a1ab-3685-4bd8-9d1e-88f300189f65	d9d83e3b-9c40-4bc6-8b1e-51c4e00b63a7	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.492773-05	2026-02-01 13:56:18.492773-05
0934a51f-cf4b-4367-a98b-2def35f2cd12	d9d83e3b-9c40-4bc6-8b1e-51c4e00b63a7	6f3b5c25-0e29-46ee-b41a-82a624e76d17	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.527442-05	2026-02-01 13:56:18.527442-05
03c1a80a-be56-4bf2-90d1-e6297971a2e5	b4b7b66a-9bf6-47d5-94de-74e6df1bfc33	fe7140bf-1416-4b1d-91dd-fe0d165784fe	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.533496-05	2026-02-01 13:56:18.533496-05
46c0dde5-6183-4b74-984f-8d0862e578ca	b4b7b66a-9bf6-47d5-94de-74e6df1bfc33	5332f171-1509-4c56-8284-22023d8ae132	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.537778-05	2026-02-01 13:56:18.537778-05
5823248b-b38e-4348-9951-470a36bb832e	495cbe96-a981-4479-8fb8-c4373ebe50d0	2767dbe2-895a-42f4-a9d0-4adcdbc6b26d	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.540537-05	2026-02-01 13:56:18.540537-05
acd9571d-5e1b-464f-bfa1-4081bc1436ed	495cbe96-a981-4479-8fb8-c4373ebe50d0	f0966d91-1f50-428b-8cb4-cce2de9a923a	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.54505-05	2026-02-01 13:56:18.54505-05
24f9db7b-0884-409c-a0bd-994b2cba38d2	dbf3af56-1b65-4742-b46e-da6cd034898e	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.54911-05	2026-02-01 13:56:18.54911-05
5e0bfbdf-271d-43da-8fe0-1981f1b655d9	dbf3af56-1b65-4742-b46e-da6cd034898e	1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.553839-05	2026-02-01 13:56:18.553839-05
505ab8f0-3bf4-44c0-8fe3-5132afc9fb50	2e112b1d-9b25-4e3f-a554-07a4350730ea	e8a01f0b-ee5f-48f5-9cdc-c8ad1a78b5c8	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.555741-05	2026-02-01 13:56:18.555741-05
51a8d929-8507-49bf-8323-fd5a2203b2f5	2e112b1d-9b25-4e3f-a554-07a4350730ea	a8b9c58e-5ce9-42dd-9000-2ef1373e2435	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.559967-05	2026-02-01 13:56:18.559967-05
bf4ed9cd-c14b-4b34-92a5-4e2c763ce8dd	66021dd6-7fdc-4b46-abe5-03a255328cbe	2767dbe2-895a-42f4-a9d0-4adcdbc6b26d	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.563458-05	2026-02-01 13:56:18.563458-05
ac0cf7f8-a2ed-4edf-939b-1ec16bb6d044	66021dd6-7fdc-4b46-abe5-03a255328cbe	187964a9-29b7-4347-8479-191d1f3980ac	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.566076-05	2026-02-01 13:56:18.566076-05
75ae902d-0c8f-4e20-ae2e-89871420e5f6	719da0db-d0ab-48ab-9acc-5ad6481569ec	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.571281-05	2026-02-01 13:56:18.571281-05
fd808537-62b1-4aa4-a1d2-5320128ee04a	719da0db-d0ab-48ab-9acc-5ad6481569ec	03d484a3-cabe-43d6-b1c7-5ef65d449d06	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.573348-05	2026-02-01 13:56:18.573348-05
8eeff77c-b0d3-42d4-bb99-78f66bac1d2f	ae839f86-4045-49cf-b8ca-fb459580cbb6	02c183db-00b9-4939-a24e-5faee6536cc3	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.580194-05	2026-02-01 13:56:18.580194-05
2e86a5c9-9a86-4977-9448-7f5ca79d5bab	ae839f86-4045-49cf-b8ca-fb459580cbb6	4aa824a1-7612-40fa-829d-ad5588660f95	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.584466-05	2026-02-01 13:56:18.584466-05
302a7c0f-8e18-4674-87f8-270910662fcc	5d2b8fb4-64ac-4b1d-97ad-f61e1a3c7b8e	180c9ceb-68a2-44f7-a3c8-a4a854c720a8	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.587638-05	2026-02-01 13:56:18.587638-05
7bc383dc-f2dd-4b2f-b965-30209ec3855b	5d2b8fb4-64ac-4b1d-97ad-f61e1a3c7b8e	b1f3c908-ad01-41f1-ae7b-e566ac5eb5f8	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.58953-05	2026-02-01 13:56:18.58953-05
c627fe26-b682-42f7-977d-e50b5f342262	c12a5aed-3e0b-4a9f-ab72-d7af2675f58b	02c183db-00b9-4939-a24e-5faee6536cc3	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.592001-05	2026-02-01 13:56:18.592001-05
def16bab-b179-4c9e-8a13-3e7aa392b8a0	c12a5aed-3e0b-4a9f-ab72-d7af2675f58b	1e9e4ff0-e5df-4dd2-9dcb-380e15174d03	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.594298-05	2026-02-01 13:56:18.594298-05
2124183c-896d-49a1-84dd-e883afbd1ced	a9c0ed3b-00dc-4baa-bfdd-d1fe61f9a10b	c77cfe76-f691-4151-9d3a-d88902762ee3	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.597078-05	2026-02-01 13:56:18.597078-05
f3a59d3e-1525-4cf4-bbfa-761aa16010a0	a9c0ed3b-00dc-4baa-bfdd-d1fe61f9a10b	9f1b0054-3548-4461-aacf-333640ee3f4a	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.601195-05	2026-02-01 13:56:18.601195-05
178611ff-a7ad-48da-9274-21bf01fe6cda	abb89c40-8d24-4e8f-9608-582bb797ca53	2767dbe2-895a-42f4-a9d0-4adcdbc6b26d	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.606953-05	2026-02-01 13:56:18.606953-05
28b0b00b-e637-49fb-bf4c-3009e0a4e39e	abb89c40-8d24-4e8f-9608-582bb797ca53	b1f3c908-ad01-41f1-ae7b-e566ac5eb5f8	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.610453-05	2026-02-01 13:56:18.610453-05
64bdb52a-3870-466c-9297-dd478a716b31	62f208a6-da63-4761-9a31-521472968d75	e8a01f0b-ee5f-48f5-9cdc-c8ad1a78b5c8	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.61418-05	2026-02-01 13:56:18.61418-05
c4999d8c-3d2f-4aa3-acae-a49d8644aa8c	62f208a6-da63-4761-9a31-521472968d75	511e125a-1e5b-4ffb-a2c1-a436d06adc41	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.618944-05	2026-02-01 13:56:18.618944-05
1ddc019b-f2d8-4b18-b2af-7c9d2c6f44fb	459f956f-ee55-44e9-a3c5-bd8409b25b8e	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.621739-05	2026-02-01 13:56:18.621739-05
955ae801-7a66-4996-b0a0-d3e129bef668	459f956f-ee55-44e9-a3c5-bd8409b25b8e	4aa824a1-7612-40fa-829d-ad5588660f95	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.624707-05	2026-02-01 13:56:18.624707-05
ad48a070-7586-499e-bd9e-9b954455e126	645fdf36-7af9-4f55-affd-b8a27f68f77b	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.627053-05	2026-02-01 13:56:18.627053-05
4d8d01c5-e4f6-4d59-93fc-d52f09e84fbf	645fdf36-7af9-4f55-affd-b8a27f68f77b	4aa824a1-7612-40fa-829d-ad5588660f95	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.632443-05	2026-02-01 13:56:18.632443-05
711c5188-6abb-4983-88fc-708e8154d15f	9ab351cb-4480-4732-99fd-7eff9a976f4c	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.638839-05	2026-02-01 13:56:18.638839-05
bb716577-ef5c-4f08-ba73-a6b61ff12222	9ab351cb-4480-4732-99fd-7eff9a976f4c	4aa824a1-7612-40fa-829d-ad5588660f95	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.646888-05	2026-02-01 13:56:18.646888-05
4c406032-3f37-4ee9-9de0-5535f58ce245	2886ae5e-491e-4a1f-918c-6caeb3307305	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.649862-05	2026-02-01 13:56:18.649862-05
0090253e-800b-469e-90c9-d6d54923945a	2886ae5e-491e-4a1f-918c-6caeb3307305	64f88721-05fb-49e4-a413-abb9aa9af7db	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.654031-05	2026-02-01 13:56:18.654031-05
de930df1-5bd7-4c7d-89da-bd4eb75a82d8	5e0d0ee7-34bb-4a3c-bb04-0068b73f3137	ae7655cb-af0f-4ce5-9065-c57612ab7fda	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.656191-05	2026-02-01 13:56:18.656191-05
1406f111-49a7-4b3f-84da-d112500afbfd	5e0d0ee7-34bb-4a3c-bb04-0068b73f3137	1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.659647-05	2026-02-01 13:56:18.659647-05
b45b15dd-c5d0-411c-a462-8fc252f8825c	5554fb9c-f51d-4fc1-89f4-6394ba2cb679	c77cfe76-f691-4151-9d3a-d88902762ee3	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.663259-05	2026-02-01 13:56:18.663259-05
0545b9fe-7d84-4210-9cc3-2998f3afe2e2	5554fb9c-f51d-4fc1-89f4-6394ba2cb679	1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.666849-05	2026-02-01 13:56:18.666849-05
c82fce81-8d71-46c0-ad7e-550232e7f352	c180552a-62c1-4c94-9303-af74111f6ef2	180c9ceb-68a2-44f7-a3c8-a4a854c720a8	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.670577-05	2026-02-01 13:56:18.670577-05
ba65742b-99e8-43fc-aa32-d5146aea55f8	c180552a-62c1-4c94-9303-af74111f6ef2	63c8c882-01d0-4442-a151-4653ce1bb804	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.672721-05	2026-02-01 13:56:18.672721-05
f251801d-982c-4ed6-9fdd-ea9a6fb8d0e6	338f5d02-3e7c-4bff-b9fb-a07089bba5ab	02c183db-00b9-4939-a24e-5faee6536cc3	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.676392-05	2026-02-01 13:56:18.676392-05
19668836-5b8d-4185-8966-03f17d1f56fd	338f5d02-3e7c-4bff-b9fb-a07089bba5ab	4aa824a1-7612-40fa-829d-ad5588660f95	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.679926-05	2026-02-01 13:56:18.679926-05
b15a5b83-522a-461f-af98-bb10d73f069a	7083881a-f018-4c81-ac15-0030a35044d5	fe7140bf-1416-4b1d-91dd-fe0d165784fe	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.682916-05	2026-02-01 13:56:18.682916-05
c689e828-c08e-4edd-a0f3-09cae64eb272	7083881a-f018-4c81-ac15-0030a35044d5	64f88721-05fb-49e4-a413-abb9aa9af7db	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.68769-05	2026-02-01 13:56:18.68769-05
dcd64cfb-6121-4122-90d4-5eece5a4b71d	176ffe98-ae00-4305-84f6-0134fc36241b	ae7655cb-af0f-4ce5-9065-c57612ab7fda	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.692903-05	2026-02-01 13:56:18.692903-05
fc565ae7-6275-449b-b0e7-bcba1fdcabf1	176ffe98-ae00-4305-84f6-0134fc36241b	5c505f36-a4d6-4e9c-82ae-8f93c170b03b	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.701564-05	2026-02-01 13:56:18.701564-05
966f9660-fcf9-459a-9e24-ea100568559a	333df34d-bb2f-46a7-9692-623b6f1af71a	02c183db-00b9-4939-a24e-5faee6536cc3	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.705084-05	2026-02-01 13:56:18.705084-05
0123d9b1-c45a-4369-8215-342038dc3d1b	333df34d-bb2f-46a7-9692-623b6f1af71a	a2bbb9a1-feed-4485-a6cf-bf08fa9b2e42	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.712822-05	2026-02-01 13:56:18.712822-05
2d0e5af6-3ff4-41eb-b113-990f9146f099	c89e8915-4267-41ac-8610-1eae01a7c563	fe7140bf-1416-4b1d-91dd-fe0d165784fe	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.714941-05	2026-02-01 13:56:18.714941-05
bb405898-edaf-4733-b294-501fabb18736	c89e8915-4267-41ac-8610-1eae01a7c563	277178f0-6c51-4393-8cc9-e0cd29249230	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.72225-05	2026-02-01 13:56:18.72225-05
6951f617-40c3-42ac-989b-f6212925a91b	7ad47cd9-e283-4500-a58a-5e64ebbd484b	e6fdf898-9460-4129-ad5d-0e4f0d980036	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.756206-05	2026-02-01 13:56:18.756206-05
e7eb22a6-775d-4450-ab99-29ee827dc448	7ad47cd9-e283-4500-a58a-5e64ebbd484b	2f70b8ab-9b68-4d11-a560-2762939aef77	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.773209-05	2026-02-01 13:56:18.773209-05
9c3385a7-f628-41de-8379-ffdb365dfc7c	a11d375b-f1cb-47dc-955b-25d10323dff3	180c9ceb-68a2-44f7-a3c8-a4a854c720a8	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.790084-05	2026-02-01 13:56:18.790084-05
a886ccb4-0ad0-4792-8d5b-391a86929da2	a11d375b-f1cb-47dc-955b-25d10323dff3	f5340528-e901-42b5-9067-db445e5a57b5	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.806354-05	2026-02-01 13:56:18.806354-05
67f47b82-a3ca-43df-bebe-8f2a9c4820c1	e0355561-bc59-4cc3-8f24-463f97cde2a4	180c9ceb-68a2-44f7-a3c8-a4a854c720a8	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.821255-05	2026-02-01 13:56:18.821255-05
d4cc1645-efe8-4703-8074-34287cd78c1b	e0355561-bc59-4cc3-8f24-463f97cde2a4	1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.824822-05	2026-02-01 13:56:18.824822-05
1d0500a8-6e74-4efe-9cee-7274f8e0f018	77be6a53-b18a-42fc-bf61-c11121c1f36c	2767dbe2-895a-42f4-a9d0-4adcdbc6b26d	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.830712-05	2026-02-01 13:56:18.830712-05
4491a184-8959-4a6c-93ef-b1d9c5ad0f25	77be6a53-b18a-42fc-bf61-c11121c1f36c	24cee186-4fde-4baa-8a74-b17561ee9584	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.836203-05	2026-02-01 13:56:18.836203-05
bc9ad353-8902-45d8-b14b-fa6237ddfb5c	2da693d3-a101-4efb-9599-fedd5c011db0	fe7140bf-1416-4b1d-91dd-fe0d165784fe	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 13:56:18.844478-05	2026-02-01 13:56:18.844478-05
945bcaa7-ecf9-4a7f-80aa-24062b0c94b6	2da693d3-a101-4efb-9599-fedd5c011db0	1671ae2f-67da-42a3-adf4-97cfcbf5e9fc	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 13:56:18.853478-05	2026-02-01 13:56:18.853478-05
2bb6f38d-5025-4d36-8705-0480d24e96f0	fbfd8373-4275-4be8-bc9a-2b4520b37db9	14c91ba6-cf1b-489b-8058-6efafc204602	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 14:31:46.434655-05	2026-02-01 14:31:46.434655-05
00a1358d-6217-401d-b19b-9d8d2235a57f	fbfd8373-4275-4be8-bc9a-2b4520b37db9	86eb24ea-2ef2-4862-b09a-d0d3430f3658	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 14:31:46.434901-05	2026-02-01 14:31:46.434901-05
4b960d46-13e2-46bc-94b2-f2a75910ae56	408b7c91-61dd-4303-8d56-d8c1da071372	d5c629d0-6c89-4b77-a297-02a7a921e361	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 14:41:49.954807-05	2026-02-01 14:41:49.954807-05
6f438559-8495-4104-96c3-4af68ce53663	408b7c91-61dd-4303-8d56-d8c1da071372	7fb454f1-f8f3-425a-92ce-052efd9091e0	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 14:41:49.954543-05	2026-02-01 14:41:49.954543-05
528a33f5-be48-40d5-946b-8a12b5516069	67e6ab84-f309-4209-8c24-c2c47aa02f86	ce555229-1ec3-4e01-aaef-6386185a069c	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 14:45:40.608065-05	2026-02-01 14:45:40.608065-05
c5bf6ae0-74e3-4102-b3bc-4bb2b118023a	67e6ab84-f309-4209-8c24-c2c47aa02f86	69624d6b-d7b5-47fd-96f2-64a5dddfe70e	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 14:45:40.608332-05	2026-02-01 14:45:40.608332-05
89ee060b-87a5-4d48-b798-53bb7c74f38b	b8619364-e3f5-42c8-ae37-0123dcc66dec	ca64b1c8-b1f7-443a-b07b-8f40bded4995	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 14:48:31.442493-05	2026-02-01 14:48:31.442493-05
40d3da25-1092-4e4a-99af-c4d4cc350ddf	b8619364-e3f5-42c8-ae37-0123dcc66dec	1f884ac2-de2f-4a99-bd80-bd8d0afbf8dc	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 14:48:31.442412-05	2026-02-01 14:48:31.442412-05
827a2275-17dd-446f-926b-7344972f4d83	32340655-21a5-4d4c-a396-ba67492519fb	e07b2c01-f484-49ae-9238-acab765129c9	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	jd1brg4159aa76up0gi1247jjk	2026-02-01 14:54:31.414368-05	2026-02-01 14:54:31.414368-05
cb323c21-5222-4ccd-8e7d-1f1091d2b089	32340655-21a5-4d4c-a396-ba67492519fb	50b7b93f-1535-4d22-bb01-9dc54a5ee92f	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	jd1brg4159aa76up0gi1247jjk	2026-02-01 14:54:31.414128-05	2026-02-01 14:54:31.414128-05
4034465d-fc35-4365-b56b-93d509d45f31	98d6d66f-3815-44a2-8398-e7ad6c3b7780	0f3f994b-4b02-49ff-b21a-a5f0e099134e	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 15:08:05.698462-05	2026-02-01 15:08:05.698462-05
3b4a3925-dee8-486e-9b6f-33f7d7fbe559	98d6d66f-3815-44a2-8398-e7ad6c3b7780	0e140beb-6ce8-428d-9e71-8ce380b391ed	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 15:08:05.700033-05	2026-02-01 15:08:05.700033-05
91d73130-304f-4abe-9960-176f06c18470	772ef051-ab72-4132-a6c2-464b24fcbf90	05f19688-5e46-4a67-9ad9-61075baa9177	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	qvmmqbq37tett0pvecp3563814	2026-02-01 15:09:52.900653-05	2026-02-01 15:09:52.900653-05
e944bf42-d1e1-430a-ba2f-483de97db827	772ef051-ab72-4132-a6c2-464b24fcbf90	ca9559eb-3bae-4a0a-a2b1-1205103ed256	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	qvmmqbq37tett0pvecp3563814	2026-02-01 15:09:52.90109-05	2026-02-01 15:09:52.90109-05
00814d10-4ae9-4514-b8cb-e6fc49ce170c	b53c2681-2168-4ecc-bf9e-39e14dbd6791	0e3c727e-014e-4529-aef8-652ac09f7d6a	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	pending	\N	2026-02-01 15:13:30.746141-05	2026-02-01 15:13:30.746141-05
1993857c-a57d-43c1-95ba-d4d408c6f2fb	b53c2681-2168-4ecc-bf9e-39e14dbd6791	505a3d50-5dca-4ceb-8972-09941d851f28	925a88dc-8f7c-40da-927f-79d46a794b9a	t	pending	\N	2026-02-01 15:13:30.746407-05	2026-02-01 15:13:30.746407-05
3011c3c3-755c-46db-adea-7f222513944f	391cb75e-a359-43ff-9a6b-0b044ae1dda1	d327338f-4efb-46e2-9cf4-91480af3ef9d	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	8av252t909dt55gvd4ucarv0g0	2026-02-01 15:14:24.05799-05	2026-02-01 15:14:24.05799-05
f0157a98-1a5b-496a-8d05-2a1fdbd0df43	391cb75e-a359-43ff-9a6b-0b044ae1dda1	84603f01-2755-4329-9701-ca20ba1d43d0	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	8av252t909dt55gvd4ucarv0g0	2026-02-01 15:14:24.058037-05	2026-02-01 15:14:24.058037-05
42949532-e681-4876-9d6f-5b7e84d3f750	c77385ac-b1f8-4d0f-84c7-226feb6556bf	0d209db0-60eb-4219-ac81-3472a01c75aa	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	kj2vd3d8b31tajesdg699ckpds	2026-02-01 15:25:32.807781-05	2026-02-01 15:25:32.807781-05
621f1ca9-319f-4105-ad51-8a4078071804	c77385ac-b1f8-4d0f-84c7-226feb6556bf	bffbf0a4-9c85-44e9-85d9-2844bf4b4afa	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	kj2vd3d8b31tajesdg699ckpds	2026-02-01 15:25:32.807143-05	2026-02-01 15:25:32.807143-05
de964238-d707-444e-a7ea-5ec21e0c4836	3809b9ce-f4b7-4b04-a141-5d2b0a198dc8	6c05ed33-e4ce-4924-b54f-9e35b3c53e0d	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	6eciilbp7s9m78f1mlv4elk224	2026-02-01 15:33:47.141837-05	2026-02-01 15:33:47.141837-05
68df9943-3834-4451-928c-9db13a55d302	3809b9ce-f4b7-4b04-a141-5d2b0a198dc8	2336039b-8785-4e86-81fd-bc36545cce45	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	6eciilbp7s9m78f1mlv4elk224	2026-02-01 15:33:47.142072-05	2026-02-01 15:33:47.142072-05
467e5af2-488a-4d0f-8f5a-79cd244e1e24	6e2c56ab-30a6-4645-bbf5-a79125402fa9	c265adb6-6980-4c45-b669-50545c12c43d	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	7362q6lmkn5r4n3kna93hjin68	2026-02-02 09:54:33.896168-05	2026-02-02 09:54:33.896168-05
e6d4cd5c-6d1d-4c70-85ed-4d55e3dd5768	6e2c56ab-30a6-4645-bbf5-a79125402fa9	d154468c-564f-4c94-91df-c844b2b13381	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	7362q6lmkn5r4n3kna93hjin68	2026-02-02 09:54:33.897446-05	2026-02-02 09:54:33.897446-05
eaf3acf0-a61e-4da7-9c21-b41b91328a9c	d26591cb-d82e-4086-8192-b0acfe87c3e4	cb293813-9d2b-48c3-8cc1-49373c1f10fc	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	8hprb95igee9m0gq5j02ufjm3g	2026-02-26 17:53:13.160115-05	2026-02-26 17:53:13.160115-05
e3018114-40da-4f35-871c-9307de35da0e	d26591cb-d82e-4086-8192-b0acfe87c3e4	e58fdd91-ad0f-42f4-b566-2e726ed3caa1	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	8hprb95igee9m0gq5j02ufjm3g	2026-02-26 17:53:13.160685-05	2026-02-26 17:53:13.160685-05
daf3f5e8-d357-4603-ba4e-0a8692f3d37a	3b928e19-ee3c-4104-a444-336e7401ef57	ba470a2b-f40a-4151-8763-4db05627100c	\N	t	sent	871qfbr8uelet2v1jr4sdmr2no	2026-02-26 22:39:15.936682-05	2026-02-26 22:39:15.936682-05
d3690a1d-cb12-4e78-8f99-931286f9a5fe	e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	7d3f3796-def8-49fd-829e-57a3f8a2cd85	925a88dc-8f7c-40da-927f-79d46a794b9a	t	sent	9bhjob7nut6lq40a5ji2iaqvvo	2026-02-27 16:50:46.759607-05	2026-02-27 16:50:46.759607-05
9b754338-5613-42be-ac0a-808c4dc8d2fa	e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	fc76fac3-1549-4bb1-9136-1388f46998a7	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	9bhjob7nut6lq40a5ji2iaqvvo	2026-02-27 16:50:46.760788-05	2026-02-27 16:50:46.760788-05
684caf19-1f4b-401f-95f9-b02a838e64dc	3b928e19-ee3c-4104-a444-336e7401ef57	620843ad-a6e4-46c7-89ac-41f8bcf5ef4c	40b16b79-d5df-4f30-9dec-509e2a65d7f3	t	sent	k4po56rjqhk00brsvdp24e8llc	2026-02-26 22:39:15.935768-05	2026-02-26 22:39:15.935768-05
\.


--
-- Data for Name: appointment_fee_summaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment_fee_summaries (id, appointment_id, base_fee_total, overage_fee_total, total_fee, square_footage, adu_count, currency, calculated_at, created_at) FROM stdin;
479beee5-447e-410a-a3b7-66a66bb8a00b	d26591cb-d82e-4086-8192-b0acfe87c3e4	150	152100	152250	507	1	USD	2026-02-26 17:53:13.121-05	2026-02-26 17:53:13.165599-05
56345f2f-500c-4ddf-8f5f-ce6e2e1a00b1	3b928e19-ee3c-4104-a444-336e7401ef57	150	90600	90750	302	1	USD	2026-02-26 22:39:15.872-05	2026-02-26 22:39:15.941701-05
f7811663-2211-4442-b705-9ca776b06e60	e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	150	152100	152250	507	1	USD	2026-02-27 16:50:46.685-05	2026-02-27 16:50:46.765026-05
\.


--
-- Data for Name: appointment_fee_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment_fee_entries (id, fee_summary_id, block_instance_id, block_name, block_shape_ref, base_fee, overage_fee, total_fee, quantity, created_at) FROM stdin;
7f3f8c99-9bb1-464f-a58e-8f7e9d4c89d8	479beee5-447e-410a-a3b7-66a66bb8a00b	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	Single Family Home	c9d53a2f-fbbd-4a93-bb84-48c828617af4	0	0	0	1	2026-02-26 17:53:13.170693-05
9d8235c9-4eb2-41bc-863e-c5a44c5c5dc1	479beee5-447e-410a-a3b7-66a66bb8a00b	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection	26d66957-e7a1-40a7-829e-b68a5ca49b8e	150	152100	152250	1	2026-02-26 17:53:13.170619-05
e47bade2-e79f-4eeb-8a0c-5688c1fb3ae7	56345f2f-500c-4ddf-8f5f-ce6e2e1a00b1	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection	26d66957-e7a1-40a7-829e-b68a5ca49b8e	150	90600	90750	1	2026-02-26 22:39:15.943561-05
c71df636-4c39-4092-8ec9-fd2a9fce9b44	56345f2f-500c-4ddf-8f5f-ce6e2e1a00b1	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	Single Family Home	c9d53a2f-fbbd-4a93-bb84-48c828617af4	0	0	0	1	2026-02-26 22:39:15.943605-05
5d1af60d-b83e-4951-85ab-4226cb35a49d	f7811663-2211-4442-b705-9ca776b06e60	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	Single Family Home	c9d53a2f-fbbd-4a93-bb84-48c828617af4	0	0	0	1	2026-02-27 16:50:46.767469-05
6123a7d9-de4a-48c4-8219-71818d772975	f7811663-2211-4442-b705-9ca776b06e60	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection	26d66957-e7a1-40a7-829e-b68a5ca49b8e	150	152100	152250	1	2026-02-27 16:50:46.76741-05
\.


--
-- Data for Name: block_instance_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.block_instance_versions (id, block_instance_id, name, icon, base_sq_ft, allow_multiple, differential, created_at, pre_closing) FROM stdin;
65e666fd-c4af-4000-a98b-f1c0d952f98d	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection		0	f	true	2026-01-11 20:26:20.696367-05	f
635744e4-9c8c-44d5-a788-0dc9fc5d14a8	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection		250	f	true	2026-01-11 20:35:36.020186-05	f
ff914baa-9ee9-4ff3-bb59-b92703507574	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection		300	f	true	2026-01-11 20:35:45.119516-05	f
57994807-bc21-41fe-8106-b87a36798c40	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection		250	f	true	2026-01-12 22:00:39.099663-05	f
0fcccfeb-d0f5-457f-b790-5c225b758f14	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection		205	f	true	2026-01-13 10:03:44.206383-05	f
2c215a94-2216-4cf2-8322-c5a6af875f5a	71d4e133-0007-40b5-b249-7f1c9d2f7772	Test Service 1		205	f	true	2026-01-20 12:34:56.594745-05	f
81caa9b5-2945-4248-b671-2c6e0171cc66	71d4e133-0007-40b5-b249-7f1c9d2f7772	Composite Differential		205	f	true	2026-01-26 14:17:39.8943-05	f
b11f5f6d-cf6e-41ed-a552-c9f1c353606d	71d4e133-0007-40b5-b249-7f1c9d2f7772	Composite Differential Stand-alone		200	f	true	2026-01-29 14:54:19.946254-05	f
58fe4e2d-41a2-4a9e-8643-e1a1832963cb	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	Single Family Home		200	f	false	2026-02-01 14:31:46.409541-05	f
c7255104-42b3-4bcf-9a0e-31da021ddc3a	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	Condo/Co-op		0	f	false	2026-02-02 09:54:33.882729-05	f
20df3d38-a53b-4327-b46e-42cf22ec2212	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's 		200	f	true	2026-02-10 17:32:18.025571-05	f
5b413d77-14f1-4c50-b65a-cae48f11ce6c	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection		200	f	true	2026-02-10 17:32:18.107068-05	f
41bca924-4cfa-4164-a340-e827f5589246	71d4e133-0007-40b5-b249-7f1c9d2f7772	Buyer's Inspection		200	f	true	2026-02-27 16:50:46.732827-05	t
\.


--
-- Data for Name: appointment_selection_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment_selection_lines (id, appointment_id, line_kind, sort_order, block_instance_id, quantity, snapshot_version_id) FROM stdin;
9b99c6e7-398a-4004-9aca-4701a55c202b	d9d83e3b-9c40-4bc6-8b1e-51c4e00b63a7	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
e5dcbec8-8dba-4191-b529-6aac31894667	b4b7b66a-9bf6-47d5-94de-74e6df1bfc33	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
3142b590-e2a8-4ee5-b459-ce5d0a3fb10c	495cbe96-a981-4479-8fb8-c4373ebe50d0	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
2331b6fe-7b6c-4ddf-9210-1d760ce1b575	b53c2681-2168-4ecc-bf9e-39e14dbd6791	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
f0136b89-8cac-4369-8c05-2567edc949cd	ae839f86-4045-49cf-b8ca-fb459580cbb6	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
c55eecc6-5ad0-423e-a32f-9df4dede4095	fbfd8373-4275-4be8-bc9a-2b4520b37db9	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
d339d432-cf12-4602-b7e9-743185aec75b	391cb75e-a359-43ff-9a6b-0b044ae1dda1	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
d6aeaebd-2f01-45c0-8907-4fa15724b9b5	dbf3af56-1b65-4742-b46e-da6cd034898e	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
8879ed7d-136f-4ad7-b58d-16dcc918d9b9	2e112b1d-9b25-4e3f-a554-07a4350730ea	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
af97986e-85cc-4b20-8a97-5e2367b083b9	66021dd6-7fdc-4b46-abe5-03a255328cbe	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
d15036c7-4605-4aa0-965e-41cd08bcecbe	645fdf36-7af9-4f55-affd-b8a27f68f77b	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
105e16ae-1665-49a8-b7b2-f7b47a7372ae	9ab351cb-4480-4732-99fd-7eff9a976f4c	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
79bfe01e-db92-4a8a-b892-bcbb9fa4a081	2886ae5e-491e-4a1f-918c-6caeb3307305	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
97d6ede0-0f59-4919-bcff-a75d0ae88f5e	408b7c91-61dd-4303-8d56-d8c1da071372	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
4a93e929-32fc-4424-836f-3a67f8ae35fa	c77385ac-b1f8-4d0f-84c7-226feb6556bf	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
ecd6f28f-f44d-44e2-9436-ad501b89e5e6	719da0db-d0ab-48ab-9acc-5ad6481569ec	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
27a82c75-98dc-4a2b-a933-a5fbe677e035	5d2b8fb4-64ac-4b1d-97ad-f61e1a3c7b8e	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
bada31dd-8810-4b2d-8df5-6f3b86a52681	c12a5aed-3e0b-4a9f-ab72-d7af2675f58b	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
685467e7-6f1a-416e-8914-a188e1e19954	a9c0ed3b-00dc-4baa-bfdd-d1fe61f9a10b	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
95aceb62-5bc5-4ae8-bf1f-30f7866ddb7a	abb89c40-8d24-4e8f-9608-582bb797ca53	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
ad6e5967-9fd3-4691-ac2b-6610ba5f71f4	62f208a6-da63-4761-9a31-521472968d75	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
a1f7fea1-b51c-4e57-89bc-dac3a19d85b7	459f956f-ee55-44e9-a3c5-bd8409b25b8e	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
524aa277-f940-4da4-aa1f-6664d17d14c0	333df34d-bb2f-46a7-9692-623b6f1af71a	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
b9e39bce-daaa-43e1-b0d3-3496d00b6c68	c89e8915-4267-41ac-8610-1eae01a7c563	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
70d06eb4-31b1-4a59-a031-9bc699500c14	67e6ab84-f309-4209-8c24-c2c47aa02f86	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
3dc94cca-4f59-4b4f-a24a-0274d13a2f6e	3809b9ce-f4b7-4b04-a141-5d2b0a198dc8	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
35854206-e08a-43a0-bdc5-77e4c61582f7	5e0d0ee7-34bb-4a3c-bb04-0068b73f3137	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
1567d20b-dd54-4180-9eed-51512ebbceda	5554fb9c-f51d-4fc1-89f4-6394ba2cb679	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
a2aeaa64-77ef-477d-ae2a-43bc715ceec2	c180552a-62c1-4c94-9303-af74111f6ef2	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
6263f28d-4380-4a58-82a5-23ea5510ab86	338f5d02-3e7c-4bff-b9fb-a07089bba5ab	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
e232d438-f1ec-4d34-a3d9-b5fac25e1adb	7ad47cd9-e283-4500-a58a-5e64ebbd484b	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
4cc26f0b-234f-40db-bd61-98fc01eefa77	b8619364-e3f5-42c8-ae37-0123dcc66dec	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
9e4f7a29-3811-4073-8ba6-791fd020b4ea	6e2c56ab-30a6-4645-bbf5-a79125402fa9	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
ce899a50-976e-4df9-9c5b-2cd01bc9ec82	7083881a-f018-4c81-ac15-0030a35044d5	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
4ac222d0-1889-4616-b1f4-7b08040f7501	d26591cb-d82e-4086-8192-b0acfe87c3e4	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	5b413d77-14f1-4c50-b65a-cae48f11ce6c
d63a4a50-5949-43ec-a2fe-82118b21a3d5	3b928e19-ee3c-4104-a444-336e7401ef57	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	5b413d77-14f1-4c50-b65a-cae48f11ce6c
007ffcd1-72fb-4e68-b9b5-bb03ed6d054a	e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	41bca924-4cfa-4164-a340-e827f5589246
55ccb4e9-8ee9-4258-ada3-cb5c7be5a45c	32340655-21a5-4d4c-a396-ba67492519fb	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
ec40b027-9982-4c7f-92c4-85447cdf4fcc	176ffe98-ae00-4305-84f6-0134fc36241b	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
ac528d76-319f-4c02-9d67-f33b71324ef0	98d6d66f-3815-44a2-8398-e7ad6c3b7780	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
252e6b16-486a-4678-8026-2c0ac44f7777	a11d375b-f1cb-47dc-955b-25d10323dff3	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
423833cf-508a-4d5e-95c8-b1f69ecb4f60	e0355561-bc59-4cc3-8f24-463f97cde2a4	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
f24eec40-a356-414f-9763-554923e4a4ec	772ef051-ab72-4132-a6c2-464b24fcbf90	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	b11f5f6d-cf6e-41ed-a552-c9f1c353606d
ebf5d199-c19e-4ae1-beb1-b8df12ca2447	77be6a53-b18a-42fc-bf61-c11121c1f36c	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
d509e87c-80b4-4ae0-8992-fdddfa0b8cb3	2da693d3-a101-4efb-9599-fedd5c011db0	service	0	71d4e133-0007-40b5-b249-7f1c9d2f7772	1	\N
b582ec7b-47b3-4141-be95-216d7998db2b	d9d83e3b-9c40-4bc6-8b1e-51c4e00b63a7	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
2a163bce-7add-40b5-8eea-0dd4ddeb834a	b4b7b66a-9bf6-47d5-94de-74e6df1bfc33	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
1fc026c1-bb78-4358-8b05-b78e736d75b4	495cbe96-a981-4479-8fb8-c4373ebe50d0	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
f9d5188e-313f-456c-90e5-3b368d0cb81d	b53c2681-2168-4ecc-bf9e-39e14dbd6791	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
07c34a21-a6d2-49bf-b955-1a9f35947373	ae839f86-4045-49cf-b8ca-fb459580cbb6	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
52a7d52b-154d-434b-b875-060ff3899a1f	fbfd8373-4275-4be8-bc9a-2b4520b37db9	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
e15cca59-c683-4f23-865d-237bff561aea	391cb75e-a359-43ff-9a6b-0b044ae1dda1	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
b592d385-6268-4327-afd5-592c11b03d74	dbf3af56-1b65-4742-b46e-da6cd034898e	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
3354c8fa-3a0c-4ace-a6f1-ffe24568409f	2e112b1d-9b25-4e3f-a554-07a4350730ea	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
5f5947e4-750c-48bd-9a69-8d9fc6f1c30e	66021dd6-7fdc-4b46-abe5-03a255328cbe	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
bc366900-7d9a-4f45-a124-5cda4ac5c9c6	645fdf36-7af9-4f55-affd-b8a27f68f77b	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
56060daf-d0f2-4bd1-9465-8b11c3dc31ef	9ab351cb-4480-4732-99fd-7eff9a976f4c	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
2ba1371c-2237-40e1-b4af-840e320b0263	2886ae5e-491e-4a1f-918c-6caeb3307305	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
5abce779-4a1e-4bc6-afe7-3987e402dca7	408b7c91-61dd-4303-8d56-d8c1da071372	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
1af4f3cb-c00f-4b68-9aca-c3880c081497	c77385ac-b1f8-4d0f-84c7-226feb6556bf	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
18c3604c-2683-404c-bbc8-87718a43a13a	719da0db-d0ab-48ab-9acc-5ad6481569ec	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
8051e8cd-7820-4ce7-b44b-da2d27fc4f49	5d2b8fb4-64ac-4b1d-97ad-f61e1a3c7b8e	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
c00c243b-ee38-4d52-b441-3095ad4bb105	c12a5aed-3e0b-4a9f-ab72-d7af2675f58b	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
cbc23299-4835-469f-916d-65377a02d426	a9c0ed3b-00dc-4baa-bfdd-d1fe61f9a10b	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
eb33cdd3-caab-4e15-a4ba-79d4b3c33a72	abb89c40-8d24-4e8f-9608-582bb797ca53	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
97bcff76-4a5a-4dc9-86d9-153df14c43c3	62f208a6-da63-4761-9a31-521472968d75	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
91c79c4c-0989-44f7-95e9-c2df186d5975	459f956f-ee55-44e9-a3c5-bd8409b25b8e	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
328521e6-a9d2-445a-ac9c-27cf4beae9c8	333df34d-bb2f-46a7-9692-623b6f1af71a	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
2473d2c9-8a61-40ff-9458-2f426f264c2d	c89e8915-4267-41ac-8610-1eae01a7c563	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
975c87c7-01f5-442a-b952-51b03c5537a1	67e6ab84-f309-4209-8c24-c2c47aa02f86	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
d8afd4fd-a181-4d9e-9146-46624e12f6b5	3809b9ce-f4b7-4b04-a141-5d2b0a198dc8	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
3af38164-dcff-4482-a3e6-65e4395b3827	5e0d0ee7-34bb-4a3c-bb04-0068b73f3137	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
e063424d-7101-4d31-8feb-988142821e8e	5554fb9c-f51d-4fc1-89f4-6394ba2cb679	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
82e1dc7d-adab-4a17-87b8-8ba2ce74fe6a	c180552a-62c1-4c94-9303-af74111f6ef2	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
929f1410-76d6-47ac-9fbb-0f9e3b58fa65	338f5d02-3e7c-4bff-b9fb-a07089bba5ab	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
c779a1a5-0bec-4fa8-a8ca-59f2c2d6c458	7ad47cd9-e283-4500-a58a-5e64ebbd484b	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
916b09b6-4458-4a1e-b6df-9702f00efe00	b8619364-e3f5-42c8-ae37-0123dcc66dec	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
c5ad6292-a07a-438b-b7f9-8a1ebbf08837	6e2c56ab-30a6-4645-bbf5-a79125402fa9	property	0	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	1	c7255104-42b3-4bcf-9a0e-31da021ddc3a
8e25b8f2-7e86-4d89-9f84-e922605a8f0f	7083881a-f018-4c81-ac15-0030a35044d5	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
5bbc7f9d-c836-463f-9c40-d931559ed521	d26591cb-d82e-4086-8192-b0acfe87c3e4	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
0c955546-36ad-4605-b9be-d1e44ac4ec82	3b928e19-ee3c-4104-a444-336e7401ef57	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
4ea8f509-064e-4c20-b00b-f9ac610f1c02	e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
9219eee3-8c0b-4650-9d15-9c78b449471b	32340655-21a5-4d4c-a396-ba67492519fb	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
e9b987aa-ba1f-4797-9778-9f9f8dd6d834	176ffe98-ae00-4305-84f6-0134fc36241b	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
df4b88ec-d276-4814-8752-1199dcdf14d8	98d6d66f-3815-44a2-8398-e7ad6c3b7780	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
8e38131c-3aff-4cd3-afbe-e24baddf1282	a11d375b-f1cb-47dc-955b-25d10323dff3	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
48809fe8-83d4-466a-8b3b-4b3438c7906d	e0355561-bc59-4cc3-8f24-463f97cde2a4	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
420e2cdb-9f1a-4ae7-8353-fec3f5a4b181	772ef051-ab72-4132-a6c2-464b24fcbf90	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	58fe4e2d-41a2-4a9e-8643-e1a1832963cb
49ee45f5-2efe-417c-8cc7-665ec5ad6b27	77be6a53-b18a-42fc-bf61-c11121c1f36c	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
53c6a165-f15c-405e-a935-3b04d19c3bd0	2da693d3-a101-4efb-9599-fedd5c011db0	property	0	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	1	\N
\.


--
-- Data for Name: appointment_time_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment_time_slots (id, appointment_id, sort_order, start_at, end_at, duration_minutes, slot_metadata) FROM stdin;
19af669a-f0b2-4c70-92ec-1c04f2c30a1d	c77385ac-b1f8-4d0f-84c7-226feb6556bf	0	2026-02-01 16:30:00-05	2026-02-01 18:15:00-05	105	\N
b6fc22cc-3b51-4b1e-a218-659149fba07c	c77385ac-b1f8-4d0f-84c7-226feb6556bf	1	2026-02-01 17:45:00-05	2026-02-01 18:15:00-05	30	\N
e70f1320-2b66-412e-8e23-57edaee024a5	3809b9ce-f4b7-4b04-a141-5d2b0a198dc8	0	2026-02-01 19:30:00-05	2026-02-01 21:15:00-05	105	\N
66335bb7-6559-418b-b1f0-4076695b614d	3809b9ce-f4b7-4b04-a141-5d2b0a198dc8	1	2026-02-01 20:45:00-05	2026-02-01 21:15:00-05	30	\N
ec37689e-5281-4b2d-a10b-60cdf201f510	6e2c56ab-30a6-4645-bbf5-a79125402fa9	0	2026-02-02 14:00:00-05	2026-02-02 15:45:00-05	105	\N
883a0dbd-2733-4881-b845-aedf0171bb5c	6e2c56ab-30a6-4645-bbf5-a79125402fa9	1	2026-02-02 15:15:00-05	2026-02-02 15:45:00-05	30	\N
b34dc8ee-3f72-4678-81b6-96300cedc206	d26591cb-d82e-4086-8192-b0acfe87c3e4	0	2026-02-26 19:30:00-05	2026-02-26 21:00:00-05	90	\N
5e59356f-401e-4ad7-ba63-d940978db0b7	d26591cb-d82e-4086-8192-b0acfe87c3e4	1	2026-02-26 20:15:00-05	2026-02-26 21:00:00-05	45	\N
0058c1c6-c03c-4d7a-a3a6-b9c229873a94	3b928e19-ee3c-4104-a444-336e7401ef57	0	2026-02-27 09:30:00-05	2026-02-27 11:00:00-05	90	\N
41b9ab8d-0f6a-4096-8b84-df08b4e8474e	3b928e19-ee3c-4104-a444-336e7401ef57	1	2026-02-27 10:15:00-05	2026-02-27 11:00:00-05	45	\N
fac3ba03-2051-48a4-8f77-9294157e312b	e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	0	2026-02-28 07:30:00-05	2026-02-28 09:00:00-05	90	\N
706030cb-f981-425e-965a-6112a25d9b22	e6f399aa-3ac6-47ba-91b2-391d24f1d3e2	1	2026-02-28 08:15:00-05	2026-02-28 09:00:00-05	45	\N
\.


--
-- Data for Name: availability_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_settings (id, minute_increment, timezone, default_location_place_id, default_location_label, default_location_lat, default_location_lng, duration_rounding_enabled, duration_rounding_increment, duration_rounding_method, overlap_out_of_office_enforcement, created_at, updated_at, drive_time_fee_complimentary_minutes, drive_time_fee_rate_per_hour, drive_time_fee_rounding_minutes) FROM stdin;
ebd5a509-bbca-4f06-9ad6-ae99714c4056	30	America/New_York	ChIJG3WDuNC3t4kRTu9xC8VPKLU	Home	38.9192	-77.0459	t	15	roundUp	off	2026-03-21 09:57:49.345082-04	2026-03-21 11:52:59.522-04	60	100	15
\.


--
-- Data for Name: availability_buffers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_buffers (id, availability_settings_id, buffer_kind, minutes, enforcement, placement, apply_to) FROM stdin;
8e89edcb-48a6-4944-b154-750c7df9333d	ebd5a509-bbca-4f06-9ad6-ae99714c4056	appointment	20	hard	off	\N
62eeb29a-f02b-44c5-ac0f-1ebb77de78a8	ebd5a509-bbca-4f06-9ad6-ae99714c4056	drive_to_candidate	40	hard	\N	skipDayStart
275b9ecb-db12-4932-9762-2450c26cb009	ebd5a509-bbca-4f06-9ad6-ae99714c4056	drive_from_candidate	20	hard	\N	skipDayEnd
\.


--
-- Data for Name: availability_business_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_business_hours (id, availability_settings_id, day_of_week, start_at, end_at) FROM stdin;
78838db6-fe7e-4894-b6f1-4d4809eaa40f	ebd5a509-bbca-4f06-9ad6-ae99714c4056	0	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
860fc696-9b38-41e3-aa6f-3e8b0f1af2e1	ebd5a509-bbca-4f06-9ad6-ae99714c4056	1	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
e2b5630e-bb82-4832-b9d5-8d09cd0cd953	ebd5a509-bbca-4f06-9ad6-ae99714c4056	2	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
da9519cc-2416-422e-8522-7c125ebc1910	ebd5a509-bbca-4f06-9ad6-ae99714c4056	3	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
509899bc-da56-4b4e-9cbd-55bcacd8f4d2	ebd5a509-bbca-4f06-9ad6-ae99714c4056	4	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
a20877e6-6ba1-441b-b5b2-f7fd3c676fa1	ebd5a509-bbca-4f06-9ad6-ae99714c4056	5	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
dd1a5f91-dc6f-49d1-8c3e-22a7ac1633d0	ebd5a509-bbca-4f06-9ad6-ae99714c4056	6	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
\.


--
-- Data for Name: availability_differential_attendees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_differential_attendees (id, availability_settings_id, role, sort_order, value) FROM stdin;
98ff0bf7-c850-4311-b9b7-3ac6a001e8d2	ebd5a509-bbca-4f06-9ad6-ae99714c4056	major	0	464fa760-13f1-4760-b5d9-1a2fd5474eea
32af5be0-12b7-4394-8001-c7f63179354c	ebd5a509-bbca-4f06-9ad6-ae99714c4056	major	1	40b16b79-d5df-4f30-9dec-509e2a65d7f3
8ba3a4b1-3fb4-4c11-bea7-e22e02158fc9	ebd5a509-bbca-4f06-9ad6-ae99714c4056	minor	0	464fa760-13f1-4760-b5d9-1a2fd5474eea
b090b75c-33ea-4e5c-b0c6-0ef8add0ee50	ebd5a509-bbca-4f06-9ad6-ae99714c4056	minor	1	925a88dc-8f7c-40da-927f-79d46a794b9a
7985f61c-02c6-4e99-94b6-2cd7cc7a54b4	ebd5a509-bbca-4f06-9ad6-ae99714c4056	minor	2	40b16b79-d5df-4f30-9dec-509e2a65d7f3
\.


--
-- Data for Name: availability_max_income; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_max_income (id, availability_settings_id, scope, max_income, enforcement, rolling_direction) FROM stdin;
\.


--
-- Data for Name: availability_max_work_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_max_work_hours (id, availability_settings_id, scope, max_hours, enforcement, rolling_direction) FROM stdin;
\.


--
-- Data for Name: availability_range_constraints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_range_constraints (id, availability_settings_id, range_type, enforcement, lead_time_minutes, date_range_start, date_range_end) FROM stdin;
aac335ce-bb7e-4018-9f3f-fde8f09a27da	ebd5a509-bbca-4f06-9ad6-ae99714c4056	businessHours	hard	\N	\N	\N
387804d3-7d4e-4db3-8099-8653550e9d5a	ebd5a509-bbca-4f06-9ad6-ae99714c4056	leadTime	hard	60	\N	\N
\.


--
-- Data for Name: availability_range_constraint_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.availability_range_constraint_hours (id, range_constraint_id, day_of_week, start_at, end_at) FROM stdin;
634310f2-81f2-4815-8f57-733a9edffc6c	aac335ce-bb7e-4018-9f3f-fde8f09a27da	0	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
739e268f-5c4f-407b-b37b-57be2ba76193	aac335ce-bb7e-4018-9f3f-fde8f09a27da	1	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
067f85fe-a319-4137-9c17-64c3658eaf2e	aac335ce-bb7e-4018-9f3f-fde8f09a27da	2	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
8a180b6e-0859-4e66-9fd8-5ae91f5cf165	aac335ce-bb7e-4018-9f3f-fde8f09a27da	3	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
95c0d718-2a8f-43bb-b73f-bc3f4a00d088	aac335ce-bb7e-4018-9f3f-fde8f09a27da	4	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
ca107e82-f043-42dd-8339-30b2c48d1e04	aac335ce-bb7e-4018-9f3f-fde8f09a27da	5	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
d7993bfb-4515-4f29-9ba1-b722734dfe17	aac335ce-bb7e-4018-9f3f-fde8f09a27da	6	2000-01-01 07:00:00-05	2000-01-01 21:00:00-05
\.


--
-- Data for Name: beta_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beta_feedback (id, reporter_name, reporter_email, category, severity, title, description, page_url, browser_info, screen_size, steps_to_reproduce, expected_behavior, actual_behavior, status, resolution_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: beta_feedback_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beta_feedback_tags (id, feedback_id, tag) FROM stdin;
\.


--
-- Data for Name: booking_cascades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_cascades (id, parent_id, child_id, disabled, created_at, updated_at) FROM stdin;
7baef219-9810-405e-920c-1db167f680f7	925a88dc-8f7c-40da-927f-79d46a794b9a	71d4e133-0007-40b5-b249-7f1c9d2f7772	f	2026-01-09 02:49:09.763234	2026-01-09 02:49:09.763234
c151a18e-fee2-4345-abd5-6bec7a5fac50	925a88dc-8f7c-40da-927f-79d46a794b9a	6bf75af9-8a55-415f-9ae4-c038a1f34e61	f	2026-01-09 02:49:09.767895	2026-01-09 02:49:09.767895
aa85f2b5-5d84-48bd-9e74-61694ebf78ed	40b16b79-d5df-4f30-9dec-509e2a65d7f3	71d4e133-0007-40b5-b249-7f1c9d2f7772	f	2026-01-09 02:49:26.385643	2026-01-09 02:49:26.385643
bb57f769-1c53-44a3-a45e-8a89a51dc086	40b16b79-d5df-4f30-9dec-509e2a65d7f3	6bf75af9-8a55-415f-9ae4-c038a1f34e61	f	2026-01-09 02:49:26.398479	2026-01-09 02:49:26.398479
80b28e72-dbd1-4668-b99d-68e2814ea632	71d4e133-0007-40b5-b249-7f1c9d2f7772	d8ac1b8d-60a1-44da-a953-c065fab9648a	f	2026-01-09 02:49:57.814791	2026-01-09 02:49:57.814791
aba9605c-3581-44ce-bf12-8de68541fc10	71d4e133-0007-40b5-b249-7f1c9d2f7772	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	f	2026-01-09 02:49:57.816776	2026-01-09 02:49:57.816776
aa90960d-dbf9-491f-a939-7d56d380ed0c	71d4e133-0007-40b5-b249-7f1c9d2f7772	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	f	2026-01-09 02:49:57.818038	2026-01-09 02:49:57.818038
abb86d40-14ee-4026-b611-1984f10142d3	71d4e133-0007-40b5-b249-7f1c9d2f7772	ff79708b-4edf-4981-bb2a-8ba9cd24fc5b	f	2026-01-09 02:49:57.819778	2026-01-09 02:49:57.819778
06e36002-1a75-4792-bdf5-03744016dc90	6bf75af9-8a55-415f-9ae4-c038a1f34e61	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	f	2026-01-09 02:50:22.424967	2026-01-09 02:50:22.424967
58ffa607-4ab1-468f-8a03-282824e5192a	6bf75af9-8a55-415f-9ae4-c038a1f34e61	d8ac1b8d-60a1-44da-a953-c065fab9648a	f	2026-01-09 02:50:22.435604	2026-01-09 02:50:22.435604
2422ceec-d20f-4651-9052-dfa687625b04	6bf75af9-8a55-415f-9ae4-c038a1f34e61	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	f	2026-01-09 02:50:22.439752	2026-01-09 02:50:22.439752
0193ee45-3b83-4d76-ba7c-e36941fdd3ed	6bf75af9-8a55-415f-9ae4-c038a1f34e61	ff79708b-4edf-4981-bb2a-8ba9cd24fc5b	f	2026-01-09 02:50:22.442391	2026-01-09 02:50:22.442391
90ae55ef-f552-4fb1-829e-8c4d8f82bfc1	ff79708b-4edf-4981-bb2a-8ba9cd24fc5b	db3942c3-8d49-4a92-a2dd-73ac142d5701	f	2026-01-09 02:51:19.544401	2026-01-09 02:51:19.544401
ead09410-c317-42a8-9b43-200c8a61ef9f	ff79708b-4edf-4981-bb2a-8ba9cd24fc5b	925ff678-2d75-47b0-adaa-23bff4c6e1e6	f	2026-01-09 02:51:19.548113	2026-01-09 02:51:19.548113
1f90e93b-50c7-4692-abac-f58dd808aad9	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	8f0d9ac5-3215-4eca-ae9c-7ba6ee60e533	f	2026-01-09 02:51:40.082001	2026-01-09 02:51:40.082001
f710774c-d267-4c90-a347-b8e24e21ad7f	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	db3942c3-8d49-4a92-a2dd-73ac142d5701	f	2026-01-09 02:51:40.084391	2026-01-09 02:51:40.084391
6cfe9332-1734-497c-aefe-6092f5f736e8	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	925ff678-2d75-47b0-adaa-23bff4c6e1e6	f	2026-01-09 02:51:40.089982	2026-01-09 02:51:40.089982
531359d4-6e06-41fb-9ca2-492616b30005	9ed2de4d-b90c-4c4c-bf62-6225ec8cda28	bf374191-f440-447b-8b0f-b9f991031237	f	2026-01-09 02:51:40.091461	2026-01-09 02:51:40.091461
582fcd39-daaa-4777-bc93-4e436206aa70	d8ac1b8d-60a1-44da-a953-c065fab9648a	925ff678-2d75-47b0-adaa-23bff4c6e1e6	f	2026-01-09 02:51:51.066563	2026-01-09 02:51:51.066563
3ca1a536-4f43-403b-a58a-4aa4dee36d30	d8ac1b8d-60a1-44da-a953-c065fab9648a	bf374191-f440-447b-8b0f-b9f991031237	f	2026-01-09 02:51:51.067676	2026-01-09 02:51:51.067676
1d61c35c-6e60-4469-b1d2-efd200f2bb58	d8ac1b8d-60a1-44da-a953-c065fab9648a	db3942c3-8d49-4a92-a2dd-73ac142d5701	f	2026-01-09 02:51:51.07022	2026-01-09 02:51:51.07022
39b138ed-a2e4-4924-8d0f-773f9d324982	d8ac1b8d-60a1-44da-a953-c065fab9648a	8f0d9ac5-3215-4eca-ae9c-7ba6ee60e533	f	2026-01-09 02:51:51.071111	2026-01-09 02:51:51.071111
c1dcbf15-47d3-481f-a616-ee0d9b5931e0	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	8f0d9ac5-3215-4eca-ae9c-7ba6ee60e533	f	2026-01-09 02:51:59.383477	2026-01-09 02:51:59.383477
ebd5d7d9-5cbd-4350-869a-04ac89e77565	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	db3942c3-8d49-4a92-a2dd-73ac142d5701	f	2026-01-09 02:51:59.384297	2026-01-09 02:51:59.384297
5706dea4-45e0-4713-85c5-195d796f5118	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	925ff678-2d75-47b0-adaa-23bff4c6e1e6	f	2026-01-09 02:51:59.385113	2026-01-09 02:51:59.385113
0135f2e9-412f-4fef-8e99-f9d7f6c9a97e	f48a2b12-3de8-4f61-951b-779dbdc7b3cc	bf374191-f440-447b-8b0f-b9f991031237	f	2026-01-09 02:51:59.388984	2026-01-09 02:51:59.388984
3c61bbba-8687-4e9c-80c3-fc623dcbbdd3	71d4e133-0007-40b5-b249-7f1c9d2f7772	925ff678-2d75-47b0-adaa-23bff4c6e1e6	f	2026-01-09 06:46:42.596094	2026-01-09 06:46:42.596094
380d1dbc-b78c-401d-a072-b530246bc44e	71d4e133-0007-40b5-b249-7f1c9d2f7772	bf374191-f440-447b-8b0f-b9f991031237	f	2026-01-09 06:46:42.599532	2026-01-09 06:46:42.599532
5695d745-9f56-42af-9e8b-f427cd2fe872	71d4e133-0007-40b5-b249-7f1c9d2f7772	db3942c3-8d49-4a92-a2dd-73ac142d5701	f	2026-01-09 06:46:42.607071	2026-01-09 06:46:42.607071
c355bc06-b181-4999-b5e0-c6c25dfc3a16	6bf75af9-8a55-415f-9ae4-c038a1f34e61	925ff678-2d75-47b0-adaa-23bff4c6e1e6	f	2026-01-09 06:46:54.679633	2026-01-09 06:46:54.679633
e680961a-caaa-4b90-a474-31395f32b6dc	6bf75af9-8a55-415f-9ae4-c038a1f34e61	db3942c3-8d49-4a92-a2dd-73ac142d5701	f	2026-01-09 06:46:54.682157	2026-01-09 06:46:54.682157
228cd621-5d53-45fd-9f7f-caa54bc44858	6bf75af9-8a55-415f-9ae4-c038a1f34e61	8f0d9ac5-3215-4eca-ae9c-7ba6ee60e533	f	2026-01-09 06:46:54.682926	2026-01-09 06:46:54.682926
2ed4ac48-eebb-42fe-99d5-7312fa1465b1	925a88dc-8f7c-40da-927f-79d46a794b9a	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-06 22:40:43.680108	2026-03-06 22:40:43.680108
cab53bfc-6135-4abc-86d6-96c28496eb3e	925a88dc-8f7c-40da-927f-79d46a794b9a	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-06 22:40:43.706518	2026-03-06 22:40:43.706518
cc17bab5-73b2-4901-a1c9-6b79a9f7ce3d	925a88dc-8f7c-40da-927f-79d46a794b9a	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-06 22:40:43.706792	2026-03-06 22:40:43.706792
1c29f418-6640-442b-9c32-03b2b25bc850	925a88dc-8f7c-40da-927f-79d46a794b9a	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-06 22:40:43.708195	2026-03-06 22:40:43.708195
b843fc5e-bdac-46cb-90da-88b8045359fa	6bf75af9-8a55-415f-9ae4-c038a1f34e61	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
e00aaac4-e12f-4db1-aba7-bd99151e8643	71d4e133-0007-40b5-b249-7f1c9d2f7772	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
8813fd92-17f1-47d6-bdc4-b8872668bbc8	2c4cc469-8f51-4066-8ad2-75c790277e42	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
c3d623d9-1b8d-417c-9d9d-f57d39380bfc	1c6346af-469d-4b40-8cc9-1e48f2594f80	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
19e915fe-bde0-48fd-a988-d34f0a3cba61	d8a2f79e-938f-472a-9da6-d414c695aaec	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
d417cbec-2457-43eb-9ee4-756259b529d5	e411fa45-c892-4291-a8f8-6a9a6d42b240	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
fad8b846-84b6-42fc-be1d-79feaa7ecab3	309ee11d-5df3-4b65-a30c-bb47b2743613	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
c1829022-78b8-481e-803e-138fe9682529	169b7f30-3091-4f80-9a93-7603ff06a359	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
f0ba76f5-8801-4190-9a24-ed17060e7e83	20d52207-ae48-4552-9078-75c0b94abc4d	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
08db64bb-55be-4f31-ad31-5641ca97011d	b35eb056-d45a-4f77-b1c8-41007edb1383	a8f3b5ee-1918-468f-b62e-902ba39444a4	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
b841716f-c9e7-450c-ac45-70f4692c06b0	6bf75af9-8a55-415f-9ae4-c038a1f34e61	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
2e454216-9810-492f-a801-5f1912217121	71d4e133-0007-40b5-b249-7f1c9d2f7772	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
c6d6fe17-fbe6-4ab0-a7f4-cbc60bf14fcc	2c4cc469-8f51-4066-8ad2-75c790277e42	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
0eee8f50-5e60-479c-8372-1a818c55576d	1c6346af-469d-4b40-8cc9-1e48f2594f80	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
27706955-7014-4704-ae0d-962aee8036e8	d8a2f79e-938f-472a-9da6-d414c695aaec	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
a17cabfd-36d2-4e95-b5db-adc9f8da4c91	e411fa45-c892-4291-a8f8-6a9a6d42b240	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
75fbe92c-cbe5-4d92-ac94-bc731e087557	309ee11d-5df3-4b65-a30c-bb47b2743613	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
5066b42a-574b-4e2d-9aaa-99a2c9e9c8f8	169b7f30-3091-4f80-9a93-7603ff06a359	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
7c5d3d87-0f87-4de4-af6c-0d0f1b4827c8	20d52207-ae48-4552-9078-75c0b94abc4d	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
da6ba188-09a1-4d11-a4be-db2ccf6c012e	b35eb056-d45a-4f77-b1c8-41007edb1383	61352ee6-603f-4ede-85bb-fc45a6220d01	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
069636fa-fa71-436d-901c-91f7d6a91496	6bf75af9-8a55-415f-9ae4-c038a1f34e61	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
192bd0db-ab2e-47d1-80dd-6bc540540eb1	71d4e133-0007-40b5-b249-7f1c9d2f7772	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
afa2395e-bd25-45e1-bd24-b8ad4ed6bee6	2c4cc469-8f51-4066-8ad2-75c790277e42	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
6c1682aa-7bf0-4391-a4ec-df589ae32222	1c6346af-469d-4b40-8cc9-1e48f2594f80	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
b29a42a4-2527-4e23-95f9-a04003af4f35	d8a2f79e-938f-472a-9da6-d414c695aaec	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
4e52dd66-004d-4715-bf0e-dfe5c40ac38d	e411fa45-c892-4291-a8f8-6a9a6d42b240	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
89d1fd65-0abc-4b9e-a184-7c654f4a77a0	309ee11d-5df3-4b65-a30c-bb47b2743613	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
efc07046-4a80-42ca-bce4-fec29c249e7e	169b7f30-3091-4f80-9a93-7603ff06a359	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
acf664f2-e263-455a-9ab8-f0608dd85f93	20d52207-ae48-4552-9078-75c0b94abc4d	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
d889933e-fa3a-49b8-93a1-40462781f4b3	b35eb056-d45a-4f77-b1c8-41007edb1383	053fdfa6-1dfa-4b14-8d3a-8febc6bc57ab	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
4c784589-f778-4ecb-be3f-87b685d4f106	6bf75af9-8a55-415f-9ae4-c038a1f34e61	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
f4449740-e6b3-4e1c-8909-f822982159da	71d4e133-0007-40b5-b249-7f1c9d2f7772	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
9de887d4-3afe-4e8d-9069-1887cd08451c	2c4cc469-8f51-4066-8ad2-75c790277e42	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
38e8b440-2d34-457a-a970-774dc511ae8b	1c6346af-469d-4b40-8cc9-1e48f2594f80	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
286425c0-a221-48c2-ae05-0dbd1f0387b9	d8a2f79e-938f-472a-9da6-d414c695aaec	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
2b33c977-04f1-4e7a-9912-36f918ebfa09	e411fa45-c892-4291-a8f8-6a9a6d42b240	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
032d66bb-fa15-4e2e-9efa-c244cb4aa015	309ee11d-5df3-4b65-a30c-bb47b2743613	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
eea294c2-f7dd-4fba-9850-db6e4161ac02	169b7f30-3091-4f80-9a93-7603ff06a359	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
95856742-7a6a-40bd-9f7f-30c320a43edd	20d52207-ae48-4552-9078-75c0b94abc4d	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
d3c1217b-0d37-47ce-acde-bd21dcff7841	b35eb056-d45a-4f77-b1c8-41007edb1383	93df4a57-a05f-4e25-a189-5f938da61c7e	f	2026-03-07 17:05:51.309251	2026-03-07 17:05:51.309251
\.


--
-- Data for Name: business_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_rules (id, block_instance_id, rule_type, rule_config, validation_message_annotation_id, active, created_at, updated_at) FROM stdin;
7ab581c4-a4d0-433e-a4a4-ce5fbafa5135	ff79708b-4edf-4981-bb2a-8ba9cd24fc5b	required_fields	{"fields": ["numberOfUnits"], "condition": "isMultiFamily"}	7490090a-0cb0-4c06-b58a-36d5fb3765ac	t	2026-01-31 19:08:31.444-05	2026-01-31 19:08:31.444-05
\.


--
-- Data for Name: calendar_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_settings (id, created_at, updated_at, enabled, provider, hold_duration_minutes, hold_duration_min, hold_duration_max, hold_duration_fallback, admin_entry_timeout_value, admin_entry_timeout_unit, auto_confirm_enabled) FROM stdin;
d31929b3-5d11-4f2c-afc8-24c6896ba5d2	2026-03-15 20:21:16.56-04	2026-03-21 11:52:59.503-04	t	google	20	1	60	15	30	days	t
\.


--
-- Data for Name: calendar_setting_calendars; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_setting_calendars (id, calendar_settings_id, sort_order, email, label, read_from, write_to) FROM stdin;
a5d74528-39ef-4657-baf3-5f98666a5c06	d31929b3-5d11-4f2c-afc8-24c6896ba5d2	0	scheduling@districthomepro.com	Dev Testing	t	t
c6427bdc-1e4e-4777-842f-07a4d958faf6	d31929b3-5d11-4f2c-afc8-24c6896ba5d2	1	will@districthomepro.com	Work	t	f
cd75348d-1c0e-4956-90c4-e9dd0a23e276	d31929b3-5d11-4f2c-afc8-24c6896ba5d2	2	will.b.whittaker@gmail.com	Personal	t	f
\.


--
-- Data for Name: constraint_overrides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.constraint_overrides (id, appointment_id, overridden_violations, authorized_by_id, reason, slot_start, slot_end, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dependent_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dependent_instances (id, parent_id, child_id, disabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: entity_layout_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_layout_config (id, entity_id, entity_type, field_key, visibility, layout, "order", section, render_as, status_button_color, panel, bulk_edit, created_at, updated_at) FROM stdin;
3af83097-31c5-41d3-ae05-71bd5f39c013	26d66957-e7a1-40a7-829e-b68a5ca49b8e	block	icon	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.521-05	2026-01-14 10:55:35.521-05
41929128-c086-47ee-8a0c-cae4e3fad0a2	26d66957-e7a1-40a7-829e-b68a5ca49b8e	block	differential	alwaysVisible	inline	0	\N	statusButton	secondary	none	f	2026-01-14 10:55:35.551-05	2026-01-14 10:55:35.551-05
810c4e8e-8edf-4aa2-a5b5-ca2de3d4b1d7	26d66957-e7a1-40a7-829e-b68a5ca49b8e	block	allowMultiple	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.553-05	2026-01-14 10:55:35.553-05
13204ddf-39f5-4827-8dd1-c5250b845b65	26d66957-e7a1-40a7-829e-b68a5ca49b8e	block	requiresUnitNumber	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.557-05	2026-01-14 10:55:35.557-05
fd6aada1-2519-4b50-a988-e9b46e199878	c9d53a2f-fbbd-4a93-bb84-48c828617af4	block	icon	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.558-05	2026-01-14 10:55:35.558-05
8f2e2469-f275-41a3-a5ad-f14ffbbbdc32	c9d53a2f-fbbd-4a93-bb84-48c828617af4	block	active	alwaysVisible	inline	0	\N	statusButton	primary	none	f	2026-01-14 10:55:35.559-05	2026-01-14 10:55:35.559-05
984c6758-75d6-484b-8b8a-360e15e45d71	c9d53a2f-fbbd-4a93-bb84-48c828617af4	block	baseSqFt	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.559-05	2026-01-14 10:55:35.559-05
297a510d-229f-4740-aa90-1bbfc39ad671	c9d53a2f-fbbd-4a93-bb84-48c828617af4	block	differential	alwaysVisible	inline	0	\N	statusButton	success	none	f	2026-01-14 10:55:35.56-05	2026-01-14 10:55:35.56-05
4f71b204-32e1-48b6-befc-2c86d6528009	c9d53a2f-fbbd-4a93-bb84-48c828617af4	block	allowMultiple	expandedDirect	inline	0	\N	statusButton	default	none	f	2026-01-14 10:55:35.561-05	2026-01-14 10:55:35.561-05
001c4df2-db94-45e3-ac90-a7057891f01a	c9d53a2f-fbbd-4a93-bb84-48c828617af4	block	requiresUnitNumber	expandedDirect	inline	0	\N	statusButton	info	none	f	2026-01-14 10:55:35.564-05	2026-01-14 10:55:35.564-05
3b389002-9e4c-44cc-8b13-e454e9d1ec5c	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	icon	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.565-05	2026-01-14 10:55:35.565-05
35404998-9a70-4dff-8c65-ee94ae1cd4d0	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	active	alwaysVisible	inline	0	\N	statusButton	primary	none	f	2026-01-14 10:55:35.566-05	2026-01-14 10:55:35.566-05
c9c2cba2-be51-4323-97ae-57ff604670d0	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	baseSqFt	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.567-05	2026-01-14 10:55:35.567-05
0f96a5b6-b9a6-44d3-8bc2-e2a1b9fc97f2	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	composable	expandedDirect	stacked	0	\N	statusButton	success	none	f	2026-01-14 10:55:35.568-05	2026-01-14 10:55:35.568-05
eda5b978-587d-46d0-930d-f64719356e50	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	constituable	alwaysVisible	stacked	0	\N	statusButton	info	none	f	2026-01-14 10:55:35.569-05	2026-01-14 10:55:35.569-05
0c74a4d8-31f2-4151-aa26-466988552bfc	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	differential	alwaysVisible	inline	0	\N	statusButton	secondary	none	f	2026-01-14 10:55:35.57-05	2026-01-14 10:55:35.57-05
0b9c3601-f16d-46c3-8909-d12c024ed751	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	allowMultiple	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.571-05	2026-01-14 10:55:35.571-05
bcef5491-2125-4237-b9aa-537d2d6309aa	c3e2fbe7-5201-4151-8355-14ebe8741b48	block	requiresUnitNumber	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.573-05	2026-01-14 10:55:35.573-05
d0da0e78-e9bf-4d45-b228-2d9bd2a4b610	c6e7ec8a-ed79-4280-b54c-3e8b75155168	block	icon	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.575-05	2026-01-14 10:55:35.575-05
74dd4624-b32b-407c-907a-19a3f4c8451e	c6e7ec8a-ed79-4280-b54c-3e8b75155168	block	differential	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.58-05	2026-01-14 10:55:35.58-05
f942045c-f78f-4423-96ef-45ed69a48c0c	c6e7ec8a-ed79-4280-b54c-3e8b75155168	block	allowMultiple	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.581-05	2026-01-14 10:55:35.581-05
eb4e1c1b-ad92-47a6-a46b-0305d50cda03	c6e7ec8a-ed79-4280-b54c-3e8b75155168	block	requiresUnitNumber	hidden	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.587-05	2026-01-14 10:55:35.587-05
4bba0da3-aff3-48bd-b2df-209c8c653f33	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	onSite	alwaysVisible	inline	0	\N	statusButton	secondary	none	f	2026-01-14 10:55:35.593-05	2026-01-14 10:55:35.593-05
1078ebb1-4561-43e7-b457-04826bf8662e	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	baseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.593-05	2026-01-14 10:55:35.593-05
9164b710-2479-4aa4-8e13-5a7d38b81581	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	baseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.594-05	2026-01-14 10:55:35.594-05
a025abc5-3e95-4bba-99e8-45b248c0e950	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	moveable	alwaysVisible	inline	0	\N	statusButton	success	none	f	2026-01-14 10:55:35.595-05	2026-01-14 10:55:35.595-05
9b5fd1a7-c7bc-478e-a8c2-6f2a4970ffe4	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	zeroOutPart	expandedDirect	inline	0	\N	statusButton	warning	none	f	2026-01-14 10:55:35.595-05	2026-01-14 10:55:35.595-05
5717990d-7359-4dc7-9f75-c2887fcbe43f	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	clientPresent	alwaysVisible	inline	0	\N	statusButton	info	none	f	2026-01-14 10:55:35.596-05	2026-01-14 10:55:35.596-05
c281432c-a37a-45d9-bcc9-4cc052fbce64	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	rateOverBaseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.597-05	2026-01-14 10:55:35.597-05
e86fed61-903e-403e-9d3a-b7bbea402f37	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	rateOverBaseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.599-05	2026-01-14 10:55:35.599-05
15c3d131-6a59-4771-8568-f991fad0650b	16d2945f-c38e-45bc-9947-35c73544416f	part	onSite	alwaysVisible	inline	0	\N	statusButton	secondary	none	f	2026-01-14 10:55:35.602-05	2026-01-14 10:55:35.602-05
cb91a745-4678-48f7-b38b-51b524baa707	16d2945f-c38e-45bc-9947-35c73544416f	part	baseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.603-05	2026-01-14 10:55:35.603-05
fab6b1ca-d960-4cb0-9e48-48fb5015a18a	16d2945f-c38e-45bc-9947-35c73544416f	part	baseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.605-05	2026-01-14 10:55:35.605-05
ea94f2b5-6fcd-4bcb-b04d-9004a3e2f634	16d2945f-c38e-45bc-9947-35c73544416f	part	moveable	alwaysVisible	inline	0	\N	statusButton	success	none	f	2026-01-14 10:55:35.606-05	2026-01-14 10:55:35.606-05
be30973a-aa4a-40ca-bd87-01c74aef541b	16d2945f-c38e-45bc-9947-35c73544416f	part	zeroOutPart	expandedDirect	inline	0	\N	statusButton	warning	none	f	2026-01-14 10:55:35.609-05	2026-01-14 10:55:35.609-05
1a15f8d1-75df-431e-9b38-87f66ff780fd	16d2945f-c38e-45bc-9947-35c73544416f	part	clientPresent	alwaysVisible	inline	0	\N	statusButton	info	none	f	2026-01-14 10:55:35.612-05	2026-01-14 10:55:35.612-05
14c1898b-aae1-4a43-8421-a017f78db41c	16d2945f-c38e-45bc-9947-35c73544416f	part	rateOverBaseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.613-05	2026-01-14 10:55:35.613-05
806f4488-0635-4b95-94c6-c11c34904800	16d2945f-c38e-45bc-9947-35c73544416f	part	rateOverBaseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.614-05	2026-01-14 10:55:35.614-05
a1005320-c219-4f27-b51f-4641b02a3ee0	16d2945f-c38e-45bc-9947-35c73544416f	part	active	expandedDirect	inline	0	\N	statusButton	primary	none	f	2026-01-14 10:55:35.601-05	2026-01-14 10:55:35.601-05
37afdeee-1969-406e-a9d6-3036c527048f	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	part	active	expandedDirect	inline	0	\N	statusButton	primary	none	f	2026-01-14 10:55:35.591-05	2026-01-14 10:55:35.591-05
83305d14-030b-41fb-944c-7ab6fe3dbee5	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	active	expandedDirect	inline	0	\N	statusButton	primary	none	f	2026-01-14 10:55:35.616-05	2026-01-14 10:55:35.616-05
06961942-ab8e-4e2f-82f0-fface030f150	26d66957-e7a1-40a7-829e-b68a5ca49b8e	block	baseSqFt	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.55-05	2026-01-14 10:55:35.55-05
44637728-8ff4-4919-8fef-9c5af32e94ea	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	onSite	alwaysVisible	inline	0	\N	statusButton	secondary	none	f	2026-01-14 10:55:35.617-05	2026-01-14 10:55:35.617-05
db44096e-79f2-4ea3-8ca7-c0abfb2f84cc	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	baseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.619-05	2026-01-14 10:55:35.619-05
40c86e56-da1b-406c-bbe3-da9fe455cc11	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	baseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.62-05	2026-01-14 10:55:35.62-05
49e3156b-4642-4283-aed0-efee5e85ced8	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	moveable	alwaysVisible	inline	0	\N	statusButton	success	none	f	2026-01-14 10:55:35.62-05	2026-01-14 10:55:35.62-05
be2f3014-d86d-4710-8447-21911be7a1de	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	zeroOutPart	expandedDirect	inline	0	\N	statusButton	warning	none	f	2026-01-14 10:55:35.621-05	2026-01-14 10:55:35.621-05
18db9841-bbae-4bf8-a5e2-691ff8cf4d39	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	clientPresent	alwaysVisible	inline	0	\N	statusButton	info	none	f	2026-01-14 10:55:35.622-05	2026-01-14 10:55:35.622-05
39c01724-984a-4a7f-afce-33887774fc38	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	rateOverBaseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.623-05	2026-01-14 10:55:35.623-05
b5efc22f-1d90-4a9b-b87b-aa9bc6377dc3	42d854d2-1461-4e4c-9e74-e39ff505ac69	part	rateOverBaseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.624-05	2026-01-14 10:55:35.624-05
c1dec33e-ee77-41ee-8f6f-70c3005a0dee	70f68a49-8339-4590-8716-cd4bcccabee5	part	onSite	alwaysVisible	inline	0	\N	statusButton	secondary	none	f	2026-01-14 10:55:35.626-05	2026-01-14 10:55:35.626-05
4e0c483a-5e3c-4596-9ae9-a72e4d6d0295	70f68a49-8339-4590-8716-cd4bcccabee5	part	baseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.627-05	2026-01-14 10:55:35.627-05
9c8cef62-f11b-4252-8ef7-01a0b6125abb	70f68a49-8339-4590-8716-cd4bcccabee5	part	baseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.628-05	2026-01-14 10:55:35.628-05
f5d67704-56e6-41b8-ae86-fbc6c03b4a84	70f68a49-8339-4590-8716-cd4bcccabee5	part	moveable	alwaysVisible	inline	0	\N	statusButton	success	none	f	2026-01-14 10:55:35.629-05	2026-01-14 10:55:35.629-05
ba77021e-a0fd-4433-a936-312270d05d4e	70f68a49-8339-4590-8716-cd4bcccabee5	part	zeroOutPart	expandedDirect	inline	0	\N	statusButton	warning	none	f	2026-01-14 10:55:35.629-05	2026-01-14 10:55:35.629-05
5bba0a8e-1ee6-499f-be00-a746bfb82f50	70f68a49-8339-4590-8716-cd4bcccabee5	part	clientPresent	alwaysVisible	inline	0	\N	statusButton	info	none	f	2026-01-14 10:55:35.63-05	2026-01-14 10:55:35.63-05
6cae8a84-9c5a-4f63-9b46-88145d4d4d47	70f68a49-8339-4590-8716-cd4bcccabee5	part	rateOverBaseFee	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.631-05	2026-01-14 10:55:35.631-05
c62d0f68-9d6d-493c-8c98-65a9cdfc0afc	70f68a49-8339-4590-8716-cd4bcccabee5	part	rateOverBaseTime	expandedDirect	inline	0	\N	field	default	none	f	2026-01-14 10:55:35.632-05	2026-01-14 10:55:35.632-05
50391255-db4c-4605-9fc1-17192edf12e8	70f68a49-8339-4590-8716-cd4bcccabee5	part	active	expandedDirect	inline	0	\N	statusButton	primary	none	f	2026-01-14 10:55:35.626-05	2026-01-14 10:55:35.626-05
22bd820f-8ab1-4694-a849-4cdec12e6128	00000000-0000-0000-0000-000000000001	blockShape	name	alwaysVisible	stacked	0	\N	field	\N	none	f	2026-01-14 12:28:16.134-05	2026-01-14 12:28:16.134-05
3dd42d51-ee18-4843-8b5a-bb516af08f8e	00000000-0000-0000-0000-000000000001	blockShape	composable	expandedDirect	stacked	1	\N	field	\N	none	f	2026-01-14 12:28:16.136-05	2026-01-14 12:28:16.136-05
9a06ac38-ce29-4a43-a478-101595f92710	00000000-0000-0000-0000-000000000001	blockShape	constituable	expandedDirect	stacked	2	\N	field	\N	none	f	2026-01-14 12:28:16.137-05	2026-01-14 12:28:16.137-05
cc776158-e850-4e44-866e-34534f11b17e	00000000-0000-0000-0000-000000000001	blockShape	type	expandedDirect	stacked	3	\N	field	\N	none	f	2026-01-14 12:28:16.138-05	2026-01-14 12:28:16.138-05
ac607944-885d-47f9-ba69-20b5acac7d7b	00000000-0000-0000-0000-000000000002	partShape	name	alwaysVisible	stacked	0	\N	field	\N	none	f	2026-01-14 12:28:16.14-05	2026-01-14 12:28:16.14-05
d4fe7f0d-843c-46ce-9b07-e4e10e530243	26d66957-e7a1-40a7-829e-b68a5ca49b8e	block	active	alwaysVisible	inline	0	\N	statusButton	primary	none	f	2026-01-14 10:55:35.548-05	2026-01-14 10:55:35.548-05
90c6a562-8327-4112-8b15-0dd8eae08715	c6e7ec8a-ed79-4280-b54c-3e8b75155168	block	active	alwaysVisible	stacked	1	\N	statusButton	primary	none	f	2026-01-14 11:56:23.000488-05	2026-01-14 11:56:23.000488-05
\.


--
-- Data for Name: event_shapes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_shapes (id, name, created_at, updated_at, order_index, active, is_ternary, ternary_default, differential_role, include_reschedule_link, include_cancel_link) FROM stdin;
3cdfe1a5-d49e-40fa-b339-fd92dec13eb6	Client Presentation	2026-01-30 11:12:32.997-05	2026-01-31 13:32:37.436-05	2	t	t	true	minor	t	t
2fe56381-8354-4f56-b15f-e974fb6b6ed0	Moveable Part	2026-01-30 11:12:32.997-05	2026-01-31 13:32:37.438-05	1	t	f	true	moveable	t	t
14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Total Time	2026-01-30 11:12:32.996-05	2026-01-31 13:32:37.436-05	0	t	f	true	major	t	t
a6596028-ec7a-42c0-a623-6c06f45d1e6b	tester	2026-03-21 21:18:02.115479-04	2026-03-21 21:18:02.115479-04	3	t	f	\N	\N	t	t
\.


--
-- Data for Name: event_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_instances (id, event_shape_ref, name, title_template, description_template, location_template, created_at, updated_at, order_index, active, visibility, transparency, guests_can_modify, guests_can_invite_others, guests_can_see_other_guests, add_conference_link, send_updates, color_id, status, reminder_overrides) FROM stdin;
1bc6f1a4-a48b-4062-b5b8-d8815e399dbd	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Data Collection-OnSite				2026-01-31 14:06:51.406054-05	2026-01-31 14:06:51.406054-05	4	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
b3de0a00-3ec4-4955-bc1a-e2ed8446621c	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Data Collection-OnSite				2026-01-31 14:07:51.333088-05	2026-01-31 14:07:51.333088-05	5	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
11506d57-c2cf-4bbb-b222-e666dd59000e	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Data Collection-OnSite				2026-01-31 14:09:22.066841-05	2026-01-31 14:09:22.066841-05	6	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
dc02f654-1c44-4464-a292-48e7c227ff50	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Data Collection-OnSite				2026-01-31 14:11:54.012075-05	2026-01-31 14:11:54.012075-05	7	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
34e25def-8154-4a8f-be5b-c4b86baa4d75	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Report Writing-OnSite				2026-01-31 14:27:39.597989-05	2026-01-31 14:27:39.597989-05	8	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
42aa18fe-dc48-479a-92f0-944337220b5b	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Report Writing-OnSite				2026-01-31 14:31:08.833727-05	2026-01-31 14:31:08.833727-05	9	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
ee9b9511-88c8-4a75-a77a-52479d2ac384	2fe56381-8354-4f56-b15f-e974fb6b6ed0	Buyer's Inspection-Report Writing-Moveable				2026-01-31 14:31:23.46001-05	2026-01-31 14:31:23.46001-05	10	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
db34c9bc-335f-44fe-b5e4-4dc62c465e97	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Formal Presentation-OnSite				2026-01-31 14:31:33.475967-05	2026-01-31 14:31:33.475967-05	11	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
aa11e33f-ff2e-462c-af47-f262c26bcfce	3cdfe1a5-d49e-40fa-b339-fd92dec13eb6	Buyer's Inspection-Formal Presentation-ClientPresent				2026-01-31 14:31:37.426025-05	2026-01-31 14:31:37.426025-05	12	t	default	opaque	f	t	t	f	all	\N	confirmed	\N
9c14e023-a6c2-42fe-9635-114bee637998	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	Buyer's Inspection-Data Collection-OnSite	{service} Inspection Prep	Only the Inspector is here{rescheduleLink}	{fullAddress}	2026-01-31 14:03:07.627-05	2026-01-31 14:03:07.627-05	3	t	default	opaque	f	t	t	f	all	\N	confirmed	""
\.


--
-- Data for Name: event_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_assignments (id, created_at, updated_at, parent_id, parent_kind, child_id, disabled) FROM stdin;
c7398481-44ef-4e8e-be37-e6459b4daea6	2026-01-31 14:11:54.119768-05	2026-03-21 21:42:09.526688-04	71d4e133-0007-40b5-b249-7f1c9d2f7772	blockInstance	dc02f654-1c44-4464-a292-48e7c227ff50	f
1de17b42-8156-426c-84ad-c35728e71af5	2026-01-31 14:31:23.5422-05	2026-03-21 21:42:09.526688-04	71d4e133-0007-40b5-b249-7f1c9d2f7772	blockInstance	ee9b9511-88c8-4a75-a77a-52479d2ac384	f
19218a79-04b3-4132-8d34-2f3c87298888	2026-01-31 14:31:08.954953-05	2026-03-21 21:42:09.526688-04	71d4e133-0007-40b5-b249-7f1c9d2f7772	blockInstance	42aa18fe-dc48-479a-92f0-944337220b5b	f
fff12ee3-f519-4ac5-9330-6f7deca49e54	2026-01-31 14:31:37.502617-05	2026-03-21 21:42:09.526688-04	71d4e133-0007-40b5-b249-7f1c9d2f7772	blockInstance	aa11e33f-ff2e-462c-af47-f262c26bcfce	f
c9dc4d25-61db-41b4-8cbf-4f59ffefe986	2026-01-31 14:31:33.566513-05	2026-03-21 21:42:09.526688-04	71d4e133-0007-40b5-b249-7f1c9d2f7772	blockInstance	db34c9bc-335f-44fe-b5e4-4dc62c465e97	f
\.


--
-- Data for Name: event_shape_attendees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_shape_attendees (id, event_shape_id, user_type_block_instance_id, created_at, updated_at, disabled) FROM stdin;
09abb88e-d187-4866-b5d7-38b2dcc5eeb2	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	40b16b79-d5df-4f30-9dec-509e2a65d7f3	2026-01-31 15:45:35.017411-05	2026-01-31 15:45:35.017411-05	f
69633750-2066-4eb1-b223-ff4a36079b32	3cdfe1a5-d49e-40fa-b339-fd92dec13eb6	40b16b79-d5df-4f30-9dec-509e2a65d7f3	2026-01-31 15:46:19.170559-05	2026-01-31 15:46:19.170559-05	f
bbae93cb-d364-458c-86c3-a3c43894c34a	3cdfe1a5-d49e-40fa-b339-fd92dec13eb6	925a88dc-8f7c-40da-927f-79d46a794b9a	2026-01-31 15:46:19.172237-05	2026-01-31 15:46:19.172237-05	f
02bfbe4c-cc39-4a4b-8fd7-e564b4118e9d	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	925a88dc-8f7c-40da-927f-79d46a794b9a	2026-02-25 18:31:29.763273-05	2026-02-25 18:31:29.763273-05	f
\.


--
-- Data for Name: instance_components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.instance_components (id, parent_id, child_id, disabled, created_at, updated_at, order_index) FROM stdin;
7b014971-fb1b-4b99-9a28-8a78af815f87	71d4e133-0007-40b5-b249-7f1c9d2f7772	169b7f30-3091-4f80-9a93-7603ff06a359	f	2026-02-10 17:47:14.230967-05	2026-02-10 17:47:14.230967-05	0
4aac8fad-bc78-40a9-afcf-4c3d6e6ddf7f	71d4e133-0007-40b5-b249-7f1c9d2f7772	b35eb056-d45a-4f77-b1c8-41007edb1383	f	2026-02-10 17:47:14.232126-05	2026-02-10 17:47:14.232126-05	1
0ac4d6f6-b47f-44cc-8b81-5d9a8f6ef645	71d4e133-0007-40b5-b249-7f1c9d2f7772	309ee11d-5df3-4b65-a30c-bb47b2743613	f	2026-02-10 17:47:14.231663-05	2026-02-10 17:47:14.231663-05	3
0f749083-91e8-4785-adf1-a1217ad4bc47	71d4e133-0007-40b5-b249-7f1c9d2f7772	20d52207-ae48-4552-9078-75c0b94abc4d	f	2026-02-10 17:47:14.232721-05	2026-02-10 17:47:14.232721-05	2
f2b46a55-70ec-4934-a373-0dd75073a887	71d4e133-0007-40b5-b249-7f1c9d2f7772	2c4cc469-8f51-4066-8ad2-75c790277e42	f	2026-03-21 14:52:54.948689-04	2026-03-21 14:52:54.948689-04	5
77a4901e-4a3d-4450-927f-0f0bccceca91	71d4e133-0007-40b5-b249-7f1c9d2f7772	e411fa45-c892-4291-a8f8-6a9a6d42b240	f	2026-03-21 14:52:54.949385-04	2026-03-21 14:52:54.949385-04	4
a9853d2a-edad-4161-8865-d318a491e6fd	6bf75af9-8a55-415f-9ae4-c038a1f34e61	b35eb056-d45a-4f77-b1c8-41007edb1383	f	2026-03-21 14:53:37.952938-04	2026-03-21 14:53:37.952938-04	1
0a968749-ac6f-4fe9-9eb4-82f8586d0743	6bf75af9-8a55-415f-9ae4-c038a1f34e61	2c4cc469-8f51-4066-8ad2-75c790277e42	f	2026-03-21 14:53:37.954867-04	2026-03-21 14:53:37.954867-04	0
7d218a07-6703-4f1b-8e6b-b03b88cbdbb0	6bf75af9-8a55-415f-9ae4-c038a1f34e61	e411fa45-c892-4291-a8f8-6a9a6d42b240	f	2026-03-21 14:53:37.95518-04	2026-03-21 14:53:37.95518-04	2
\.


--
-- Data for Name: part_shapes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.part_shapes (id, name, order_index, created_at, updated_at) FROM stdin;
16d2945f-c38e-45bc-9947-35c73544416f	Early Arrival	0	2025-10-27 11:31:29.547	2025-10-27 11:31:29.547
714eb9dd-dd32-4db7-92e7-86cb5aa5c497	Report Writing	2	2025-10-26 23:31:29.547	2025-10-26 23:31:29.547
42d854d2-1461-4e4c-9e74-e39ff505ac69	Formal Presentation	3	2025-10-26 23:31:29.547	2025-10-26 23:31:29.547
70f68a49-8339-4590-8716-cd4bcccabee5	Data Collection	1	2025-10-26 23:31:29.547	2025-10-26 23:31:29.547
4d88b347-52bb-472d-b351-b484cb4e61b8	something	4	2026-02-26 22:57:47.506807	2026-02-26 22:57:47.506807
\.


--
-- Data for Name: part_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.part_instances (id, name, order_index, part_shape_ref, created_at, updated_at, base_fee, rate_over_base_fee, base_time, rate_over_base_time, active, zero_out_part) FROM stdin;
da247699-99a6-430a-8b38-ddaf98b90182	Buyer's Inspection-Data Collection	9	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-12 13:30:15.009096	2026-01-12 13:30:15.009096	25	100	15	60	f	f
e3144dcf-a636-4485-b81c-cbb09a8f85d0	Buyer's Inspection-Data Collection	9	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-12 13:30:28.40727	2026-01-12 13:30:28.40727	25	100	15	60	f	f
54ebde71-23d1-496b-a4cd-165cc0ff63ec	Buyer's Inspection-Data Collection	9	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-12 13:32:34.653647	2026-01-12 13:32:34.653647	25	100	15	60	f	f
6e2c6799-ba05-4e7d-b13f-6740f7644a93	Buyer's Inspection-Early Arrival	0	16d2945f-c38e-45bc-9947-35c73544416f	2026-01-07 20:25:33.190693	2026-01-07 20:25:33.190693	0	0	0	0	t	f
2e798e85-7fd2-4e1c-a743-b36e3cfa3b4c	Buyer's Inspection-Data Collection	1	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-07 20:25:47.297203	2026-01-07 20:25:47.297203	0	0	0	0	t	f
5064ab15-2284-4900-9437-661ab2fc2ded	Buyer's Inspection-Report Writing	2	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	2026-01-07 20:25:56.490842	2026-01-07 20:25:56.490842	0	0	0	0	t	f
633a1c6f-71b2-446e-992c-70d20977efdd	Buyer's Inspection-Formal Presentation	3	42d854d2-1461-4e4c-9e74-e39ff505ac69	2026-01-07 20:26:01.501121	2026-01-07 20:26:01.501121	0	0	0	0	t	f
df5f06cb-004b-471e-9265-df2a583baa2a	Buyer's Inspection-Data Collection	4	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-12 01:36:19.440054	2026-01-12 01:36:19.440054	0	0	0	0	t	f
27043b3c-df57-4efb-867b-f84e764f6909	Buyer's Inspection-Data Collection	5	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-12 13:21:08.259257	2026-01-12 13:21:08.259257	0	0	0	0	t	f
4060fc67-80f0-45e7-bc16-11a4518cd14b	Composite Flat Stand-alone-Formal Presentation	16	42d854d2-1461-4e4c-9e74-e39ff505ac69	2026-01-30 05:21:33.446	2026-01-30 05:21:33.446	25	106	15	204	t	f
0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	8	42d854d2-1461-4e4c-9e74-e39ff505ac69	2026-01-12 23:27:51.098	2026-01-12 23:27:51.098	75	100	37	60	t	f
87dcdf28-3535-478f-8123-8aaf2cfafa73	No Presentation-Formal Presentation	11	42d854d2-1461-4e4c-9e74-e39ff505ac69	2026-01-15 20:00:33.929575	2026-01-15 20:00:33.929575	0	0	0	0	t	t
26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	6	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-12 23:27:42.045	2026-01-12 23:27:42.045	25	100	20	60	t	f
bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	7	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	2026-01-12 23:27:47.464	2026-01-12 23:27:47.464	50	100	25	60	t	f
c85d6960-5195-456d-9111-e229ed1092f8	Extra Presentation Time-Formal Presentation	14	42d854d2-1461-4e4c-9e74-e39ff505ac69	2026-01-28 02:05:46.301	2026-01-28 02:05:46.301	25	0	15	0	t	f
dd9eb144-c3c1-44e8-bbc1-1fe02f323e54	Walk and Talk-Data Collection	10	70f68a49-8339-4590-8716-cd4bcccabee5	2026-01-13 20:04:17.426	2026-01-13 20:04:17.426	30	100	20	200	t	f
2c0671eb-1111-42ff-abc3-c4e9435e4e70	Composite Flat Stand-alone-Report Writing	15	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	2026-01-29 23:55:41.937143	2026-01-29 23:55:41.937143	35	101	25	201	t	f
8f0e2e1b-3d9e-5c2f-0a7b-4e3d2c1b0a9e	Drive time	0	70f68a49-8339-4590-8716-cd4bcccabee5	2026-03-21 13:35:16.757077	2026-03-21 13:35:16.757077	0	0	0	0	t	f
\.


--
-- Data for Name: part_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.part_assignments (id, parent_id, child_id, disabled, created_at, updated_at) FROM stdin;
16256e43-2157-4f3f-b018-bb03b37da589	71d4e133-0007-40b5-b249-7f1c9d2f7772	26e0e481-8bf5-4112-8271-1756a0243d9a	f	2026-01-12 13:27:42.193357	2026-01-12 13:27:42.193357
12d01efc-64d8-4e38-bedf-c16de5e34b90	71d4e133-0007-40b5-b249-7f1c9d2f7772	bef43695-3ea8-44dc-b611-64c81ecadb33	f	2026-01-12 13:27:47.622308	2026-01-12 13:27:47.622308
6188f5bd-b2f0-4f5c-8df4-d9c1e577fb51	71d4e133-0007-40b5-b249-7f1c9d2f7772	0c48255a-72b6-4b30-8896-c097cf2e3a6c	f	2026-01-12 13:27:51.219903	2026-01-12 13:27:51.219903
edfebf4a-81d6-48d2-b4e2-b5d9d7409d40	6bf75af9-8a55-415f-9ae4-c038a1f34e61	dd9eb144-c3c1-44e8-bbc1-1fe02f323e54	f	2026-01-13 15:04:17.536037	2026-01-13 15:04:17.536037
6b9d13e0-5e5a-44b5-aad0-c5375fbc4b60	925ff678-2d75-47b0-adaa-23bff4c6e1e6	87dcdf28-3535-478f-8123-8aaf2cfafa73	f	2026-01-15 20:00:34.029343	2026-01-15 20:00:34.029343
c462b107-87cc-47a5-9658-4ed37bb31c03	bf374191-f440-447b-8b0f-b9f991031237	c85d6960-5195-456d-9111-e229ed1092f8	f	2026-01-27 21:05:46.397263	2026-01-27 21:05:46.397263
dea4a5bd-d133-4049-833f-eea7fa528a57	71d4e133-0007-40b5-b249-7f1c9d2f7772	da247699-99a6-430a-8b38-ddaf98b90182	t	2026-01-12 13:30:15.232211	2026-01-12 13:30:15.232211
8c28a5be-3ba6-417d-8b1f-4a1dc49391f3	71d4e133-0007-40b5-b249-7f1c9d2f7772	e3144dcf-a636-4485-b81c-cbb09a8f85d0	t	2026-01-12 13:30:28.566659	2026-01-12 13:30:28.566659
43d5a37a-d83a-49c0-b798-cf97556ff412	71d4e133-0007-40b5-b249-7f1c9d2f7772	54ebde71-23d1-496b-a4cd-165cc0ff63ec	t	2026-01-12 13:32:34.874579	2026-01-12 13:32:34.874579
1425e0cf-92c8-441c-90c8-108d6b2c9f4a	6bf75af9-8a55-415f-9ae4-c038a1f34e61	2c0671eb-1111-42ff-abc3-c4e9435e4e70	f	2026-01-29 23:55:42.032418	2026-01-29 23:55:42.032418
cf4b89fa-a5e0-4740-ac15-de160aceac02	6bf75af9-8a55-415f-9ae4-c038a1f34e61	4060fc67-80f0-45e7-bc16-11a4518cd14b	f	2026-01-30 00:21:33.527831	2026-01-30 00:21:33.527831
9a1f3e2c-4e0f-6d3a-1b8c-5f4e3d2c1b0a	7e9e1f0a-2c8d-4b1e-9f6a-3d2c1b0a9e8f	8f0e2e1b-3d9e-5c2f-0a7b-4e3d2c1b0a9e	f	2026-03-21 13:35:16.758323	2026-03-21 13:35:16.758323
\.


--
-- Data for Name: part_instance_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.part_instance_versions (id, block_instance_version_id, part_instance_id, name, base_fee, base_time, rate_over_base_fee, rate_over_base_time, created_at) FROM stdin;
38cfd5e3-e27c-43cf-a805-8e2dd3c5528a	57994807-bc21-41fe-8106-b87a36798c40	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	0	0	0	0	2026-01-12 22:00:39.107002-05
9c18f7cf-7c2a-4b03-b193-f4c0650a536f	57994807-bc21-41fe-8106-b87a36798c40	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	0	0	0	0	2026-01-12 22:00:39.107002-05
a6184605-0420-42fb-8c65-507a9bc587d4	57994807-bc21-41fe-8106-b87a36798c40	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	0	0	0	0	2026-01-12 22:00:39.107002-05
aa209239-07cf-4d2b-a19b-dd15af327b11	57994807-bc21-41fe-8106-b87a36798c40	da247699-99a6-430a-8b38-ddaf98b90182	Buyer's Inspection-Data Collection	0	0	0	0	2026-01-12 22:00:39.107002-05
1202a039-9c46-44e5-992b-775bc38c390e	57994807-bc21-41fe-8106-b87a36798c40	e3144dcf-a636-4485-b81c-cbb09a8f85d0	Buyer's Inspection-Data Collection	0	0	0	0	2026-01-12 22:00:39.107002-05
eb575b98-839f-402e-bf3c-07276a011a36	57994807-bc21-41fe-8106-b87a36798c40	54ebde71-23d1-496b-a4cd-165cc0ff63ec	Buyer's Inspection-Data Collection	0	0	0	0	2026-01-12 22:00:39.107002-05
cb7dfb68-efde-4283-9a9a-d9d3f5f1882c	0fcccfeb-d0f5-457f-b790-5c225b758f14	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	0	200	0	0	2026-01-13 10:03:44.211114-05
0e2b8cc3-3d0a-4b2e-9bb7-d293a4bffc64	0fcccfeb-d0f5-457f-b790-5c225b758f14	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	0	200	0	0	2026-01-13 10:03:44.211114-05
7ab28c0f-8303-4dde-a209-1ff7f0b5c433	0fcccfeb-d0f5-457f-b790-5c225b758f14	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	0	200	0	0	2026-01-13 10:03:44.211114-05
779d5f80-7a31-4be2-aa97-d792ba686732	0fcccfeb-d0f5-457f-b790-5c225b758f14	da247699-99a6-430a-8b38-ddaf98b90182	Buyer's Inspection-Data Collection	0	200	0	0	2026-01-13 10:03:44.211114-05
a649ed99-be1c-427a-8fcf-2255519bcf9d	0fcccfeb-d0f5-457f-b790-5c225b758f14	e3144dcf-a636-4485-b81c-cbb09a8f85d0	Buyer's Inspection-Data Collection	0	200	0	0	2026-01-13 10:03:44.211114-05
1b0c93b1-ae6f-4037-8d73-cd0fcb687dac	0fcccfeb-d0f5-457f-b790-5c225b758f14	54ebde71-23d1-496b-a4cd-165cc0ff63ec	Buyer's Inspection-Data Collection	0	200	0	0	2026-01-13 10:03:44.211114-05
e6c3cb36-bd13-4352-a752-9b34ff97d423	2c215a94-2216-4cf2-8322-c5a6af875f5a	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-20 12:34:56.600033-05
6a3539bc-c2f7-4686-816b-0e099ffe3bf1	2c215a94-2216-4cf2-8322-c5a6af875f5a	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	219	20	0	60	2026-01-20 12:34:56.600033-05
5b73b155-47df-44b7-9333-b9ba031b8e87	2c215a94-2216-4cf2-8322-c5a6af875f5a	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	219	20	0	60	2026-01-20 12:34:56.600033-05
82dfb496-1452-43c3-a4dd-5f928719f5ca	2c215a94-2216-4cf2-8322-c5a6af875f5a	da247699-99a6-430a-8b38-ddaf98b90182	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-20 12:34:56.600033-05
73e0cfbf-33fd-4697-be82-0fcc6be8f9ee	2c215a94-2216-4cf2-8322-c5a6af875f5a	e3144dcf-a636-4485-b81c-cbb09a8f85d0	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-20 12:34:56.600033-05
991ce2ad-7c0f-4dc9-be5d-f3b7b4439e55	2c215a94-2216-4cf2-8322-c5a6af875f5a	54ebde71-23d1-496b-a4cd-165cc0ff63ec	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-20 12:34:56.600033-05
e5089d06-4576-4758-949b-2c89e0f055d5	81caa9b5-2945-4248-b671-2c6e0171cc66	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-26 14:17:39.905215-05
5f8a6289-832d-4822-bb11-efccb251dfcc	81caa9b5-2945-4248-b671-2c6e0171cc66	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	219	20	0	60	2026-01-26 14:17:39.905215-05
47dc9e16-d62b-43d1-b36b-b39c09b4f903	81caa9b5-2945-4248-b671-2c6e0171cc66	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	219	20	0	60	2026-01-26 14:17:39.905215-05
dc9365b8-49a2-430e-9766-1e46536327a3	81caa9b5-2945-4248-b671-2c6e0171cc66	da247699-99a6-430a-8b38-ddaf98b90182	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-26 14:17:39.905215-05
3d5579c2-20e4-4521-9ee6-06407b85e2cd	81caa9b5-2945-4248-b671-2c6e0171cc66	e3144dcf-a636-4485-b81c-cbb09a8f85d0	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-26 14:17:39.905215-05
f6709055-e89a-425c-bf3e-085ae24b8ed5	81caa9b5-2945-4248-b671-2c6e0171cc66	54ebde71-23d1-496b-a4cd-165cc0ff63ec	Buyer's Inspection-Data Collection	219	20	0	60	2026-01-26 14:17:39.905215-05
8b0a4c02-b66b-4062-81f7-6040191d4654	b11f5f6d-cf6e-41ed-a552-c9f1c353606d	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	75	37	100	60	2026-01-29 14:54:19.950757-05
5ef37e1f-37d2-48ff-90f7-c59a01ba3502	b11f5f6d-cf6e-41ed-a552-c9f1c353606d	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	25	20	100	60	2026-01-29 14:54:19.950757-05
a7f88b47-c8a5-42c7-a666-d4c86c6fe6ea	b11f5f6d-cf6e-41ed-a552-c9f1c353606d	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	50	25	100	60	2026-01-29 14:54:19.950757-05
8a536355-7118-4171-8d16-04a2b752efa5	20df3d38-a53b-4327-b46e-42cf22ec2212	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	75	37	100	60	2026-02-10 17:32:18.036186-05
39155385-9a83-443c-839c-96372f7dfd7b	20df3d38-a53b-4327-b46e-42cf22ec2212	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	25	20	100	60	2026-02-10 17:32:18.036186-05
8fd55972-08d8-4813-9696-d5783eff1884	20df3d38-a53b-4327-b46e-42cf22ec2212	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	50	25	100	60	2026-02-10 17:32:18.036186-05
a1c83292-d901-4960-93b2-102ec96663b3	5b413d77-14f1-4c50-b65a-cae48f11ce6c	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	75	37	100	60	2026-02-10 17:32:18.110561-05
49d5a2a2-6997-4856-8db6-7b7c08c0b065	5b413d77-14f1-4c50-b65a-cae48f11ce6c	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	25	20	100	60	2026-02-10 17:32:18.110561-05
e4ae0b1e-c95b-46bd-b6ee-3d64c8c174a3	5b413d77-14f1-4c50-b65a-cae48f11ce6c	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	50	25	100	60	2026-02-10 17:32:18.110561-05
36122ef9-6958-4b3a-aa9d-8ccc28063c0a	41bca924-4cfa-4164-a340-e827f5589246	0c48255a-72b6-4b30-8896-c097cf2e3a6c	Buyer's Inspection-Formal Presentation	75	37	100	60	2026-02-27 16:50:46.743698-05
79c1d570-a5dd-49e5-ba2c-cfcf818f0efd	41bca924-4cfa-4164-a340-e827f5589246	26e0e481-8bf5-4112-8271-1756a0243d9a	Buyer's Inspection-Data Collection	25	20	100	60	2026-02-27 16:50:46.743698-05
647cdb3d-2a21-4441-a062-428c83d63a36	41bca924-4cfa-4164-a340-e827f5589246	bef43695-3ea8-44dc-b611-64c81ecadb33	Buyer's Inspection-Report Writing	50	25	100	60	2026-02-27 16:50:46.743698-05
\.


--
-- Data for Name: pricing_cascades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_cascades (id, parent_id, child_id, disabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_details (id, property_version_id, source, mls_number, square_footage, bedrooms, bathrooms, foundation_access, additional_units, created_at, updated_at) FROM stdin;
00e54abf-af8e-4416-991c-4ebdce015ea9	db6b1800-b430-415f-9f9f-d99b95d80af3	client	\N	680	\N	\N	\N	\N	2026-01-03 16:37:37.836-05	2026-01-03 16:37:37.836-05
0c5e1622-bc91-4359-8e5f-8da15bf40124	702e1655-6b78-4aac-bda7-5411410d2ad1	client	\N	800	\N	\N	\N	\N	2026-01-03 16:37:37.89-05	2026-01-03 16:37:37.89-05
0e06d668-77de-4498-baa0-ff97df139c0d	b6405afd-534e-41a3-bc02-cb1ae7ec1771	client	\N	302	\N	\N	\N	\N	2026-01-03 16:37:37.869-05	2026-01-03 16:37:37.869-05
1b0e7e35-4591-4159-872f-764742255e11	c5e45412-6ee9-4a1a-b109-e12fd8db4a2c	client	\N	302	\N	\N	\N	\N	2026-01-03 16:37:37.896-05	2026-01-03 16:37:37.896-05
1d6e4f9b-c80b-4e51-ac10-d8496d923dcf	909cd25a-b36b-4ab5-861d-e78005060be0	client	\N	1201	\N	\N	\N	\N	2026-01-03 16:37:37.9-05	2026-01-03 16:37:37.9-05
233189e2-1316-4175-beda-ebca22f29212	07461c33-c3d2-4d40-a214-f1db5c3197fd	client	\N	800	\N	\N	\N	\N	2026-01-03 16:37:37.894-05	2026-01-03 16:37:37.894-05
27f0302f-2467-4434-a1d9-95ebc2ac94fe	d6b91b78-b3cb-43cc-b4f1-2a883efb8d1b	client	\N	251	\N	\N	\N	\N	2026-01-03 16:37:37.831-05	2026-01-03 16:37:37.831-05
29184258-ae4d-4ffb-8964-aafe466b99f9	4d66b65e-66ea-42bc-a190-3adf79070217	client	\N	251	\N	\N	\N	\N	2026-01-03 16:37:37.883-05	2026-01-03 16:37:37.883-05
292d15dd-342c-4445-a6f3-85bf9ab8dbcc	6d491803-198a-406e-8095-17339e94d520	client	\N	800	\N	\N	\N	\N	2026-01-03 16:37:37.846-05	2026-01-03 16:37:37.846-05
31b7152e-8351-4e37-ae94-b98884ac98ba	a3b82dd7-dd39-43a5-a9a3-592732d47153	client	\N	251	\N	\N	\N	\N	2026-01-03 16:37:37.797-05	2026-01-03 16:37:37.797-05
4faf461e-fc66-4bc2-8198-2cda7e705a6b	a5073149-fc1d-43dc-b39e-b6417d8dc492	client	\N	680	\N	\N	\N	\N	2026-01-03 16:37:37.85-05	2026-01-03 16:37:37.85-05
56e993d1-ae3a-4055-b382-912d521e1193	a7c6151f-766d-429d-9807-1e0bc4bfcac7	client	\N	507	\N	\N	\N	\N	2026-01-03 16:37:37.867-05	2026-01-03 16:37:37.867-05
66d695af-9e08-4c41-8835-c100e948171a	14395b07-44ed-439d-bb1c-1ce0dd48b6f7	client	\N	2294	\N	\N	\N	\N	2026-01-03 16:37:37.907-05	2026-01-03 16:37:37.907-05
8cfa0c9c-473e-47bc-9dcd-214d3f69577e	95b26d9b-f284-4792-942b-ce2fe5f0f990	client	\N	251	\N	\N	\N	\N	2026-01-03 16:37:37.826-05	2026-01-03 16:37:37.826-05
8f81c25a-c7a4-48d0-8253-5ac39b823586	98e669c4-d073-4418-94ad-6d5e0c53d015	client	\N	507	\N	\N	\N	\N	2026-01-03 16:37:37.862-05	2026-01-03 16:37:37.862-05
9aa0964a-a7cd-4614-866a-0e0bb6b96e98	aaed68b3-769d-494f-9d46-066a12c75d18	client	\N	302	\N	\N	\N	\N	2026-01-03 16:37:37.815-05	2026-01-03 16:37:37.815-05
b8504454-e5b0-4eb0-ac31-d1f39365de96	e2086f8b-e311-4654-90e6-8a6c657cf472	client	\N	251	\N	\N	\N	\N	2026-01-03 16:37:37.844-05	2026-01-03 16:37:37.844-05
baddcc6f-17ed-4acb-888c-157d02d48ad4	0324a23f-1404-4fa6-91b2-7ba1e6d1bf3f	client	\N	302	\N	\N	\N	\N	2026-01-03 16:37:37.822-05	2026-01-03 16:37:37.822-05
bfc41b41-9210-4e0a-82e3-661f9d1f6bb3	23cc1b89-c880-4675-ba43-232b003a8e67	client	\N	680	\N	\N	\N	\N	2026-01-03 16:37:37.887-05	2026-01-03 16:37:37.887-05
c4b3584c-6d00-4a0a-8baf-165f3cdc6f90	59b57f05-e653-41bf-a66e-36cacfd6b3b3	client	\N	507	\N	\N	\N	\N	2026-01-03 16:37:37.902-05	2026-01-03 16:37:37.902-05
c75f68d1-88fa-4b31-b60e-f2248fa56b28	837ce8a9-c2ff-43fa-8c89-a6396a46c2e3	client	\N	1201	\N	\N	\N	\N	2026-01-03 16:37:37.842-05	2026-01-03 16:37:37.842-05
cd0a233a-dbf1-46bf-809a-341a11724ff9	bce735b7-2d99-4399-a200-05bde624319b	client	\N	507	\N	\N	\N	\N	2026-01-03 16:37:37.78-05	2026-01-03 16:37:37.78-05
d032d323-0c66-4cee-b4ae-c1f97528f9fd	88aea53d-8d90-41de-bf78-8be96271c03b	client	\N	251	\N	\N	\N	\N	2026-01-03 16:37:37.874-05	2026-01-03 16:37:37.874-05
d5596148-4740-4f62-af5a-23fbf84112cf	60e1c91a-3ac0-4369-931a-5f030083c2c1	client	\N	800	\N	\N	\N	\N	2026-01-03 16:37:37.804-05	2026-01-03 16:37:37.804-05
d7fbd686-3699-401a-86ae-51aa75d23549	2c63ca4b-dd41-4b97-9ff4-5439ed2d7b03	client	\N	2294	\N	\N	\N	\N	2026-01-03 16:37:37.879-05	2026-01-03 16:37:37.879-05
da971a99-68fd-4064-a556-b4a7cf857dfd	d8eed4a4-a1c6-4f22-9cd7-e9370f3e2fc4	client	\N	302	\N	\N	\N	\N	2026-01-03 16:37:37.856-05	2026-01-03 16:37:37.856-05
db0c6cae-bcba-4be6-b6e4-7c1762c0d718	08f60b0f-90c2-4a03-a7c7-08b4702d1924	client	\N	302	\N	\N	\N	\N	2026-01-03 16:37:37.817-05	2026-01-03 16:37:37.817-05
e4aa8def-b11f-404c-a6a5-76a71fca20fb	dfde6ac8-80aa-447a-b6ce-e0f024107cd2	client	\N	2294	\N	\N	\N	\N	2026-01-03 16:37:37.811-05	2026-01-03 16:37:37.811-05
f60dbc46-7458-4694-b76d-dcaf7a1d1c21	6db6520e-0dd9-42da-9df6-275c54d8c50f	client	\N	800	\N	\N	\N	\N	2026-01-03 16:37:37.839-05	2026-01-03 16:37:37.839-05
87a92148-3470-49db-9f0f-d50828607545	b01ac9c8-9eba-4bd4-af4c-c8bce81d9ff2	client	\N	800	\N	\N	\N	\N	2026-01-09 01:48:39.15894-05	2026-01-09 01:48:39.15894-05
a4c72eb8-0f65-4fef-8669-600bcc56ffb2	a4babe1c-2a42-46c0-bc1e-682c120a3d3a	client	\N	800	\N	\N	\N	\N	2026-01-27 21:36:12.622276-05	2026-01-27 21:36:12.622276-05
9b055d2b-152a-4e04-a72a-346cec8d37a5	f03f10fa-d9c3-4cb3-8f84-472be69ff03e	client	\N	2294	\N	\N	\N	\N	2026-01-29 19:26:48.617208-05	2026-01-29 19:26:48.617208-05
179c4837-d547-4077-b5b3-707967e9198c	a1abfb4f-57e8-4621-9c09-367b6940da05	client	\N	507	\N	\N	\N	\N	2026-02-01 14:38:07.868498-05	2026-02-01 14:38:07.868498-05
ae59b6cb-379b-4601-85ac-bdb75d08c9dd	14d1dcee-0651-48db-b6c3-455e18c1c6e8	client	\N	1201	\N	\N	\N	\N	2026-02-25 20:26:04.244259-05	2026-02-25 20:26:04.244259-05
7889d504-dfc8-4507-b85f-41a3a76abd77	9f0dad4e-2551-4065-b1bc-92dec2e5d3d2	client	\N	1201	\N	\N	\N	\N	2026-02-25 20:26:55.191821-05	2026-02-25 20:26:55.191821-05
34912e56-3bb9-4c61-9f9b-49b4e0c12b36	bb353343-e842-4bef-991c-ae1490e34660	client	\N	251	\N	\N	\N	\N	2026-02-25 20:27:19.90465-05	2026-02-25 20:27:19.90465-05
33f3ef8a-a81b-422f-9faa-c801e762eaa3	36be7202-7369-4e25-bef8-5604e55450ec	client	\N	800	\N	\N	basement	\N	2026-01-03 16:37:37.769-05	2026-01-03 16:37:37.769-05
3f33efd7-f1ac-433d-a70d-56d6e3cc1b54	5f0d6c40-3b9f-4754-a053-abcf92eb745d	client	\N	251	\N	\N	\N	\N	2026-02-01 14:31:46.278713-05	2026-02-01 14:31:46.278713-05
1689e5fa-4075-4d60-b0c3-f5f78a074e33	1402674b-6479-49cb-bc1b-2c8733de7840	client	\N	507	\N	\N	\N	\N	2026-02-01 14:41:49.672767-05	2026-02-01 14:41:49.672767-05
7fce363d-f374-4f34-8c96-282a2c0315ef	1755fbfc-ac6e-45e2-aafa-f467fb69b04c	client	\N	251	\N	\N	\N	\N	2026-02-01 14:45:40.412176-05	2026-02-01 14:45:40.412176-05
38addb76-6a11-4421-9c55-fc1ceefddc83	514855ac-cc9b-4b53-b242-1590cd2cb6e4	client	\N	251	\N	\N	\N	\N	2026-02-01 14:48:30.566991-05	2026-02-01 14:48:30.566991-05
136ffd09-71d6-42e2-9186-2a9dab42afeb	cc0583c4-b9ce-4d31-a768-23821b406698	client	\N	507	\N	\N	\N	\N	2026-02-01 14:54:31.216076-05	2026-02-01 14:54:31.216076-05
d73d97f0-43d1-4760-b6a3-bb1be7e228b8	6cdfd9d3-0688-4a21-bb02-8a6296cb3d9d	client	\N	251	\N	\N	\N	\N	2026-02-01 15:08:04.95642-05	2026-02-01 15:08:04.95642-05
2d0f1d8d-1dba-4799-b845-6203934ee6b9	a7369ade-7bbc-497a-9823-81740e60b941	client	\N	251	\N	\N	\N	\N	2026-02-01 15:09:52.377004-05	2026-02-01 15:09:52.377004-05
f97d42b0-3272-4727-a2b1-18cfa5bd25cf	4b263c34-755a-452c-904e-9bca9f80b23d	client	\N	2294	\N	\N	\N	\N	2026-02-01 15:13:30.594019-05	2026-02-01 15:13:30.594019-05
f5d0f78e-1619-46d0-8f3b-3052957a8d2a	11724304-9569-4e52-a81b-c441741bc37e	client	\N	2294	\N	\N	\N	\N	2026-02-01 15:14:23.924105-05	2026-02-01 15:14:23.924105-05
5d1de86b-2b53-465c-8ff0-d4e3989c7b50	315e8bd4-a5b9-48dd-bce7-375e87a9e151	client	\N	251	\N	\N	\N	\N	2026-02-01 15:25:32.634841-05	2026-02-01 15:25:32.634841-05
8f912d59-7a5f-4e0c-a0b3-c98229f2ba67	22566be7-37a9-408a-8d34-35addf7e7708	client	\N	507	\N	\N	\N	\N	2026-02-01 15:33:46.971258-05	2026-02-01 15:33:46.971258-05
f20907f8-7995-4f08-8a0c-895702ab6914	57aa2c13-8b9c-441b-8fe8-1eb2b613285f	client	\N	1750	\N	\N	\N	\N	2026-02-02 09:54:33.707681-05	2026-02-02 09:54:33.707681-05
b63cf6b4-0868-4974-bf3f-e574eb56c976	20580e85-d3b3-4abc-b06e-56a27ee7d762	client	\N	507	\N	\N	\N	\N	2026-02-26 17:53:12.94704-05	2026-02-26 17:53:12.94704-05
2ea5f16e-fcfc-4936-b8c9-7c83460dd337	e0101dab-faa5-4c3a-b0a1-c9cebd76958f	client	\N	302	\N	\N	\N	\N	2026-02-26 22:39:15.705724-05	2026-02-26 22:39:15.705724-05
5734cfde-8b30-462f-a890-3f7ce4ff9aa2	7b64ebb2-579b-48e2-a5e4-a517bf55c152	client	\N	507	\N	\N	\N	\N	2026-02-27 16:50:46.433047-05	2026-02-27 16:50:46.433047-05
\.


--
-- Data for Name: property_feature_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_feature_mappings (id, data_source, source_field, match_type, match_value, block_instance_id, active, priority, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_field_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_field_mappings (id, data_source, source_field, target_field, value_mapping, fallback_value, active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_version_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_version_types (id, property_version_id, block_instance_id, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: valid_annotations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.valid_annotations (id, parent_id, child_id, disabled, created_at, updated_at) FROM stdin;
6458a2a1-ff62-4f79-89ad-cae2be5c61f6	26d66957-e7a1-40a7-829e-b68a5ca49b8e	3a1ddad9-4627-44fb-9394-074bc4a67763	f	2026-03-21 13:08:52.671719-04	2026-03-21 13:08:52.671719-04
676f0540-b275-40fc-afd3-9e54eccf7ac9	26d66957-e7a1-40a7-829e-b68a5ca49b8e	e4dd3170-4524-4074-9872-46d93fea6c65	f	2026-03-21 13:08:50.366116-04	2026-03-21 13:08:50.366116-04
4593c9f1-4ad2-45b0-8676-aec7c120c3eb	c6e7ec8a-ed79-4280-b54c-3e8b75155168	3a1ddad9-4627-44fb-9394-074bc4a67763	t	2026-03-21 12:26:49.964763-04	2026-03-21 12:26:49.964763-04
632eb232-a21c-4b25-80f5-d4d958e3f581	c6e7ec8a-ed79-4280-b54c-3e8b75155168	e4dd3170-4524-4074-9872-46d93fea6c65	f	2026-03-21 12:26:47.680129-04	2026-03-21 12:26:47.680129-04
\.


--
-- Data for Name: valid_cascades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.valid_cascades (id, parent_id, child_id, is_default, disabled, created_at, updated_at) FROM stdin;
238f76c5-a5bd-48b5-a2e4-9439aff7a514	c6e7ec8a-ed79-4280-b54c-3e8b75155168	26d66957-e7a1-40a7-829e-b68a5ca49b8e	f	f	2026-01-09 02:47:39.439372	2026-01-09 02:47:39.439372
4a7df14c-adb3-4581-9826-b3dfc8360da9	26d66957-e7a1-40a7-829e-b68a5ca49b8e	c9d53a2f-fbbd-4a93-bb84-48c828617af4	f	f	2026-01-09 02:47:58.525248	2026-01-09 02:47:58.525248
8911b7d1-33bb-460e-b09e-4922d45fcecf	26d66957-e7a1-40a7-829e-b68a5ca49b8e	c3e2fbe7-5201-4151-8355-14ebe8741b48	f	f	2026-01-09 02:47:58.526942	2026-01-09 02:47:58.526942
6b21daba-3d30-4457-93e3-efd9682cb69f	c9d53a2f-fbbd-4a93-bb84-48c828617af4	c3e2fbe7-5201-4151-8355-14ebe8741b48	f	f	2026-01-09 02:48:22.244257	2026-01-09 02:48:22.244257
65045f57-ac84-4c6f-bb20-60206001a24c	c6e7ec8a-ed79-4280-b54c-3e8b75155168	9acd044e-4470-4916-83fe-ac254eb6e7fe	f	f	2026-03-06 14:16:47.109918	2026-03-06 14:16:47.109918
33548ac1-a7bf-438d-bc92-a79fe467981f	26d66957-e7a1-40a7-829e-b68a5ca49b8e	9acd044e-4470-4916-83fe-ac254eb6e7fe	f	f	2026-03-06 22:46:04.484085	2026-03-06 22:46:04.484085
\.


--
-- Data for Name: valid_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.valid_events (id, parent_id, child_id, disabled, created_at, updated_at) FROM stdin;
e43ec1b7-f8ec-452d-8a6b-55801fb930de	26d66957-e7a1-40a7-829e-b68a5ca49b8e	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	f	2026-01-31 12:06:34.483358-05	2026-01-31 12:06:34.483358-05
8acdc58d-57a0-49ec-9a5a-7a3a5e3d86a7	26d66957-e7a1-40a7-829e-b68a5ca49b8e	2fe56381-8354-4f56-b15f-e974fb6b6ed0	f	2026-01-31 13:46:42.386267-05	2026-01-31 13:46:42.386267-05
7384b2e7-9e36-4417-b620-e1b2317f1de4	26d66957-e7a1-40a7-829e-b68a5ca49b8e	3cdfe1a5-d49e-40fa-b339-fd92dec13eb6	f	2026-01-31 13:46:50.099256-05	2026-01-31 13:46:50.099256-05
3a2d1515-f5e4-4c0c-ba27-004007460122	c3e2fbe7-5201-4151-8355-14ebe8741b48	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	f	2026-01-31 12:06:34.483358-05	2026-01-31 12:06:34.483358-05
672d8c1f-de76-4098-9c08-c717d496d721	c3e2fbe7-5201-4151-8355-14ebe8741b48	2fe56381-8354-4f56-b15f-e974fb6b6ed0	f	2026-01-31 13:46:42.386267-05	2026-01-31 13:46:42.386267-05
fd296ca2-4642-4f8d-b5bb-c4a6f8daade3	c3e2fbe7-5201-4151-8355-14ebe8741b48	3cdfe1a5-d49e-40fa-b339-fd92dec13eb6	f	2026-01-31 13:46:50.099256-05	2026-01-31 13:46:50.099256-05
3bba65c9-bf30-409c-a3e8-b71e280de4ec	c6e7ec8a-ed79-4280-b54c-3e8b75155168	14e0677e-bd1a-4fdc-95b8-6976acfbb1af	f	2026-01-31 12:06:34.483358-05	2026-01-31 12:06:34.483358-05
f803112a-a479-47fa-815e-b10821e59ea2	c6e7ec8a-ed79-4280-b54c-3e8b75155168	2fe56381-8354-4f56-b15f-e974fb6b6ed0	f	2026-01-31 13:46:42.386267-05	2026-01-31 13:46:42.386267-05
095c0b76-3c6e-4b8d-b030-2f0570e47969	c6e7ec8a-ed79-4280-b54c-3e8b75155168	3cdfe1a5-d49e-40fa-b339-fd92dec13eb6	f	2026-01-31 13:46:50.099256-05	2026-01-31 13:46:50.099256-05
\.


--
-- Data for Name: valid_parts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.valid_parts (id, parent_id, child_id, is_default, disabled, created_at, updated_at) FROM stdin;
b5113fc0-f74e-475d-9050-489c6fcf7284	26d66957-e7a1-40a7-829e-b68a5ca49b8e	70f68a49-8339-4590-8716-cd4bcccabee5	f	f	2026-01-09 02:48:02.902553	2026-01-09 02:48:02.902553
745cc7e2-8dab-4acd-b202-ca372789cc61	26d66957-e7a1-40a7-829e-b68a5ca49b8e	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	f	f	2026-01-09 02:48:02.924977	2026-01-09 02:48:02.924977
86adbe74-ae2e-4697-9d01-dd265ab0d1e5	26d66957-e7a1-40a7-829e-b68a5ca49b8e	42d854d2-1461-4e4c-9e74-e39ff505ac69	f	f	2026-01-09 02:48:02.932539	2026-01-09 02:48:02.932539
61701b9a-17f0-4043-b1c3-56769bcbe30e	c6e7ec8a-ed79-4280-b54c-3e8b75155168	70f68a49-8339-4590-8716-cd4bcccabee5	f	f	2026-01-15 19:57:27.481743	2026-01-15 19:57:27.481743
9d1e81d0-9a66-4625-965a-c8756ebc29fd	c6e7ec8a-ed79-4280-b54c-3e8b75155168	16d2945f-c38e-45bc-9947-35c73544416f	f	f	2026-01-15 19:57:27.509749	2026-01-15 19:57:27.509749
27cd38db-50fd-4310-b201-2cf92ba51c18	c6e7ec8a-ed79-4280-b54c-3e8b75155168	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	f	f	2026-01-15 19:57:27.511141	2026-01-15 19:57:27.511141
8eff9f2c-a851-48d1-be11-b7524f0751ae	c6e7ec8a-ed79-4280-b54c-3e8b75155168	42d854d2-1461-4e4c-9e74-e39ff505ac69	f	f	2026-01-15 19:57:27.51274	2026-01-15 19:57:27.51274
2efb6592-40fc-48e4-9c01-f0f775a2e8f6	c3e2fbe7-5201-4151-8355-14ebe8741b48	70f68a49-8339-4590-8716-cd4bcccabee5	f	f	2026-01-15 19:57:53.199358	2026-01-15 19:57:53.199358
525f23ea-e350-4c0a-88d2-8189fbf71f45	c3e2fbe7-5201-4151-8355-14ebe8741b48	714eb9dd-dd32-4db7-92e7-86cb5aa5c497	f	f	2026-01-15 19:57:53.202216	2026-01-15 19:57:53.202216
3ffb7cd4-40b1-431f-995e-5f05de888760	c3e2fbe7-5201-4151-8355-14ebe8741b48	42d854d2-1461-4e4c-9e74-e39ff505ac69	f	f	2026-01-15 19:57:53.203524	2026-01-15 19:57:53.203524
8d0273eb-f6da-406c-9a70-dad004561004	c3e2fbe7-5201-4151-8355-14ebe8741b48	16d2945f-c38e-45bc-9947-35c73544416f	f	f	2026-01-15 19:57:53.205612	2026-01-15 19:57:53.205612
58296cde-513c-4604-afa2-95d28d5cb7a4	26d66957-e7a1-40a7-829e-b68a5ca49b8e	16d2945f-c38e-45bc-9947-35c73544416f	f	f	2026-01-30 22:26:03.856746	2026-01-30 22:26:03.856746
\.


--
-- Data for Name: valid_pricing_cascades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.valid_pricing_cascades (id, parent_id, child_id, disabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wizard_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wizard_settings (id, created_at, updated_at, show_apply_coupon, use_brand_colors, major_label, minor_label, moveable_fallback_label, differential_graph_default_label, major_state_label, minor_state_label, select_time_slot_label, sub_step_label_pick_day, sub_step_label_options, sub_step_label_pick_time, sub_step_label_confirm_moveable) FROM stdin;
3ac9a05e-e739-4f17-b7ec-4c091f31e19d	2026-03-15 20:21:16.56-04	2026-03-21 11:52:59.543-04	t	t	\N	\N	\N	Select a Perspective	Inspector's Full Time on the Property	Formal Client Presentation at the Property	\N	Pick the Day for Your Inspection	Tailor Your Appointment	Pick a Time That Works for Everyone	Pick When Your Report Will Be Written
\.


--
-- Name: beta_feedback_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.beta_feedback_tags_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--



