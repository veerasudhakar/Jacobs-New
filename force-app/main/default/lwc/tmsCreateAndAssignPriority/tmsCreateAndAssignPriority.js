import {
    LightningElement,
    api,
    track,
    wire
} from 'lwc';
import {
    CurrentPageReference
} from 'lightning/navigation';

import {
    NavigationMixin
} from 'lightning/navigation';

import {
    ShowToastEvent
} from "lightning/platformShowToastEvent";

import { deleteRecord } from 'lightning/uiRecordApi';
import getTalentDetails from '@salesforce/apex/TMS_Create_Priority_In_Bulk.getTalentDetails';
import deletePriority from '@salesforce/apex/TMS_Create_Priority_In_Bulk.deletePriority';
import getCurrentUserTalentDetails from '@salesforce/apex/TMS_Create_Priority_In_Bulk.getCurrentUserTalentDetails';
import savePriorities from '@salesforce/apex/TMS_Create_Priority_In_Bulk.savePriorities';
import getPriorityDetails from '@salesforce/apex/TMS_Create_Priority_In_Bulk.getPriorityDetails';
import getPriorityDetailsImperative from '@salesforce/apex/TMS_Create_Priority_In_Bulk.getPriorityDetailsImperative';
import getAssignPriorityRecordType from '@salesforce/apex/TMS_Create_Priority_In_Bulk.getAssignPriorityRecordType';
import getFiscalYears from '@salesforce/apex/TMS_Create_Priority_In_Bulk.getFiscalYears';

export default class TmsCreateAndAssignPriority extends NavigationMixin(LightningElement) {

    // private variables
    //priorityRecordTypeId = '0123f0000008TpCAAU'
    title = '';
    subTitle = 'Priority Details';
    shared = 'Everyone at Jacobs';
    notShared = 'You and your Manager Hierarchy';
    messageWhenSharedOnCreate = 'By clicking Create Priority, you are making this priority visible to all of Jacobs. Others will see it in your e3 Overview.';
    messageWhenSharedOnUpdate = 'By clicking Update Priority, you are making this priority visible to all of Jacobs. Others will see it in your e3 Overview.';
    invalidUserSelectionErrorMessage = '* Names in red must be removed before you can proceed because they are not your direct report or delegated employee.';
    isCreate = false;
    isUpdate = false;
    isAssignPriority = false;
    isInvalidUserSelected = false;
    showSpinner  = true;
    isFiscalYearAndCreatedForYearMismatched = false;

    @track disableAssignButton = true;
    @track priorityData = {
                            Id: null,
                            Name: null,
                            TMS_Measure__c: null,
                            TMS_Alignment__c: null,
                            TMS_Expected_Date_of_completion__c: null,
                            TMS_Priority_Accomplished_Date__c: null,
                            TMS_Created_for_Year__c: null,
                            TMS_Priority_Status__c: null,
                            TMS_Simple_and_Specific_Details__c: null,
                            Priority_Share__c: false,
                            TMS_Progress_Notes_Results__c: null
                        };
    @track placeHolders = {
                            Title: 'Enter the Title',
                            Measure: 'Determine a Measure for success',
                            DateOfCompletion: 'Choose the target date',
                            DateOfAccomplished: 'Choose the accomplished date',
                            simpleDetails: 'Simple and specific details about this priority'
                        }
                    
    talentDetails = {};
    talentId = null;
    urlStateParameters = null;
    financialYears = [];

    @track valueForRichText;
    @track errorMessageForRichText = 'Complete this field.';
    @track validityForRichText = true;

    // Public Variables
    @api recordId;
    @api talentProfileId;
    @api mode;

    // Reactive Track Variables
    @track selectedTalents = [];
    @track isTalentsSelected = false;
    @track isShowAddButtonVisible = false;

    @wire(getFiscalYears)
    getFiscalYears({
        data,
        error
    }){
        if (data) {
            this.financialYears = data;
        } else if (error) {
            this.showToastMessage('Error',error,'Error');
        }
    }
    

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.urlStateParameters = currentPageReference.state;
            if(this.urlStateParameters.c__mode){
                this.setParametersBasedOnUrl();
            }
            else{
                this.getTitle();
            }
        }
    }

    @wire(getTalentDetails, {
        talentId: '$talentId'
    })
    getTalentDetails({
        data,
        error
    }) {
        if (data) {
            if(data.Id){
                this.talentDetails = data;
                this.handleAddOfTalent();
            }
        } else if (error) {
            //this.showToastMessage('Error',error,'Error');
        }
    }

    @wire(getCurrentUserTalentDetails)
    getCurrentUserTalentDetails({
        data,
        error
    }) {
        if (data) {
            this.talentDetails = data;
            if(this.mode != 'assign') {
            this.selectedTalents.push(this.talentDetails);
            }
        } else if (error) {
            //this.showToastMessage('Error',error,'Error');
        }
    }

    // Connected Callback
    connectedCallback() {
        this.getPriorityDetailsImperative();
        this.showSpinner = false;
    }

    setParametersBasedOnUrl() {
        this.recordId = this.urlStateParameters.c__recordId || null;
        this.talentProfileId = this.urlStateParameters.c__talentProfileId || null;
        this.mode = this.urlStateParameters.c__mode || 'new';
        //this.recordId = this.urlStateParameters.c__recordid;
        this.getTitle();
    }

    getPriorityDetailsImperative(){
        getPriorityDetailsImperative({recordId : this.recordId})
            .then(data => {
                console.log(data);
                this.priorityData = data;
            })
            .catch(error => {
                console.log(error);
                this.showToastMessage('Error','Error',error);
            })
    }

    // Helps to get the title for the Page
    getTitle() {
        if (this.mode == 'new') {
            this.isCreate = true;
            this.title = 'Create New Priority';
        } else if (this.mode == 'update') {
            this.isUpdate = true;
            this.title = 'Edit Priority';
            //this.priorityData.TMS_Progress_Notes_Results__c = "";
        } else if (this.mode == 'assign') {
            this.disableAssignButton = true;
            this.isAssignPriority = true
            this.title = 'Assign Priority';
        } else {
            this.showToastMessage('Error', 'Error', 'Unable to render form');
            this.showSpinner = true;
        }
    }

    // When a Priority Owner is selected
    handlePriorityOwnerChange(event) {
        try {
            let detail = event.detail;
            if (detail) {
                this.talentId = detail.Id;
            }
        } catch (error) {
            this.showToastMessage('Error', error, 'Error');
        }
    }


    // When talent is Added
    handleAddOfTalent() {
        let setOfSelectedTalentIds = new Set();
        this.selectedTalents.forEach(element => {
            setOfSelectedTalentIds.add(element.Id)
        });

        if (setOfSelectedTalentIds.has(this.talentDetails.Id)) {
            // Do nothing
        } else {
            this.selectedTalents.push(this.talentDetails);
        }

        if(this.selectedTalents) {
            this.disableAssignButton = false;
        }
        this.validateTalentSelected();
        // reset values
        this.handleLookupReset();
        //this.validateShowOfAddButton();
        //this.handleErrorOnPill();
    }

    // When talent is removed by clicking on the X
    handleRemoveOfTalent(event) {
        let talentIdToRemove = event.target.dataset.id;
        this.selectedTalents = this.selectedTalents.filter(object => {
            return object.Id !== talentIdToRemove;
        });
        if(this.selectedTalents.length == 0) {
            this.disableAssignButton = true;
        }
    }

    // When one or more talent is seleted
    validateTalentSelected() {
        if (this.selectedTalents) {
            this.isTalentsSelected = true;
        } else {
            this.isTalentsSelected = false;
        }
    }

    // Resets the look-up field
    handleLookupReset() {
        this.talentId = null;
        this.talentDetails = null;
        this.template.querySelector('c-tms-custom-lookup').clear();
    }


    // Helps us to determine if the Add button is to be displayed yet
    validateShowOfAddButton() {
        if (this.talentDetails) {
            this.isShowAddButtonVisible = true
        } else {
            this.isShowAddButtonVisible = false;
        }
    }

    get disableButton() {
        let hasInvalidUser = false;

        this.selectedTalents.forEach(element => {
            if (hasInvalidUser == false && element.isInvalidUser) {
                hasInvalidUser = true;
            }

        })
        this.isInvalidUserSelected = hasInvalidUser
        return !(this.selectedTalents && hasInvalidUser == false);
    }

    handleSharePriority(event) {
        this.priorityData.Priority_Share__c = event.target.checked;
        if (event.target.checked) {
            if(this.isCreate){
                this.showToastMessage('Warning', 'Warning', this.messageWhenSharedOnCreate);
            }
            else if(this.isUpdate){
                this.showToastMessage('Warning', 'Warning', this.messageWhenSharedOnUpdate);
            }
        }

    }

    handleClickOfPill(event) {
        event.preventDefault();
        // Navigate to a URL
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: event.target.dataset.navurl
            }
        }).then(url => {
            window.open(url, "_blank");
        });
    }

    handleSave(){
        console.log('recordId : '+this.recordId );
        let saveMessage = '';
        if(this.isCreate){
            saveMessage = 'The priority was created successfully';
        }
        else if(this.isUpdate){
            saveMessage = 'The priority was updated successfully';
        }
        else if(this.isAssignPriority){
            saveMessage = 'The priorities were created and Assigned Successfully';
        }
        //this.priorityData.RecordTypeId = this.priorityRecordTypeId;
        savePriorities({
            priorityToInsert: this.priorityData,
            selectedTalentProfiles: this.selectedTalents
        })
        .then(data => {
            this.showSpinner = false;
            this.showToastMessage('Success', 'Success', saveMessage);
            if(this.isCreate || this.isAssignPriority){
                this.recordId = data[0].Id;
            }
            this.dispatchEvent(new CustomEvent('edit' , { detail : { recordId : this.recordId, type : 'save'}}));
            this.handleReset();
        })
        .catch(error => {
            this.showSpinner = false;
            let errorMessageType = 'FIELD_CUSTOM_VALIDATION_EXCEPTION';
            let errorMessage = error.body.message;
            let messageToDisplay = error.body.message;

            try {
                if (errorMessage.includes(errorMessageType)) {
                    messageToDisplay = errorMessage.substring(errorMessage.indexOf(errorMessageType) + errorMessageType.length + 1);
                }
                if(messageToDisplay.includes(": [")){
                    messageToDisplay = messageToDisplay.substring(0, messageToDisplay.indexOf(": ["));
                }
                if(messageToDisplay.includes("&quot;")){
                    messageToDisplay = messageToDisplay.replace(/&quot;/g, "\'");
                }

                if(messageToDisplay.includes("&amp;")){
                    messageToDisplay = messageToDisplay.replace(/&amp;/g, "&");
                }
            } catch (err) {
                messageToDisplay = error.body.message;
            }

            this.showToastMessage('Error', 'Error', messageToDisplay);
        })
    }

    // Helps to save the Priority in draft format
    handleSaveDraft() {
        let hasError = this.validateForm();
        if (hasError == false) {
            this.priorityData.TMS_Priority_Status__c = 'TMS_Draft';
            this.handleSave();
        }
    }

    // Helps to save the Priority in In Progress Status
    handleCreateSave() {
        this.showSpinner = true;
        let hasError = this.validateForm();
        if (hasError == false) {
            this.priorityData.TMS_Priority_Status__c = 'TMS_InProgress';
            this.handleSave();
        }
    }

    // Helps save Priority when Update is clicked
    handleUpdateSave(){
        this.showSpinner = true;
        let hasError = this.validateForm();
        if (hasError == false) {
            // this.priorityData.TMS_Priority_Status__c = 'TMS_InProgress';
            this.handleSave();
        }
    }

    handleDelete(){
        if(this.recordId){
            deletePriority({priorityId : this.recordId})
            .then(data => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                this.handleNavigateToPriorityPage();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        }
    }
    // 
    handleAssignPriority() {
        let hasError = this.validateForm();
        this.showSpinner = false;
        if (hasError == false && this.isInvalidUserSelected == false) {
            this.showSpinner = true;
            this.priorityData.TMS_Priority_Status__c = 'TMS_InProgress'
            this.handleSave();
        }
    }

    handleDiscard(){
        this.showDiscardModal();
    }

    // 
    validateForm() {
        this.showSpinner = true;
        let hasError = false;
        this.template.querySelectorAll('lightning-input-field').forEach(element => element.reportValidity());
        this.template.querySelectorAll('lightning-input').forEach(element => element.reportValidity());
        
        this.template.querySelectorAll('lightning-input-field').forEach(element => {
            this.priorityData[element.dataset.apiname] = element.value;
            if (element.required == true && !element.value && hasError == false) {
                hasError = true;
                this.showSpinner = false;
            }
        });
        
        this.template.querySelectorAll('lightning-combobox').forEach(element => {
            this.priorityData[element.dataset.apiname] = element.value;
            if (element.required == true && !element.value && hasError == false) {
                hasError = true;
                this.showSpinner = false;
            }
        });
        this.template.querySelectorAll('lightning-input').forEach(element => {
            if(element.name != 'is-shared') {
            this.priorityData[element.dataset.apiname] = element.value;
            if (element.required == true && !element.value && hasError == false) {
                hasError = true;
                this.showSpinner = false;
                }
            }
        });
         this.valueForRichText = this.template.querySelector('lightning-input-rich-text').value;
         if (!this.valueForRichText) {
             this.validityForRichText = false;
             hasError = true;
             this.showSpinner = false;
         }
         else {
             this.priorityData[this.template.querySelector('lightning-input-rich-text').dataset.apiname] =
             this.template.querySelector('lightning-input-rich-text').value;
             this.validityForRichText = true;
         }
        return hasError;
    }

    handleReset(){
        this.title = '';
        this.subTitle = 'Priority Details';
        this.isCreate = false;
        this.isUpdate = false;
        this.isAssignPriority = false;
        this.showSpinner  = false;
        this.priorityData = {
                            Id: null,
                            Name: null,
                            TMS_Measure__c: null,
                            TMS_Alignment__c: null,
                            TMS_Expected_Date_of_completion__c: null,
                            TMS_Priority_Status__c: null,
                            TMS_Created_for_Year__c: null,
                            TMS_Simple_and_Specific_Details__c: null,
                            Priority_Share__c: false,
                            TMS_Progress_Notes_Results__c: null,
                            TMS_Priority_Accomplished_Date__c: null
                        };           
        this.talentDetails = {};
        this.talentId = null;
        this.urlStateParameters = null;
        this.recordId = null;
        this.talentProfileId = null;
        this.mode = null;
        this.selectedTalents = [];
        this.isTalentsSelected = false;
        this.isShowAddButtonVisible = false;

        this.template.querySelectorAll('lightning-input-field').forEach(element => {
            element.value = null;
        });
        this.template.querySelectorAll('lightning-input').forEach(element => {
            element.value = null;
        });
        this.template.querySelector('lightning-input-rich-text').value = '';

    }

    navigateToPriorityPage(){
        this.dispatchEvent(new CustomEvent('edit' , { detail : { recordId : this.recordId, type : 'cancel'}}));
    }

    showDiscardModal() {
        this.template.querySelector('.discardConfirmModal').show();
    }

    handleDiscardNo() {
        this.template.querySelector('.discardConfirmModal').hide();
    }

    handleDiscardYes() {     
        this.navigateToPriorityPage();           
        this.handleReset();
    }

    showDeletedModal() {
        this.template.querySelector('.deleteConfirmModal').show();
    }


    handleDeleteYes(){
        this.handleDelete();
    }

    handleDeleteNo(){
        this.template.querySelector('.deleteConfirmModal').hide();
    }

    handleNavigateToPriorityPage() {
        // Navigate to a URL
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/e3experience/s/tms-priority/TMS_Priority__c/Default'
            }
        });
        // .then(url => {
        //     window.open(url, "_blank");
        // });
    }
    
    handleOnChangeOfDate(){
        this.isFiscalYearAndCreatedForYearMismatched = false;
        let dateValue = this.template.querySelector("lightning-input[data-apiname=TMS_Expected_Date_of_completion__c]").value;
        let yearValue = this.template.querySelector("lightning-input-field[data-apiname=TMS_Created_for_Year__c]").value;

        if(dateValue && yearValue){
            this.financialYears.forEach(financialYear => {
                let startDate = new Date();
                let endDate = new Date();
                startDate = financialYear.StartDate;
                endDate = financialYear.EndDate;
                console.log(startDate);
                console.log(endDate);
                if(startDate <= dateValue && endDate >=dateValue){
                    console.log('Found');
                    console.log(financialYear);
                    console.log(financialYear.Name);
                    if(financialYear.Name != yearValue){
                        this.isFiscalYearAndCreatedForYearMismatched = true;
                    }
                }
            })
        }
    }

    get isCreatedForYearMismatched(){

        return this.isFiscalYearAndCreatedForYearMismatched;
    }

    get priorityStatusPicklistValues(){
        return [{label: 'In Progress', value : 'TMS_InProgress'},{label: 'Accomplished', value : 'TMS_Accomplished'}];
    }

    // Helps display a toast message
    showToastMessage(variant, title, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}