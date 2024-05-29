import { LightningElement, track} from 'lwc';
import defaultaccountId from '@salesforce/apex/ContactRelatedAccountId.passingAccountId';
import createrelatedContact from '@salesforce/apex/ContactRelatedAccountId.creatingcontact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
export default class ContactAccountIdExample extends NavigationMixin(LightningElement) { 
    @track selectedRecordId;
 
    latestAccountid ;
    passingAccountid ;
    @track lastNameofcontact ;
     
     
            // @wire(defaultaccountId)
            //  accountRecordid({data , error})
            // {
            //     if(data){
            //          this.latestAccountid = data;
            //     }else if(error){
            //         console.error('error fetching record id ', error);
            //     }
            // }
     
     
    //         connectedCallback() {
    //             this.retriveAccountId();  
    //         }
     
                constructor() {
            super();
                this.retriveAccountId();
        }
     
    retriveAccountId(){
          defaultaccountId()
                .then(result => {
                    this.selectedRecordId = result;
                   // alert(result);
                    console.log(' this.selectedRecordId ', this.selectedRecordId );
                })
                .catch(error => {
                    console.error('error fetching record id ', error);
                    console.log(error);
                })
     
    }
    handleChange(event){
        console.log(event.target.value);
        this.lastNameofcontact = event.target.value;
    }
     
         handleRecordSelection(event) {
            console.log('Event Detail:', JSON.stringify(event.detail));
            console.log('Selected Record : ' +event.detail.recordId);
     
            this.selectedRecordId = event.detail.recordId;
        }
     
        handlecreaterelatedContact(event){
            // alert(this.selectedRecordId);
             console.log(' this.selectedRecordId ', this.selectedRecordId );
              console.log(' this.lastNameofcontact ', this.lastNameofcontact );
                   createrelatedContact({ AccountIdss: this.selectedRecordId , LastName: this.lastNameofcontact})
        .then(result => {
            console.log('Success: ', result);
            const event = new ShowToastEvent({
                title: 'Contact Inserted Successfully',
                message: JSON.stringify(result),
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);
        })
        .catch(error => {
            console.error('Error: ', error);
            const event = new ShowToastEvent({
                title: 'Error creating Contact',
                message: error.body.message || JSON.stringify(error),
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);
        });
     
            
        }
     
}