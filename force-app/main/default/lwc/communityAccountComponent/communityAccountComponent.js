import { LightningElement, track,wire } from 'lwc';  
import saveRecord from '@salesforce/apex/contractController.saveContract';  
import { NavigationMixin } from 'lightning/navigation';  
import { ShowToastEvent } from 'lightning/platformShowToastEvent';  
const MAX_FILE_SIZE = 100000000; //10mb  
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import RATING_FIELD from "@salesforce/schema/Account.Rating";
import INDUSTRY_FIELD from "@salesforce/schema/Account.Industry";
import TYPE_FIELD from "@salesforce/schema/Account.Type";

export default class CommunityAccountComponent extends NavigationMixin(LightningElement) {
   
   @track error;
   @track selectedStep = 'account';
  @track name;  
  @track phone;  
  @track accNumber; 
  @track email;
  @track BillingCity;
  @track BillingState;
  @track BillingPostalCode;
  @track BillingCountry;
  @track Type;
  @track Rating;
  @track Industry;
  @track description;  
  uploadedFiles = []; file; fileContents; fileReader; content; fileName  

 

   @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
   objectInfo;

   @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: INDUSTRY_FIELD})
   IndustryPicklistValues;

   @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: TYPE_FIELD})
   TypePicklistValues;

   @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: RATING_FIELD})
   RatingPicklistValues;

  onNameChange(event) {  
    this.name = event.detail.value;  
  }  
  onTypeChange(event) {  
    this.Type = event.detail.value;  
  }  
  onPhoneChange(event) {  
    this.phone = event.detail.value;  
  }  
  onAccountNumChange(event) {  
    this.accNumber = event.detail.value;  
  }  

onIndustryChange(event) {  
   this.Industry = event.detail.value;  
 }  
 onDescriptionChange(event) {  
   this.description = event.detail.value;  
 }  
 onRatingChange(event) {  
   this.Rating = event.detail.value;  
 }  
 onEmailChange(event) {  
   this.email = event.detail.value;  
 }  



 onBCityChange(event) {  
   this.BillingCity = event.detail.value;  
 }  
 onBStateChange(event) {  
   this.BillingState = event.detail.value;  
 }  
 onBPostalChange(event) {  
   this.BillingPostalCode = event.detail.value;  
 }  
 onBCountryChange(event) {  
   this.BillingCountry = event.detail.value;  
 }  

  onFileUpload(event) {  
    if (event.target.files.length > 0) {  
      this.uploadedFiles = event.target.files;  
      this.fileName = event.target.files[0].name;  
      this.file = this.uploadedFiles[0];  
      if (this.file.size > this.MAX_FILE_SIZE) {  
        alert("File Size Can not exceed" + MAX_FILE_SIZE);  
      }  
    }  
  }  
  saveContact() {  
    this.fileReader = new FileReader();  
    this.fileReader.onloadend = (() => {  
      this.fileContents = this.fileReader.result;  
      let base64 = 'base64,';  
      this.content = this.fileContents.indexOf(base64) + base64.length;  
      this.fileContents = this.fileContents.substring(this.content);  
      this.saveRecord();  
    });  
    this.fileReader.readAsDataURL(this.file);  
  }  
  saveRecord() {  
    var acc = {  
      'sobjectType': 'Account',  
      'Name': this.name,  
      'Type': this.Type,  
      'Phone': this.phone,  
      'AccountNumber': this.accNumber,
      'Industry' : this.Industry,
      'Description' : this.description,
      'Rating' : this.Rating,
      'Email__c' : this.email,
      'BillingCity' : this.BillingCity,
      'BillingState' : this.BillingState,
      'BillingPostalCode' : this.BillingPostalCode,
      'BillingCountry' : this.BillingCountry 
    }  
    saveRecord({  
       accountRec: acc,  
      file: encodeURIComponent(this.fileContents),  
      fileName: this.fileName  
    })  
      .then(accId => {  
        if (accId) {  
          this.dispatchEvent(  
            new ShowToastEvent({  
              title: 'Success',  
              variant: 'success',  
              message: 'Account Successfully created',  
            }),  
          );  
          this[NavigationMixin.Navigate]({
           type: 'standard__recordPage',
           attributes: {
               recordId: accId,
               objectApiName: 'Account',
               actionName: 'view'
           }
       });  
        }  
      }).catch(error => {  
        console.log('error ', error);  
      });  
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

isAccountStepValid() {
   
   return !!this.name && !!this.Type && !!this.phone && !!this.accNumber; // Return true if the name field is not empty, otherwise return false 
}

isContactStepValid() {
   
   return !!this.Industry && !!this.description && !!this.Rating && !!this.email; // Return true if the phone field is not empty, otherwise return false
}

isOpportunityStepValid() {
  
   return !!this.BillingCity && !!this.BillingState && !!this.BillingPostalCode && !!this.BillingCountry; // Return true if the email field is not empty, otherwise return false
}

nextStep() {
   if (this.selectedStep === 'account') {
       if (!this.isAccountStepValid()) {
           this.hasError = true;
           return;
       }
       this.selectedStep = 'contact';
       this.hasError = false;
   } else if (this.selectedStep === 'contact') {
       if (!this.isContactStepValid()) {
           this.hasError = true;
           return;
       }
       this.selectedStep = 'opportunity';
       this.hasError = false;
   } else if (this.selectedStep === 'opportunity') {
       if (!this.isOpportunityStepValid()) {
           this.hasError = true;
           return;
       }
       this.selectedStep = 'FileUpload';
       this.hasError = false;
   }
}

previousStep() {
   if (this.selectedStep === 'contact') {
       this.selectedStep = 'account';
   } else if (this.selectedStep === 'opportunity') {
       this.selectedStep = 'contact';
   } else if (this.selectedStep === 'FileUpload') {
       this.selectedStep = 'opportunity';
   }
}
}