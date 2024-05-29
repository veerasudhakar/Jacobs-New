import { LightningElement, wire, track,api} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from "lightning/uiRecordApi";
import OTHERTHANTEAMS_FIELD from "@salesforce/schema/Sport__c.Still_are_u_like_other_than_Above_teams__c";
import TEAMCAPTAIN_FIELD from "@salesforce/schema/Sport__c.like_the_Above_Team_Captain__c";

export default class Sports5 extends LightningElement {
    @track otherthanTeamData;
    @track TeamLikeData;
    @track isteamRequired;
    @track iscaptainRequired;
    @api recordid;

    @wire(getRecord, {
        recordId: "$recordid",
        fields: [OTHERTHANTEAMS_FIELD, TEAMCAPTAIN_FIELD]
    })
    wiredRecord({ error, data }) {
        if (data) {
            this.otherthanTeamData = data.fields.Still_are_u_like_other_than_Above_teams__c.value === "YES";
            this.TeamLikeData = data.fields.like_the_Above_Team_Captain__c.value === "YES";
            this.isteamRequired = this.otherthanTeamData;
            this.iscaptainRequired = this.TeamLikeData;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleOtherTeamChange(event) {
        if (event.target.name === 'otherthanTeamData') {
            this.otherthanTeamData = event.target.value === 'YES';
            this.isteamRequired = this.otherthanTeamData;
        } else if (event.target.name === 'TeamLikeData') {
            this.TeamLikeData = event.target.value === 'YES';
            this.iscaptainRequired = this.TeamLikeData;
        }
    }

    handleSuccess() {
        const selectedEvent = new CustomEvent("pagefive", {
            detail: {
                forward: true
            }
        });
        this.dispatchEvent(selectedEvent);
        this.showToast('Success', 'Your record saved successfully', 'success');
    }

    handlePrevious() {
        const selectedEvent = new CustomEvent("pagefive", {
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