import { LightningElement, track } from 'lwc';  
 import saveRecord from '@salesforce/apex/ContactController.saveContact';  
 import { NavigationMixin } from 'lightning/navigation';  
 import { ShowToastEvent } from 'lightning/platformShowToastEvent';  
 const MAX_FILE_SIZE = 100000000; //10mb  
 export default class NewRecordWithFileUpload extends NavigationMixin(LightningElement) {  
    @track error;
    @track selectedStep = 'account';
   @track name;  
   @track phone;  
   @track email;  
   @track description;  
   uploadedFiles = []; file; fileContents; fileReader; content; fileName  
   onNameChange(event) {  
     this.name = event.detail.value;  
   }  
   onPhoneChange(event) {  
     this.phone = event.detail.value;  
   }  
   onEmailChange(event) {  
     this.email = event.detail.value;  
   }  
   onDescriptionChange(event) {  
     this.description = event.detail.value;  
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
     var con = {  
       'sobjectType': 'Contact',  
       'LastName': this.name,  
       'Email': this.email,  
       'Phone': this.phone,  
       'Description': this.description  
     }  
     saveRecord({  
       contactRec: con,  
       file: encodeURIComponent(this.fileContents),  
       fileName: this.fileName  
     })  
       .then(conId => {  
         if (conId) {  
           this.dispatchEvent(  
             new ShowToastEvent({  
               title: 'Success',  
               variant: 'success',  
               message: 'Contact Successfully created',  
             }),  
           );  
           this[NavigationMixin.Navigate]({  
             type: 'standard__recordPage',  
             attributes: {  
               recordId: conId,  
               objectApiName: 'Contact',  
               actionName: 'view'  
             },  
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
    
    return !!this.name; // Return true if the name field is not empty, otherwise return false
}

isContactStepValid() {
    
    return !!this.phone; // Return true if the phone field is not empty, otherwise return false
}

isOpportunityStepValid() {
   
    return !!this.email && !!this.description; // Return true if the email field is not empty, otherwise return false
}

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

previousStep () {
    if (this.selectedStep === 'opportunity') {
        this.selectedStep = 'contact';
    } else if (this.selectedStep === 'contact') {
        this.selectedStep = 'account';
    }
}
 } 