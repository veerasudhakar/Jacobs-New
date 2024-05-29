public with sharing class contractController {
    
    
    @AuraEnabled  
    public static string saveContract(Contract contractRec, string file, string fileName) {  
      string contractId;  
      try{  
        Insert contractRec;  
        contractId = contractRec.Id;  
        String base64File = EncodingUtil.urlDecode(file, 'UTF-8');     
        ContentVersion contentVersionRec = new ContentVersion();  
        contentVersionRec.Title = fileName;  
        contentVersionRec.PathOnClient = '/' + fileName;  
        contentVersionRec.FirstPublishLocationId = contractRec.Id;  
        contentVersionRec.VersionData = EncodingUtil.base64Decode(base64File);  
        contentVersionRec.IsMajorVersion = true;  
        Insert contentVersionRec;  
      } catch(Exception ex){  
        system.debug('Exception===>'+ex.getMessage());  
      }  
      return contractId;  
    }  
}