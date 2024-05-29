import { LightningElement,api, wire } from 'lwc';

/* eslint-disable no-console */
/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */

// for debugging
const componentName = 'tmsMyPrioritiesAndReview';

// utility methods
import { isEmpty, toastError, errorMessage, scrollToTop } from 'c/lwcUtils';

// import navigation methods
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

// apex methods
import getUserTalentProfileId from '@salesforce/apex/TMS_MyController.getUserTalentProfileId';
import getUserPriorityDetails from '@salesforce/apex/TMS_CareerPlanViewDetails.getUserPersonalDetails';
// user fields to get.
import USER_ID from '@salesforce/user/Id';

export default class tmsMyPrioritiesAndReview extends NavigationMixin (LightningElement) {

   
    // constructors/lifecycle callbacks

        // for methods that need to run after public variables have been instantiated
        connectedCallback() {

            const methodName = 'connectedCallback';
            this.fetchCareerPlanDetails();  
            // console.log(componentName+'.'+methodName+': start');
            
            try {
                
                if(!isEmpty(this.recordId)){
                    this.userId=this.recordId;
                    
                }else{
                    this.userId=USER_ID;
                }

                if(!isEmpty(this.userId) && this.userId === USER_ID){
                    this.isOwnPage = true;
                }

                // check if the URL has a record id on loading
                // if so, show the record details
                let pagePriorityId = this.getUrlPriorityId();
                if (!isEmpty(pagePriorityId)) {
                    this.showWhat('priorityDetails', pagePriorityId);
                }
                
                
            } catch (err) {
                this.handleError(errorMessage(err));
            }
            
            // console.log(componentName+'.'+methodName+': end');
        }

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

        @api hasPriorityRecordAccess;

        // the currently selected record
        @api recordId;
        @api userIdTp;  
        // holding the flag where its viewing from pririty setting or from talent profile
        @api isTalentProfileView;

    // public methods

    
    // private variables/handlers

       // show the loading spinner, on by default until the page stops loading background information
      
       showSpinner = true;

       // which tab to show by default
       defaultTab = 'priorities';

       // which tab is currently selected
       // selectedTab;

       // the talent profile id of the manager whose page we are viewing
       talentProfileId;

       // flag to show the priorities list
       showList = true;

       // flag on whether to show the new/edit form
       showPriorityForm = false;
       priorityFormMode;

       // flag on whether to show the priority details
       showPriorityDetails = false;

       // save the filters and sorting so we can remember them when showing the list again after creating
       prioritySelectedFilters;
       prioritySortField;
       prioritySortDirection;

       //will hold userid from parent(recordId) or user field (USER_ID)
       userId;

       hasPriorityPageAccess = false;
       isPriorityPageAccessLoaded = false;
       isOwnPage = false;
      
    // wires

        @wire(getUserTalentProfileId, {
            userId: '$userId'
        }) wiregetUserTalentProfileId({error, data}) {
        
            const methodName = 'getUserTalentProfileId';           
            // console.log(componentName+'.'+methodName+': wire method called');
        
            try {
        
                if (error) {
        
                    // console.log(componentName+'.'+methodName+': error: ', JSON.stringify(error));
        
                    this.handleError(errorMessage(error));
        
                } else if (data !== undefined && data !== null) {
                           
                    //console.log(componentName+'.'+methodName+': data: ', JSON.stringify(data))
                   this.talentProfileId = data;                    

                }

                // check if background data is loaded and turn off spinner
                if (this.backgroundLoaded()) {
                    this.showSpinner = false;
                }
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        currentPageReference = undefined; 
        urlParameters = undefined;
        urlParametersLoaded = undefined;

        // get the page's url parameters
        @wire(CurrentPageReference)
        getStateParameters(currentPageReference) {

            const methodName = 'getStateParameters';

            if (currentPageReference) {
                this.currentPageReference = currentPageReference;
                this.urlParameters = currentPageReference.state;
                this.urlParametersLoaded = true;

                // console.log(componentName+'.'+methodName+': urlParameters: ' + JSON.stringify(this.urlParameters));

                // set the default tab that displays on load
                if (!isEmpty(this.urlParameters.c__tab)) {
                    this.defaultTab = this.urlParameters.c__tab;
                }

                // if a page action has been provided
                if (!isEmpty(this.urlParameters.c__action) && this.urlParameters.c__action === 'assignPriority') {
                    this.priorityFormMode = 'assign';
                    this.showWhat('priorityForm', undefined);
                   //Added for 9345
                } else if(!isEmpty(this.urlParameters.c__action) && this.urlParameters.c__action === 'createNewPriority'){
                    this.priorityFormMode = 'new';
                    this.showWhat('priorityForm', undefined);
                }

            }

            // check if background data is loaded and turn off spinner
            if (this.backgroundLoaded()) {
                this.showSpinner = false;
            }
        }

    // getters

        // any conditions to be met before the UI is ready to be rendered
        get pageReady() {
            return this.backgroundLoaded();
        }

        get hasPageAccess(){
            return (this.hasPriorityPageAccess === true || 
                this.hasPriorityRecordAccess === true ||
                this.isOwnPage === true);
        }

    // button handlers

        // a tab has become active, change which content appears
        // and set the default URL parameters
        // handleActiveTab(event) {

        //     const methodName = 'handleActiveTab';
            
        //     // console.log(componentName+'.'+methodName+': start');

        //     try {

                // let tabName = event.target.value;
                
                // if(this.defaultTab === tabName){
                //     // console.log(componentName+'.'+methodName+': Same, exiting early');
                //     return;
                // }

                // // changing tabs, reset the subtab
                // this.subTab = undefined;

                // // navigate to the appropriate list page based on the tab selected
                // if (tabName === 'priorities') {
                //     this.showWhat('priorityList', null);
                // } else if (tabName === 'annuale3') {
                //     this.showWhat('annuale3List', null);
                // }
                
        //     } catch (err) {
        //         this.handleError(errorMessage(err));
        //     }
        // }

        
        fetchCareerPlanDetails() {
          // getUserPriorityDetails({userId : this.userIdTp})
             getUserPriorityDetails({userId : this.userIdTp})
            .then(result => {

                this.hasPriorityPageAccess = result;
                this.isPriorityPageAccessLoaded = true;
                
                // check if background data is loaded and turn off spinner
                if (this.backgroundLoaded()) {
                    this.showSpinner = false;
                }
            })
            .catch(error => {
                this.showSpinner = false;
            })
        }

        // user clicked button to Create New Priority
        handleNewPriority(event) {
        
            const methodName = 'handleNewPriority';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                this.priorityFormMode = 'new';
                this.showWhat('priorityForm', undefined);
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // user clicked button to Assign Priority
        handleAssignPriority(event) {
        
            const methodName = 'handleAssignPriority';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                this.priorityFormMode = 'assign';
                this.showWhat('priorityForm', undefined);
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // user selected a priority
        handlePrioritySelect(event) {
        
            const methodName = 'handlePrioritySelect';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                this.showWhat('priorityDetails', detail.recordId);
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // a component made a request to launch a flow, bubble it up to the aura wrapper component
        handleFlow(event) {
        
            const methodName = 'handleFlow';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                this.dispatchEvent(new CustomEvent(
                    'flow',
                    {
                        detail : detail
                    }
                ));
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // user clicked button to Go Back
        handleBackToList(event) {
            console.log('Test Button Is Clicked');

            
            let priorityId = event.target.dataset.recordId;
            this[NavigationMixin.GenerateUrl]({
                type: 'standard__webPage',
                attributes: {
                    //url: '/e3experience/s/career-planning'
					url: '/e3experience/s/profile/0053f000000Pblt?c__tab=TMS_Career_Plan'
                }
            }).then(url => {
                window.open(url, "_blank");
            });
        
            // const methodName = 'handleBackToList';
        
            // // console.log(componentName+'.'+methodName+': event received');
        
            // try {
        
            //     let name = event.target.name; // the field/button name, if parameter is set
            //     let detail = event.detail; // the event detail
            //     let value = event.target.value; // field/button value
            //     // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
            //     // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
            //     // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
                
            //     if(this.isTalentProfileView){
            //         this.showWhat('talentProfilePriorityList', this.userId);
                    
            //     }else{
            //         this.showWhat('priorityList', undefined);
            //     }
                
        
            // } catch (err) {
            //     this.handleError(errorMessage(err));
            // }
        }

        // user changed a filter, save a copy
        handleFilterChange(event) {
        
            const methodName = 'handleFilterChange';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let detail = event.detail; // the event detail
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
        
                this.prioritySelectedFilters = detail;
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // user changed sorting, save a copy
        handleSortChange(event) {
        
            const methodName = 'handleSortChange';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let detail = event.detail; // the event detail
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
        
                this.prioritySortField = detail.sortField;
                this.prioritySortDirection = detail.sortDirection;
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // the user wants to edit the priority
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
        
                this.priorityFormMode = 'update';
                this.showWhat('priorityForm', detail.recordId);
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // the user finished with the priority edit form
        handlePriorityEdited(event) {
        
            const methodName = 'handlePriorityEdited';
        
            // console.log(componentName+'.'+methodName+': event received');
        
            try {
        
                let name = event.target.name; // the field/button name, if parameter is set
                let detail = event.detail; // the event detail
                let value = event.target.value; // field/button value
                // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
                // console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
                // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
        
                let recordId = detail.recordId;
                let type = detail.type;

                // if no record id, go back to list
                if (isEmpty(recordId)) {
                    this.showWhat('priorityList', undefined);
                
                // if record id, go back to record detail
                } else {
                    this.showWhat('priorityDetails', recordId);
                }
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

    // helper methods

        // check if the background data is loaded
        backgroundLoaded() {
            return !isEmpty(this.urlParametersLoaded) && 
            !isEmpty(this.talentProfileId) && 
            !isEmpty(this.defaultTab) && 
            this.isPriorityPageAccessLoaded === true;
        }

        // identify whether we are on the list or details page
        getPageType() {
        
            const methodName = 'getPageType';

            let location = window.location.href;
            // console.log(componentName+'.'+methodName+': location: ' + JSON.stringify(location));

            let urlObj = new URL(location);
            // console.log(componentName+'.'+methodName+': urlObj: ' + JSON.stringify(urlObj));

            let pathname = urlObj.pathname;
            // console.log(componentName+'.'+methodName+': pathname: ' + JSON.stringify(pathname));

            // initialize result
            let result;

            if (!isEmpty(pathname) && pathname.includes('/tms-priority/TMS_Priority__c')) {
                result = 'priorityList';
            } else {

                let regex = /tms-priority\/(.{18})\//;
                let found = pathname.match(regex);
                // console.log(componentName+'.'+methodName+': found: ' + JSON.stringify(found));

                if (!isEmpty(found) && found.length > 1) {
                    result = 'priorityRecord';
                }

            }

            // console.log(componentName+'.'+methodName+': result: ' + JSON.stringify(result));

            return result;

        }

        // get the page's record id
        getUrlPriorityId() {
        
            const methodName = 'getUrlPriorityId';

            let location = window.location.href;
            // console.log(componentName+'.'+methodName+': location: ' + JSON.stringify(location));

            let urlObj = new URL(location);
            // console.log(componentName+'.'+methodName+': urlObj: ' + JSON.stringify(urlObj));

            let pathname = urlObj.pathname;
            // console.log(componentName+'.'+methodName+': pathname: ' + JSON.stringify(pathname));

            let regex = /tms-priority\/(.{18})\//;
            let found = pathname.match(regex);
            // console.log(componentName+'.'+methodName+': found: ' + JSON.stringify(found));

            let result = undefined;

            if (!isEmpty(found) && found.length > 1) {
                result = found[1];
            }

            // console.log(componentName+'.'+methodName+': result: ' + JSON.stringify(result));

            return result;

        }

        // set which part of the interface to display
        showWhat(showWhat, recordId) {
        
            const methodName = 'showWhat';

            // console.log(componentName+'.'+methodName+': showWhat: ' + JSON.stringify(showWhat));
            // console.log(componentName+'.'+methodName+': recordId: ' + JSON.stringify(recordId));

            try {

                this.showList = false;
                this.showPriorityForm = false;
                this.showPriorityDetails = false;
                this.recordId = undefined;
    
                if (showWhat === 'priorityList') {

                    this.defaultTab = 'priorities';
                    this.showList = true;
    
                    // clear the chatter feed
                    this.dispatchEvent(new CustomEvent(
                        'chatter',
                        {
                            detail : { recordId : undefined }
                        }
                    ));

                    // update the browser url if different
                    let url = '/e3experience/s/tms-priority/TMS_Priority__c/Default'
                    window.history.pushState({}, 'Priority List', url);
    
                } else if (showWhat === 'priorityForm') {

                    this.defaultTab = 'priorities';
                    this.showPriorityForm = true;
                    this.recordId = recordId;
    
                    // update the chatter feed
                    this.dispatchEvent(new CustomEvent(
                        'chatter',
                        {
                            detail : { recordId : recordId }
                        }
                    ));

                    // update the browser url if different
                    let pagePriorityId = this.getUrlPriorityId();
                    if (recordId !== pagePriorityId) {
                        let url = '/e3experience/s/tms-priority/' + recordId + '/edit';
                        window.history.pushState({}, 'Priority Edit', url);
                    }
    
                } else if (showWhat === 'priorityDetails') {

                    this.defaultTab = 'priorities';
                    this.showPriorityDetails = true;
                    this.recordId = recordId;
    
                    // update the chatter feed
                    this.dispatchEvent(new CustomEvent(
                        'chatter',
                        {
                            detail : { recordId : recordId }
                        }
                    ));

                    // update the browser url if different
                    let pagePriorityId = this.getUrlPriorityId();
                    if (recordId !== pagePriorityId) {
                        let url = '/e3experience/s/tms-priority/' + recordId;
                        window.history.pushState({}, 'Priority Details', url);
                    }
                }else if (showWhat === 'talentProfilePriorityList') {

                    this.defaultTab = 'priorities';
                    this.showList = true;
                    this.recordId = recordId;
    
                    // clear the chatter feed
                    this.dispatchEvent(new CustomEvent(
                        'chatter',
                        {
                            detail : { recordId : undefined }
                        }
                    ));

                    // update the browser url if different
                    let url = '/e3experience/s/profile/'+this.recordId+'?c__tab=TMS_Priorities'
                    window.history.pushState({}, 'Priority List', url);
    
                } 

                // scroll to top of page
                scrollToTop();
                
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