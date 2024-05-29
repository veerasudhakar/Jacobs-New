import { LightningElement,track,wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from "lightning/uiRecordApi";
import AREULIKEOTHER_FIELD from "@salesforce/schema/Sport__c.Are_u_like_Any_other_team__c";
import AREULIKECAPS_FIELD from "@salesforce/schema/Sport__c.Are_u_like_the_captain__c";
export default class Sports3 extends LightningElement {
    @track otherdata;
    @track Captaindata;
    @track isotherFieldsrequired;
    @track iscaptainFieldsrequired;
    @api recordid;

    @wire(getRecord, {
        recordId: "$recordid",
        fields: [AREULIKEOTHER_FIELD, AREULIKECAPS_FIELD]
    })
    wiredRecord({ error, data }) {
        if (data) {
            this.otherdata = data.fields.Are_u_like_Any_other_team__c.value === "YES";
            this.Captaindata = data.fields.Are_u_like_the_captain__c.value === "YES";
            this.isotherFieldsrequired = this.otherdata;
            this.iscaptainFieldsrequired = this.Captaindata;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleOtherChange(event) {
        if (event.target.name === 'otherdata') {
            this.otherdata = event.target.value === 'YES';
            this.isotherFieldsrequired = this.otherdata;
        } else if (event.target.name === 'Captaindata') {
            this.Captaindata = event.target.value === 'YES';
            this.iscaptainFieldsrequired = this.Captaindata;
        }
    }

    handleSuccess() {
        const selectedEvent = new CustomEvent("pagethree", {
            detail: {
                forward: true
            }
        });
        this.dispatchEvent(selectedEvent);
        this.showToast('Success', 'Your record saved successfully', 'success');
    }

    handlePrevious() {
        const selectedEvent = new CustomEvent("pagethree", {
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