/**************************************************************************************
Name: TMS_Priority_TriggerHandler
Version: 1.0 
Created Date: 11/3/2020
Function: Priority Trigger Handler

Modification Log:
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -
* Developer         Date            Description
* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --                  
* Lance Johnson     11/3/2020       Original Version
* Jignesh Suvarna	06/21/2021		US6228 - setTalentProfileId() Priorities relationship with Talent Profile
* Lance Johnson     10/6/2021       US-0006632 - Delete Related Share Records When Priorities are Deleted
* Wiktor Dyngosz    25/4/2022       US-0006792 - Move Priority Process Builder logic to Priority Trigger
*************************************************************************************/

public without sharing class TMS_Priority_TriggerHandler {

    private static Boolean run = true;

    public static void onBeforeInsert(List<TMS_Priority__c> newRecords) {
        setTalentProfileId(newRecords);
        checkGlobalGradeForLPP(newRecords);
        setPriorityCreationRecordType(newRecords);
        setPriorityInProgressStatus(newRecords);
        setPriorityAccomplishedStatus(newRecords);
    }

    public static void onAfterInsert(List<TMS_Priority__c> newRecords) {
        shareWithCareerTeamMembers(newRecords);
        runPrioritySharingFlow(newRecords);
        createActionCenterTask(newRecords);
        //startAECAggregation(newRecords);
        createAnnualTalentConversationPriorty(newRecords);

    }

    public static void onBeforeUpdate(Map<Id, TMS_Priority__c> newRecords, Map<Id, TMS_Priority__c> oldRecords) {
        checkGlobalGradeForLPP(newRecords.values());
        setPriorityInProgressStatus(newRecords.values());
        setPriorityAccomplishedStatus(newRecords.values());
    }

    public static void onAfterUpdate(Map<Id, TMS_Priority__c> newRecords, Map<Id, TMS_Priority__c> oldRecords) {
        shareWithCareerTeamMembers(newRecords.values());
        //startAECAggregation(newRecords.values());
        updateAnnualTalentConversationPriorty(newRecords);
    }

    public static void onAfterDelete(Map<Id, TMS_Priority__c> oldRecords) {
        removeRelatedShareRecords(oldRecords);
    }

    public static void createActionCenterTask(List<TMS_Priority__c> newRecords) {
        List<Task> tasksToCreate = new List<Task>();
        Map<String, User> talentProfileWithUserIdMap = createTalentProfileWithUserMap(newRecords);
        Map<Id, User> userIdWithFieldsMap = createUserIdMap(newRecords);
        
        /*share priority record  */
        List<TMS_Priority__Share> priorityShareList = new List<TMS_Priority__Share>();
        Map<String, Schema.RecordTypeInfo> taskRecordTypesByDeveloperName = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName();
        Map<String, String> priorityCreatorWithTalentProfileMap = createPriorityCreatorWithTalentProfileMap(newRecords);
        // TODO
        List<Messaging.SingleEmailMessage> emailsToSend = new List<Messaging.SingleEmailMessage>();
        EmailTemplate emailTemplate = TMS_EmailNotificationUtils.getEmailTemplateDetails('TMS_Priority_Manager_Assigned_Notificat');
        List<OrgWideEmailAddress> orgWideEmailAddresses = [SELECT Id 
                                                                FROM OrgWideEmailAddress 
                                                                WHERE Address = :TriggerUtil.ORG_WIDE_EMAIL 
                                                                LIMIT 1];

        for (TMS_Priority__c priority : newRecords) {
            if (priority.TMS_Owner__c != priorityCreatorWithTalentProfileMap.get(priority.CreatedById)) {
                Task actionTask = new Task();
                actionTask.ActivityDate = Date.today();
                actionTask.Description = userIdWithFieldsMap.get(priority.CreatedById).FirstName + ' ' + userIdWithFieldsMap.get(priority.CreatedById).LastName + ' has assigned you a priority called ' + priority.Name + '. Click here to take a look.';
                actionTask.Navigate_to_Related_Record__c = true;
                actionTask.Notification_Type__c = 'Priority Assignment';
                actionTask.OwnerId = talentProfileWithUserIdMap.get(priority.TMS_Owner__c)?.Id;
                actionTask.RecordTypeId = taskRecordTypesByDeveloperName.get('Notification').getRecordTypeId();
                actionTask.Requestor__c = priority.CreatedById;
                actionTask.Subject = 'Your manager has assigned you a priority';
                actionTask.Type = 'Notification';
                actionTask.WhatId = priority.Id;

                tasksToCreate.add(actionTask);

                // TODO
                if(talentProfileWithUserIdMap.get(priority.TMS_Owner__c)?.Receive_e3_Emails__c ==  true){
                    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                    mail = createEmailMessage(  emailTemplate.Id, 
                                                orgWideEmailAddresses.get(0)?.Id, 
                                                talentProfileWithUserIdMap.get(priority.TMS_Owner__c)?.Id,
                                                priority.Id);
                    emailsToSend.add(mail);
                }

                /* US-0009692 Share priority record with createdby User */
                TMS_Priority__Share shareRec = new TMS_Priority__Share();
                shareRec.ParentId = priority.Id;
                shareRec.AccessLevel = 'Read';
                shareRec.RowCause = 'TMS_CareerTeamSharing__c';
                shareRec.UserOrGroupId = userIdWithFieldsMap.get(priority.CreatedById).Id;
                priorityShareList.add(shareRec);
            }
        }

        if (tasksToCreate.size() > 0) {
            insert tasksToCreate;
        }

        if(priorityShareList.size() > 0){
            insert priorityShareList;
        }
        
        if(!Test.isRunningTest()){
            if(emailsToSend.isEmpty() == false){
                Messaging.sendEmail(emailsToSend);
            }
        }
    }

    // TODO
    private static Messaging.SingleEmailMessage createEmailMessage(Id templateId, Id orgWideAddressId, Id emailReceipientId, Id recordId){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setTemplateId(templateId);
        mail.setOrgWideEmailAddressId(orgWideAddressId);
        mail.setTargetObjectId(emailReceipientId);
        mail.setSaveAsActivity(false);
        mail.setWhatId(recordId);
        
        return mail;
    }

    public static Map<String, String> createPriorityCreatorWithTalentProfileMap(List<TMS_Priority__c> priorities) {
        Map<String, String> priorityCreatorWithTalentProfileMap = new Map<String, String>();
        Set<String> userIds = new Set<String>();

        for (TMS_Priority__c priority : priorities) {
            userIds.add(priority.CreatedById);
        }

        List<TMS_Talent_Profile__c> talentProfiles = [SELECT Id, TMS_User__c FROM TMS_Talent_Profile__c WHERE TMS_User__c IN :userIds];
        for (TMS_Talent_Profile__c talentProfile : talentProfiles) {
            priorityCreatorWithTalentProfileMap.put(talentProfile.TMS_User__c, talentProfile.Id);
        }

        return priorityCreatorWithTalentProfileMap;
    }

    public static Map<String, User> createTalentProfileWithUserMap(List<TMS_Priority__c> priorities) {
        Map<String, User> talentProfileWithUserMap = new Map<String, User>();
        Set<String> talentProfileIds = new Set<String>();
        for (TMS_Priority__c priority : priorities) {
            talentProfileIds.add(priority.TMS_Owner__c);
        }
        List<TMS_Talent_Profile__c> talentProfiles = [SELECT Id, TMS_User__c, TMS_User__r.Receive_e3_Emails__c FROM TMS_Talent_Profile__c WHERE Id IN :talentProfileIds];
        for (TMS_Talent_Profile__c talentProfile : talentProfiles) {
            talentProfileWithUserMap.put(talentProfile.Id, talentProfile.TMS_User__r);
        }

        return talentProfileWithUserMap;
    }

    public static Map<Id, User> createUserIdMap(List<TMS_Priority__c> priorities) {
        Map<Id, User> userIdWithFieldsMap = new Map<Id, User>();
        Set<String> relatedUserIds = new Set<String>();
        for (TMS_Priority__c priority : priorities) {
            relatedUserIds.add(priority.CreatedById);
        }
        List<User> relatedUsers = [SELECT Id, FirstName, LastName FROM User WHERE Id IN:relatedUserIds];
        for (User relatedUser : relatedUsers) {
            userIdWithFieldsMap.put(relatedUser.Id, relatedUser);
        }

        return userIdWithFieldsMap;
    }

    // public static void startAECAggregation(List<TMS_Priority__c> newRecords) {
    //     for (TMS_Priority__c priority : newRecords) {
    //         if (runOnce()) {
    //             if (priority.TMS_Is_Priority_Ready_for_ATC__c == true) {
    //                 Map<String, Object> variables = new Map<String, Object>();
    //                 variables.put('RecipientId', priority.TMS_Owner__c);
    //                 variables.put('PriorityRecordId', priority.Id);
    //                 Flow.Interview.TMS_Priority_Update_ATC_lookup priorityUpdateATCFlow =
    //                         new Flow.Interview.TMS_Priority_Update_ATC_lookup(variables);
    //                 priorityUpdateATCFlow.start();
    //             }
    //         }
    //     }
    // }

    public static void setPriorityAccomplishedStatus(List<TMS_Priority__c> newRecords) {

        Map<String, Schema.RecordTypeInfo> priorityRecordTypesByDeveloperName = Schema.SObjectType.TMS_Priority__c.getRecordTypeInfosByDeveloperName();
        for (TMS_Priority__c priority : newRecords) {
            if (priority.TMS_Priority_Status__c == 'TMS_Accomplished') {
                // Commenting it out as a part of EPIC : E0000494 
                // https://jacobs1.lightning.force.com/lightning/r/copado__Epic__c/a2k3f000000PGUTAA4/view
                // if (priority.TMS_Priority_Accomplished_Date__c == null) {
                //     priority.TMS_Priority_Accomplished_Date__c = Date.today();
                // }

                if (priority.TMS_Type__c == 'Development Activity') {
                    priority.RecordTypeId = priorityRecordTypesByDeveloperName.get('TMS_Development_Activity_Accomplished').getRecordTypeId();
                } else {
                    priority.RecordTypeId = priorityRecordTypesByDeveloperName.get('TMS_Accomplished').getRecordTypeId();
                }
            }
        }
    }

    public static void setPriorityInProgressStatus(List<TMS_Priority__c> newRecords) {
        Map<String, Schema.RecordTypeInfo> priorityRecordTypesByDeveloperName = Schema.SObjectType.TMS_Priority__c.getRecordTypeInfosByDeveloperName();
        for (TMS_Priority__c priority : newRecords) {
            if (priority.TMS_Priority_Status__c == 'TMS_InProgress' && priority.TMS_Type__c == 'Development Activity') {
                priority.RecordTypeId = priorityRecordTypesByDeveloperName.get('TMS_Development_Activity_In_Progress').getRecordTypeId();
            }
        }
    }

    public static void setPriorityCreationRecordType(List<TMS_Priority__c> newRecords) {
        Map<String, Schema.RecordTypeInfo> priorityRecordTypesByDeveloperName = Schema.SObjectType.TMS_Priority__c.getRecordTypeInfosByDeveloperName();
        for (TMS_Priority__c priority : newRecords) {

        //            This logic was previously used to not change the record type of Priority from TMS_Assign_Priority to TMS_Priority_Creation
        //            if (priority.TMS_Type__c != 'Development Activity' && priority.OwnerId != null && priority.RecordTypeId != priorityRecordTypesByDeveloperName.get('TMS_Assign_Priority').getRecordTypeId()) {

            if (priority.TMS_Type__c != 'Development Activity' && priority.OwnerId != null) {
                priority.RecordTypeId = priorityRecordTypesByDeveloperName.get('TMS_Priority_Creation').getRecordTypeId();
            }
        }
    }

    public static void runPrioritySharingFlow(List<TMS_Priority__c> newRecords) {
        for (TMS_Priority__c priority : newRecords) {
            if (priority.OwnerId != null) {
                Map<String, Object> variables = new Map<String, Object>();
                variables.put('PriorityId', priority.Id);
                variables.put('EmployeeManagerGroupName', 'ManagerUp_' + (Id) priority.OwnerId);
                Flow.Interview.TMS_Priority_Sharing_with_Manager_Group prioritySharingWithManagerGroupFlow =
                        new Flow.Interview.TMS_Priority_Sharing_with_Manager_Group(variables);
                prioritySharingWithManagerGroupFlow.start();
            }
        }

    }

    public static void setTalentProfileId(List<TMS_Priority__c> newRecords) {
        Map<String, Schema.RecordTypeInfo> priorityRecordTypesByDeveloperName = Schema.SObjectType.TMS_Priority__c.getRecordTypeInfosByDeveloperName();
        Id priorityRecType = priorityRecordTypesByDeveloperName.get('TMS_Assign_Priority').getRecordTypeId();
        Set<Id> priorityOwnerIds = new Set<Id>();
        for (TMS_Priority__c p : newRecords) {
            priorityOwnerIds.add(p.OwnerId);
        }
        // get OwnerID and Talent Profile IDs Map
        Map<Id, ID> mapOwnerIds = TMS_TalentProfileUtils.getTalentProfileIDMap(priorityOwnerIds);
        //Set Talent Profile based on priority owner
        for (TMS_Priority__c p : newRecords) {

            if (p.RecordTypeId == priorityRecType) {
                p.OwnerId = p.TMS_Owner_User_Id__c;

            } else {

                p.TMS_Owner__c = mapOwnerIds.get(p.OwnerId);
            }
        }
    }

    public static void checkGlobalGradeForLPP(List<TMS_Priority__c> newRecords) {
        User currentUser = [
                SELECT
                        Id,
                        Profile.Name
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
        ];

        Set<Id> priorityOwnerIds = new Set<Id>();

        for (TMS_Priority__c p : newRecords) {
            //priorityOwnerIds.add(p.OwnerId);
            priorityOwnerIds.add(p.TMS_Owner__c);
        }

        Map<Id, TMS_Talent_Profile__c> lppProfilesMap = new Map<Id, TMS_Talent_Profile__c>();

        for (TMS_Talent_Profile__c t : [
                SELECT
                        Id,
                        TMS_User__c,
                        TMS_User__r.Profile.Name,
                        TMS_Personal_Detail__r.TMS_Employment_Detail__r.TMS_GCS_Global_Grade__c
                FROM TMS_Talent_Profile__c
//                WHERE TMS_User__r.IsActive = true
        //            AND TMS_Personal_Detail__r.TMS_Employment_Detail__r.TMS_GCS_Global_Grade__c != NULL
                //AND TMS_User__c IN :priorityOwnerIds
                WHERE ID IN :priorityOwnerIds
        ]) {
            //lppProfilesMap.put(t.TMS_User__c, t);
            lppProfilesMap.put(t.ID, t);
        }


        for (TMS_Priority__c p : newRecords) {

            String ownerGlobalGrade = lppProfilesMap.get(p.TMS_Owner__c).TMS_Personal_Detail__r.TMS_Employment_Detail__r.TMS_GCS_Global_Grade__c;
            List<String> TMSLPPGlobalGradesList = Label.TMSLPPGlobalGrades.split(',');

            if ((!lppProfilesMap.containsKey(p.TMS_Owner__c) || ownerGlobalGrade == null
                    || !(TMSLPPGlobalGradesList).contains(ownerGlobalGrade)) &&
                    p.TMS_Alignment__c.contains(Label.TMSLppPriorityAlignmentCommonValue) &&
                    currentUser.Profile.Name != 'System Administrator') {
                p.addError(Label.TMSCheckGlobalGradeForLPPError);

            } else if ((!lppProfilesMap.containsKey(p.TMS_Owner__c) || ownerGlobalGrade == null
                    || !(TMSLPPGlobalGradesList).contains(ownerGlobalGrade)) &&
                    !p.TMS_Alignment__c.contains(Label.TMSLppPriorityAlignmentCommonValue) &&
                    currentUser.Profile.Name != 'System Administrator') {
                p.TMS_LPP_VP_Plus__c = false;

            } else if (lppProfilesMap.containsKey(p.TMS_Owner__c)) {
                p.TMS_LPP_VP_Plus__c = true;
            }
        }
    }

    public static void shareWithCareerTeamMembers(List<TMS_Priority__c> newRecords) {
        List<TMS_Priority__c> prioritiesToShare = new List<TMS_Priority__c>();

        for (TMS_Priority__c p : newRecords) {
            if (p.TMS_Priority_Status__c != 'TMS_Draft') {
                prioritiesToShare.add(p);
            }
        }

        TMS_CareerTeamMemberHelper.shareWithCareerTeamMembers('TMS_Priority__c', 'TMS_Owner__c', prioritiesToShare, true);
    }

    public static void removeRelatedShareRecords(Map<Id, TMS_Priority__c> oldRecords) {
        List<TMS_Related_Records_Share__c> relatedShareRecordsToDelete = [
                SELECT
                        Id
                FROM TMS_Related_Records_Share__c
                WHERE Related_Record_ID__c IN :oldRecords.keySet()
        ];

        if (relatedShareRecordsToDelete.size() > 0) {
            delete relatedShareRecordsToDelete;
        }
    }

    // Create ATCP when Priority is created
    private static void createAnnualTalentConversationPriorty(List<TMS_Priority__c> newRecords){
        List<TMS_Annual_Conversation_Priority__c> annualTalentConversationPriorities = new List<TMS_Annual_Conversation_Priority__c>(); // for Insert
        Map<Id, Id> talentProfileIdToAnnualTalentConversationId = new Map<Id, Id>();
        Set<Id> priorityIds = new Set<Id>();
        
        // Create child ATCP records
        for(TMS_Priority__c priority : newRecords){
            priorityIds.add(priority.Id);
        }

        talentProfileIdToAnnualTalentConversationId = getTalentToCurrentAnnualTalentConversationRecord(priorityIds);

        // Create child ATCP records
        for(TMS_Priority__c priority : newRecords){
            TMS_Annual_Conversation_Priority__c annualConversationPriority = new TMS_Annual_Conversation_Priority__c();
            if(priority.TMS_Priority_Status__c != 'TMS_Draft'){
                annualConversationPriority.TMS_Annual_Talent_Conversation__c = talentProfileIdToAnnualTalentConversationId.get(priority.TMS_Owner__c);
            }
            annualConversationPriority.Priority__c = priority.Id;
            annualConversationPriority.TMS_Status__c = priority.TMS_Priority_Status__c;
            annualTalentConversationPriorities.add(annualConversationPriority);
        }

        insert annualTalentConversationPriorities;
    }

    // When Priority is updated.
    private static void updateAnnualTalentConversationPriorty(Map<Id, TMS_Priority__c> newRecords){
        List<TMS_Annual_Conversation_Priority__c> annualTalentConversationPriorities = new List<TMS_Annual_Conversation_Priority__c>(); // for update
        Map<Id, Id> talentProfileIdToAnnualTalentConversationIdOfCurrentYear = new Map<Id, Id>(); // Talent ID to ATC ID Current Year
        talentProfileIdToAnnualTalentConversationIdOfCurrentYear = getTalentToCurrentAnnualTalentConversationRecord(newRecords.keySet());
        Map<Id, TMS_Annual_Conversation_Priority__c> priorityIdToAnnualTalentConversationPriorityId = new Map<Id, TMS_Annual_Conversation_Priority__c>(); // Priority ID to Last Created ATCP
        priorityIdToAnnualTalentConversationPriorityId = getPriorityIdToAnnualTalentConversationPriorityId(newRecords.keySet());

        // Create child ATCP records
        for(TMS_Priority__c priority : newRecords.values()){
            TMS_Annual_Conversation_Priority__c annualConversationPriority = new TMS_Annual_Conversation_Priority__c();
            annualConversationPriority = priorityIdToAnnualTalentConversationPriorityId.get(priority.ID);
            if (annualConversationPriority != null) {
                // When ATC is not created yet, UPDATE the Status
                if(annualConversationPriority.TMS_Annual_Talent_Conversation__c == null){
                    annualConversationPriority.TMS_Status__c = priority.TMS_Priority_Status__c;
                    if(priority.TMS_Priority_Status__c != 'TMS_Draft'){
                        annualConversationPriority.TMS_Annual_Talent_Conversation__c = talentProfileIdToAnnualTalentConversationIdOfCurrentYear.get(priority.TMS_Owner__c);
                    }
                }// When ATC is created but not closed, UPDATE the Status
                else if(annualConversationPriority.TMS_Annual_Talent_Conversation__r.TMS_Is_ATC_Ready_for_Aggregation__c == true){
                    annualConversationPriority.TMS_Status__c = priority.TMS_Priority_Status__c;
                }
                // else{ // For Past ATCs, CREATE a new ATCP
                //     annualConversationPriority.Id = null;
                //     annualConversationPriority.TMS_Annual_Talent_Conversation__c = talentProfileIdToAnnualTalentConversationIdOfCurrentYear.get(priority.TMS_Owner__c);
                //     annualConversationPriority.Priority__c = priority.Id;
                //     annualConversationPriority.TMS_Status__c = priority.TMS_Priority_Status__c;
                // }
                annualTalentConversationPriorities.add(annualConversationPriority);
            }
        }

        //upsert annualTalentConversationPriorities; // Create and Update ATCP record
        update annualTalentConversationPriorities;
    }

    // helps to get the Current Annual Talent Conversation Record
    private static map<Id, Id> getTalentToCurrentAnnualTalentConversationRecord(Set<Id> priorityIds){
        String currentYear = String.valueOf(Date.today().year());
        Set<Id> thesePriorityOwners = new Set<Id>();    //added by dladek 30-aug-22
        Map<ID, ID> talentProfileIdToAnnualTalentConversationId = new Map<ID, ID>();
        for(TMS_Priority__c priority : [SELECT ID, TMS_Owner__c FROM TMS_Priority__c WHERE ID IN :priorityIds] ){
            talentProfileIdToAnnualTalentConversationId.put(priority.TMS_Owner__c ,  Null);
            thesePriorityOwners.add(priority.TMS_Owner__c);  //added by dladek 30-aug-22
        }

        //added by dladek 30-aug-22 - updated this query to only return the ATCs for priroties we're interested in.
        for(TMS_Annual_Talent_Conversation__c annualTalentConversationRecord : [SELECT Id, 
                                                                                        TMS_Reviewee__c, 
                                                                                        Cycle_Year__c 
                                                                                FROM TMS_Annual_Talent_Conversation__c 
                                                                                WHERE Cycle_Year__c = :currentYear
                                                                                    AND TMS_Locked__c = False
                                                                                    AND tms_reviewee__c in :thesePriorityOwners]){  
            talentProfileIdToAnnualTalentConversationId.put(annualTalentConversationRecord.TMS_Reviewee__c, 
                                                            annualTalentConversationRecord.Id);
        }

        return talentProfileIdToAnnualTalentConversationId;
    }

    // helps to get the Last Years Annual Talent Conversation Record
    // private static map<Id, Id> getTalentLastAnnualTalentConversationRecord(List<TMS_Priority__c> priorityIds){
    //     String lastYear = String.valueOf(Date.today().year()-1);
    //     Map<ID, ID> talentProfileIdToAnnualTalentConversationId = new Map<ID, ID>();
    //     for(TMS_Priority__c priority : [SELECT ID, TMS_Owner__c FROM TMS_Priority__c WHERE ID IN :priorityIds] ){
    //         talentProfileIdToAnnualTalentConversationId.put(priority.TMS_Owner__c ,  Null);
    //     }

    //     for(TMS_Annual_Talent_Conversation__c annualTalentConversationRecord : [SELECT Id, 
    //                                                                                     TMS_Reviewee__c, 
    //                                                                                     Cycle_Year__c 
    //                                                                             FROM TMS_Annual_Talent_Conversation__c 
    //                                                                             WHERE Cycle_Year__c = :lastYear]){
    //         talentProfileIdToAnnualTalentConversationId.put(annualTalentConversationRecord.TMS_Reviewee__c, 
    //                                                         annualTalentConversationRecord.Id);
    //     }

    //     return talentProfileIdToAnnualTalentConversationId;
    // }

    // Get the list Map of Priority Record to the last created ATCP
    private static map<Id, TMS_Annual_Conversation_Priority__c> getPriorityIdToAnnualTalentConversationPriorityId(Set<Id> priorityIds){
        Map<Id, TMS_Annual_Conversation_Priority__c> priorityIdToAnnualTalentConversationPriorityId = new Map<Id, TMS_Annual_Conversation_Priority__c>();
        List<TMS_Annual_Conversation_Priority__c> annualTalentConversationPriorities = 
                                                                        new List<TMS_Annual_Conversation_Priority__c>([SELECT 
                                                                                                                        ID,
                                                                                                                        Priority__c,
                                                                                                                        TMS_Annual_Talent_Conversation__c,
                                                                                                                        TMS_Annual_Talent_Conversation__r.TMS_Is_ATC_Ready_for_Aggregation__c,
                                                                                                                        TMS_Status__c
                                                                                                                    FROM TMS_Annual_Conversation_Priority__c 
                                                                                                                    WHERE Priority__c IN :priorityIds
                                                                                                                    ORDER BY CreatedDate ASC]); // ASC so that the last record is added to the Map.

        for(TMS_Annual_Conversation_Priority__c annualConversationPriority : annualTalentConversationPriorities){
            priorityIdToAnnualTalentConversationPriorityId.put(annualConversationPriority.Priority__c, annualConversationPriority);
        }
        return priorityIdToAnnualTalentConversationPriorityId;
    }

}