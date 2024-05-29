import { LightningElement, track, wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS';
import fetchEvents from '@salesforce/apex/FullCalendarController.fetchEvents';
import createEvent from '@salesforce/apex/FullCalendarController.createEvent';
import deleteEvent from '@salesforce/apex/FullCalendarController.deleteEvent';
import { refreshApex } from '@salesforce/apex';
import EMPLOYEE_OBJECT from '@salesforce/schema/Employee__c';
import STATUS_FIELD from '@salesforce/schema/Employee__c.status__c';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class FullCalendarJs extends LightningElement {
 //To avoid the recursion from renderedcallback
 fullCalendarJsInitialised = false;
 
 //Fields to store the event data -- add all other fields you want to add
 name;
 startDate;
 endDate;
 emailP;
 mobile;
 status;

 
 @wire(getObjectInfo, { objectApiName: EMPLOYEE_OBJECT })
    employeeInfo;

    @wire(getPicklistValues,
        {
            recordTypeId: '$employeeInfo.data.defaultRecordTypeId',
            fieldApiName: STATUS_FIELD
        }
    )
    EmployeeStatusValues;


 eventsRendered = false;//To render initial events only once
 openSpinner = false; //To open the spinner in waiting screens
 openModal = false; //To open form

 @track
 events = []; //all calendar events are stored in this field

 //To store the orignal wire object to use in refreshApex method
 eventOriginalData = [];

 //Get data from server - in this example, it fetches from the event object
 @wire(fetchEvents)
 eventObj(value){
     this.eventOriginalData = value; //To use in refresh cache

     const {data, error} = value;
     if(data){
         //format as fullcalendar event object
         console.log(data);
         let events = data.map(event => {
             return { id : event.Id, 
                     emname : event.name, 
                     emstart : event.startDate,
                     emend : event.endDate,
                     ememail : event.email,
                     emmobile : event.mobile,
                     emStatus : event.status,
                     allDay : event.IsAllDayEvent};
         });
         this.events = JSON.parse(JSON.stringify(events));
         console.log(this.events);
         this.error = undefined;

         //load only on first wire call - 
         // if events are not rendered, try to remove this 'if' condition and add directly 
         if(! this.eventsRendered){
             //Add events to calendar
             const ele = this.template.querySelector("div.fullcalendarjs");
             $(ele).fullCalendar('renderEvents', this.events, true);
             this.eventsRendered = true;
         }
     }else if(error){
         this.events = [];
         this.error = 'No events are found';
     }
}

/**
 * Load the fullcalendar.io in this lifecycle hook method
 */
renderedCallback() {
   // Performs this operation only on first render
   if (this.fullCalendarJsInitialised) {
      return;
   }
   this.fullCalendarJsInitialised = true;

   // Executes all loadScript and loadStyle promises
   // and only resolves them once all promises are done
     Promise.all([
         loadScript(this, FullCalendarJS + "/FullCalendarJS/jquery.min.js"),
         loadScript(this, FullCalendarJS + "/FullCalendarJS/moment.min.js"),
         loadScript(this, FullCalendarJS + "/FullCalendarJS/fullcalendar.min.js"),
         loadStyle(this, FullCalendarJS + "/FullCalendarJS/fullcalendar.min.css"),
     ])
     .then(() => {
         //initialize the full calendar
     this.initialiseFullCalendarJs();
     })
     .catch((error) => {
     console.error({
         message: "Error occured on FullCalendarJS",
         error,
     });
     });
}

 initialiseFullCalendarJs() {
     const ele = this.template.querySelector("div.fullcalendarjs");
     const modal = this.template.querySelector('div.modalclass');
     console.log(FullCalendar);

     var self = this;

     //To open the form with predefined fields
     //TODO: to be moved outside this function
     function openActivityForm(startDate, endDate){
         self.startDate = startDate;
         self.endDate = endDate;
         self.openModal = true;
     }
     //Actual fullcalendar renders here - https://fullcalendar.io/docs/v3/view-specific-options
     $(ele).fullCalendar({
         header: {
             left: "prev,next today",
             center: "title",
             right: "month,agendaWeek,agendaDay",
         },
         defaultDate: new Date(), // default day is today - to show the current date
         defaultView : 'agendaWeek', //To display the default view - as of now it is set to week view
         navLinks: true, // can click day/week names to navigate views
         // editable: true, // To move the events on calendar - TODO 
         selectable: true, //To select the period of time

         //To select the time period : https://fullcalendar.io/docs/v3/select-method
         select: function (startDate, endDate) {
             let stDate = startDate.format();
             let edDate = endDate.format();
              
             openActivityForm(stDate, edDate);
         },
         eventLimit: true, // allow "more" link when too many events
         events: this.events, // all the events that are to be rendered - can be a duplicate statement here
     });
 }

 //TODO: add the logic to support multiple input texts
 handleKeyup(event) {
     this.title = event.target.value;
 }

 handleEmialChange(event){
    this.email = event.target.value;
 }

 handleMobileChange(event){
this.mobile = event.target.value;
 }
  handleChange(event){
this.status = event.target.value;
    }
 //To close the modal form
 handleCancel(event) {
     this.openModal = false;
 }

//To save the event
/*
 handleSave(event) {
     let events = this.events;
     console.log(events, '......this.events');
     this.openSpinner = true;

     //get all the field values - as of now they all are mandatory to create a standard event
     //TODO- you need to add your logic here.
     this.template.querySelectorAll('lightning-input').forEach(ele => {
         if(ele.name === 'emname'){
            this.name = ele.value;
            console.log(this.name, ' ...emname')
        }
        if(ele.name === 'ememail'){
            this.email = ele.value;
        }
        if(ele.name === 'emmobile'){
            this.mobile = ele.value;
        }
        if(ele.name === 'emStatus'){
            this.status = ele.value;
        }
        if (ele.name === 'emstart') {
            this.startDate = ele.value;
        }
        if (ele.name === 'emend') {
            this.endDate = ele.value;
        }
     });
     
     //format as per fullcalendar event object to create and render
     let newevent = {name : this.name, emstart : this.startDate, emend: this.endDate, ememail : this.email, emmobile : this.mobile,
    emStatus : this.status};
     console.log(this.events);

     //Close the modal
     this.openModal = false;
     //Server call to create the event
     createEvent({'event' : JSON.stringify(newevent)})
     .then( result => {
         const ele = this.template.querySelector("div.fullcalendarjs");
console.log(ele, '........this.template.querySelector("div.fullcalendarjs")');
         //To populate the event on fullcalendar object
         //Id should be unique and useful to remove the event from UI - calendar
         newevent.id = result;
         console.log(newevent.id, '....newevent.id');
          
         //renderEvent is a fullcalendar method to add the event to calendar on UI
         //Documentation: https://fullcalendar.io/docs/v3/renderEvent
         $(ele).fullCalendar( 'renderEvent', newevent, true );
          
         //To display on UI with id from server
         this.events.push(newevent);

         //To close spinner and modal
         this.openSpinner = false;

         //show toast message
         this.showNotification('Success!!', 'Your event has been logged', 'success');

     })
     .catch( error => {
         console.log(error);
         this.openSpinner = false;

         //show toast message - TODO 
         this.showNotification('Oops', 'Something went wrong, please review console', 'error');
     })
}
 */

/*
handleSave(event) {
    // Gather input field values for the new Employee record
    let name = this.name;
    let startDate = this.startDate;
    let endDate = this.endDate;
    let email = this.email;
    let mobile = this.mobile;
    let status = this.status;

    // Prepare the Employee object to be passed to the Apex method
    let employeeData = {
        "Name": name,
        "start_date__c": startDate,
        "End_date__c": endDate,
        "Email__c": email,
        "Mobile__c": mobile,
        "status__c": status
    };

    // Call the Apex method to create the Employee record
    createEvent({ event: JSON.stringify(employeeData) })
        .then(result => {
            // Handle successful creation of the Employee record
            console.log('Employee record created successfully: ', result);
            
            // Reset input fields to clear previous data
            this.name = '';
            this.startDate = '';
            this.endDate = '';
            this.email = '';
            this.mobile = '';
            this.status = '';

            // Close the modal
            this.openModal = false;

            // Retrieve the Name of the newly created Employee using its ID
            this.getEmployeeName(result); // Assuming you have a method to fetch the Name
        })
        .catch(error => {
            // Handle error during creation of the Employee record
            console.error('Error creating Employee record: ', error);
            // Optionally, display an error message to the user
        });
}
*/

handleSave(event) {
    // Gather input field values for the new Employee record
    let name = this.name;
    let startDate = this.startDate;
    let endDate = this.endDate;
    let email = this.email;
    let mobile = this.mobile;
    let status = this.status;

    // Prepare the Employee object to be passed to the Apex method
    let employeeData = {
        "Name": name,
        "start_date__c": startDate,
        "End_date__c": endDate,
        "Email__c": email,
        "Mobile__c": mobile,
        "status__c": status
    };

    // Call the Apex method to create the Employee record
    createEvent({ event: JSON.stringify(employeeData) })
        .then(result => {
            // Handle successful creation of the Employee record
            console.log('Employee record created successfully: ', result);
            
            // Reset input fields to clear previous data
            this.name = '';
            this.startDate = '';
            this.endDate = '';
            this.email = '';
            this.mobile = '';
            this.status = '';

            // Close the modal
            this.openModal = false;

            // Display the ID and Name of the newly created Employee
            if (result && result.Id) {
                console.log('New Employee ID: ', result.Id);
                if (result.Name) {
                    console.log('New Employee Name: ', result.Name);
                } else {
                    console.error('New Employee Name is undefined');
                }
            } else {
                console.error('No Employee record created');
            }

            // Optionally, perform any additional actions after record creation
        })
        .catch(error => {
            // Handle error during creation of the Employee record
            console.error('Error creating Employee record: ', error);
            // Optionally, display an error message to the user
        });
}
/**
 * @description: remove the event with id
 * @documentation: https://fullcalendar.io/docs/v3/removeEvents
 */
removeEvent(event) {
     //open the spinner
     this.openSpinner = true;

     //delete the event from server and then remove from UI
     let eventid = event.target.value;
     deleteEvent({'eventid' : eventid})
     .then( result => {
         console.log(result);
         const ele = this.template.querySelector("div.fullcalendarjs");
         console.log(eventid);
         $(ele).fullCalendar( 'removeEvents', [eventid] );

         this.openSpinner = false;
          
         //refresh the grid
         return refreshApex(this.eventOriginalData);

     })
     .catch( error => {
         console.log(error);
         this.openSpinner = false;
     });
}

/**
 *  @description open the modal by nullifying the inputs
 */
 addEvent(event) {
     this.startDate = null;
     this.endDate = null;
     this.name = null;
     this.mobile = null;
     this.email = null;
     this.status = null;
     this.openModal = true;
 }

 /**
  * @description method to show toast events
  */
 showNotification(title, message, variant) {
     console.log('enter');
     const evt = new ShowToastEvent({
         title: title,
         message: message,
         variant: variant,
     });
     this.dispatchEvent(evt);
 }

}