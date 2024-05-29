import { LightningElement ,track} from 'lwc';
import createContact from '@salesforce/apex/GetCurrentAccountId.createContact';
import getMostRecentAccountId from '@salesforce/apex/GetCurrentAccountId.getMostRecentAccountId';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import Contact from '@salesforce/schema/Asset.Contact';
export default class GetCurrentAccountId extends NavigationMixin(LightningElement) {

    @track isModalOpen = true;
    @track accountId;
    

    openModal() {
        this.isModalOpen = true;
    }

     connectedCallback() {
       
        getMostRecentAccountId()
            .then(result => {
                this.accountId = result;
            })
            .catch(error => {
                // Handle error
            });
    }

    closeModal() {
        this.isModalOpen = false;
        this.clearInputFields();
    }

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    handleAccountChange(event) {
        this.accountId = event.detail.recordId;
        console.log('Acc-Id', this.accountId );
    }

    handleBirthdayChange(event) {
        this.birthday = event.target.value;
    }

    handleDepartmentChange(event) {
        this.department = event.target.value;
    }

    handleLeadSourceChange(event) {
        this.leadSource = event.detail.value;
    }

    

    leadSourceOptions = [
        { label: 'Web', value: 'Web' },
        { label: 'Phone Inquiry', value: 'Phone Inquiry' },
        { label: 'Partner Referral', value: 'Partner Referral' },
        { label: 'Purchased List', value: 'Purchased List' },
        { label: 'Other', value: 'Other' },
    ];


    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    saveContact() {
        createContact({
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone,
                accountId: this.accountId,
                birthday: this.birthday,
                department: this.department,
                leadSource: this.leadSource,
                description: this.description
            })
            .then(result => {
                               // Navigate to record detail page
                               this[NavigationMixin.Navigate]({
                                type: 'standard__recordPage',
                             attributes: {   
                            recordId: result,
                            actionName: 'view'
                        }
                    });
                // Close modal and clear input fields
                this.isModalOpen = false;
                this.clearInputFields();

                // Show success toast message
                const eve = new ShowToastEvent({
                    title: 'Success',
                    message: 'Contact created successfully',
                    variant: 'success'
                });
                this.dispatchEvent(eve);
                
               console.log(result, 'result....Id');
                //window.location.href = '/lightning/o/Contact/list?filterName=Recent'

            })
            .catch(error => {
                console.error('Error creating contact:', error);
                
                // Show error toast message
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'Error creating contact',
                    variant: 'error'
                });
                this.dispatchEvent(event);
            });
    }
 clearInputFields() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
    }
}