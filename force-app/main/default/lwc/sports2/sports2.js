import { LightningElement, wire, track,api} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from "lightning/uiRecordApi";
import VIRAT_FIELD from "@salesforce/schema/Sport__c.Are_u_like_Virat__c";
import ABD_FIELD from "@salesforce/schema/Sport__c.Are_you_Like_Abd_yes_no__c";

export default class Sports2 extends LightningElement {
    @track viratData;
    @track abdData;
    @track isViratRequired;
    @track isAbdRequired;
    @api recordid;

    @wire(getRecord, {
        recordId: "$recordid",
        fields: [VIRAT_FIELD, ABD_FIELD]
    })
    wiredRecord({ error, data }) {
        if (data) {
            this.viratData = data.fields.Are_u_like_Virat__c.value === "YES";
            this.abdData = data.fields.Are_you_Like_Abd_yes_no__c.value === "YES";
            this.isViratRequired = this.viratData;
            this.isAbdRequired = this.abdData;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleViratChange(event) {
        if (event.target.name === 'viratData') {
            this.viratData = event.target.value === 'YES';
            this.isViratRequired = this.viratData;
        } else if (event.target.name === 'abdData') {
            this.abdData = event.target.value === 'YES';
            this.isAbdRequired = this.abdData;
        }
    }

    handleSuccess() {
        const selectedEvent = new CustomEvent("pagetwo", {
            detail: {
                forward: true
            }
        });
        this.dispatchEvent(selectedEvent);
        this.showToast('Success', 'Your record saved successfully', 'success');
    }

    handlePrevious() {
        const selectedEvent = new CustomEvent("pagetwo", {
            detail: {
                forward: false
            }
        });
        this.dispatchEvent(selectedEvent);
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
