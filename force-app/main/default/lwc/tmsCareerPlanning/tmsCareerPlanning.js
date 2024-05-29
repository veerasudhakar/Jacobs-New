import {
    LightningElement,
    wire,
    api,
    track
} from 'lwc';
import {
    NavigationMixin
} from 'lightning/navigation';
import {
    getPicklistValues,
    getObjectInfo
} from 'lightning/uiObjectInfoApi';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import CAREER_PLAN_OBJECT from '@salesforce/schema/TMS_Career_Plan__c';
import gethrDirectorAndMangerHirarchyMember from '@salesforce/apex/TMS_TalentProfileUtils.hrDirectorAndMangerHirarchyMember';
//import getCareerPlanDetails from '@salesforce/apex/TMS_CareerPlanningLWC.getCareerPlanDetails';
import updateCareerPlanDetails from '@salesforce/apex/TMS_CareerPlanningLWC.updateCareerPlanDetails';
import WHAT_MATTERS_MOST_TO_ME from '@salesforce/schema/TMS_Career_Plan__c.TMS_What_matters_most_to_me__c';
import PRIORITY_OBJECT from '@salesforce/schema/TMS_Priority__c';   //US10310
import TALENT_PROFILE_OBJECT from '@salesforce/schema/TMS_Talent_Profile__c';
import MARKET_ASPIRATION from '@salesforce/schema/TMS_Talent_Profile__c.Market_Aspiration__c';
//import TMS_Grad_Program_Status from '@salesforce/schema/TMS_Talent_Profile__c.TMS_Grad_Program_Status__c';
import TMS_ALIGNMENT from '@salesforce/schema/TMS_Priority__c.TMS_Alignment__c';
import TMS_FOCUS_ELEMENT from '@salesforce/schema/TMS_Priority__c.TMS_Focus_elements__c';
import TMS_STATUS from '@salesforce/schema/TMS_Priority__c.TMS_Priority_Status__c';
import TMS_DEVELOPMENT_TYPE from '@salesforce/schema/TMS_Priority__c.TMS_Development_Type__c';
import TMS_CREATED_FOR_YEAR from '@salesforce/schema/TMS_Priority__c.TMS_Created_for_Year__c';
import {
    getPicklistValuesByRecordType
} from 'lightning/uiObjectInfoApi';
import uploadCareerDocumentFile from '@salesforce/apex/TMS_CareerPlanningLWC.uploadCareerDocumentFile';
import createDevelopmentActivities from '@salesforce/apex/TMS_CareerPlanningLWC.createDevelopmentActivities';
import getDevelopmentActivities from '@salesforce/apex/TMS_CareerPlanningLWC.getDevelopmentActivities';
import updateDevelopmentActivities from '@salesforce/apex/TMS_CareerPlanningLWC.updateDevelopmentActivities';
import deleteDevelopmentActivities from '@salesforce/apex/TMS_CareerPlanningLWC.deleteDevelopmentActivities';
//import getTalentProfileDetails from '@salesforce/apex/TMS_CareerPlanningLWC.getTalentProfileDetails';
import updateTalentProfileDetails from '@salesforce/apex/TMS_CareerPlanningLWC.updateTalentProfileDetails';

import getUserCareerPlanDetails from '@salesforce/apex/TMS_CareerPlanViewDetails.getUserCareerPlanDetails';
import getUserPersonalDetailAccess from '@salesforce/apex/TMS_CareerPlanViewDetails.getUserPersonalDetails';
import getUserTalentProfileDetails from '@salesforce/apex/TMS_CareerPlanningLWC.getUserTalentProfileDetails';


// import jacobsCompetencyFramework from '@salesforce/label/c.Jacobs_Competency_Framework';
// import essentialSkills from '@salesforce/label/c.Essential_Skills_Link';
// import whyWeRecommend from '@salesforce/label/c.Why_We_Recommend_Link';

import { errorMessage, isEmpty, toastSuccess, toastError, toastInfo, toastWarning, scrollToTop } from 'c/lwcUtils';

import USER_ID from '@salesforce/user/Id';

const componentName = 'tmsCareerPlanning';
import { getRecord } from 'lightning/uiRecordApi';



export default class TmsCareerPlanning extends NavigationMixin(LightningElement){

    @api userIdTp;    
    @api hideMentorMatching = false;
    @track developinCurrentMarketvalue;
    @track showSpinner = true;
    @track currentUserDevelopmentActivities = [];
    @track talentDetails = [];
    @track selectedPrimaryMarketAlignment = [];
    @track selectedsecondaryMarketAlignment = [];
    @track developmentActivitiesDisplayList =[];
    @track primaryMarketAlignment;
    @track primarySubmarketAlignmentValue;
    @track yearOption;
    @track currentUserCareerPlanningDetails = {}
    selectedexpectedDate;
    selectedaccomplishedDate;
    secondarySubmarketAlignmentValue;
   @track alignmentValues=[];
    @track focuselementsValues=[];
    statusValues;
    developmentValues;
    recordCareerplanId;
    primarySubmarketcontrolValues;
    secondarySubmarketcontrolValues; 
    talentProfileId;
    fileData;
    expecteddate;
    secondaryMarketAlignment;
    secondarySubmarketAlignment;
    developinCurrentMarketApi = 'Develop in Current Market';
    title = 'Career Planning';
    whatMattersMostToMe = 'What Matters Most To Me';
    careerAspirations = 'Career Aspirations';
    strengths = 'Strengths';
    developmentOpportunitie = 'Development Opportunities';
    careerDevelopmentDocuments = 'Career Development Documents';
    developmentActivities = 'Create New Development Action';
    editDevelopmentActivities = 'Edit Development Action';
    developmentActivity = 'Development Actions';
    showCreateDevelopmentActivityForm = false;
    showDevelopmentActivityInReadMode = true;
    showEditDevelopmentActivities = false;
    showMoreLessButton = true;
    isTalentLoaded = false;
    isCareerPlanLoaded = false;
    isPriorityLoaded = false;
    optionsWhatMattersMostToMe = [];
    selectedmarketAspiration = [];
    developinCurrentMarket = [];
    primarySubmarketAlignment= [];
    selectedValuesWhatMattersMostToMe = [];
    currentUserTalentProfileDetails = {}
    editedPriority = {};
    primarySubmarketAlignmentOptionsToDisplay = [];
    secondarySubmarketAlignmentOptionsToDisplay = [];
    whatMattersMostToMeButton = true;
    careerPlanningDetailsButton =true;
    strengthsButton = true;
    developmentOpportunitiesButton= true;
    talentEditButtons =true;
    priorityButton =true;
    priorityAddButton = true;
    developmentOpportunities ={};
    careerAspirationsValue ={};
    LastDiscussedDateValue ;
    isOwnPage = true;    
    StrengthsValue ={};
    whatMattersMostToMeHelpText = 'Focus on what is important to you now and then revise as you move along your path and these priorities change. These priorities will be used to provide support and guide conversation. They should not be considered a guarantee of any change. Select the items that are your top 3 priorities at this time.';
    careerAspirationsHelpText = 'Roles change, organizations restructure, technology advances. Think more about what impact you want to have and what experiences you want/need. Consider what role you want to be in or path you want to take. This plan will be shared with your Career Team, including your manager and manager hierarchy, to provide context around your career objectives. Provide your high-level thoughts on things like what matters to you most in your career and what keeps you engaged.';
    strengthsHelpText = 'Think about the skills and competencies you need in order to achieve your aspirations or to be ready for opportunities that may arise outside of your specific plan. Identify things you are good at and things that you really enjoy. Consider ways to take those to the next level. Document specific actions using your Development Activities.';
    developmentOpportunitieHelpText = 'Expand your thinking and consider opportunities outside of your comfort zone that will challenge you and help you grow. What areas do you need to work on to develop the required skills and competencies that will help you achieve your career aspirations? Document specific actions using your Development Activities.';
    developmentActivityHelpText = 'Development Actions are the actions you plan to take to help you achieve your development and career aspirations. Use this section of your Career Plan to capture and track progress against these actions. Development Actions may be steps you have agreed with your manager, your mentor or others on your career team. This section ensures everyone on your career team has visibility of them and can help keep you accountable.';
    careerDevelopmentDocumentsHelpText ='Add any relevant career planning documents here.';

    developinCurrentMarketHelpText ='Check if you current interest is to continue to developing in your primary market affiliation.';
    primaryMarketAlignmentHelpText ='Select the market that most closely aligns to your experience including relevant experience that may be beyond technical such as business development, quality, safety, etc. in a particular market.';
    primarySubmarketAlignmentHelpText ='Select the submarket based on your primary market alignment that most closely aligns to your experience.';
    secondaryMarketAlignmentHelpText ='Select the market that closely aligns to your experience including relevant experience that may be beyond technical such as business development, quality, safety, etc. in a particular market.';
    secondarySubmarketAlignmentHelpText ='Select the submarket based on your secondary market alignment that most closely aligns to your experience.';
    marketAspirationHelpText ='Select additional market(s) you are interested in gaining experience in beyond your primary or secondary market alignment.';
    alignmentHelpText = 'The alignment category helps to provide the focus of your objective.';
	focuselementsHelpText = 'The focus elements helps to provide the focus of your objective.';

    marketAlignmentHelpText = 'Market Alignment & Aspiration';
    CareerPlanLastDiscussedDate = 'Career Plan Last Discussed';

    talentProfile = {};
    showMoreLessButtonStart = true;
    uploadedFilesCount = 1;
    haveCareerPlanRecordAccess = false;
    isDevelopmentActLoaded = false;
    expectedupdateddate;
    accomplishedupdatedate;

    //This is for Conditional Rendering in Focus Elements
    // @track dependentFocusValues = {};
    // @track showFocusElements = false;

    // handleAlignmentValue(event) {
    //     const selectedValue = event.detail.value;      
    //     if (selectedValue === 'Human Skills') {            
    //         this.dependentFocusValues = ['Abundance Mentality', 'Active Listening', 'Adaptability (Situational Adaptability)', 'Authenticity',
    //     'Cultivates Innovation', 'Curiosity', 'Empathy', 'Relationship Centric', 'Resilience', 'Strategic Mindset/Business acumen'];
    //     } else if (selectedValue === 'Consulting Skills') {           
    //         this.dependentFocusValues = ['Storytelling', 'Written and verbal expression', 'Time management', 'Cultural competence',
    //     'Data analysis and interpretation', 'Negotiation Skills', 'Social value/Community impact', 'Client relationship management'];
    //     }else if (selectedValue === 'Champion our Strategy') {                      
    //         this.dependentFocusValues = ['Data Solutions/Digital acumen', 'Inclusion', 'Climate response'];
    //     }  else if (selectedValue === 'Your Passion') {                   
    //         this.dependentFocusValues = ['Project management/PMAP', 'Project delivery/PDAP', 'Technical development', 'Business development and Sales'];
    //     }else {

    //         this.dependentFocusValues = [];
    //     }

       
    //     this.showFocusElements = this.dependentFocusValues.length > 0;
    // }

    // handleFocusValue(event) {
        
    // }
   
    // jacobsCompetencyFrameworkLink = jacobsCompetencyFramework;
    // essentialSkillsLink = essentialSkills;
    // whyWeRecommendLink = whyWeRecommend;

    // for methods that need to run after public variables have been instantiated
    connectedCallback() {
        //this.fetchUserTalentProfileDetails();
        this.fetchPersonalDetails();
        this.fetchTalentProfileDetails();
        this.fetchCareerPlanDetails();       
        this.fetchDevelopmentActivities();
        this.showSpinner = false;
        this.recordId = USER_ID;
        this.userIdTp = (this.userIdTp == null || this.userIdTp == undefined)? '' : this.userIdTp;
    }

    // for methods that need to run after data Retrived.
    get isInitialDataLoaded(){       
       
        if(this.isTalentLoaded && this.isCareerPlanLoaded && this.isDevelopmentActLoaded){
            return true;
            
        }
        else{

            return false;

        }
        
    }
   
    //Added on 27 feb for US-8817 
    get isEditable() {
        //as per US-0008713 removed the below condition
        // || this.userIdentities?.TMS_Admin === true
        return this.talentProfile?.TMS_User__c === USER_ID;
    } 
        
    
     /** Method Name : getPicklistValues
     * Description : This is used to fetch the picklist value .
     */
    @wire(getObjectInfo, {
        objectApiName: CAREER_PLAN_OBJECT
    })
    objectInfo;

  // get picklist value of WHAT MATTERS MOST TO ME field
    @wire(getPicklistValues, {
        fieldApiName: WHAT_MATTERS_MOST_TO_ME,
        recordTypeId: '$objectInfo.data.defaultRecordTypeId'
    })
    wiregetPicklistValues({
        error,
        data
    }) {
        if (data) {
            // handle Error
            this.optionsWhatMattersMostToMe = data.values;
        } else if (error) {            
        }
    };

  // this methods is used to get Record from Career plan.
    fetchCareerPlanDetails() {
        getUserCareerPlanDetails({userId : this.userIdTp})
            .then(result => {               
                //this.haveCareerPlanRecordAccess = result.Id ? true : false;                
                this.recordCareerplanId = result.Id;
                this.currentUserCareerPlanningDetails = result;
                if ((this.currentUserCareerPlanningDetails.TMS_What_matters_most_to_me__c) != null) {
                    this.selectedValuesWhatMattersMostToMe = this.currentUserCareerPlanningDetails.TMS_What_matters_most_to_me__c.replaceAll(';', '<br/>');
                }
                this.developmentOpportunities = this.currentUserCareerPlanningDetails.TMS_Development_Opportunities__c;
                this.careerAspirationsValue = this.currentUserCareerPlanningDetails.TMS_Career_Aspirations__c;
                this.StrengthsValue = this.currentUserCareerPlanningDetails.TMS_Strengths__c;
                this.LastDiscussedDateValue = this.currentUserCareerPlanningDetails.TMS_Last_Discussed_Date__c; 
                this.isCareerPlanLoaded = true;          
              
            })
            .catch(error => {
                this.showSpinner = false;
            })
    }

    /*
     * Method Name : getPicklistValues
     * Description : This is used to fetch the picklist value .
     */
    @wire(getObjectInfo, {
        objectApiName: PRIORITY_OBJECT
    })
    priorityMetadata;
    //get record type of Development Avtivity for the TMS_Alignment picklist
    devActivityRecordTypeId;
    @wire(getObjectInfo, { objectApiName: PRIORITY_OBJECT })
    wiredObjectInfo({error, data}) {
    if (error) {
        // handle Error

    } else if (data) {
        const rtis = data.recordTypeInfos;
        this.devActivityRecordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Development Activity');
    }
    };

    //get the TMS_FOCUS_ELEMENT type picklist values
    @wire(getPicklistValues, {
        recordTypeId: '$devActivityRecordTypeId',
        fieldApiName: TMS_FOCUS_ELEMENT
    })
    focuselementsValuesMethod({
        error,
        data
    }) {
        if (data) {
            
            this.focuselementsValues = data;
            console.log(this.focuselementsValues,'this.focuselementsValues.....');
        } else if (error) {}
    }
    //get the TMS_ALIGNMENT type picklist values
    @wire(getPicklistValues, {
        recordTypeId: '$devActivityRecordTypeId',
        fieldApiName: TMS_ALIGNMENT
    })
    alignmentValuesMethod({
        error,
        data
    }) {
        if (data) {

            this.alignmentValues = data.values;
            console.log('ind....'+this.alignmentValues.findIndex(x => x.value === 'Human Skills'))
            // for (let i = 0; i < this.alignmentValues.length; i++) { 
                
            // }
            console.log(this.alignmentValues,'this.alignmentValues.....');
        } else if (error) {}
    }

    focuselementsValuesSelected = [];
    @track showFocusElements = false;
    handelAlignmentValue(event){
        let selectedValue = event.detail.value;
        console.log(event.detail.value, '....selectedValue');

        let key = this.focuselementsValues.controllerValues[selectedValue];
        this.focuselementsValuesSelected = this.focuselementsValues.values.filter(opt =>
            opt.validFor.includes(key));
            console.log(this.focuselementsValues, '.....this.focuselementsValues');
        // Check if the selected alignment value requires showing the dependent picklist
        if (selectedValue === 'GDP - Human Skills​' || selectedValue === 'GDP - Consulting Skills​' ||
            selectedValue === 'GDP - Champion our Strategy​' || selectedValue === 'GDP - Your Passions') {
            this.showFocusElements = true;
            console.log(this.showFocusElements, '......this.showFocusElements');
           
        } else {
            this.showFocusElements = false;
            
        }
    }
	
	

//get the TMS_STATUS type picklist values
@wire(getPicklistValues, {
    recordTypeId: '$devActivityRecordTypeId',
    fieldApiName: TMS_STATUS
})
statusValuesMethod({
    error,
    data
}) {
    if (data) {
        this.statusValues = data.values;

    } else if (error) {}
}


    //get the TMS_DEVELOPMENT_TYPE picklist values
    @wire(getPicklistValues, {
        recordTypeId: '$priorityMetadata.data.defaultRecordTypeId',
        fieldApiName: TMS_DEVELOPMENT_TYPE
    })
    developmentValuesMethod({
        error,
        data
    }) {
        if (data) {
            this.developmentValues = data.values;

        } else if (error) {}
    }
    //return [{label: 'Draft', value : 'TMS_Draft'},{label: 'In Progress', value : 'TMS_InProgress'},{label: 'Accomplished', value : 'TMS_Accomplished'}];

    get daStatusOptions(){
        return [{label: 'Draft', value : 'TMS_Draft'},{label: 'In Progress', value : 'TMS_InProgress'}];
    }
    //get the TMS_CREATED_FOR_YEAR picklist values
    @wire(getPicklistValues, {
        recordTypeId: '$priorityMetadata.data.defaultRecordTypeId',
        fieldApiName: TMS_CREATED_FOR_YEAR
    })
    yearOptionMethod({
        error,
        data
    }) {
        if (data) {
            this.yearOption = data.values;

        } else if (error) {}
    }

     // This methods is used to get Record from Priority.
    fetchDevelopmentActivities() {
        getDevelopmentActivities({userId : this.userIdTp})
            .then(result => {
                this.currentUserDevelopmentActivities = result;
                this.showMoreLessButtonStart = this.currentUserDevelopmentActivities.length>3 ? true : false;
                this.developmentActivitiesDisplayList = [...this.currentUserDevelopmentActivities].splice(0,3);
                this.isDevelopmentActLoaded = true;
            })
            .catch(error => {
                this.showSpinner = false;
        })
    }

     //get the Talent Profile picklist values
    @wire(getPicklistValuesByRecordType, {
        objectApiName: TALENT_PROFILE_OBJECT,
        recordTypeId: '$objectInfo.data.defaultRecordTypeId'
    })
    picklistValues({
        data,
        error
    }) {
        if (data) {
            this.primarySubmarketAlignment = data.picklistFieldValues.Primary_Submarket_Alignment__c.values;
            this.secondarySubmarketAlignment = data.picklistFieldValues.Secondary_Submarket_Alignment__c.values;
            this.optionSelectedmarketAspiration = data.picklistFieldValues.Market_Aspiration__c.values;

             // dependent picklist value for Secondary SubMarket Alignment
            let primaryMarketAlignmentOptions = [];
            data.picklistFieldValues.Primary_Market_Alignment__c.values.forEach(key => {
                primaryMarketAlignmentOptions.push({
                                                label : key.label,
                                                value: key.value
                                                })
            });
            
            this.primaryMarketAlignment = primaryMarketAlignmentOptions;
            let primarySubmarketAlignmentOptions = [];
            this.primarySubmarketcontrolValues = data.picklistFieldValues.Primary_Submarket_Alignment__c.controllerValues;
                 this.primarySubmarketAlignment.forEach(key => {
                            primarySubmarketAlignmentOptions.push({
                                            label : key.label,
                                            value: key.value
                                            })
               })
               this.primarySubmarketdependent = primarySubmarketAlignmentOptions;

            // dependent picklist value for Secondary SubMarket Alignment
            let secondaryMarketAlignmentOptions = [];
            data.picklistFieldValues.Secondary_Market_Alignment__c.values.forEach(key => {
                secondaryMarketAlignmentOptions.push({
                                                label : key.label,
                                                value: key.value
                                                })
                                            });
            this.secondaryMarketAlignment = secondaryMarketAlignmentOptions;
            let secondarySubmarketAlignmentOptions = [];
            this.secondarySubmarketcontrolValues = data.picklistFieldValues.Secondary_Submarket_Alignment__c.controllerValues;
                this.secondarySubmarketAlignment.forEach(key => {
                    secondarySubmarketAlignmentOptions.push({
                                            label : key.label,
                                            value: key.value

                                        })
            })
            this.secondarySubmarketdependent = secondarySubmarketAlignmentOptions;
            }

            }

    // handle show more secton
    handleClickviewmore(event){
        this.developmentActivitiesDisplayList = [...this.currentUserDevelopmentActivities];
        this.showMoreLessButton = false;
    }

     // handle show less secton
     handleClickshowless(event){
        this.developmentActivitiesDisplayList = [...this.currentUserDevelopmentActivities].splice(0,3);;
        this.showMoreLessButton = true;
    }
         
    // This method is used to filter the dependent field value
    handleprimaryMarketChange(event){
       
    // Selected Primary Market Alignment Value
    this.selectedPrimaryMarketAlignment = event.target.value;
    let dependValues = [];
    
        if(this.selectedPrimaryMarketAlignment) {
            let selectedIndex = this.primarySubmarketcontrolValues[this.selectedPrimaryMarketAlignment];
            // filter the total dependent values based on selected Primary SubMarket Alignmentvalue 
            this.primarySubmarketAlignment.forEach(conValues => {
                if(conValues.validFor[0] === selectedIndex) {
                dependValues.push({
                label: conValues.label,
                value: conValues.value
                })
            }
            })
            this.primarySubmarketAlignmentOptionsToDisplay = dependValues;
        }
    }

    //handle for Primary Submarket Alignment
    handlePrimarySubmarketAlignmentChange(event){
        this.primarySubmarketAlignmentValue = event.target.value;
    }

    //handle for Secondary Submarket Alignment
    handleSecondarySubmarketChange(event){
        this.secondarySubmarketAlignmentValue = event.target.value;
    }

    //handle for Secondary Market Alignment
    handlesecondaryMarketChange(event){
        // Selected Primary Market Alignment Value
        this.selectedsecondaryMarketAlignment = event.target.value;
        let dependValues = [];
        
        if(this.selectedsecondaryMarketAlignment) {

            let selectedIndex = this.secondarySubmarketcontrolValues[this.selectedsecondaryMarketAlignment];
            // filter the total dependent values based on selected Primary SubMarket Alignmentvalue 
            this.secondarySubmarketAlignment.forEach(conValues => {
                if(conValues.validFor[0] === selectedIndex) {
                dependValues.push({
                label: conValues.label,
                value: conValues.value
            })
        }
        })
        this.secondarySubmarketAlignmentOptionsToDisplay = dependValues;
        }
    }

    //checking user have acces to career planning
    fetchPersonalDetails() {
        getUserPersonalDetailAccess({userId : this.userIdTp})
        .then(result => {               
            this.haveCareerPlanRecordAccess = result;                
            this.isCareerPlanLoaded = true; 
            //console.log('Priority Record Access'+JSON.stringify(result));
        })
        .catch(error => {
            this.showSpinner = false;
        })
    }
  // this methods is used to get Record from Talent Profile.
    fetchTalentProfileDetails() {
        //getTalentProfileDetails()
        getUserTalentProfileDetails({userId : this.userIdTp})
            .then(result => {
                if(result.Id != null){
                this.talentProfile = result;
                this.talentProfileId = result.Id;
                this.currentUserTalentProfileDetails = result;
                console.log('currentUserTalentProfileDetails',this.currentUserTalentProfileDetails);
                this.talentDetails = result;
                this.selectedmarketAspiration = this.currentUserTalentProfileDetails.Market_Aspiration__c?.split(";");
                this.developinCurrentMarket = this.currentUserTalentProfileDetails.Develop_in_Current_Market__c;
                console.log('developincurrentmarket',this.developinCurrentMarket);
                this.primarySubmarketAlignmentValue = this.currentUserTalentProfileDetails.Primary_Submarket_Alignment__c;
                this.secondarySubmarketAlignmentValue = this.currentUserTalentProfileDetails.Secondary_Submarket_Alignment__c;
                this.developinCurrentMarketvalue = this.developinCurrentMarket;
                console.log('developinCurrentMarketvalue',this.developinCurrentMarket);
                this.isTalentLoaded = true;
                }
                else{
                    this.showNotification('Error', 'Error', 'Talent Profile is Mandatory for User');
                }
            })
            .catch(error => {
                this.showSpinner = false;
            })
    }

    

 // this methods is used to upload Notes and files Record from Career Plan.
    openfileUpload(event) {
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordCareerplanId
            }
            this.uploadFile();
        }
        reader.readAsDataURL(file)
    }

    uploadFile() {
        const {
            base64,
            filename,
            recordId
        } = this.fileData
        uploadCareerDocumentFile({
            base64,
            filename,
            recordId
        }).then(result => {
            this.fileData = null
            let title = `${filename} uploaded successfully!!`
            this.showNotification('success', 'success', title);
        })
    }

    // state of each section
    careerAspirationsMode = 'view';
    whatMattersMostToMeMode = 'view';
    strengthSectionMode = 'view';
    developmentOpportunitiesMode = 'view';
    developmentActivitiesMode = 'view';
    talentProfileMode = 'view';

 // return true if the fields are editable by the running user
    get careerAspirationsSectionIsView() {
        return this.careerAspirationsMode === 'view';
    }

    get whatMattersMostToMeSectionIsView() {
        return this.whatMattersMostToMeMode === 'view';
    }


    get strengthSectionIsView() {
        return this.strengthSectionMode === 'view';
    }


    get developmentOpportunitiesSectionIsView() {
        return this.developmentOpportunitiesMode === 'view';
    }


    // picklist options from object metadata
    get whatMattersMostToMeOptions() {
        return this.prepMultiPicklistOptions(this.optionsWhatMattersMostToMe, this.currentUserCareerPlanningDetails[WHAT_MATTERS_MOST_TO_ME.fieldApiName]);
    }


    // picklist options from object metadata
    get marketAspirationValue() {
        return this.prepMultiPicklistOptions(this.optionSelectedmarketAspiration, this.currentUserTalentProfileDetails[MARKET_ASPIRATION.fieldApiName]);
    }

    // the user has clicked Edit buttons on Talent Profile section
    get marketAlignmentAspiration() {
        return this.talentProfileMode === 'view';
    }
    get showCareerPlanDetails(){
        return (this.showCreateDevelopmentActivityForm || this.showEditDevelopmentActivities) ? false : true;
    }
    get showCareerDocumentList() {
        return this.uploadedFilesCount > 0 ? true: false;
    }   
    
    
    // the user has clicked Add buttons on a Priority section
    handleOnAddClick(event) {
        this.showCreateDevelopmentActivityForm = true;
        this.showDevelopmentActivityInReadMode = false;
        this.whatMattersMostToMeButton = false;
        this.careerPlanningDetailsButton =false;
        this.strengthsButton = false;
        this.developmentOpportunitiesButton= false;
        this.talentEditButtons =false;
        this.priorityButton =false;
        this.priorityAddButton = false;

        this.dispatchEvent(new CustomEvent(
            'developmentactivityaddedit',
            {
                detail : {
                    developmentActivity : true                    
                }
            }
        )); 
         // Scroll to top of page
         scrollToTop();
    }
    handleFileCount(event) {
        
        const methodName = 'handleFileCount';
    
        // console.log(componentName+'.'+methodName+': event received');
    
        try {
    
            let name = event.target.name; // the field/button name, if parameter is set
            let detail = event.detail; // the event detail
            let value = event.target.value; // field/button value
            // console.log(componentName+'.'+methodName+': name: ', JSON.stringify(name));
            //console.log(componentName+'.'+methodName+': detail: ', JSON.stringify(detail));
            // console.log(componentName+'.'+methodName+': value: ', JSON.stringify(value));
    
            this.uploadedFilesCount = detail;

    
        } catch (err) {
            this.handleError(errorMessage(err));
            this.showNotification('Error', 'Error', err);
        }
     }
    // the user has clicked Edit buttons on a Priority section
    handleOnEditClick(event) {
        let editedPriorityId = event.target?.dataset?.priorityId;
        this.currentUserDevelopmentActivities.forEach(priority => {
            if (editedPriorityId == priority.Id) {
                this.editedPriority = priority;
            }
            // Edit Buttton section Hide/show
             this.whatMattersMostToMeButton = false;
             this.careerPlanningDetailsButton =false;
             this.strengthsButton = false;
             this.developmentOpportunitiesButton= false;
             this.talentEditButtons =false;
             this.priorityButton =false;
             this.priorityAddButton =true;

             this.dispatchEvent(new CustomEvent(
                'developmentactivityaddedit',
                {
				         detail : {
                        developmentActivity : true                    
                    }
                }
            )); 
            //Scroll to top of page
            scrollToTop();
        })

        this.showEditDevelopmentActivities = true;
        this.showDevelopmentActivityInReadMode = false;
    }

    // the user has clicked cancel buttons on a Priority section
    handleReset(event) {
        this.showEditDevelopmentActivities = false;
        this.showDevelopmentActivityInReadMode = true;

        // Edit Buttton section Hide/show
        this.whatMattersMostToMeButton = true;
        this.careerPlanningDetailsButton =true;
        this.strengthsButton = true;
        this.developmentOpportunitiesButton= true;
        this.talentEditButtons =true;
        this.priorityButton =true;
        this.priorityAddButton =true;
        this.dispatchEvent(new CustomEvent(
            'developmentactivityaddedit',
            {
                detail : {
                    developmentActivity : false                    
                }
            }
        )); 
    }
    handleexpecteddateValueChange(event)
    {
        this.expectedupdateddate=event.target.value;

        console.log('expectedupdateddate',this.expectedupdateddate);
    }
    handleAccomplishedDateEditchange(event)
    {
        this.accomplishedupdatedate=event.target.value;
        console.log('accomplishedupdatedate',this.accomplishedupdatedate);
    }

    // the user has clicked update buttons on a Priority section
    async handleUpdate(event) {
        const editedPriorityId = event.target.value;
        let title = this.template.querySelector('.titleNameupdate').value;
        let developmentType = this.template.querySelector('.developmentupdate').value;
        let alignment = this.template.querySelector('.alignmentValueupdate').value;
        // let focuselements = '';
        // if (this.showFocusElements) {
        //     let focuselementsElement = this.template.querySelector('.focuselementsValueupdate');
        //     if (focuselementsElement && focuselementsElement.value && focuselementsElement.value.trim() !== '') {
        //           focuselements = focuselementsElement.value;
        //     } else {
                
        //         this.showToastMessage('Error', 'Error', 'Please Select the Focus elements field');
                
        //         return;
        //     }}
    /*    let focuselements = this.showFocusElements ? 
    (this.template.querySelector('.focuselementsValueupdate') && this.template.querySelector('.focuselementsValueupdate').value.trim() !== '' ? 
        this.template.querySelector('.focuselementsValueupdate').value : 
        (this.showToastMessage('Error', 'Error', 'Please Select the Focus elements field'), null)) 
    : '';
            console.log('Update Focous',focuselements);
            console.log('Update Focous',this.showFocusElements);  */
			
		let focuselements = '';
        if (this.showFocusElements) {
           const focuselementsInput = this.template.querySelector('.focuselementsValueupdate');
            if (focuselementsInput && focuselementsInput.value.trim() !== '') {
               focuselements = focuselementsInput.value;
           } else {
               this.showToastMessage('Error', 'Error', 'Please Select the Focus elements field');
            }
        }
        console.log('Update Focus:', focuselements);
			
		//let focuselements = this.template.querySelector('.focuselementsValueupdate').value;
        let status = this.template.querySelector('.statusValueupdate').value;
        let expecteddateofcompletion = this.template.querySelector('.Expectedupdateupdate').value;
        let accomplishDate = this.template.querySelector('.accomplishDate')?.value;
        let progressnotesresults = this.template.querySelector('.progressnotesresultsupdate').value;

        let createdforYear = this.template.querySelector('.createdYearupdate').value;
        let description = this.template.querySelector('.descriptionupdate').value;

        let priorityToUpdate = {
            Id : editedPriorityId,
            TMS_Alignment__c : alignment,
			TMS_Focus_elements__c : focuselements,
            TMS_Priority_Status__c :status,
           TMS_Expected_Date_of_completion__c:expecteddateofcompletion,
           TMS_Priority_Accomplished_Date__c : accomplishDate,
            TMS_Progress_Notes_Results__c:progressnotesresults,
            Name : title,
            TMS_Development_Type__c : developmentType,
            TMS_Created_for_Year__c : createdforYear,
            TMS_Simple_and_Specific_Details__c : description
        };
        
         
        if(title){
                // call apex method updateTalentProfile and process result
            await updateDevelopmentActivities({tmsPriority : priorityToUpdate})
            .then(result => {
                console.log('Update button selected Calling Apex ',priorityToUpdate)
                //Refreshing Development Activities Record 
                //console.log('fetchDevelopmentActivities :: '+this.userIdTp);
                this.fetchDevelopmentActivities();
                //turn on spinner
                this.showSpinner = true;
                 //turn off spinner
            this.showSpinner = false;
            this.showEditDevelopmentActivities = false;
            this.showDevelopmentActivityInReadMode = true;

            // Edit Buttton section Hide/show
            this.whatMattersMostToMeButton = true;
            this.careerPlanningDetailsButton =true;
            this.strengthsButton = true;
            this.developmentOpportunitiesButton= true;
            this.talentEditButtons =true;
            this.priorityButton =true;
            this.priorityAddButton =true;
            this.showMoreLessButton = true;
            this.dispatchEvent(new CustomEvent(
                'developmentactivityaddedit',
                {
                    detail : {
                        developmentActivity : false                    
                    }
                }
            )); 
            })
            .catch(error => {
                let errorMessageType = 'FIELD_CUSTOM_VALIDATION_EXCEPTION';
                let errorMessage = error.body.message;
                let messageToDisplay = error.body.message;

                try {
                    if (errorMessage.includes(errorMessageType)) {
                        messageToDisplay = errorMessage.substring(errorMessage.indexOf(errorMessageType) + errorMessageType.length + 1);
                    }
					
					//TP Added
					/* if (errorMessage.includes(errorMessageType)) {
						
						console.log("Step1 errorMessageType::"+errorMessageType);
						console.log("Step1 errorMessage::"+errorMessage);
						
						messageToDisplay = errorMessage.substring(errorMessage.indexOf(errorMessageType) + errorMessageType.length + 1);
						
						console.log("Step2 messageToDisplay::"+messageToDisplay);
						//console.log("Step2 errorMessage::"+errorMessage.substring(errorMessage.indexOf(errorMessageType));
						// Truncate the message after the error description
						const colonIndex = messageToDisplay.indexOf(':');
						
						
						console.log("Step3 colonIndex::"+colonIndex);
					
						
						if (colonIndex !== -1) {
							
							console.log("Step4 messageToDisplay::"+messageToDisplay);
							messageToDisplay = messageToDisplay.substring(colonIndex + 1).trim();
						}
					} */
					
					if (errorMessage.includes(errorMessageType)) {
						var startIndex = errorMessage.indexOf(errorMessageType) + errorMessageType.length + 1;
						var endIndex = errorMessage.indexOf(': [');
						if (endIndex === -1) {
							endIndex = errorMessage.length;
						}
						 messageToDisplay = errorMessage.substring(startIndex, endIndex);
						console.log(messageToDisplay.trim());
					}
					 
                    if(messageToDisplay.includes(": [")){
                        messageToDisplay = messageToDisplay.substring(0, messageToDisplay.indexOf(": ["));
                    }
                    if(messageToDisplay.includes("&quot;")){
                        messageToDisplay = messageToDisplay.replace(/&quot;/g, "\'");
                    }

                    if(messageToDisplay.includes("&amp;")){
                        messageToDisplay = messageToDisplay.replace(/&amp;/g, "&");
                    }
                    if(messageToDisplay.includes("Priorities")){
                        messageToDisplay = messageToDisplay.replace(/Priorities/g, "Development Action");
                    }
                    if(messageToDisplay.includes("Priority")){
                        messageToDisplay = messageToDisplay.replace(/Priority/g, "Development Action");
                    }
                    if(messageToDisplay.includes("priority")){
                        messageToDisplay = messageToDisplay.replace(/priority/g, "Development Action");
                    }
										
					

                } catch (err) {
                    messageToDisplay = error.body.message;
                }
                this.showToastMessage('Error', 'Error', messageToDisplay);
                this.showEditDevelopmentActivities = true;
                this.showDevelopmentActivityInReadMode = false;
                
              ///  if(error.body.pageErrors.length > 0){
              //      this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
              //  } else if (error.body.fieldErrors){
             //       this.showNotification('Error', 'Error', error.body.fieldErrors.message);
             //   }
            });

           
        }
    else{
            this.template.querySelector('.title').checkValidity() ? null : this.template.querySelector('.title').reportValidity();
            this.showSpinner = false;
        }     
    
                //this.accomplishedupdatedate=null;
    
    }

      // Helps display a toast message
      showToastMessage(variant, title, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    //handle development Opportunities 
    handledevelopmentChange(event){
        this.developmentOpportunities = event.target.value;
    }

    //handle Aspirations 
    handleAspirationsChange(event){
    this.careerAspirationsValue = event.target.value;
    }

    //handle strengths 
    handleStrengthsChange(event){
    this.StrengthsValue = event.target.value;
    }

    // the user has clicked delete buttons on a Priority section
    handleDelete(event) {
        const editedPriorityId = event.target.value;

        // call apex method To delete Activities.
        deleteDevelopmentActivities({
            developmentActivitiesId: editedPriorityId
        }).then(result => {
            //Refreshing Development Activities Record 
            this.fetchDevelopmentActivities();
        })
        .catch(error => {
            if(error.body.pageErrors.length > 0){
                this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
            } else if (error.body.fieldErrors){
                this.showNotification('Error', 'Error', error.body.fieldErrors.message);
            }
        });

        this.showEditDevelopmentActivities = false;
        this.showDevelopmentActivityInReadMode = true;

         // Edit Buttton section Hide/show
         this.whatMattersMostToMeButton = true;
         this.careerPlanningDetailsButton =true;
         this.strengthsButton = true;
         this.developmentOpportunitiesButton= true;
         this.talentEditButtons =true;
         this.priorityButton =true;
         this.priorityAddButton =true;
         this.showMoreLessButton = true;
         this.dispatchEvent(new CustomEvent(
            'developmentactivityaddedit',
            {
                detail : {
                    developmentActivity : false                    
                }
            }
        )); 
    }

    // the user has clicked one of the edit/save/cancel buttons on a section
    async handleSectionEdit(event) {
        try {
            let detail = event.detail; // the event detail
            let section = detail.identifier;
            let button = detail.button;

            if (section === 'careerAspirations') {
                if (button === 'edit') {
                    this.template.querySelector('c-tms-edit-save.careerPlanningDetailsButtons').changeState('edit');
                    this.careerAspirationsMode = 'edit';
                    this.whatMattersMostToMeButton = false;
                    this.careerPlanningDetailsButton =true;
                    this.strengthsButton = false;
                    this.developmentOpportunitiesButton= false;
                    this.talentEditButtons =false;
                    this.priorityButton =false;
                    this.priorityAddButton = false;
                                
                    //Save Button 
                } else if (button === 'save') {

                    let careerPlanToUpdate = {
                        Id : this.recordCareerplanId,
                        TMS_Career_Aspirations__c : this.careerAspirationsValue
                    };
                    console.log('careerPlanToUpdate :: '+JSON.stringify(careerPlanToUpdate));
                    // call apex method updateTalentProfile and process result
                    await updateCareerPlanDetails({careerPlan : careerPlanToUpdate})
                    .then(result => {
                        //Refreshing the component for New Value
                        this.fetchCareerPlanDetails();
                    })
                    .catch(error => {
                        if(error.body.pageErrors.length > 0){
                            this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
                        } else if (error.body.fieldErrors){
                            this.showNotification('Error', 'Error', error.body.fieldErrors.message);
                        }
                    });

                    // turn on spinner
                    this.showSpinner = true;

                    // do your processing
                    this.template.querySelector('c-tms-edit-save.careerPlanningDetailsButtons').changeState('view');
                    this.careerAspirationsMode = 'view';

                    // turn off spinner
                    this.showSpinner = false;

                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;


                } else if (button === 'cancel') {
                    this.template.querySelector('c-tms-edit-save.careerPlanningDetailsButtons').changeState('view');
                    this.careerAspirationsMode = 'view';

                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;
                }
            } else if (section === 'whatMattersMostToMe') {

                if (button === 'edit') {

                    this.template.querySelector('c-tms-edit-save.whatMattersMostToMeButtons').changeState('edit');
                    this.whatMattersMostToMeMode = 'edit';
                    this.careerPlanningDetailsButton =false;
                    this.strengthsButton = false;
                    this.developmentOpportunitiesButton= false;
                    this.talentEditButtons =false;
                    this.priorityButton =false;
                    this.priorityAddButton =false;

                } else if (button === 'save') {
                    let whatMattersMostToMeValue = this.template.querySelector('.whatMattersMostToMeValue').getSelectedItems();

                    // convert array to string
                    let whatMattersMostToMeValueString = '';
                    if ((whatMattersMostToMeValue) != null) {
                        for (let i = 0; i < whatMattersMostToMeValue.length; i++) {
                            if (i > 0) {
                                whatMattersMostToMeValueString += ';';
                            }
                            whatMattersMostToMeValueString += whatMattersMostToMeValue[i].value;
                        }
                    }
                    if(whatMattersMostToMeValue.length <= 3){
                        let careerPlanToUpdate = {
                            Id : this.recordCareerplanId,
                            TMS_What_matters_most_to_me__c : whatMattersMostToMeValueString
                        };

                     // call apex method updateCareerPlan and process result
                     await updateCareerPlanDetails({careerPlan : careerPlanToUpdate})
                        .then(result => {
                            //Refreshing the component for New Value
                            this.fetchCareerPlanDetails();
                        })
                        .catch(error => {
                            if(error.body.pageErrors.length > 0){
                                this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
                            } else if (error.body.fieldErrors){
                                this.showNotification('Error', 'Error', error.body.fieldErrors.message);
                            }
                        });
                    }
                    else{
                        this.showNotification('Error', 'Error', 'Only allowed to select up to 3 Values.');
                    }
                       

                    // turn on spinner
                    this.showSpinner = true;

                    this.template.querySelector('c-tms-edit-save.whatMattersMostToMeButtons').changeState('view');
                    this.whatMattersMostToMeMode = 'view';

                    // turn off spinner
                    this.showSpinner = false;

                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;

                } else if (button === 'cancel') {
                    this.template.querySelector('c-tms-edit-save.whatMattersMostToMeButtons').changeState('view');
                    this.whatMattersMostToMeMode = 'view';

                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;
                }
            } else if (section === 'Strengths') {

                if (button === 'edit') {

                    this.template.querySelector('c-tms-edit-save.strengthsButtons').changeState('edit');
                    this.strengthSectionMode = 'edit';
                    this.whatMattersMostToMeButton = false;
                    this.careerPlanningDetailsButton =false;
                    this.strengthsButton = true;
                    this.developmentOpportunitiesButton= false;
                    this.talentEditButtons =false;
                    this.priorityButton =false;
                    this.priorityAddButton =false;

                } else if (button === 'save') {

                    let careerPlanToUpdate = {
                        Id : this.recordCareerplanId,
                        TMS_Strengths__c : this.StrengthsValue
                    };

                    // call apex method updateCareerPlan and process result
                    await updateCareerPlanDetails({careerPlan : careerPlanToUpdate})
                    .then(result => {
                         //Refreshing the component for New Value
                         this.fetchCareerPlanDetails();
                    })
                    .catch(error => {
                        if(error.body.pageErrors.length > 0){
                            this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
                        } else if (error.body.fieldErrors){
                            this.showNotification('Error', 'Error', error.body.fieldErrors.message);
                        }
                    });
                    // turn on spinner
                    this.showSpinner = true;

                    this.template.querySelector('c-tms-edit-save.strengthsButtons').changeState('view');
                    this.strengthSectionMode = 'view';

                    // turn off spinner
                    this.showSpinner = false;

                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;

                } else if (button === 'cancel') {
                    this.template.querySelector('c-tms-edit-save.strengthsButtons').changeState('view');
                    this.strengthSectionMode = 'view';

                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;
                }
            } else if (section === 'developmentOpportunities') {

                if (button === 'edit') {

                    this.template.querySelector('c-tms-edit-save.developmentOpportunitiesButtons').changeState('edit');
                    this.developmentOpportunitiesMode = 'edit';

                    this.whatMattersMostToMeButton = false;
                    this.careerPlanningDetailsButton =false;
                    this.strengthsButton = false;
                    this.developmentOpportunitiesButton= true;
                    this.talentEditButtons =false;
                    this.priorityButton =false;
                    this.priorityAddButton =false;


                } else if (button === 'save') {
                 
                    //Career Plan Record
                    let careerPlanToUpdate = {
                        Id : this.recordCareerplanId,
                        TMS_Development_Opportunities__c : this.developmentOpportunities
                    };
                    
                    // call apex method updateTalentProfile and process result
                    await updateCareerPlanDetails({careerPlan : careerPlanToUpdate})
                    .then(result => {
                        //Refreshing the component for New Value
                        this.fetchCareerPlanDetails();
                    })
                    .catch(error => {
                        if(error.body.pageErrors.length > 0){
                            this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
                        } else if (error.body.fieldErrors){
                            this.showNotification('Error', 'Error', error.body.fieldErrors.message);
                        }
                    });
                    // turn on spinner
                    this.showSpinner = true;

                    this.template.querySelector('c-tms-edit-save.developmentOpportunitiesButtons').changeState('view');
                    this.developmentOpportunitiesMode = 'view';

                    // turn off spinner
                    this.showSpinner = false;

                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;

                } else if (button === 'cancel') {
                    this.template.querySelector('c-tms-edit-save.developmentOpportunitiesButtons').changeState('view');
                    this.developmentOpportunitiesMode = 'view';
                    
                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;
 
                }
            } else if (section === 'talentProfile') {

                if (button === 'edit') {

                    this.template.querySelector('c-tms-edit-save.talentEditButton').changeState('edit');
                    this.talentProfileMode = 'edit';

                    this.whatMattersMostToMeButton = false;
                    this.careerPlanningDetailsButton =false;
                    this.strengthsButton = false;
                    this.developmentOpportunitiesButton= false;
                    this.talentEditButtons =true;
                    this.priorityButton =false;
                    this.priorityAddButton =false;

                 // pre populating primary Submarket Alignment value
                    let dependentValuesForSubmarketAlignment = [];
                        this.primarySubmarketAlignment.forEach(conValues => {
                            if(conValues.validFor[0] === this.primarySubmarketcontrolValues[this.talentDetails.Primary_Market_Alignment__c]) {
                            dependentValuesForSubmarketAlignment.push({
                            label: conValues.label,
                            value: conValues.value
                        })
                    }
                    })
                    this.primarySubmarketAlignmentOptionsToDisplay = Object.assign([],dependentValuesForSubmarketAlignment);

                    // pre populating secondary Submarket Alignment value
                     let dependentValuesForsecondarySubmarketAlignment = [];
                     this.secondarySubmarketAlignment.forEach(conValues => {
                         if(conValues.validFor[0] === this.secondarySubmarketcontrolValues[this.talentDetails.Secondary_Market_Alignment__c]) {
                            dependentValuesForsecondarySubmarketAlignment.push({
                         label: conValues.label,
                         value: conValues.value
                     })
                 }
                 })
                 this.secondarySubmarketAlignmentOptionsToDisplay = Object.assign([],dependentValuesForsecondarySubmarketAlignment);

                } else if (button === 'save') {
                    let Primary_Market_Alignment = this.template.querySelector('.Primary_Market_Alignment').value;
                    let Secondary_Market_Alignment = this.template.querySelector('.Secondary_Market_Alignment').value;
                    let Primary_Submarket_Alignment = this.template.querySelector('.Primary_Submarket_Alignment').value;
                    let Secondary_Submarket_Alignment = this.template.querySelector('.Secondary_Submarket_Alignment').value;
                    let marketAspiration = this.template.querySelector('.marketAspiration').getSelectedItems();
                    let Develop_in_Current_Market = this.template.querySelector('.Develop_in_Current_Market').checked;

                    // convert array to string
                    let marketAspirationString = '';
                    if ((marketAspiration) != null) {
                        for (let i = 0; i < marketAspiration.length; i++) {
                            if (i > 0) {
                                marketAspirationString += ';';
                            }
                            marketAspirationString += marketAspiration[i].value;
                        }
                    }

                    let talentProfileToUpdate = {
                        Id : this.talentProfileId,
                        Primary_Market_Alignment__c : Primary_Market_Alignment,
                        Secondary_Market_Alignment__c  : Secondary_Market_Alignment,
                        Primary_Submarket_Alignment__c : Primary_Submarket_Alignment,
                        Secondary_Submarket_Alignment__c : Secondary_Submarket_Alignment,
                        Market_Aspiration__c : marketAspirationString,
                        Develop_in_Current_Market__c : Develop_in_Current_Market
                    };

                  // call apex method updateTalentProfile and process result
                  await updateTalentProfileDetails({talentProfile : talentProfileToUpdate})
                    .then(result => {
                        // Refreshing the Talent profile Record
                        this.fetchTalentProfileDetails();
                    })
                    .catch(error => {
                        if(error.body.pageErrors.length > 0){
                            this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
                        } else if (error.body.fieldErrors){
                            this.showNotification('Error', 'Error', error.body.fieldErrors.message);
                        }
                    });

                    // Edit Buttton section Hide/show
                    this.whatMattersMostToMeButton = true;
                    this.careerPlanningDetailsButton =true;
                    this.strengthsButton = true;
                    this.developmentOpportunitiesButton= true;
                    this.talentEditButtons =true;
                    this.priorityButton =true;
                    this.priorityAddButton =true;

                    //turn on spinner
                    this.showSpinner = true;

                    this.template.querySelector('c-tms-edit-save.talentEditButton').changeState('view');
                    this.talentProfileMode = 'view';

                    // turn off spinner
                    this.showSpinner = false;

                } else if (button === 'cancel') {
                    this.template.querySelector('c-tms-edit-save.talentEditButton').changeState('view');
                    this.talentProfileMode = 'view';


                     // Edit Buttton section Hide/show
                     this.whatMattersMostToMeButton = true;
                     this.careerPlanningDetailsButton =true;
                     this.strengthsButton = true;
                     this.developmentOpportunitiesButton= true;
                     this.talentEditButtons =true;
                     this.priorityButton =true;
                     this.priorityAddButton =true;
 
                }
            }
        } catch (err) {
            //this.handleError(errorMessage(err));
            this.showNotification('Error', 'Error', err);
        }
    }
    
    // Development Activities Cancel Buttons
    handleDevelopmentActivityCancel(event) {
        this.showCreateDevelopmentActivityForm = false;
        this.showDevelopmentActivityInReadMode = true;

         // Edit Buttton section Hide/show
         this.whatMattersMostToMeButton = true;
         this.careerPlanningDetailsButton =true;
         this.strengthsButton = true;
         this.developmentOpportunitiesButton= true;
         this.talentEditButtons =true;
         this.priorityButton =true;
         this.priorityAddButton =true;
         //this.showMoreLessButton = true;         
         this.dispatchEvent(new CustomEvent(
            'developmentactivityaddedit',
            {
                detail : {
                    developmentActivity : false                    
                }
            }
        ));
    }

   // Development Activities save as draft Buttons
   async handleDevelopmentActivityDraft() {
    console.log('Save as Draft Button Clicked');
    
    
        this.showSpinner = true;
        let title = this.template.querySelector('.title').value;
        console.log('For title --',title);
        let developmentType = this.template.querySelector('.developmentType').value;
        console.log('For DevType--',developmentType);
        let alignment = this.template.querySelector('.alignmentadd').value;
        console.log('For Alignment--',alignment);
        //let focusalignment = this.template.querySelector('.focuselementsadd').value;
		//let focusalignment = this.template.querySelector('.focuselementsadd').value || 'Default Value';
		//console.log('For Focousalignment--',focusalignment);
		let focusAlignmentElement = this.template.querySelector('.focuselementsadd');
        let focusalignment = focusAlignmentElement ? focusAlignmentElement.value : '';
        console.log('For Focousalignment--',focusalignment);
        let createdforYear = this.template.querySelector('.createdforYear').value;
        console.log('For Created Year',createdforYear);
        let description = this.template.querySelector('.description').value;
        console.log('For Des',description);
        let expecteddateofcompletion = this.template.querySelector('.expecteddateofcompletion').value;
       // let expecteddate = this.createExpectedDate;
        console.log('For expecteddate',expecteddateofcompletion);


       
       // status
        let status = 'TMS_Draft';
        console.log('For status--',status);

        let priorityToUpdate = {
            TMS_Alignment__c : alignment,
			TMS_Focus_elements__c : focusalignment,
            Name : title,
            TMS_Development_Type__c : developmentType,
            TMS_Created_for_Year__c : createdforYear,
            TMS_Simple_and_Specific_Details__c : description,
            TMS_Priority_Status__c : status,
            TMS_Expected_Date_of_completion__c :expecteddateofcompletion
        };
       
        
        if(title && developmentType && alignment && createdforYear && expecteddateofcompletion  ){
            console.log('Save as Draft If condi Clicked');
                // call apex method updateTalentProfile and process result
            await createDevelopmentActivities({tmsPriority : priorityToUpdate, Status :status , expdate:this.createExpectedDate})
            .then(data => {
            //Refreshing Development Activities Record 
            console.log('Save as Draft Record Creation', data);
            console.log('Save as Draft Apex Called');
                this.fetchDevelopmentActivities();
                this.showDevelopmentActivityInReadMode = true;
                this.showCreateDevelopmentActivityForm = false;
                this.showSpinner = false;
            })
            .catch(error => {
                let errorMessageType = 'FIELD_CUSTOM_VALIDATION_EXCEPTION';
            let errorMessage = error.body.message;
            let messageToDisplay = error.body.message;
			const colonIndex  = 0 ;
            if (errorMessage.includes(errorMessageType)) {
						
                console.log("Step1 errorMessageType::"+errorMessageType);
                console.log("Step1 errorMessage::"+errorMessage);
                
                //messageToDisplay = errorMessage.substring(errorMessage.indexOf(errorMessageType) + errorMessageType.length + 1);
                
                console.log("Step2 messageToDisplay::"+messageToDisplay);
                //console.log("Step2 errorMessage::"+errorMessage.substring(errorMessage.indexOf(errorMessageType));
                // Truncate the message after the error description
                const colonIndex = messageToDisplay.indexOf(':');
                
                
                console.log("Step3 colonIndex::"+colonIndex);
            
                
                if (colonIndex !== -1) {
                    
                    console.log("Step4 messageToDisplay::"+messageToDisplay);
                    //messageToDisplay = messageToDisplay.substring(colonIndex + 1).trim();
                    
                    this.showNotification('Error', 'Error', 'The selected alignment is designated for GDP members only. Please choose a different alignment');
                }
            }else{
                console.log('Create button Else Apex  block');
           console.error('Error creating development activity:', error);
		this.showNotification('Error', 'Error', error.body ? error.body.message : 'An error occurred while creating the development activity.');
			}
        
           /* if(error.body.pageErrors.length > 0){
                this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
                    } else if (error.body.fieldErrors){
                this.showNotification('Error', 'Error', error.body.fieldErrors.message);
                }*/ 
			if(error.body && error.body.pageErrors && error.body.pageErrors.length > 0){
                this.showNotification('Error', 'Error', error.body.pageErrors[0].message);
                    } else if (error.body && error.body.fieldErrors){
                this.showNotification('Error', 'Error', error.body.fieldErrors.message);
                }	
                this.showSpinner = false;
            });

            // Edit Buttton section Hide/show
            this.whatMattersMostToMeButton = true;
            this.careerPlanningDetailsButton =true;
            this.strengthsButton = true;
            this.developmentOpportunitiesButton= true;
            this.talentEditButtons =true;
            this.priorityButton =true;
            this.priorityAddButton =true;
            this.showMoreLessButton = true;
            this.dispatchEvent(new CustomEvent(
                'developmentactivityaddedit',
                {
                    detail : {
                        developmentActivity : false                    
                    }
                }
            )); 
            
        }else{
            console.log('Save as Draft Else condi Clicked');
            this.template.querySelector('.title').checkValidity() ? null : this.template.querySelector('.title').reportValidity();
            this.template.querySelector('.expecteddateofcompletion').checkValidity() ? null : this.template.querySelector('.expecteddateofcompletion').reportValidity();
            this.template.querySelector('.developmentType').checkValidity() ? null : this.template.querySelector('.developmentType').reportValidity();
            this.template.querySelector('.alignmentadd').checkValidity() ? null : this.template.querySelector('.alignmentadd').reportValidity();
            this.template.querySelector('.focusalignment').checkValidity() ? null : this.template.querySelector('.focusalignment').reportValidity();
			if (focusAlignmentElement) {
            focusAlignmentElement.checkValidity() ? null : focusAlignmentElement.reportValidity();
        }
            this.template.querySelector('.createdforYear').checkValidity() ? null : this.template.querySelector('.createdforYear').reportValidity();
            this.showSpinner = false;
        }
         
    }
    //handleExpectedDateofCompletionChange(event)
    //{
   //     this.expecteddate=event.taget.value;
   //     console.log('this.expecteddate ',this.expecteddate)
   // }

    // @track createExpectedDate;

    // handleExpectedDateofCompletionChange(event) {
        
    //      this.createExpectedDate = event.target.value;
    //     console.log('expectedSelected Date:', this.createExpectedDate);
    // }
// @track createaccomplisheddate
//     handleAccomplishedDatecreatedChange(event){
//         this.createaccomplisheddate = event.target.value;
//         console.log('accomplishedSelected Date:', this.createaccomplisheddate);
//     }

// Development Activities Activity Create Buttons
async handledevelopmentActivityCreate(event) {
    console.log('Create button Click');
    this.showSpinner = true;
    let title = this.template.querySelector('.title').value;
    console.log(this.template.querySelector('.title').value);
    let developmentType = this.template.querySelector('.developmentType').value;
    let alignmentAction = this.template.querySelector('.alignmentadd').value;
    let focuselementsAction = '';
    if (this.showFocusElements) {
        const focuselementsElement = this.template.querySelector('.focuselementsadd');
        if (focuselementsElement && focuselementsElement.value && focuselementsElement.value.trim() !== '') {
            focuselementsAction = focuselementsElement.value;
        } else {
            this.showToastMessage('Error', 'Error', 'Please Select the Focus elements field');
            this.showSpinner = false;
            return;               
        }
    }  console.log('Selected Focus Elements outside if:', focuselementsAction);
    //let focuselementsAction = this.template.querySelector('.focuselementsadd').value;
    let expectedDate = this.template.querySelector('.expecteddateofcompletion').value;
    console.log(this.template.querySelector('.expecteddateofcompletion').value);
    let createdforYear = this.template.querySelector('.createdforYear').value;
    let description = this.template.querySelector('.description').value;
    let status = this.template.querySelector('.status').value;

    let priorityToUpdate = {
        TMS_Alignment__c: alignmentAction,
       TMS_Focus_elements__c: focuselementsAction,
        Name: title,
        TMS_Development_Type__c: developmentType,
        TMS_Created_for_Year__c: createdforYear,
        TMS_Simple_and_Specific_Details__c: description,
        TMS_Priority_Status__c: status,
        TMS_Expected_Date_of_completion__c: expectedDate
    };
    
    if (title && developmentType && alignmentAction && createdforYear) {
        
        try {
            console.log('Create button If Apex try block');
            // call apex method createDevelopmentActivities and process result
            await createDevelopmentActivities({ tmsPriority: priorityToUpdate });
            console.log('createDevelopmentActivities11', priorityToUpdate);
            console.log(createDevelopmentActivities, 'createDevelopmentActivities....');
            // Refreshing Development Activities Record 
            this.fetchDevelopmentActivities();
            this.showCreateDevelopmentActivityForm = false;
            this.showDevelopmentActivityInReadMode = true;
            this.talentEditButtons =true;
         this.priorityButton =true;
         this.priorityAddButton =true;
            
        } catch (error) {
			console.log('Create button Apex Catch block');
			let errorMessageType = 'FIELD_CUSTOM_VALIDATION_EXCEPTION';
            let errorMessage = error.body.message;
            let messageToDisplay = error.body.message;
			const colonIndex  = 0 ;
			if (errorMessage.includes(errorMessageType)) {
						
						console.log("Step1 errorMessageType::"+errorMessageType);
						console.log("Step1 errorMessage::"+errorMessage);
						
						//messageToDisplay = errorMessage.substring(errorMessage.indexOf(errorMessageType) + errorMessageType.length + 1);
						
						console.log("Step2 messageToDisplay::"+messageToDisplay);
						//console.log("Step2 errorMessage::"+errorMessage.substring(errorMessage.indexOf(errorMessageType));
						// Truncate the message after the error description
						const colonIndex = messageToDisplay.indexOf(':');
						
						
						console.log("Step3 colonIndex::"+colonIndex);
					
						
						if (colonIndex !== -1) {
							
							console.log("Step4 messageToDisplay::"+messageToDisplay);
							//messageToDisplay = messageToDisplay.substring(colonIndex + 1).trim();
							
							this.showNotification('Error', 'Error', 'The selected alignment is designated for GDP members only. Please choose a different alignment');
						}
					}	
			else{
                console.log('Create button Else Apex  block');
           console.error('Error creating development activity:', error);
		this.showNotification('Error', 'Error', error.body ? error.body.message : 'An error occurred while creating the development activity.');
			}
        } finally {
            this.showSpinner = false;
        }
    } else {
        console.log('Create button Apex elsee block');
        this.template.querySelector('.title').checkValidity() ? null : this.template.querySelector('.title').reportValidity();
        this.template.querySelector('.developmentType').checkValidity() ? null : this.template.querySelector('.developmentType').reportValidity();
        this.template.querySelector('.alignmentAction').checkValidity() ? null : this.template.querySelector('.alignmentAction').reportValidity();
        this.template.querySelector('.focuselementsAction').checkValidity() ? null : this.template.querySelector('.focuselementsAction').reportValidity();
        this.template.querySelector('.createdforYear').checkValidity() ? null : this.template.querySelector('.createdforYear').reportValidity();
        this.showSpinner = false;
    }
    this.createExpectedDate = null;
}
    
    //helper method
    // prepare the list of options to pass to the multipicklist, including any preselections
    prepMultiPicklistOptions(picklistValues, fieldValue) {
       
        // convert multi-picklist to array
        let selectedLabels = [];
        if ((fieldValue) != null) {
            selectedLabels = fieldValue.split(';');
        }

        let results = [];
        if ((picklistValues) != null) {
            picklistValues.forEach(item => {
                let result = {
                    label: item.label,
                    value: item.value,
                    selected: false
                };
                // if this option has been selected, set the flag
                if ((selectedLabels) != null && selectedLabels.includes(item.label)) {
                    result.selected = true;
                }
                results.push(result);
            });
        }
        return results;
    }
  
    // this method is used to navigate to Prority Record.
    navigateToPriorityRecord(event) {
        let priorityId = event.target.dataset.recordId;
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: '/e3experience/s/tms-priority/'+priorityId
            }
        }).then(url => {
            window.open(url, "_blank");
        });
    }

// This method Return option for Develop in Current Market
    get developinCurrentMarketOption() {
        return [{
                label: 'True',
                value: 'True'
            },
            {
                label: 'False',
                value: 'False'
            },
        ];
    }

    /*
    * Helps to Show a Toast Message
    */
    showNotification(title, variant, message) {
        const evt = new ShowToastEvent({
        title: title,
        variant: variant,
        message: message
        });
        this.dispatchEvent(evt);
        }
        dd = ['rr','tt','yy'];
    
//  handelAlignmentValue(event) {
//     let key = this.focuselementsValuesMethod.controllerValues[event.target.value];

//     this.focuselementsValues = this.focuselementsValuesMethod.values.filter(opt => opt.validFor.includes(key));
// }
// handelFocusValue(event){
// var focuselementsValues1 = event.target.value;
// }
}