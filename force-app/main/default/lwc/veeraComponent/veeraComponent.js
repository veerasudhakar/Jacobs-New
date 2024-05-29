import { LightningElement,api} from 'lwc';

export default class VeeraComponent extends LightningElement {

    // @api recordId;
    // currentStep = 1;
    // renderlast = false;
    // @api renderPage;
    
    // connectedCallback(){
    //     if(this.renderPage != '' && this.renderPage){
    //        this.currentStep = this.renderPage; 
    //     }
    // }

    // get isSiteDetails() {
    //     return this.currentStep === 1;
    // }

    // get isHazard() {
    //     return this.currentStep === 2;
    // }

    // get isGenService() {
    //     return this.currentStep === 3;
    // }

    // get isServiceLocation() {
    //     return this.currentStep === 4;
    // }

    // get isSitePlan() {
    //     return this.currentStep === 5;
    // }
    // get isConfirmation() {
    //     return this.currentStep === 6;
    // }
    // handleSiteDetails(event){ 
    //     this.currentStep = 2;
    // }
    // //to be called from Hazard last page
    // handleHazard(event){
    //     if(event.detail.forward){
    //         this.currentStep = 3;
    //     }else{
    //         this.currentStep = 1;
    //     }
    // }
    // handleGenService(event){
        
    //     if(event.detail.forward){
    //        //Update step four for service location
    //        this.currentStep = 4;
    //     }
    //     else{
           
    //         //this.renderlast = true;
    //         this.currentStep = 2;
           
    //     }
    // }
    // handleServiceLocation(event){
    //     if(event.detail.forward){
    //         //Update step four for service location
    //         this.currentStep = 5;
    //      }
    //      else{
            
    //          //this.renderlast = true;
    //          this.currentStep = 3;
            
    //      }
    // }
    // handleSitePlan(event) {
    //     if(event.detail.forward){
    //         this.currentStep = 6;
    //     }
    //     else{
    //         this.currentStep = 4
    //     }
    // }
    // handleConfirmation(event) {
    //     if(!event.detail.forward){
    //         this.currentStep = 5
    //     }
        
    // }
}