import { LightningElement, wire, track,api} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from "lightning/uiRecordApi";
import OTHERTEAMCAPTAIN_FIELD from "@salesforce/schema/Sport__c.Are_u_like_any_other_Team_other_than_tha__c";
import TEAMCAPTAIN_FIELD from "@salesforce/schema/Sport__c.Are_u_like_the_above_Team_captain__c";
export default class Sports4 extends LightningElement {

    @track otherTeamData;
    @track TeamData;
    @track isotherRequired;
    @track isteamRequired;
    @api recordid;

    @wire(getRecord, {
        recordId: "$recordid",
        fields: [OTHERTEAMCAPTAIN_FIELD, TEAMCAPTAIN_FIELD]
    })
    wiredRecord({ error, data }) {
        if (data) {
            this.otherTeamData = data.fields.Are_u_like_any_other_Team_other_than_tha__c.value === "YES";
            this.TeamData = data.fields.Are_u_like_the_above_Team_captain__c.value === "YES";
            this.isotherRequired = this.otherTeamData;
            this.isteamRequired = this.TeamData;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleOtherTeamChange(event) {
        if (event.target.name === 'otherTeamData') {
            this.otherTeamData = event.target.value === 'YES';
            this.isotherRequired = this.otherTeamData;
        } else if (event.target.name === 'TeamData') {
            this.TeamData = event.target.value === 'YES';
            this.isteamRequired = this.TeamData;
        }
    }

    handleSuccess() {
        const selectedEvent = new CustomEvent("pagefour", {
            detail: {
                forward: true
            }
        });
        this.dispatchEvent(selectedEvent);
        this.showToast('Success', 'Your record saved successfully', 'success');
    }

    handlePrevious() {
        const selectedEvent = new CustomEvent("pagefour", {
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