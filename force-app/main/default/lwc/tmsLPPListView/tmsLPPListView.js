import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getIncentiveProgramListInfinite from '@salesforce/apex/TMS_LPPListViewController.getIncentiveProgramListInfinite';
import hasViewAsUserPermission from '@salesforce/apex/TMS_LPPListViewController.hasViewAsUserPermission';
import getNextFiscalYear from '@salesforce/apex/TMS_LPPListViewController.getNextFiscalYear';
import getFyPicklist from '@salesforce/apex/TMS_LPPListViewController.getFyPicklist';
import save from '@salesforce/apex/TMS_LPPListViewController.save';
import BUSINESS_UNIT from '@salesforce/schema/TMS_Talent_Profile__c.TMS_Business_Unit__c';
import LINE_OF_BUSINESS from '@salesforce/schema/User.TMS_Line_of_Business__c';
import BUSINESS_SUB_UNIT from '@salesforce/schema/TMS_Talent_Profile__c.TMS_Sub_Unit__c';
import TALENT_PROFILE_OBJECT from '@salesforce/schema/TMS_Talent_Profile__c';
import USER_OBJECT from '@salesforce/schema/User';
import FISCAL_YEAR from '@salesforce/schema/Incentive_Program__c.Grant_Fiscal_Year__c';
import REASONS from '@salesforce/schema/Incentive_Program__c.Reason__c';
import INCENTIVE_PROGRAM_OBJECT from '@salesforce/schema/Incentive_Program__c';
import USER_ID from '@salesforce/user/Id';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { errorMessage, isEmpty, toastSuccess, toastError } from 'c/lwcUtils';
import { updateRecord } from 'lightning/uiRecordApi';

const MAX_RECORDS = 20;

export default class TmsLPPListView extends NavigationMixin(LightningElement) {

    columns = [
        {label: "Participant", fieldName: "LPP_Person__r.Full_Name__c", type: "image", wrapText: true, hideDefaultActions: true, initialWidth: 180, 
            typeAttributes: {
                talentId: { fieldName: 'Id' },
                userImgSrc: { fieldName: 'lppPersonImage' },
                userName: { fieldName: 'lppPersonName' }
            },
            sortable: true
        },
        {label: "2Y LPP Actual %", fieldName: "X2YA_LPP_Actual__c", type: 'percentFixed', typeAttributes: {
            step: '1',
            minimumFractionDigits: '2',
            maximumFractionDigits: '2',
            formatStyle: 'percent',
            value: 'X2YA_LPP_Actual__c'
        }, wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "2Y LTI Actual", fieldName: "X2YA_LTI_Actual__c", type: 'number', wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "1Y LPP Actual %", fieldName: "X1YA_LPP_Actual__c", type: 'percentFixed', typeAttributes: {
            step: '1',
            minimumFractionDigits: '2',
            maximumFractionDigits: '2',
            formatStyle: 'percent',
            value: 'X1YA_LPP_Actual__c'
        }, wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "1Y LTI Actual", fieldName: "X1YA_LTI_Actual__c", type: 'number', wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "Current Salary", fieldName: "Current_Salary__c", type: 'number', wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "Calculated LPP Target", fieldName: "Calculated_LPP_Target__c", type: 'number', wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "LPP Plan %", editable: true, fieldName: "LPP_Plan__c", type: 'percentFixed', typeAttributes: {
            step: '1',
            minimumFractionDigits: '2',
            maximumFractionDigits: '2',
            formatStyle: 'percent',
            value: 'LPP_Plan__c'
        }, wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "Total Cash", fieldName: "Total_Cash__c", type: 'number', wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "LLTI", editable: true, fieldName: "LLTI__c", type: 'number', wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "TDC", fieldName: "TDC__c", type: 'number', wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "Reason", editable: true, fieldName: 'Reason__c', type: 'picklistType', wrapText: true, hideDefaultActions: true, initialWidth: 140, sortable: true, 
            typeAttributes: {
                options: { fieldName: 'reasonPicklistOptions' } 
            }
        },
        {label: "Comment", editable: true, fieldName: "Comments__c", wrapText: true, hideDefaultActions: true, initialWidth: 120, sortable: true},
        {label: "Discretionary Bonus Amount", editable: true, fieldName: "Discretionary_Bonus_Amount__c", type: 'currency', wrapText: true, hideDefaultActions: true, initialWidth: 140, sortable: true},
        {label: "Discretionary Bonus Received Date", fieldName: "Discretionary_Bonus_Received_Date__c", type: 'date', wrapText: true, hideDefaultActions: true, initialWidth: 140, sortable: true},
        {label: "Retention Bonus Amount", editable: true, fieldName: "Retention_Bonus_Amount__c", type: 'currency', wrapText: true, hideDefaultActions: true, initialWidth: 140, sortable: true},
        {label: "Retention Bonus Received Date", fieldName: "Retention_Bonus_Received_Date__c", type: 'date', wrapText: true, hideDefaultActions: true, initialWidth: 140, sortable: true},
        {label: "Global Grade", fieldName: "Global_Grade__c", type: 'text', wrapText: true, hideDefaultActions: true, initialWidth: 140, sortable: true},
    ];

    inOutPlanOptions = [
        {label: 'All', value: null},
        {label: 'Planned', value: 'Planned'},
        {label: 'Not Planned', value: 'Not Planned'}
    ];
    acceleratedTalentList = [
        {label: 'All', value: null},
        {label: 'Tier 2 - SVP Potential', value: 'Tier 2 - SVP Potential'},
        {label: 'Tier 3 - VP Potential', value: 'Tier 3 - VP Potential'},
        {label: 'Tier 4 - Rising Talent', value: 'Tier 4 - Rising Talent'}
    ];
    canViewAsUser;
    showSpinner = false;
    userId = USER_ID;
    grantFY;
    @wire(getFyPicklist)
    wireGetFyPicklist({error, data}) {
        if (error) {
            this.handleError(errorMessage(error));
        } else if (data !== undefined && data !== null) {
            try {
                let bu = JSON.parse(JSON.stringify(data));
                let fyList = new Array();
                bu.forEach((item) => {
                    fyList.push({label: item, value: item});
                });
                this.grantFY = fyList;
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }
    }
    
    @wire(hasViewAsUserPermission, {userId: '$userId'})
    wireHasViewAsUserPermission({error, data}) {
        if (error) {
            this.handleError(errorMessage(error));
        } else if (data !== undefined && data !== null) {
            try {
                this.canViewAsUser = data;
            } catch (err) {
                this.handleError(errorMessage(err));
            }
        }
    }

    @wire(getObjectInfo, { objectApiName: TALENT_PROFILE_OBJECT })
    talentProfileObjInfo;

    businessUnit;
    @wire(getPicklistValues, {fieldApiName: BUSINESS_UNIT, recordTypeId: '$talentProfileObjInfo.data.defaultRecordTypeId'})
    wireBusinessUnit({error, data}) {
        if(data) {
            let bu = JSON.parse(JSON.stringify(data));
            let buArr = new Array();
            buArr.push({label: "All", value: null});
            if(!isEmpty(bu.values)){
                bu.values.forEach((item)=>{
                    buArr.push({label: item.label, value: item.value});
                });
                this.businessUnit = buArr;
            }
        } else if(error) {
            this.handleError(errorMessage(error));
        }
    }

    @wire(getObjectInfo, { objectApiName: USER_OBJECT })
    userObjInfo;

    lobList;
    userRecordTypeId = '012000000000000AAA';
    @wire(getPicklistValues, {fieldApiName: LINE_OF_BUSINESS, recordTypeId: '$userRecordTypeId'})
    wireLob({error, data}) {
        if(data) {
            let lobData = JSON.parse(JSON.stringify(data));
            console.log("lobData >> ");
            console.log(lobData);
            let lobArr = new Array();
            lobArr.push({label: "All", value: null});
            if(!isEmpty(lobData.values)){
                lobData.values.forEach((item)=>{
                    lobArr.push({label: item.label, value: item.value});
                });
                this.lobList = lobArr;
            }
        } else if(error) {
            console.log(error.message);
            this.handleError(errorMessage(error));
        }
    }
    
    subUnitList;
    @wire(getPicklistValues, {fieldApiName: BUSINESS_SUB_UNIT, recordTypeId: '$talentProfileObjInfo.data.defaultRecordTypeId'})
    wireSubUnit({error, data}) {
        if(data) {
            let subUnitData = JSON.parse(JSON.stringify(data));
            let suArr = new Array();
            suArr.push({label: "All", value: null});
            if(!isEmpty(subUnitData.values)){
                subUnitData.values.forEach((item)=>{
                    suArr.push({label: item.label, value: item.value});
                });
                this.subUnitList = suArr;
            }
        } else if(error) {
            this.handleError(errorMessage(error));
        }
    }
    
    reasonPicklistOptions = [];
    @wire(getPicklistValues, {fieldApiName: REASONS, recordTypeId: '$incentiveProgramObjInfo.data.defaultRecordTypeId'})
    wireReasonOptions({error, data}) {
        if(data) {
            let options = JSON.parse(JSON.stringify(data));
            let optArr = new Array();
            optArr.push({label: "", value: ""});
            if(!isEmpty(options.values)){
                options.values.forEach((item)=>{
                    optArr.push({label: item.label, value: item.value});
                });
                this.reasonPicklistOptions = optArr;
            }
            console.log('OPTiONS >> ');
            console.log(this.reasonPicklistOptions);
        } else if(error) {
            this.handleError(errorMessage(error));
        }
    }
    

    //*** CONNECTED CALLBACK */
    lppList;
    defaultSelectedFY;

    connectedCallback() {
        this.showSpinner = true;
        getNextFiscalYear().then(data => {
            if(data) {
                //let tp = JSON.parse(JSON.stringify(data));
                //this.selectedBusinessUnit = tp.TMS_Business_Unit__c;
                this.selectedGrantFiscalYear = data;
                this.defaultSelectedFY = data;
                this.selectedFy = data;
                this.grantFiscalYear = [{label: data, value: data}];
                this.showSpinner = false;
                this.fetchAllLPPList();
            }
        }).catch(err => {
            this.showSpinner = false;
            this.handleError(errorMessage(err));
        });
    }

    processRecords(lppList) {
        lppList.forEach(record => {
            record.lppPersonImage = record.LPP_Person__r.TMS_User__r.SmallPhotoUrl;
            record.lppPersonName = record.LPP_Person__r.Full_Name__c;
            record.reasonPicklistOptions = this.reasonPicklistOptions;
        });
        this.addRunningTotals();
    }

    hasMoreReocrds = false;
    offset = 0;
    selectedForUserId;
    selectedFy;
    fetchAllLPPList() {
        this.showSpinner = true;
        let filterObj = {
            lineOfBusiness: this.selectedLOB,
            businessUnit: this.selectedBusinessUnit,
            businessSubUnit: this.selectedSubUnit,
            userId: this.selectedViewAsUser,
            forUserId: this.selectedForUserId,
            selectedFy: this.selectedFy,
            inOutPlan: this.inOutPlan,
            acceleratedTalent: this.selectedAcceleratedTalent,
            sortedBy: this.sortedBy,
            sortDirection: this.sortDirection,
            queryLimit: MAX_RECORDS,
            offset: this.offset,
        };
        getIncentiveProgramListInfinite({filters: filterObj}).then(data => {
            if (data) {
                if(this.lppList && this.lppList.length > 0) {
                    this.lppList = this.lppList.filter(item => {
                        return item.Id != 'totals';
                    });
                }
                let beforeLength = isEmpty(this.lppList) ? 0 : this.lppList.length;
                let dataParsed = JSON.parse(JSON.stringify(data));
                this.hasMoreReocrds = dataParsed.length == MAX_RECORDS ? true : false;
                this.lppList = this.lppList && this.lppList.length > 0 ? this.lppList.concat(dataParsed) : dataParsed; 
                let afterLength = isEmpty(this.lppList) ? 0 : this.lppList.length;
                let numReturned = afterLength - beforeLength;
                if (numReturned < MAX_RECORDS) {
                    this.hasMoreReocrds = false;
                    if(this.tableElement) {
                        this.tableElement.enableInfiniteLoading = false;
                        this.tableElement.isLoading = false;
                    }
                }
                this.processRecords(this.lppList);
                this.showSpinner = false;
            }
        }).catch(err => {
            this.showSpinner = false;
            this.handleError(errorMessage(err));
        });
    }

    async handleLoadMore(event) {     
        try {
            if(this.hasMoreReocrds) {
                this.offset += MAX_RECORDS;
                this.fetchAllLPPList();
            }
        } catch (err) {
            this.handleError(errorMessage(err));
        }
    }

    addRunningTotals() {
        let totalCalculatedLPP = 0;
        let totalLLTI = 0;
        this.lppList.forEach(record => {
            totalCalculatedLPP += record.Calculated_LPP_Target__c ? record.Calculated_LPP_Target__c : 0;
            totalLLTI += record.LLTI__c ? record.LLTI__c : 0;
        });
        this.lppList.push({
            Id: 'totals', 
            lppPersonName: 'Totals',
            Calculated_LPP_Target__c: totalCalculatedLPP,
            LLTI__c: totalLLTI
        });
    }

    //*** FILTER HANDLERS */
    activeSections = ['table', 'filter'];
    selectedLOB;
    selectedBusinessUnit;
    selectedSubUnit;
    selectedViewAsUser;
    sortedBy = 'LPP_Person__r.Full_Name__c';
    sortDirection = 'asc';
    tableElement;
    inOutPlan = false;
    selectedAcceleratedTalent;

    showList() {
        const accordion = this.template.querySelector('.list-view-accordion');
        accordion.activeSectionName = 'table';
    }

    reloadTable() {
        this.lppList = [];
        this.offset = 0;
        this.fetchAllLPPList();
        //this.showList();
    }

    getSelectedValues(eventDetail) {
        if(eventDetail) {
            let arr = new Array();
            eventDetail.forEach(item => {
                if(item.value) {
                    arr.push(item.value);
                }
            });
            return arr;
        } else {
            return null;
        }
    }

    handleLobChange(event) {
        this.selectedLOB = this.getSelectedValues(event.detail);
        this.reloadTable();
    }
    
    handleBusinessUnitFilterChange(event) {
        this.selectedBusinessUnit = this.getSelectedValues(event.detail);
        this.reloadTable();
    }
    
    handleSubUnitFilterChange(event) {
        this.selectedSubUnit = this.getSelectedValues(event.detail);
        this.reloadTable();
    }

    handleGrantFYChange(event) {
        this.selectedFy = event.detail.value;
        this.reloadTable();
    }

    handleInOutPlanChange(event) {
        this.inOutPlan = event.detail.value;
        this.reloadTable();
    }
    
    handleAcceleratedTalentChange(event) {
        this.selectedAcceleratedTalent = this.getSelectedValues(event.detail);
        this.reloadTable();
    }
    
    handleFindUserSearchKeyPress(event) {
        this.selectedForUserId = event.detail ? event.detail.Id : null;
        this.reloadTable();
    }

    handleUserSearchKeyPress(event) {
        this.selectedViewAsUser = event.detail ? event.detail.Id : null;
        this.reloadTable();
    }

    handleSort(event) {
        let eventDetail = JSON.parse(JSON.stringify(event.detail));
        console.log('eventDetail='+JSON.stringify(eventDetail));
        this.sortedBy = eventDetail.fieldName;
        this.sortDirection = eventDetail.sortDirection;
        console.log('sortedBy=['+this.sortedBy+'], sortDirection=['+this.sortDirection+']');
        this.reloadTable();
    }

    //*** INLINE EDITING */
    draftValues = [];
    async handleInlineSave(event) {
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });
        
        const recordUpdatePromises = records.map((record) =>
            updateRecord(record)
        );

        await Promise.all(recordUpdatePromises).then(() => {
            this.draftValues = [];
            toastSuccess(this, 'Success!', 'Records has been saved successfully');
            this.reloadTable();
        }).catch((error) => {
            let errMsg = error.body.output.errors[0].message;
            let errorMessage = 'Approved values are in increments of 10 as well as 5, 7.5, 15 and 25.'
            toastError(this, 'Error', errMsg === 'Please enter a valid LPP Plan%' ? errorMessage : errMsg);
        });;
    }
    
    //**** NEW MODAL HANDLERS */
    grantFiscalYear;
    selectedGrantFiscalYear
    lppPlanPercent;
    lltiValue;
    selectedLppPerson;
    comment;
    selectedReason;

    @wire(getObjectInfo, { objectApiName: INCENTIVE_PROGRAM_OBJECT })
    incentiveProgramObjInfo;

    // @wire(getPicklistValues, {fieldApiName: FISCAL_YEAR, recordTypeId: '$incentiveProgramObjInfo.data.defaultRecordTypeId'})
    // wireFiscalYear({error, data}) {
    //     if(data) {
    //         let fy = JSON.parse(JSON.stringify(data));
    //         let fyArr = new Array();
    //         fyArr.push({label: "--None--", value: null});
    //         if(!isEmpty(fy.values)){
    //             fy.values.forEach((item)=>{
    //                 fyArr.push({label: item.label, value: item.value});
    //             });
    //             this.grantFiscalYear = fyArr;
    //         }
    //     } else if(error) {
    //         this.handleError(errorMessage(err));
    //     }
    // }

    clear(){
        this.selectedLppPerson = null;
    }

    resetNewModel(){

        this.selectedGrantFiscalYear = this.defaultSelectedFY;
        this.lppPlanPercent = null;
        this.lltiValue = null;
        this.comment = null;
        this.selectedReason = null;
        this.selectedLppPerson = null;
    }
    
    hideNewPopup() {
        this.template.querySelector('.modalNew').hide();
        this.resetNewModel();
    }

    showNewPopup() {
        this.template.querySelector('.modalNew').show();
    }

    handleLppPersonSelection(event) {
        try {
            let detail = event.detail;
            if(detail) {
                this.selectedLppPerson = detail.Id;
            }else{
                this.selectedLppPerson = null;
            }
        } catch (err) {
            this.handleError(errorMessage(err));
        }
    }
    
    handleGrantFiscalYearChange(event) {
        
        this.selectedGrantFiscalYear = event.detail.value; 
    }
    
    handleLppPlanPercentChange(event) {
        try {
            let detail = event.detail;
            if(detail.value !== "") {
                this.lppPlanPercent = event.detail.value;
            }else{
                this.lppPlanPercent = null;
            }
        } catch (err) {
            this.handleError(errorMessage(err));
        }
        
    }
    
    handleLltiValueChange(event) {
        try {
            let detail = event.detail;
            if(detail.value !== "") {
                this.lltiValue = event.detail.value;
            }else{
                this.lltiValue = null;
            }
        } catch (err) {
            this.handleError(errorMessage(err));
        }
        
    }
    
    handleReasonChange(event) {
        try {
            let detail = event.detail;
            if(detail.value !== "") {
                this.selectedReason = event.detail.value;
            }else{
                this.selectedReason = null;
            }
        } catch (err) {
            this.handleError(errorMessage(err));
        }
        
    }
    
    handleCommentValueChange(event) {
        try {
            let detail = event.detail;
            if(detail.value !== "") {
                this.comment = event.detail.value;
            }else{
                this.comment = null;
            }
        } catch (err) {
            this.handleError(errorMessage(err));
        }
        
    }

    isNumber(str) {
        return str && /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(str);
    }

    save() {
        this.showSpinner = true;
        let isValid = true;
        console.log('selectedLppPerson : '+this.selectedLppPerson);
        if(!this.selectedLppPerson) {
            this.handleError("Please select a Participant.");
            isValid = false;
        } else if(this.lppPlanPercent && this.isNumber(this.lppPlanPercent)) {
            let invalidLlpPlanValid = this.lppPlanPercent > 111 || (this.lppPlanPercent % 10 > 0 && this.lppPlanPercent != 5 && this.lppPlanPercent != 7.5 && this.lppPlanPercent != 15 && this.lppPlanPercent != 25);
            if(invalidLlpPlanValid) {
                this.handleError("Approved values are in increments of 10 as well as 5, 7.5, 15 and 25.");
                isValid = false;
            }
        }
        if(isValid) {
            save({
                lppPersonId: this.selectedLppPerson, 
                fiscalYear: this.selectedGrantFiscalYear,
                lppPlan: this.lppPlanPercent,
                llti: this.lltiValue,
                comment: this.comment,
                selectedReason: this.selectedReason
            }).then(data => {

                this.resetNewModel();
                this.template.querySelector('.modalNew').hide();
                this.reloadTable();
                this[NavigationMixin.GenerateUrl]({
                    type: "standard__recordPage",
                    attributes: {
                        recordId: data.Id,
                        objectApiName: 'Incentive_Program__c',
                        actionName: 'view'
                    }
                }).then(url => {
                    window.open(url, "_blank");
                });
            }).catch(err => {
                const errorMessage = err.body.message;
                this.showSpinner = false;
                if(errorMessage.includes("DUPLICATE_VALUE")){
                    this.handleError('The new record was not created. The participant has an existing record. Please use the search or adjust your filters to find the user and update the incentive plan.');
                }else if(errorMessage.includes("TRANSFER_REQUIRES_READ")){
                    this.handleError("The chosen participant lacks the necessary access to possess an incentive program record.");
                }else if(errorMessage.includes("CANNOT_EXECUTE_FLOW_TRIGGER")){
                    this.handleError("An error occurred during the validation process of the user's talent profile and its associated records due to data discrepancies. Please submit a Help Hub ticket to the System Administrator to correct.");
                }else{
                    this.handleError(errorMessage); 
                }
            });
        } else {
            this.showSpinner = false;
        }
    }

    handleError(error) {
        try {
            toastError(this, 'Error', error);
        } catch (err) {
            console.error(err);
        }
    }

}