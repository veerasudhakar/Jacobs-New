public without sharing class TMS_CareerPlanningLWC {

    /*
    * @method getCareerPlanDetails()
    * @desc Return Career Plan record.
    * */
    @AuraEnabled
    public static TMS_Career_Plan__c getCareerPlanDetails(){
        try {
            List<TMS_Career_Plan__c> usersCareerPlan= new List<TMS_Career_Plan__c>([SELECT ID,
                                                                                    OwnerId,
                                                                                    TMS_Career_Aspirations__c,
                                                                                    TMS_Development_Opportunities__c,
                                                                                    TMS_Last_Discussed_Date__c,
                                                                                    TMS_Strengths__c,
                                                                                    TMS_What_matters_most_to_me__c,
                                                                                    TMS_Where_I_want_to_be__c,
                                                                                    TMS_Manager_Last_Discussed_Date__c
                                                                                    FROM TMS_Career_Plan__c 
                                                                                    WHERE OwnerId = :UserInfo.getUserId() 
                                                                                    ORDER BY CreatedDate DESC LIMIT 1 ]);
            if(usersCareerPlan.isEmpty() == false){
                return usersCareerPlan.get(0);
            }
            else{
                return new TMS_Career_Plan__c();
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    /*
    * @method getUserCareerPlanDetails()
    * @desc Return Career Plan record from userId.
    * */
    @AuraEnabled
    public static TMS_Career_Plan__c getUserCareerPlanDetails(string userId){
        try {
            userId = (userId != null && userId !='undefined' && userId !='') ? userId: UserInfo.getUserId();
            List<TMS_Career_Plan__c> usersCareerPlan= new List<TMS_Career_Plan__c>([SELECT ID,
                                                                                    OwnerId,
                                                                                    TMS_Career_Aspirations__c,
                                                                                    TMS_Development_Opportunities__c,
                                                                                    TMS_Last_Discussed_Date__c,
                                                                                    TMS_Strengths__c,
                                                                                    TMS_What_matters_most_to_me__c,
                                                                                    TMS_Where_I_want_to_be__c,
                                                                                    TMS_Manager_Last_Discussed_Date__c
                                                                                    FROM TMS_Career_Plan__c 
                                                                                    WHERE OwnerId = :userId
                                                                                    ORDER BY CreatedDate DESC LIMIT 1 ]);
            if(usersCareerPlan.isEmpty() == false){
                return usersCareerPlan.get(0);
            }
            else{
                return new TMS_Career_Plan__c();
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    /*
    * @method getTalentProfileDetails()
    * @desc Return Talent Profile record.
    * */
    @AuraEnabled
    public static TMS_Talent_Profile__c getTalentProfileDetails(){
        try {
            List<TMS_Talent_Profile__c> userTalentProfile = new List<TMS_Talent_Profile__c>([SELECT ID,
                                                                                             OwnerId,
                                                                                             TMS_User__c,
                                                                                             TMS_User__r.Name,
                                                                                             Primary_Market_Alignment__c,
                                                                                             Primary_Submarket_Alignment__c,
                                                                                             Secondary_Market_Alignment__c,
                                                                                             Secondary_Submarket_Alignment__c,
                                                                                             Market_Aspiration__c,
                                                                                             Develop_in_Current_Market__c
                                                                                             FROM TMS_Talent_Profile__c 
                                                                                             WHERE OwnerId = :UserInfo.getUserId() 
                                                                                             ORDER BY CreatedDate DESC LIMIT 1 ]);
            if(userTalentProfile.isEmpty() == false){
                return userTalentProfile.get(0);
            }
            else{
                return new TMS_Talent_Profile__c();
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    /*
    * @method getUserTalentProfileDetails()
    * @desc Return Talent Profile record.
    * */
    @AuraEnabled
    public static TMS_Talent_Profile__c getUserTalentProfileDetails(string userId){
        try {
            userId = (userId != null && userId !='undefined' && userId !='') ? userId: UserInfo.getUserId();
            List<TMS_Talent_Profile__c> userTalentProfile = new List<TMS_Talent_Profile__c>([SELECT ID,
                                                                                             OwnerId,
                                                                                             TMS_User__c,
                                                                                             TMS_User__r.Name,
                                                                                             Primary_Market_Alignment__c,
                                                                                             Primary_Submarket_Alignment__c,
                                                                                             Secondary_Market_Alignment__c,
                                                                                             Secondary_Submarket_Alignment__c,
                                                                                             Market_Aspiration__c,
                                                                                             Develop_in_Current_Market__c
                                                                                             FROM TMS_Talent_Profile__c 
                                                                                             WHERE TMS_User__c = :userId 
                                                                                             ORDER BY CreatedDate DESC LIMIT 1 ]); 
            if(userTalentProfile.isEmpty() == false){
                return userTalentProfile.get(0);     
            }
            else{
                return new TMS_Talent_Profile__c();
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    /*
    * @method updateTalentProfileDetails()
    * @desc update Talent Profile record.
    * */
    @AuraEnabled
    public static void updateTalentProfileDetails(TMS_Talent_Profile__c talentProfile) {
        
        // create savepoint to rollback if any errors occur
        Savepoint sp = Database.setSavepoint();
        
        try {
            
            if (talentProfile != null) {
                update talentProfile;
            }
            
        } catch (Exception e) {
            
            // rollback
            Database.rollback( sp );
            
            // show exception
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    
    /*
    * @method updateCareerPlanDetails()
    * @desc update Career Plan record.
    * */
    @AuraEnabled
    public static void updateCareerPlanDetails(TMS_Career_Plan__c careerPlan) {
        Id notificationRTId = Schema.SObjectType.Task.getRecordTypeInfosByName().get('Notification').getRecordTypeId();
        // create savepoint to rollback if any errors occur
        Savepoint sp = Database.setSavepoint();
        
        try {
            
            if (careerPlan != null) {
                update careerPlan;
                
                if(careerPlan.TMS_Manager_Last_Discussed_Date__c != null){
                    system.debug('in side TMS_Last_Discussed_Date__c :: ');
                List<Task> notifications = new List<Task>();
                notifications.add(new Task(
                OwnerId = careerPlan.OwnerId,
                RecordTypeId = notificationRTId,
                WhatId = careerPlan.Id,
                Requestor__c = UserInfo.getUserId(),
                Subject = 'Career Plan Discussion',
                    Description = 'Your manager is requesting you approve your Career Plan discussion date. To accept or decline this request please click the three dots to the right.',
                Type = 'Approval',
                //Notification_Type__c = 'Career Plan Request',
                ActivityDate = Date.today(),
                Help_Text__c = 'Accept or Decline here.'
                
                ));
                insert notifications;    
                }  
            }
        } catch (Exception e) {
            
            // rollback
            Database.rollback( sp );
            
            // show exception
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    
    /*
    * @method uploadCareerDocumentFile()
    * @desc Attaching files with given Record Id. 
    * */
    @AuraEnabled
    public static String uploadCareerDocumentFile(String base64, String filename, String recordId) {
        ContentVersion cv = createContentVersion(base64, filename);
        ContentDocumentLink cdl = createContentLink(cv.Id, recordId);
        if (cv == null || cdl == null) { return null; }
        return cdl.Id;
    }

    /*
    * @method createContentVersion()
    * @desc Creates a content version from a given file's base64 and name
    * */
    public static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = filename;
        cv.PathOnClient = filename;
        try {
            insert cv;
            return cv;
        } catch(DMLException e) {
            return null;
        }
    }

    /*
    * @method createContentLink() 
    * @desc Creates a content link for a given ContentVersion and record
    * */
    public static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
        if (contentVersionId == null || recordId == null) { return null; }
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [
            SELECT ContentDocumentId 
            FROM ContentVersion 
            WHERE Id =: contentVersionId
        ].ContentDocumentId;
        cdl.LinkedEntityId = recordId;
        cdl.ShareType = 'V';
        try {
            insert cdl;
            return cdl;
        } catch(DMLException e) {
            return null;
        }
    }
    
    /*
    * @method createDevelopmentActivities()
    * @desc Create Development Activity
    * */
    //
    @AuraEnabled
    public static void createDevelopmentActivities(TMS_Priority__c tmsPriority) {
        Id developmentActivityInProgressRecordTypeId = Schema.SObjectType.TMS_Priority__c.getRecordTypeInfosByName().get('Development Activity In Progress').getRecordTypeId(); 
        Id developmentActivityRecordTypeId = Schema.SObjectType.TMS_Priority__c.getRecordTypeInfosByName().get('Development Activity').getRecordTypeId();
        
        // create savepoint to rollback if any errors occur
        Savepoint sp = Database.setSavepoint();
        
        try {
            
            if (tmsPriority != null ) {
                tmsPriority.RecordTypeId = developmentActivityInProgressRecordTypeId;
          //  tmsPriority.TMS_Expected_Date_of_completion__c=expdate;
              
                insert tmsPriority;
            }
           
            
        } catch (Exception e) {
            
            // rollback
            Database.rollback( sp );
            
            // show exception
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    
    /*
    * @method deleteDevelopmentActivities()
    * @desc delete Development Activity with given Record Id.
    * */
    @AuraEnabled
    public static void deleteDevelopmentActivities(Id developmentActivitiesId){
        if(developmentActivitiesId !=null){
            TMS_Priority__c tmsPriority = [SELECT ID
                                           FROM TMS_Priority__c WHERE ID =:developmentActivitiesId];
            if(tmsPriority !=null){
                delete tmsPriority; 
            }
        }
    }
    
    /*
    * @method updateDevelopmentActivities()
    * @desc update Development Activity with given Record Id.
    * */
    @AuraEnabled
    public static void updateDevelopmentActivities(TMS_Priority__c tmsPriority) {
        
        // create savepoint to rollback if any errors occur
        Savepoint sp = Database.setSavepoint();
        
        try {
            
            if (tmsPriority != null) {
               
              //  tmsPriority.TMS_Expected_Date_of_completion__c=expdate;
              //  tmsPriority.TMS_Priority_Accomplished_Date__c=accomplisheddate;
                update tmsPriority;
            }
        } catch (Exception e) {
            
            // rollback
            Database.rollback( sp );
            
            // show exception
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    
    /*
    * @method getDevelopmentActivities()
    * @desc Return Development Activities Record.
    * */
    @AuraEnabled
    public static List<TMS_Priority__c> getDevelopmentActivities(string userId){
        userId = (userId != null && userId !='undefined' && userId !='') ? userId: UserInfo.getUserId();
        try {
            return [SELECT ID,
                    OwnerId,
                    TMS_Alignment__c,
                    Name,
                    TMS_Development_Type__c,
                    TMS_Created_for_Year__c,
                    toLabel(TMS_Priority_Status__c) PriorityStatus,
                    TMS_Priority_Status__c,
                    TMS_Expected_Date_of_completion__c,
                    LastModifiedDate,
                    TMS_Focus_elements__c,
                    TMS_Priority_Accomplished_Date__c,
                    TMS_Progress_Notes_Results__c,
                    TMS_Simple_and_Specific_Details__c
                    FROM TMS_Priority__c WHERE OwnerId = :userId 
                    AND (
                        RecordType.DeveloperName = 'Development_Activity' 
                        OR RecordType.DeveloperName = 'TMS_Development_Activity_In_Progress'
                        OR RecordType.DeveloperName = 'TMS_Development_Activity_Accomplished'
                    )  
                    ORDER BY CreatedDate DESC ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    //added this method for changing date on approval of the notification msg that goes to the employee
    public static void submitCareerPlanDocumentDate(Task action, String response, String reason) {
        if(action?.WhatId != null && action?.OwnerId != null) {
            TMS_Career_Plan__c careerPlan = [
                SELECT
                    Id,
                    TMS_Last_Discussed_Date__c,Owner.Name,
                    TMS_Manager_Last_Discussed_Date__c,OwnerId
                    FROM TMS_Career_Plan__c
                WHERE Id = :action.WhatId
            ];

            if(careerPlan != null && response == 'Accepted') {
                careerPlan.TMS_Last_Discussed_Date__c = careerPlan.TMS_Manager_Last_Discussed_Date__c;
                
                update careerPlan;               
            }
            if(careerPlan != null && response == 'Declined') {
                careerPlan.TMS_Last_Discussed_Date__c = careerPlan.TMS_Last_Discussed_Date__c;
                update careerPlan;            	  


                Id notificationRTId = Schema.SObjectType.Task.getRecordTypeInfosByName().get('Notification').getRecordTypeId();
                // create savepoint to rollback if any errors occur
                Savepoint sp = Database.setSavepoint();
                List<Task> notifications = new List<Task>();
                notifications.add(new Task(OwnerId = action.Requestor__c,RecordTypeId = notificationRTId,WhatId = careerPlan.Id,
                Subject = 'Career Plan Declined',
                Description = careerPlan.Owner.Name + ' declined your proposed date for the career plan discussion with the following response: '+reason,
                Type = 'Notification', ActivityDate = Date.today()
                //Help_Text__c = 'Accept or Decline here'               
                ));
                insert notifications;    
            
            }
            
        } 
    }
  
    
    @AuraEnabled(cacheable = true)
    public static List<FiscalYearSettings> getFiscalYears(){
        try {
            return [SELECT Id, 
                            PeriodId, 
                            StartDate, 
                            EndDate, 
                            Name,
                            Description 
                    FROM FiscalYearSettings
                    WHERE Description != Null
                        Order By StartDate ASC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}