import { LightningElement, track, api } from 'lwc';

// Importing Apex Class method
import saveAccount from '@salesforce/apex/LWCExampleController.saveAccountRecord';

// importing to show toast notifications
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// importing Account fields
import NAME_FIELD from '@salesforce/schema/Account.Name';
import Phone_FIELD from '@salesforce/schema/Account.Phone';
import Industry_FIELD from '@salesforce/schema/Account.Industry';
import Type_FIELD from '@salesforce/schema/Account.Type';

import RATING_FIELD from '@salesforce/schema/Account.Rating';
import ANNUALREVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import ACCOUNTNUMBER_FIELD from '@salesforce/schema/Account.AccountNumber';
import BILLINGSTREET_FIELD from '@salesforce/schema/Account.BillingStreet';

import BILLINGCITY_FIELD from '@salesforce/schema/Account.BillingCity';
import BILLINGSTATE_FIELD from '@salesforce/schema/Account.BillingState';
import BILLINGPOSTALCODE_FIELD from '@salesforce/schema/Account.BillingPostalCode';
import BILLINGCOUNTRY_FIELD from '@salesforce/schema/Account.BillingCountry';

export default class CreateRecordInLWC extends LightningElement {
    @track error;
    @track selectedStep = 'account';

    // this object have record information
    @track accRecord = {
        Name: NAME_FIELD,
        Industry: Industry_FIELD,
        Phone: Phone_FIELD,
        Type: Type_FIELD,
        Rating: RATING_FIELD,
        AnnualRevenue: ANNUALREVENUE_FIELD,
        AccountNumber: ACCOUNTNUMBER_FIELD,
        BillingStreet: BILLINGSTREET_FIELD,
        BillingCity: BILLINGCITY_FIELD,
        BillingState: BILLINGSTATE_FIELD,
        BillingPostalCode: BILLINGPOSTALCODE_FIELD,
        BillingCountry: BILLINGCOUNTRY_FIELD
    };

    handleNameChange(event) {
        this.accRecord.Name = event.target.value;
    }

    handlePhoneChange(event) {
        this.accRecord.Phone = event.target.value;
    }

    handleTypeChange(event) {
        this.accRecord.Type = event.target.value;
        window.console.log('Type ==> '+this.accRecord.Type);
    }

    handleIndustryChange(event) {
        this.accRecord.Industry = event.target.value;
        window.console.log('Industry ==> '+this.accRecord.Industry);
    }

    handleRatingChange(event){
 this.accRecord.Rating = event.target.value;
        window.console.log('Rating ==> '+this.accRecord.Rating);
    }

handleAnnualChange(event){
this.accRecord.AnnualRevenue = event.target.value;
}

handleNumberChange(event){
this.accRecord.AccountNumber = event.target.value;
}

handleBillingChange(event){
this.accRecord.BillingStreet = event.target.value;
}

handleCityChange(event){
this.accRecord.BillingCity = event.target.value;
}

handleStateChange(event){
this.accRecord.BillingState = event.target.value;
}

handlePostalChange(event){
this.accRecord.BillingPostalCode = event.target.value;
}

handleCountryChange(event){
    this.accRecord.BillingCountry = event.target.value;
}


    handleSave() {
        saveAccount({ objAcc: this.accRecord })
            .then(result => {
                // Clear the user enter values
                this.accRecord = {};

                // Show success message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!!',
                        message: 'Account Created Successfully!!',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.error = error.message;
            });
    }

    @track hasError = false;
    // Handle navigation to different steps
    nextStep() {
        // Check if all required fields are filled before proceeding
        if (this.selectedStep === 'account') {
            if (!this.isAccountStepValid()) {
                this.hasError = true; // Set hasError to true if validation fails
                return;
            }
            this.selectedStep = 'contact';
            this.hasError = false; // Reset hasError if validation succeeds
        } else if (this.selectedStep === 'contact') {
            if (!this.isContactStepValid()) {
                this.hasError = true; // Set hasError to true if validation fails
                return;
            }
            this.selectedStep = 'opportunity';
            this.hasError = false; // Reset hasError if validation succeeds
        }
        else if (this.selectedStep === 'opportunity') {
            if (!this.isOpportunityStepValid()) {
                this.hasError = true; // Set hasError to true if validation fails
                return;
            }
            this.selectedStep = 'FileUpload';
            this.hasError = false; // Reset hasError if validation succeeds
        }
    }
    
    isAccountStepValid() {
        // Implement your validation logic for the Account step here
        return !!this.accRecord.Name && !!this.accRecord.Phone && !!this.accRecord.Type;
    }
    
    isContactStepValid() {
        // Implement your validation logic for the Contact step here
        return !!this.accRecord.Rating && !!this.accRecord.AnnualRevenue && !!this.accRecord.AccountNumber;
    }
    isOpportunityStepValid() {
        // Implement your validation logic for the Account step here
        return !!this.accRecord.BillingCity && !!this.accRecord.BillingPostalCodee && !!this.accRecord.BillingCountry && !!this.accRecord.BillingState;
    }
   previousStep () {
        if (this.selectedStep === 'opportunity') {
            this.selectedStep = 'contact';
        } else if (this.selectedStep === 'contact') {
            this.selectedStep = 'account';
        }
    }

    selectStepAccount() {
        this.selectedStep = 'account';
    }

    selectStepContact() {
        this.selectedStep = 'contact';
    }

    selectStepOpportunity() {
        this.selectedStep = 'opportunity';
    }

    selectStepFileUpload(){
        this.selectedStep = 'FileUpload';
    }

    get isAccountStep() {
        return this.selectedStep === 'account';
    }

    get isContactStep() {
        return this.selectedStep === 'contact';
    }

    get isOpportunityStep() {
        return this.selectedStep === 'opportunity';
    }
    get isFileUpload() {
        return this.selectedStep === 'FileUpload';
    }

    //File Upload

    @api recordId; 
    get acceptedFormats() { 
        return ['.pdf', '.png','.jpg','.jpeg']; 
    } 
    handleUploadFinished(event) { 
        // Get the list of uploaded files 
        const uploadedFiles = event.detail.files; 
        let uploadedFileNames = ''; 
        for(let i = 0; i < uploadedFiles.length; i++) { 
            uploadedFileNames += uploadedFiles[i].name + ', '; 
        } 
        this.dispatchEvent( 
            new ShowToastEvent({ 
                title: 'Success', 
                message: uploadedFiles.length + ' Files uploaded Successfully: ' + uploadedFileNames, 
                variant: 'success', 
            }), 
        ); 
    } 
}
