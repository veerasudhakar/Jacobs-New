import LightningDatatable from 'lightning/datatable';
import skillsUserImage from './tmsImageCell.html';
import picklistCmp from './tmsPicklistCell.html';
import picklistEditCmp from './tmsPicklistCellEdit.html';
import percentCmp from './tmsPercentCmp.html';
import percentEditCmp from './tmsPercentEditCmp.html';

export default class TmsCustomDatatable extends LightningDatatable  {

    static customTypes = {
        image: {
            template: skillsUserImage,
            typeAttributes: ['userImgSrc', 'userName', 'talentId']
        },
        picklistType: {
            template: picklistCmp,
            editTemplate: picklistEditCmp,
            standardCellLayout: true,
            typeAttributes: ['options']
        },
        percentFixed: {
            template: percentCmp,
            editTemplate: percentEditCmp,
            standardCellLayout: true,
            typeAttributes: ['value']
        }
    }

}