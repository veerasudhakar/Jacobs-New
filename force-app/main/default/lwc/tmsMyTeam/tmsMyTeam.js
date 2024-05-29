import { LightningElement, api, wire } from 'lwc';

const componentName = 'tmsMyTeam';

// utility methods
import { isEmpty, toastError, errorMessage, possessiveName, updatePageReference } from 'c/lwcUtils';

// import navigation methods
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { CloseActionScreenEvent } from 'lightning/actions';

// apex methods
import getUserIdentities from '@salesforce/apex/TMS_TalentProfileUtils.userIdentities';
import getTeamOverviewProfiles from '@salesforce/apex/TMS_TeamOverviewController.getTeamOverviewProfiles';
import getUserTalentProfileId from '@salesforce/apex/TMS_MyTeamController.getUserTalentProfileId';
import getUserTalentProfileDetails from '@salesforce/apex/TMS_MyTeamController.getUserTalentProfileDetails';
import isUserProfile from '@salesforce/apex/TMS_MyTeamController.isUserProfile';
import { refreshApex } from '@salesforce/apex';

// card icons
import STATIC_CARD_ICONS from '@salesforce/resourceUrl/tms_card_icons';

// user fields to get
import USER_ID from '@salesforce/user/Id';

export default class tmsMyTeam extends NavigationMixin (LightningElement) {

       // show the loading spinner, on by default until the page stops loading background information
       showSpinner = true;

       // which tab to show by default
       defaultTab;

       // which tab is currently selected
       selectedTab;

       // the talent profile id of the manager whose page we are viewing
       managerTalentProfileId;
       talentProfile ={};
       nameForMyTeamHeader = '';

       // map of which user identities this user has
       userIdentities;
       userIdentitiesLoaded;

       currentPageReference = undefined; 
       urlParameters = undefined;
       urlParametersLoaded = undefined;
       showLearningTab = undefined;

       // flag for talentProfile load
       talentProfileSet = false;

        // get a map of which user identities this user has
        @wire(getUserIdentities, {})
        wiregetUserIdentities({error, data}) {
        
            const methodName = 'getUserIdentities';
        
            // console.log(componentName+'.'+methodName+': wire method called');
        
            try {
        
                if (error) {
        
                    // console.log(componentName+'.'+methodName+': error: ', JSON.stringify(error));
        
                    this.handleError(errorMessage(error));
        
                } else if (data !== undefined && data !== null) {
        
                    // console.log(componentName+'.'+methodName+': data: ', JSON.stringify(data));
        
                    this.userIdentities = data;
                    this.userIdentitiesLoaded = true;
                }
        
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }

        // get the page's url parameters
        @wire(CurrentPageReference)
        getStateParameters(currentPageReference) {
            this.defaultTab = 'overview';
            if (currentPageReference) {
                this.currentPageReference = currentPageReference;
                this.urlParameters = currentPageReference.state;
                this.urlParametersLoaded = true;

                // set the default tab that displays on load
                if (!isEmpty(this.urlParameters.c__tab)) {
                    this.defaultTab = this.urlParameters.c__tab;
                }
                
                // if a talent profile id override has been provided, use it
                if (!isEmpty(this.urlParameters.c__profileId)) {

                    // get the manager talent profile id
                    this.managerTalentProfileId = this.urlParameters.c__profileId;

                    // get that manager's profile details
                    this.getUserTalentProfileDetails();
                    // get direct reports of manager
                    this.getDirectReports();
                
                // otherwise look up the talent profile id of the running user
                } else {
                    // get talent profile id from USER_ID
                    getUserTalentProfileId({userId: USER_ID})
                        .then(result => {
                            // get the manager talent profile id
                            this.managerTalentProfileId = result;

                            // get that manager's profile details
                            this.getUserTalentProfileDetails();
                            // get direct reports of manager
                            this.getDirectReports();
                        })
                        .catch(error => {
                            toastError(this, 'Error', errorMessage(error));
                        });
                }

            }
        }

        // Wire service to determine current user premissions
        @wire(isUserProfile, { userId: USER_ID})
        wireIsCurrentProfileUser(result) {
            if (result.error) {
                this.error = 'Unknown error';
                if (Array.isArray(result.error.body)) {
                this.error = result.error.body.map(e => e.message).join(', ');
                } else if (typeof result.error.body.message === 'string') {
                this.error = result.error.body.message;
                }
                console.log('error:', result.error.body.errorCode, result.error.body.message);
            } else if (result.data) {
                console.log('isProfileUser========>' + result.data);
                console.log('STATIC_CARD_ICONS---->'+ STATIC_CARD_ICONS);


                this.showLearningTab = result.data;
            }
        }

        getUserTalentProfileDetails(){
        
            getUserTalentProfileDetails({talentProfileId : this.managerTalentProfileId })
            .then(result => {
                this.talentProfile = result;
                this.talentProfile = result;

                // for button visibility for my own page
                if(!isEmpty(this.talentProfile)){
                    this.overviewButtonVisibility = (USER_ID === this.talentProfile.TMS_User__c) ? true : false;
                    this.talentProfileSet = true;
                }
                
                // Is logged in user is viewing his team?
                if(USER_ID === this.talentProfile.TMS_User__c){
                    this.nameForMyTeamHeader = 'My Team';
                } else{
                    this.nameForMyTeamHeader = possessiveName(this.talentProfile.TMS_User__r.Name) + ' Team';
                }

                document.title = this.nameForMyTeamHeader;
                this.showSpinner = false;
            })
            .catch(error => {
                this.handleError(error);
            })
        }

        teamOverviewProfiles;
        // get direct reports of manager 9858
        getDirectReports() {
            getTeamOverviewProfiles({managerTalentProfileId: this.managerTalentProfileId})
                .then(result => {
   
                    // update the data
                    this.teamOverviewProfiles = JSON.parse(result);
                    this.showSpinner = false;
                    
                })
                .catch(error => {
                    this.handleError(error);
                });
        }

        // any conditions to be met before the UI is ready to be rendered
        get pageReady() {
            return !isEmpty(this.userIdentitiesLoaded) &&
                   !isEmpty(this.urlParametersLoaded) &&
                   !isEmpty(this.managerTalentProfileId) &&
                   !isEmpty(this.defaultTab) &&
                   !isEmpty(this.nameForMyTeamHeader) &&
                   !isEmpty(this.showLearningTab);
        }

        // show skills for non-ITMA
        get showSkills() {
            return this.userIdentities.TMS_ITMA !== true;
        }

        // Delegation center button visibility US-9858
        get delegationButtonVisibility() {
            console.log('this.userIdentities @@',this.userIdentities);
            return (!isEmpty(this.teamOverviewProfiles) ||  
                    this.userIdentities.TMS_Admin == true || 
                    this.userIdentities.Administrators == true) && 
                    USER_ID === this.talentProfile.TMS_User__c && 
                    this.userIdentities.TMS_ITMA == false;
        }


    // Tab Selected Event
    handleActiveTab(event) {
        console.log('--Tab:' + event.target.value + '  last:' + this.defaultTab);
        try {
            if(this.defaultTab === event.target.value){
                return;
            }

            // update the browser URL to match the profile/tab but clear any other url parameters
            let newState = {
                c__profileId: this.managerTalentProfileId,
                c__tab: event.target.value,
                c__selectedFilters: undefined,
                c__groupedBy: undefined,
                c__leftSortField: undefined,
                c__leftSortDirection: undefined,
                c__sortField: undefined,
                c__sortDirection: undefined,
                c__searchText: undefined
            }

            this[NavigationMixin.Navigate](
                updatePageReference(this.currentPageReference, newState) 
            );
            this.defaultTab = event.target.value;
            
        } catch (err) {
            this.handleError(errorMessage(err));
        }
    }

    // Learning Tab Selected
    handleLearningTab(event) {
        let learningURL = 'https://learn.jacobs.com/my-zones/team-view/'
        window.open(learningURL);
        this.template.querySelector('lightning-tabset').activeTabValue = this.defaultTab;
        this.template.querySelector('lightning-tabset').focus();
    }
    
    // Error Handler
    handleError(error) {
        const methodName = 'handleError';
        this.showSpinner = false;
        try {
            toastError(this, 'Error', error);
        } catch (err) {
            console.log(componentName+'.'+methodName+': Could not display this error message to the user: ' + error);
        }
    }

}