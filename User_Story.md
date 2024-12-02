# DHP_Differential_Scheduler

I am an independent home inspector and currently available automated schedulers do not meet my business needs. 

The length of appointments for my services vary based on details about the home like home type and square footage, and therefore appointments for my most profitable services can last as much as 12 hrs. Clients, however, do not want to hang around that long. So, I perform the tedious and time-consuming parts of my inspections early and provide short presentations to my clients afterwards. unfortunately, that means when a client schedules an appointment they are actually scheduling for two things: both the inspection and the presentation. 

I call this “differential scheduling” since the clients and I show up at different times, and that time difference varies based on details about the property. Currently available schedulers confuse my clients since they aren’t built for differential scheduling. For example, if a client selects a time slot that starts at 1:00PM from my current standard scheduler because that’s when they are available, they may receive a message from me telling them to show up at 7:00PM. I constantly hear that this is confusing and has caused people to schedule with other inspectors.

To complicate things, not all of my services schedule differentially so I need a standard scheduler as well. Further still, I occasionally need to modify my services in subtle or dramatic ways to fit individual appointments in around constraints for myself, my clients, and access to each property. All of this is way too hard to explain to busy people who just want to schedule then move on with their day and don’t want to learn about how my business works.

Long story short: manual scheduling wastes time, hiring someone to do this is expensive, and simplified scheduling is a competitive advantage.

Therefore:

    AS a solo business owner with sophisticated service offerings
    I WANT a single-page scheduling application connected to Google and MLS APIs
    SO THAT I can control and adjust a complex set of available services and restraints 
    AND SO THAT users can easily schedule services that meet their needs with minimal engagement.

## User Story
### General Page
![The app displays a header, nav bar, content section, and footer.](./server/src/assets/PreviousExamples/ServiceSelectionTop.png)

  WHEN a user loads the application,
  THEN they are presented with a page containing a header, a side navigation bar, a Content Section, and a footer

  WHEN a user views the header,
  THEN they see a business name, business logo, welcome message, and navigation menu with titles corresponding to different steps of the scheduling process

  WHEN a user views the navigation titles,
  THEN they see tabs for the titles Service Selection, Property Details, Appointment Availability, Contact Information, and Confirmation, and each title has a small description underneath

  WHEN a user clicks on a navigation tile,
  THEN they are presented with the corresponding Content Section below the header, and that navigation title is Selected

  WHEN the user views the Footer,
  THEN they see an Inactive “Previous” button on the left, a blank space in the middle they see for Progress Info, and on the right they see an Inactive “Next” button

  WHEN the user looks at the Progress Info,
  THEN they see nothing

  WHEN a user loads the application for the first time,
  THEN the Service Selection page in the Content Section, the Service Selection tile is Selected, tile is Inactive.

### User Pages
#### Service Selection
![The service selection page prompts the user to select a set of available services, select a service, and add services if wanted.](./server/src/assets/PreviousExamples/ServiceSelectionBottom.png)

  WHEN a user is presented with the Service Selection page,
  THEN they see a row of Active cards/buttons indicating each possible User Type, including a small icon, a name for the User Type, and a short (character limited) description explaining the characteristics of each User Type

  WHEN a user selects a User Type,
  THEN that card/button User Type is Selected, any other user types stay Active and the area below the User Type row populates with a Title line and a column of selections with radial buttons for each Service Type available for that User Type and a title and brief (character limited) description explaining the characteristics of each service

  WHEN the user sees the title line,
  THEN they see a right justified Title that says “Select my service type” and a left justified radial button labeled “I only want a quote”

  WHEN a user selects a Service Type,
  THEN that Service Type is Selected, the radial button is filled, the "Next" button in the footer becomes Active, and the area below the Service Type columns populates with a column of cards for each Additional Service Type available for that Service Type that includes a title and brief (character limited) description explaining the characteristics of each additional service

  WHEN a user selects an Additional Service Type,
  THEN that Additional Service Type button is Selected

  WHEN the user looks the Progress Bar,
  THEN they see “I am a {User Type} that needs a {Service Type} (Conditional: with {Additional Service Types}) for my {Property Type} on {Street}.”

  WHEN a user selects the “Next” button,
  THEN they see the Property Details page in the Content Section


#### Property Details
![The property information page collects and prepares information about the property where they inspection will occur.](./server/src/assets/PreviousExamples/PropertyInformation.png)
  WHEN a user is presented with the Property Details page,
  THEN they see a row of cards/buttons indicating each possible Property Type, including a small icon, a name for the Property Type, a blank space, and an Active “Previous” button just above the footer

  WHEN a user selects any other Property Type,
  THEN that Property Type card/button is Selected, and then they see a form for Address Details under the Property Type row and a section of fields for Additional Property Details needed for that Property Type below that

  WHEN a user selects a “Condo-Co/op” Property Type,
  THEN that Property Type card/button is Selected, and then they see a form for Address Details that includes a field for “Unit Number” under the area Property Type row

  WHEN a user sees the Additional Property Details form with “SqFt” and “Bedrooms”,
  THEN they see that each type of detail is required, but the form can contain either a numeric input field or drop downs for selections

  WHEN a user has selected any property type other than “Condo/Co-op”,
  THEN they see the additional required additional property information field “Foundation Type”

  WHEN a user begins to enter the address,
  THEN a drop with suggestions from a Google Maps API that populate, if available, and if it is not available, the user proceeds to enter the address as usual (no error message)

  WHEN an address has been entered or selected from the Google API with a sufficient level of detail,
  THEN the Additional Property Details form populates with information from the MLS API if available

  WHEN the user enters all required fields,
  THEN the progress bar says “A {Service Type} (Conditional: with {Additional Service Types} for my {Property Type} on {Street} would cost {Fee}).”

  WHEN,
  THEN they see the current total fee

  WHEN a user has Selected “I only want a Quote” on the Service Selection page and views the footer,
  THEN the “Next” button reads “Proceed with Scheduling.”  

  WHEN a user selects the “Next” or “Proceed with Scheduling” button,
  THEN they see the Appointment Availability page in the Content Section

#### Appointment Availability
![The appointment availability page displays an interface that allows clients to customize their service and select available times.](./server/src/assets/PreviousExamples/AppointmentAvailabilityStandard.png)
  WHEN a user sees the Appointment Availability page,
  THEN on the left, they see a Title above a calendar from which they can select dates, and on the right, they see (from top to bottom) (1)-a Time Basis Selection field (if Differential Scheduling is a service type setting), (2)-an Available Times button field, (3)-a lateral pair of bars representing Differential Arrival Times (if Differential Scheduling is a service type setting), and (4)-a field to select for Scheduling Options that affect availability (conditional on service type settings)

  WHEN the user looks at the top of the Appointment Availability page,
  THEN they see a title section a large title that reads “Select an appointment from our current availability” and a smaller row of explanatory text

##### Calendar
    WHEN the user looks at the calendar section ,
    THEN they see the calendar they see the name of the month on top, a set of next/previous arrows on the bottom, and the current month in the middle where all Dates are buttons, and Dates that have an availability for their appointment are Active, Dates without availability are Inactive, and the current Date is Selected 

    WHEN the user selects an Active Date,
    THEN that Date becomes Selected, all other active dates stay Active and they see the Appointment Selection Field

##### Appointment Selection Field
    WHEN the user looks at the Appointment Selection field,
    THEN they see the (1) Time Basis Selection field, (2a or 2b) the Appointment Selection Buttons, the (3) Time On-Site Graph, and the (4) Availability Options–Depending on the Service Type Settings
![The differential instance of the appointment availability page allows clients to see what is happening with differential scheduling.](./server/src/assets/PreviousExamples/AppointmentAvailabilityClient.png)
###### (1) Time Basis Selector – When Service Type is Differential Scheduling is TRUE
    WHEN the user looks at the Time Basis Selector field,
    THEN they see an explanatory text field, and two buttons-one labeled “Client” and the other labeled “Inspector” which are both Active in their own colors by default

    WHEN the user selects either “Inspector” or “Client” ,
    THEN that button becomes Selected and the other remains Active, and triggers an Appointment Selection Field Refresh

    WHEN the user selects the either button after one has become Selected both buttons toggle between Selected and Active, since only one can be selected at a time and neither button is selected by default. 

###### (2) Appointment Selection Button Field

    WHEN the user looks at the field of Appointment Selection buttons on days that have full availability,
    THEN they see 4 columns of Active buttons and each button shows a time that increases in increments of :15 as they buttons go from top to bottom on the left most column, and after the bottom button of that column is reached, then the increase continues with the column next to it

    WHEN the user looks at the field of Appointment Selection buttons on days that have partial availability,
    THEN they see the same 4 columns of buttons but each button that represents the beginning of any unavailable time slot is Inactive

###### (2a) Appointment Selection Buttons (Differential Scheduling is FALSE)

    WHEN the user selects a Date and Differential Scheduling is NOT a setting for their service type,
    THEN they trigger an Appointment Selection Field Refresh, where the (2) Appointment Selection Buttons populate with times representing all possible start times for time slots that would accommodate their appointments, (where available time slots are Active and unavailable time slots are Inactive).

    WHEN the user selects a time from the Appointment Selection Buttons,
    THEN the "Next" button in the footer becomes Active

    WHEN the user selects an Availability Option BEFORE selecting a time,
    THEN they trigger an Appointment Selection Field Refresh where the Appointment Selection Buttons repopulate times based on the Availability Calculator with buttons having the same start time staying in the same location in the field

    WHEN the user selects a Availability Option AFTER selecting a time AND that time slot would still be available from the Availability Calculator,
    THEN they trigger an Appointment Selection Field Refresh where the Appointment Selection Buttons repopulate times based on the Availability Calculator with buttons having the same start time staying in the same location in the field and the selected button stays Selected

    WHEN the user selects Availability Options AFTER selecting a time and that time slot WOULD NOT still be available from the Availability Calculator,
    THEN they trigger an Appointment Selection Field Refresh where the Appointment Selection Buttons repopulate times based on the Availability Calculator with buttons having the same start time staying in the same location in the field, the selected button is unselected and Inactive, and the user sees a warning indicating that time is no longer available.

    WHEN the user de-selects (toggles off) an Availability Options AFTER selecting a time AND has NOT selected a new time,
    THEN that original button is re-Selected

    WHEN the user selects a new Date from the calendar AFTER selecting a time ,
    THEN they trigger an Appointment Selection Field Refresh, where the Selected button is de-selected and the Appointment Selection Buttons re-populate with times representing all possible start times for time slots for that Date which would accommodate their appointments, (where available time slots are Active and unavailable time slots are Inactive).

##### (2b) Appointment Selection Buttons (Differential Scheduling)

    WHEN the user selects an Active Date and Differential Scheduling is a setting for their service type,
    THEN they trigger an Appointment Selection Field Refresh, where the Appointment Selection Buttons are all Inactive and have not populated with start times

    WHEN the user selects or toggles the Time Basis Selector,
    THEN they trigger an Appointment Selection Field Refresh, where the Appointment Selection Buttons populate with times corresponding to all possible start times for time slots that would accommodate their appointments, where available time slots are Active and unavailable time slots are Inactive. (Note: the Time Basis Selector does NOT create or eliminate availabilities–it only changes the labels and colors of the buttons)

    WHEN the user toggles to the Time Basis Selector option (either “Inspector” or “Client”) BEFORE selecting a time,
    THEN the Availability field buttons update with time possible start times for that selector and the corresponding time slots are Active and Inactive in a 1-2-1 correspondence with the button from before the toggle

    WHEN the user selects a time from the Availability Field on any given selector,
    THEN the "Next" button in the footer becomes Active

    WHEN the user toggles to the other Time Basis Selector option (either “Inspector” or “Client”) 
    AFTER selecting a time THEN the Availability field buttons update with time possible start times for that selector and the corresponding time slots are Active, Inactive, and Selected in a 1-2-1 correspondence with the button from before the toggle

    WHEN the user selects a new Date from the calendar AFTER selecting a time ,
    THEN they trigger an Appointment Selection Field Refresh, where the Selected button is de-selected and the Appointment Selection Buttons re-populate with times representing all possible start times for time slots for that Date which would accommodate their appointments, (where available time slots are Active and unavailable time slots are Inactive).
![The appointment availability page displays an interface that allows clients to customize their service.](./server/src/assets/PreviousExamples/AppointmentAvailabilityInspector.png)
##### (3) Time On-Site Graph – Appearance Conditional on Service Type Settings and Availability Options

    WHEN the user looks at the Time On-Site Graph and Differential Scheduling is a setting for their service type,
    THEN they see an explanatory text field and two stacked solid horizontal bars, where the top bar extends across the full length of the Appointment Selection Field, is in the Inspector Active Color; and displays the phrase ‘Inspector: {onSiteTotal hh:mm}’, and where the bottom bar is right justified, extends across half the length of the Appointment Selection Field, is in the Client Active Color, and displays the phrase ‘Client Formal Presentation: {presentationDuration hh:mm}’ 

    WHEN the user selects from the Time Basis Selector,
    THEN the corresponding bar becomes Selected and other bar remains Active, each in its own color set

    WHEN the user selects a time from the Availability Field on any given selector,
    THEN the top bar displays the phrase ‘Inspector: {onSiteTimeBlock}’ and the bottom bar displays the phrase ‘Client Formal Presentation: {presentationTimeBlock}’


    WHEN the user looks at the Time On-Site Graph and Differential Scheduling is NOT a setting for their service type,
    THEN they see the “Inspector” bar in the Active Client colors which displays the phrase ‘{Service} Length {onsiteTotal}’


    WHEN the user selects an Availability Option that does trigger an Appointment Selection Field Refresh AFTER selecting a Time that becomes NOT available,
    THEN the Time On-site Graph refreshes to display the original phrases on the bars

    WHEN the user selects an Availability Option that does trigger an Appointment Selection Field Refresh AFTER selecting a Time that is still available,
    THEN the Time On-site Graph does not change

    WHEN the user selects an Availability Option that does NOT trigger an Appointment Selection Field Refresh,
    THEN the On-Site Graph does not change

##### (4) Availability Options – Appearance Conditional on Service Type Settings 

    WHEN the user looks at the Time On-Site Graph and Differential Scheduling is a setting for their service type,
    THEN they see a column of cards/buttons for each Availability Option possible in the Service Type Settings (mapped) with a check box, brief description, and (i) information tags

    WHEN the user selects an Availability Option that does trigger an Availability Recalculation,
    THEN it the check box checks and the Appointment Selection Field refreshes

    WHEN the user selects an Availability Option that does not trigger an Availability Recalculation THEN the check box checks but neither the calendar nor the Availability Selection Field refresh

    WHEN the user selects an Availability Option that does trigger an Availability Recalculation without selecting a Date,
    THEN the check box checks and only the calendar refreshes because the Availability Selection Field has not yet appeared

    WHEN the user selects an Availability Option that does trigger an Availability Recalculation after selecting a Date but without selecting a Time,
    THEN the check box checks and the calendar and Availability Selection Field both refresh

    WHEN the user selects an Availability Option that does trigger an Availability Recalculation after selecting a Date and a Time but that time is still available,
    THEN the check box checks, the Availability Selection Field refreshes, and the Date and time stay Selected

    WHEN the user selects an Availability Option that does trigger an Availability Recalculation after selecting a Date that is still available and a Time that becomes NOT available,
    THEN the current Date remains Selected and the selected time button de-selects and becomes Inactive.

    WHEN the user selects an Availability Option that does trigger an Availability Recalculation after selecting a Date that becomes NOT available and a Time but that time becomes NOT available,
    THEN the current Date and selected time buttons both de-select  and become Inactive.

    WHEN the user selects anAvailability Option with the Differential Override Setting and the selected Date and Time are still available,
    THEN the check box checks, they trigger an Appointment Selection Field Refresh where the current Date and time remain Selected, the Appointment Selection Buttons revert to the Client Color set, they only see the “Inspector” bar in the On-site Time Graph in the Active Client colors which displays the phrase ‘{Service} Length {onsiteTotal}’, the Time Basis Selector is no longer visible and the state on the Appointment for Differential Scheduling becomes "false"

    WHEN the user selects an Availability Option with the Differential Override Setting and the selected Date is still available but the selected Time is not,
    THEN the check box checks, they trigger an Appointment Selection Field Refresh where the current Date remains Selected, the Appointment Selection Buttons revert to the Client Color set, the “Inspector” bar in On-site Time Graph in the Active Client colors which displays the phrase ‘{Service} Length {onsiteTotal}’, and the Time Basis Selector is no longer visible

    WHEN the user selects an Availability Option that deactivates Differential Scheduling and neither the selected Date nor Time is available,
    THEN the check box checks, the current Date de-selects and the Appointment Selection Field is no longer visible

    WHEN the user de-selects an Availability Option that with the Differential Override Setting,
    THEN the selections return to the condition prior to selecting the setting

    WHEN the user selects an Availability Option for Off-site Report Writing,
    THEN at the end of that card the user sees in bold type the phrase: ‘Earliest Report Completion Time: {earliestReportCompletionTime}’

#### Contact Information
![The appointment availability page displays an interface to gather necessary information for each participant.](./server/src/assets/PreviousExamples/ContactInformation.png)
  WHEN the user looks at the contact information page,
  THEN they see a column of contact information cards for each required participant and buttons for adding additional participants cards, as listed in the Service Type Settings
  WHEN the user looks at any required contact card,
  THEN they see input fields for first name, last name, and email address, and a button to add optional information fields in that card
  WHEN the user looks at any optional contact card,
  THEN they see input fields for first name, last name, and email address, a button to add optional information fields in that card, and a button to remove optional cards
  WHEN the user enters information into each field,
  THEN the information is validated for each type
  WHEN the user enters invalid information,
  THEN they receive a modal notification they have entered an invalid email address
  WHEN the user enters identical information (non case-sensitive) into any two types of contact cards (clients & agents),
  THEN the second contact card field resets and they receive a prompt that all participants must be different
  WHEN all required contact cards and all required fields in any optional contact cards are filled,
  THEN the “Next” Button in the footer becomes Active
  WHEN a user selects the “Next” button,
  THEN they see the Confirmation page in the Content Section


#### Confirmation
![The appointment availability page displays an interface to summarize and confirm their service.](./server/src/assets/PreviousExamples/Confirmation.png)
  WHEN the user looks at the confirmation page,
  THEN the user see a left column with a title and service details and a right column with an invoice card
  WHEN the user looks at the left column,
  THEN they see a Title and explanatory text and two columns with key/value pairs for pertinent service information
  WHEN the user looks at the invoice card,
  THEN they see a title field with the phrase “Your total fee is:” and a much larger text that shows the {Appointment Fee} and a Price Details field with key/value pairs for pertinent fee information
  WHEN the user looks at the footer they see an Active “Previous” button, no Progress Sentence, and the “Next” Button has relabeled as “Schedule my {Service Type}!”
  WHEN a user clicks the submit button, they submit and previous buttons becomes Inactive, the nav bar disappears and the Google Calendar and Spectora APIs trigger to schedule,
  THEN a modal appears with explanatory text and an okay button that closes the modal

### Administrator Inquirer Interface
  WHEN the admin starts the admin interface ,
  THEN they receive a prompt to Add/Edit
  WHEN they select Edit,
  THEN they receive a prompt to choose a Service, Additional Service, or Availability Option

#### Service Settings

    WHEN the admin selects Service,
    THEN they see a prompt to select either “Add a new service type” or “Edit an existing service type” 

    WHEN the admin select “Add a new service type” button,
    THEN they see prompt to enter a service Title

    WHEN the admin enters a title,
    THEN they see a prompt to select an activity setting: Active, Inactive, or Test

    WHEN the admin select the activity setting,
    THEN they see a prompt to select the user types for whom this service will appear: Buyer, Owner, or Agent (Can be more than one)

    WHEN the admin has selected the user types ,
    THEN they will see a series of prompts to input a description of the service for each of the User Types for whom this service is available

    WHEN the admin has created descriptions of the service for each user,
    THEN they will see a prompt to select the Scheduling Type: Standard or Differential,

    WHEN the admin selects the scheduling type,
    THEN they see a prompt to select from the list of additional services available to this service type

    WHEN the admin selects the additional service options for this service,
    THEN they see a prompt to select from the list of Availability Options available to this service type

    WHEN the admin selects the availability options for this service,
    THEN they will see a series of prompts to input a values for each of the Durations for this service 

    WHEN the admin completes the Durations ,
    THEN they see a series of prompts to fill out the Calendar Event setting for each User Type

    WHEN the admin completes all of the Calendar Event settings ,
    THEN they see an option to “Save Settings” or “Edit a Setting”

    WHEN the admin selects  “Edit a Setting”,
    THEN they see a prompt to select which setting to edit: Service Title, Activation, Users, Descriptions, Scheduling Type, Additional Services, Availability Options, Durations, Calendar Events

    WHEN the admin selects the “Save Settings” button,
    THEN the new settings are pushed to the Services Table in the Services Database so they are available to the scheduler

    WHEN they select the “Edit an existing service type” button, ,
    THEN they see a drop down asking which service they want to edit, 

    WHEN they select the service they want to edit,
    THEN they see a prompt to select which setting to edit: Service Title, Activation, Users, Descriptions, Scheduling Type, Additional Services, Availability Options, Durations, Calendar Events

    WHEN they select the setting they want to edit,
    THEN they see the same prompts from the add service prompts

    WHEN they have completed editing that setting,
    THEN they see an option to “Save Settings” or “Edit a Setting”

    WHEN the admin selects  “Edit a Setting”,
    THEN they see a prompt to select which setting to edit: Service Title, Activation, Users, Descriptions, Scheduling Type, Additional Services, Availability Options, Durations, Calendar Events

    WHEN the admin selects the “Save Settings” button,
    THEN the new settings are pushed to the Services Table in the Services Database so they are available to the scheduler
      SEE Below for Existing Service Types Seeds

#### Additional Service Settings

    WHEN the admin selects Additional Services,
    THEN they see a prompt to select either “Add a new additional service type” or “Edit an existing additional; service type” 

    WHEN the admin select “Add a new additional service type” button,
    THEN they see prompt to enter an additional service Title

    WHEN the admin enters a title,
    THEN they see a prompt to select an activity setting: Active, Inactive, or Test

    WHEN the admin select the activity setting,
    THEN they see a prompt to select the user types for whom this service will appear: Buyer, Owner, or Agent (Can be more than one)

    WHEN the admin has selected the user types ,
    THEN they see a prompt to select the full list of service types for which this additional service will be an option (Can be more than one)

    WHEN the admin has selected the service types,
    THEN they will see a series of prompts to input a description of the service for each of the User Types for whom this service is available

    WHEN the admin has created descriptions of the service for each user,
    THEN they will see a series of prompts to input a values for each of the Durations for this service 

    WHEN the admin completes the Durations,
    THEN they see an option to “Save Settings” or “Edit a Setting”

    WHEN the admin selects  “Edit a Setting”,
    THEN they see a prompt to select which setting to edit: Additional Service Title, Activation, Users, Descriptions, Services, and Durations

    WHEN the admin selects the “Save Settings” button,
    THEN the new settings are pushed to the Additional Services Table in the Services Database so they are available to the scheduler

    WHEN they select the “Edit an existing additional service type” button, ,
    THEN they see a drop down asking which service they want to edit, 

    WHEN they select the service they want to edit,
    THEN they see a prompt to select which setting to edit: Additional Service Title, Activation, Users, Services, and Durations

    WHEN they select the setting they want to edit,
    THEN they see the same prompts from the add additional service prompts

    WHEN they have completed editing that setting,
    THEN they see an option to “Save Settings” or “Edit a Setting”

    WHEN the admin selects  “Edit a Setting”,
    THEN they see a prompt to select which setting to edit: Additional Service Title, Activation, Users, Descriptions, Services, and Durations

    WHEN the admin selects the “Save Settings” button,
    THEN the new settings are pushed to the Additional Services Table in the Services Database so they are available to the scheduler
      SEE Below for Existing Additional Service Type Seeds

#### Availability Options

    WHEN the admin selects Availability Options,
    THEN they see a prompt to select either “Add a new Availability Option type” or “Edit an existing Availability Option type” 

    WHEN the admin select “Add a new Availability Option type” button,
    THEN they see prompt to enter an Availability Option Title

    WHEN the admin enters a title,
    THEN they see a prompt to select an activity setting: Active, Inactive, or Test

    WHEN the admin select the activity setting,
    THEN they see a prompt to select the user types for whom this service will appear: Buyer, Owner, or Agent (Can be more than one)

    WHEN the admin has selected the user types ,
    THEN they see a prompt to select the full list of service types for which this Availability Option will be an option (Can be more than one)

    WHEN any service is a Differential Type, ,
    THEN the admin sees a prompt to select or decline Differential Override 

    WHEN the admin has selected the service types,
    THEN they will see a series of prompts to input a values for each of the Durations for this service 

    WHEN the admin completes the Durations,
    THEN they see an option to “Save Settings” or “Edit a Setting”

    WHEN the admin selects  “Edit a Setting”,
    THEN they see a prompt to select which setting to edit: Availability Option Title, Activation, Users, Descriptions, Services, and Durations

    WHEN the admin selects the “Save Settings” button,
    THEN the new settings are pushed to the Availability Options Table in the Services Database so they are available to the scheduler

    WHEN they select the “Edit an existing Availability Option type” button, ,
    THEN they see a drop down asking which service they want to edit, 

    WHEN they select the service they want to edit,
    THEN they see a prompt to select which setting to edit: Availability Option Title, Activation, Users, Services, and Durations

    WHEN they select the setting they want to edit,
    THEN they see the same prompts from the add Availability Option prompts

    WHEN they have completed editing that setting,
    THEN they see an option to “Save Settings” or “Edit a Setting”

    WHEN the admin selects  “Edit a Setting”,
    THEN they see a prompt to select which setting to edit: Availability Option Title, Activation, Users, Descriptions, Services, and Durations

    WHEN the admin selects the “Save Settings” button,
    THEN the new settings are pushed to the Availability Options Table in the Services Database so they are available to the scheduler
    SEE Below for Existing Availability Option Seeds

#### Durations

    WHEN the admin see a prompt to add Durations for any Service, Additional Service, or Availability option,
    THEN they see a prompt to select values for the Buffers (Before, Early Arrival, and After)

    WHEN the admin selects a time for a buffer ,
    THEN they must input a time in :15 minute increments

    WHEN the admin inputs values for both buffers,
    THEN they see a series of prompts to input values for each of the Onsite Events: Data Collection, On-Site Report Writing, and Client Presentation

    WHEN the admin input values for each Onsite Event,
    THEN they see a series of prompts to input a rateTime, baseTime, rateFee, and baseFee for each event

    WHEN the admin inputs values for all Onsite Events,
    THEN they see a series of prompts to input values for each of the Offsite Events:  Report Writing and Virtual Presentations

    WHEN the admin input values for each Offsite Event,
    THEN they see a series of prompts to input a rateTime, baseTime, rateFee, and baseFee for each event

    WHEN the admin has completed all of the required fields ,
    THEN they see an option to “Save Durations” or “Edit a Duration”

    WHEN the admin selects  “Edit a Duration”,
    THEN they see a prompt to select which setting to edit: Buffers, Onsite Events, or Offsite Events

    WHEN the admin selects the “Save Durations” button,
    THEN the prompt resumes with the next step in the Service, Additional Service, or Availability Option editor

    WHEN they select the “Edit a Duration” button, ,
    THEN they see a prompt to select which Duration they want to edit: Buffers, Onsite Events, or Offsite Events

    WHEN they select the Duration they want to edit,
    THEN they see the same prompts from the Add Duration prompts

    WHEN they have completed editing that Duration,
    THEN they see an option to “Save Duration” or “Edit a Duration”

    WHEN the admin selects  “Edit a Duration”,
    THEN they see a prompt to select which Duration they want to edit: Buffers, Onsite Events, or Offsite Events

    WHEN the admin selects the “Save Durations” button,
    THEN the prompt resumes with the next step in the Service, Additional Service, or Availability Option editor

### APIs

#### Google Calendar
  Fetch for availabilities
    Input 
      URLs of the calendars from which to read “busy” times
      DateRange: (If the date is between the 1st and the 21st then fetch the remainder of the current month, if the date is between 22 and the end of the month then fetch the remainder of the current month and the complete next month, and then any subsequent month on demand) 
    Output
      Unavailable times
      Addresses of events during unavailable times
      Home Address { Number, Street, Apt, City, State, Zip }
    Failure:
      ?If the fetch fails, direct the user to text me directly
  Fetch for events
    Input
      Emails for participants
      Times
      Titles
      Event information
      Permissions 
    Output
      Calendar Event Invitations
    Failure
      ?????


#### Google Maps
  Input 
    Addresses
  Output
    Address Validation
    Drive time in minutes FROM the address of the appointment instance and the location of every busy event
    Drive time in minutes TO the address of the appointment instance and home
    Drive time in minutes TO the address of the appointment instance and to the location of every busy event
  Failure
    Convert to a base drive time 

#### MLS
  Input 
    Address
  Output
    Dwelling type: (Single Family, Detached, Semi-detached, Condo, Co-op, Townhouse, Multi-family)
    Total square foot: (Above grade square foot size PLUS below grade square foot size)
    Foundation type: (Basement, Crawlspace, Slab-on-Grade, Piers, etc)
    ADUs (accessory dwelling units): (Presence and Number) 
  Failure
    Prompt user to input required information

## Acceptance Criteria

    Application uses a mobile-first design
    Application uses the Google and MLS APIs to retrieve calendar and property data
    Application uses a database to store service information and a record of scheduled/completed services
    Application uses Typescript and React features to accommodate future editing and enhancements
    Application stores calendar availability and appointment information in state
    Application uses a layout/styling library with accessible and consistent design and color scheme (Consider using Vuexy, animations, and React component libraries)

## State, Database, and Type suggestions
### Appointment State Settings

    User:                         User { Type , Participant }
    Participants:	              { firstName , lastName , email }
    Quote Only:                   boolean
    Service Information:          Service { Type , Add Services , Availability Options  , Fees }
    Property Information:         Property { Above Grade Sq ft , Below Grade Sq ft , Bedroom# , Bathroom# , Foundation Type }	
    Location:                     { Number , Street , Apt , City , State , Zip }
    Differential Scheduling:      boolean
    Time Basis:                   string
    Time Blocks:				  Duration[]
    Available Time Slots:		  TimeSlot
    Available Dates:			  Date
    Selected Start Time: 		  Time
    Earliest Report Completion:	  Time

### Service Settings Variables from the Services Database
    Title:                      string
    Active/Inactive:            boolean
    Differential Scheduling:	boolean
    User Availability:          string
    Descriptions:               string{ buyerDescription , agentDescription , ownerDescription }
    Availability Options:       string[]
    Additional Services:        string[]
    Time Blocks:                Duration[]
    Events for Calendar Push:   Events[]
    Examples:
      Buyer’s Inspection:
      Walk & Talk:
      Home Maintenance Planning:
      Pre-sale Walkthrough:

### Additional Service Settings Variables from the Services Database
    Title:                  string
    Service Availability:	string
    Descriptions:           string { buyerDescription , agentDescription , ownerDescription }
    Time Blocks:            Duration[]
      Examples:
      Blue Tape:
      Radon:
      Reinspection:

### Availability Options Variables from the Services Database:
    Title:                  string
    Service Availability:   string
    Descriptions:           string { buyerDescription , agentDescription , ownerDescription }
    Time Blocks:            Duration[]
    Differential Override:  boolean
    Examples:
      Minimize Time On-site: offsiteReportWriting = onsite , !onsite , earliestReportCompletion
      Additional Client Time: clientPresentation*(variable)
      Client will not be present: clientPresentation*0
      First-time buyers: clientPresentation*(variable):

### Types:
    TimeSlot: { 
                startTime , endTime , availability 
                }
    
    Duration: { 
                Type (buffer , driveTime , onSite , offSite) 
                Action (before , after) (fromHome , fromPrevious , toNext , driveTimeTotal) (earlyArrival , dataCollection , reportWriting , clientPresentation , onSiteTotal) (reportWriting , virtualPresentation , offSiteTotal) 
                FeeCalculators [ rateTime , baseTime , rateFee , baseFee ]
                }
    
    Events:   { 	
                User (Buyer , Agents , Owners , Inspectors),
                Appointment Info (Active/Inactive , Title , correspondingTimeBlock)
                GoogleStuff (Availability , Permissions) 
                }


## Calculator:
For each appointment time block: 
  1. Add all bases for the service and each additional service and option, 
  2. Multiply all rates for the service and each additional service and option, 
  3. Multiply the total rate by property sqft, 
  4. Then add bases to rate*sqft,
  5. Round up to the nearest :15

## Future Features:
### Scheduling Functions
    Rescheduling
    Multiday inspections
    Report Review Second Calendar Date
    Offer Zoom presentation
    Logins for admins and agents that auto-populate certain information
    Admin and some agents can create appointment offers that do not have all information completed, like time Selected, client info, additional services and must be accessed via a limited login (link, email address entry)
    Time first instead of date first: “What days can I start at 11?” instead of “When can I start on the 5th?”
    Calendar POP new appointments scheduled in weekPlus
    Lunchhour
    "How can I fit it in on ${Monday}?" button
    "Book Next Available" button
### Admin Functions
    Embeddable widget
    (i) information tags
    Active/Inactive/Test settings for Services, Additional Services, and Availability Options
    Required/Additional info types: only names are required for additional participants, ccemail, bccemail, phone number, brokerage, photo, permissions, “add profile”, password, log-in with google/facebook/etc
    Pertinent Information for Event Settings
    Additional inspectors
    Additional calendars 
    Business Settings: Fee Settings, Unit Settings (Room Number, Sqft, Zip-code), Drive billing ( Drivetime, drivetime minus, no drive time, mileage, mileage minus, no mileage
    User type refinement
    Admin Sub-type: (Inspector {Trainee, Full, Senior}, and Office)
    Buyer User Sub-Type: {Buyer, Additional Buyer, Combined Buyer ⇒ !Buyer && !Additional Buyer} 
    Owner User Sub-types: {Owner, Combined Owner ⇒ !Owner, Seller, Combined Seller ⇒ ! Seller, Trust/LLC ⇒ Trust Signatory}
    Agent User Sub-types: {Client’s Agent, Additional Agent, Transaction Manager, Brokerage/Team ⇒ Additional Agents, Team Member}
### Agent Features
    Count down to save a space
    Scheduling fee to save space
    Option for agents to request a discount
    Discount coupons
    Quote Package producer for clients
### APIs
    Chat bot
    Inspection software platforms integrations
    Payment processing
    CRM
    Agreement signatures

## Link to Mock-up scheduler
  https://warm-cat-f0d5bd.netlify.app/pages/wizard-examples/scheduler/