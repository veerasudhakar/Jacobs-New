import { LightningElement, api, wire } from 'lwc';

/* eslint-disable no-console */
/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */

// for debugging
const componentName = 'tmsPrioritiesDetail';

// utility methods
import { errorMessage, isEmpty, toastSuccess, toastError, currentLocalDate } from 'c/lwcUtils';

// apex methods
import getPriority from '@salesforce/apex/TMS_MyController.getPriority';
import updatePriority from '@salesforce/apex/TMS_MyController.updatePriority';
import isAdminOrTMSAdmin from '@salesforce/apex/TMS_MyController.isAdminOrTMSAdmin';

// the running user's id
import USER_ID from '@salesforce/user/Id';

export default class tmsPrioritiesDetail extends LightningElement {

    @api locationPage;
    priorityDAText = 'Development Action';
    editLabel = 'Edit Development Action';
	
	

    // constructors/lifecycle callbacks

        // for methods that need to run after public variables have been instantiated
        connectedCallback() {

				
            const methodName = 'connectedCallback';

            // console.log(componentName+'.'+methodName+': start');

            // load the record
            this.getRecord();

            // set today's date
            this.accomplishedDate = currentLocalDate();

            /*const param = 'location';
            const paramValue = this.getUrlParamValue(window.location.href, param);
            console.log('paramValue='+paramValue);
            this.locationPage = paramValue;*/
            if(!isEmpty(this.locationPage) && ((this.locationPage=='careerPlan') ||(this.locationPage =='careerPlanTp')))            {
                this.priorityDAText = 'Development Action';
                this.editLabel = 'Edit Development Action';
            }
            // console.log(componentName+'.'+methodName+': end');
        }

        /*getUrlParamValue(url, key) {
            return new URL(url).searchParams.get(key);
        }*/
        

        // for methods that need to run after other methods have completed
        // runs at the end of the component lifecycle
        // pageHasLoaded = false;
        // renderedCallback() {
        
            // const methodName = 'renderedCallback';
        
            // console.log(componentName+'.'+methodName+': start');
        
            // if (this.pageHasLoaded === false) {
        
                // console.log(componentName+'.'+methodName+': component has loaded for the first time');
        
                // this.pageHasLoaded = true;
            // }
        
            // console.log(componentName+'.'+methodName+': end');
        // }

    // public variables

        // the record id of the page this is embedded on
        @api recordId;

        // the talent profile id of the user whose page we are looking at
        @api talentProfileId;

    // public methods



    // private variables/handlers

       // show the loading spinner
       showSpinner = false;

       // the record to display
       record;
       recordLoaded;

       // the tab being displayed
       activeTab = 'details';

       // the statuses to display in the path
       statuses;

       // date to use when user clicks mark as accomplished
       accomplishedDate;
       progressNotes;

       // stores the state of the submitted button
       // undefined|processing
       submitState;

       // flag on whether the running user is an admin
       isAdmin;
       isAdminLoaded;

    // wires

        @wire(isAdminOrTMSAdmin, {})
        wireisAdminOrTMSAdmin({error, data}) {
        
            const methodName = 'isAdminOrTMSAdmin';
        
            // console.log(componentName+'.'+methodName+': wire method called');
        
            try {
        
                if (error) {
        
                    // console.log(componentName+'.'+methodName+': error: ', JSON.stringify(error));
        
                    this.handleError(errorMessage(error));
        
                } else if (data !== undefined && data !== null) {
        
                    // console.log(componentName+'.'+methodName+': data: ', JSON.stringify(data));
        
                    this.isAdmin = data;
                    this.isAdminLoaded = true;
                    
                }
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

    // getters

        // any conditions to be met before the UI is ready to be rendered
        
		
			
		get pageReady() {
            return this.recordLoaded === true && this.isAdminLoaded === true;
        }

        // the running user is the owner of this priority OR an admin can upload files
        get canUploadFiles() {
            return USER_ID === this.record?.TMS_Owner__r?.TMS_User__c || this.isAdmin;
        }

        // show the progress bar
        get isAccomplished() {
            return this.record?.TMS_Priority_Status__c === 'Accomplished';
        }

        // show the edit button if not Accomplished
        get showEditButton() {
            return (USER_ID === this.record?.TMS_Owner__r?.TMS_User__c && this.record?.TMS_Priority_Status__c !== 'Accomplished');
        }

        // show a message when the edit button isn't visible because it's accomplished
        get hideEditMessage() {
            return this.record?.TMS_Priority_Status__c === 'Accomplished';
        }

        // show the mark accomplished button if the Owner or Admin AND it is not accomplished yet
        get showMarkAccomplishedButton() {
            return (USER_ID === this.record?.TMS_Owner__r?.TMS_User__c || this.isAdmin) && this.record?.TMS_Priority_Status__c !== 'Accomplished';
        }

        // control what label to apply to the button based on the button's state
        get modalSubmitLabel() {
            let result = 'Mark As Accomplished';
            if (this.submitState === 'processing') {
                result = 'Please wait...';
            }
            return result;
        }
    
        // control what colour to display the button as based on the button's state
        get modalSubmitVariant() {
            let result = 'brand';
            if (this.submitState === 'processing') {
                result = 'neutral';
            }
            return result;
        }
    
        // control what label to apply to the button
        get modalCancelLabel() {
            return 'Cancel';
        }
    
        // control what colour to display the button
        get modalCancelVariant() {
            return 'neutral';
        }
    
        // control whether the buttons are disabled
        get modalButtonsDisabled() {
            let result = false;
            if (this.submitState === 'processing') {
                result = true;
            }
            return result;
        }
		
		get isPriorityShared() {
			
            return this.record?.Priority_Share__c === true;
			
        }

    // button handlers

        handleEditPriority(event) {
        
            const methodName = 'handleEditPriority';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                this.dispatchEvent(new CustomEvent(
                    'edit',
                    {
                        detail : { recordId : this.recordId, btnLabel : this.editLabel }
                    }
                ));
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }

        }

        // user changed a modal field
        handleAccomplishedDate(event) {
        
            const methodName = 'handleAccomplishedDate';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                this.accomplishedDate = value;
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // user changed progress notes
        handleProgressNotes(event) {
        
            const methodName = 'handleProgressNotes';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                this.progressNotes = value;
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // user clicked show modal button
        handleShowMarkAsAccomplishedModal(/*event*/) {
        
            const methodName = 'handleShowMarkAsAccomplishedModal';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
                this.showMarkAsAccomplishedModal();
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }
    
        // user clicked save button
        async handleMarkAsAccomplishedYes(/*event*/) {
        
            const methodName = 'handleMarkAsAccomplishedYes';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {

                // form validation
                if (isEmpty(this.accomplishedDate)) {

                    this.handleError('Please provide the Accomplished Date');

                } else if (isEmpty(this.progressNotes)) {

                    this.handleError('Please provide the Progress Notes & Results');

                } else {
        
                    // turn on spinner
                    this.showSpinner = true;
                    
                    // update button state
                    this.submitState = 'processing';

                    // define record to be updated
                    let priority = {
                        Id: this.recordId,
                        TMS_Priority_Status__c: 'TMS_Accomplished',
                        TMS_Priority_Accomplished_Date__c: this.accomplishedDate,
                        TMS_Progress_Notes_Results__c: this.progressNotes
                    };
                    // console.log(componentName+'.'+methodName+': priority: ' + JSON.stringify(priority));
        
                    // call apex method updatePriority and process result
                    await updatePriority({priority: priority});

                    // get updated priority
                    this.getRecord();
                    
                    let saveMsg = 'The '+this.priorityDAText+' has been successfully updated.';
                    // show success
                    toastSuccess(this, 'Success!',saveMsg );
        
                    // hide modal
                    this.hideMarkAsAccomplishedModal();
        
                    // turn off spinner
                    this.showSpinner = false;

                }
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }
    
        // user clicked cancel button
        handleMarkAsAccomplishedCancel(/*event*/) {
        
            const methodName = 'handleMarkAsAccomplishedCancel';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
                this.hideMarkAsAccomplishedModal();
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

    // helper methods

        // if a process encounters an error, display that error to the user
        async getRecord() {

            const methodName = 'getRecord';

            // console.log(componentName+'.'+methodName+': start');
            // console.log(componentName+'.'+methodName+': recordId: ' + JSON.stringify(this.recordId));

            try {
                
                this.showSpinner = true;

                // call apex method getPriority and process result
                let result = await getPriority({recordId: this.recordId});
                // console.log(componentName+'.'+methodName+': result: ' + JSON.stringify(result));

                this.record = {...result};
                this.recordLoaded = true;

                this.progressNotes = this.record?.TMS_Progress_Notes_Results__c;

                // build the status bar
                this.statuses = [...this.buildStatuses()];

                // re-load the card details
                let element = this.template.querySelector('c-tms-card-details');
                if (!isEmpty(element)) {
                    // console.log(componentName+'.'+methodName+': Updating card details');
                    element.set(this.recordId);
                }

                this.showSpinner = false;
                
            } catch (err) {
                this.handleError(errorMessage(err));
            }

        }
    
        // build the list of statuses and which is selected
        buildStatuses() {

            const methodName = 'buildStatuses';
            
            // console.log(componentName+'.'+methodName+': start');

            let statuses = [];
            
            try {

                // convert status text to a number for comparison
                let statusNumber = this.statusNumber(this.record.TMS_Priority_Status__c);
                // console.log(componentName+'.'+methodName+': statusNumber: ', JSON.stringify(statusNumber));

                // initialize variables
                let status;

                status = {
                        id: '0',
                        apiName: 'Draft',
                        label: 'Draft',
                        // helpText: 'TBD',
                        selected: false
                };
                statuses.push(status);

                status = {
                        id: '1',
                        apiName: 'In Progress',
                        label: 'In Progress',
                        // helpText: 'TBD',
                        selected: false
                };
                statuses.push(status);
    
                status = {
                        id: '2',
                        apiName: 'Accomplished',
                        label: 'Accomplished',
                        // helpText: 'TBD',
                        selected: false
                };
                statuses.push(status);

                // console.log(componentName+'.'+methodName+': statuses (before): ', JSON.stringify(statuses));

                // calculate values for statuses that determine how each should be displayed
                if (!isEmpty(statuses)) {
                    statuses.forEach(statusElement => {

                        // console.log(componentName+'.'+methodName+': statusElement: ', JSON.stringify(statusElement));

                        statusElement.pathId = 'path-' + statusElement.id;

                        // check if the status is selected
                        if (statusElement.apiName === this.record.TMS_Priority_Status__c) {
                            statusElement.selected = true;
                        } else {
                            statusElement.selected = false;
                        }

                        // console.log(componentName+'.'+methodName+': statusElement.id: ', JSON.stringify(parseInt(statusElement.id)));

                        // determine path's status
                        let pathStatus;
                        if (parseInt(statusElement.id) === 2 && statusNumber === 2) {
                            pathStatus = 'complete';
                        } else if (parseInt(statusElement.id) < statusNumber) {
                            pathStatus = 'complete';
                        } else if (parseInt(statusElement.id) === statusNumber) {
                            pathStatus = 'current';
                        } else {
                            pathStatus = 'incomplete';
                        }

                        // console.log(componentName+'.'+methodName+': pathStatus: ', JSON.stringify(pathStatus));

                        // apply the correct slds class for the path's status
                        statusElement.pathClass = 'slds-path__item slds-is-' + pathStatus;
                        // console.log(componentName+'.'+methodName+': pathClass: ', JSON.stringify(statusElement.pathClass));

                        if (statusElement.selected === true) {
                            // statusElement.pathClass += slds-is-active;
                            statusElement.tabIndex = 0;
                        } else {
                            statusElement.tabIndex = -1;
                        }
                
                        // console.log(componentName+'.'+methodName+': statusElement: ', JSON.stringify(statusElement));

                    });
                }

            } catch (err) {
                this.handleError(errorMessage(err));
            }
            
            // console.log(componentName+'.'+methodName+': statuses (after): ', JSON.stringify(statuses));

            return statuses;         
        }

        // convert status text to a number for comparison
        statusNumber(status) {

            const methodName = 'statusNumber';

            // console.log(componentName+'.'+methodName+': status: ' + JSON.stringify(status));

            let result = null;

            if (status === 'Draft') {
                result = 0;
            } else if (status === 'In Progress') {
                result = 1;
            } else if (status === 'Accomplished') {
                result = 2;
            }

            // console.log(componentName+'.'+methodName+': result: ' + JSON.stringify(result));

            return result;

        }
        
        // reset fields and show modal
        showMarkAsAccomplishedModal() {
        
            const methodName = 'showMarkAsAccomplishedModal';
        
            // console.log(componentName+'.'+methodName+': start');
    
            try {
    
                // reset fields 
                this.submitState = undefined;
                this.showSpinner = false;
    
                // show modal
                this.template.querySelector('c-lwc-modal.markAsAccomplished').show();
    
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }
    
        // hide modal
        hideMarkAsAccomplishedModal() {
        
            const methodName = 'hideMarkAsAccomplishedModal';
        
            // console.log(componentName+'.'+methodName+': start');
    
            try {
    
                // hide modal
                this.template.querySelector('c-lwc-modal.markAsAccomplished').hide();
                
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // if a process encounters an error, display that error to the user
        handleError(error) {

            const methodName = 'handleError';

            // console.log(componentName+'.'+methodName+': event received');
            // console.log(componentName+'.'+methodName+': error: ', JSON.stringify(error));

            // turn off the spinner
            this.showSpinner = false;

            try {
                toastError(this, 'Error', error);
            } catch (err) {
                // console.log(componentName+'.'+methodName+': Could not display this error message to the user: ' + error);
            }

        }

}