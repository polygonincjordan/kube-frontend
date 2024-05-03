import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class PatientHistoryService {

constructor(private http: HttpClient,) { }
url = environment.url;
getPhyAssessmentDoc(json){
    return this.http.get(this.url + `patientHistory/getPhyAssessmentDoc?einri=${json.einri}&falnr=${json.falnr}`, {
      withCredentials: true,
    });
  }
  getChiefTemplate(){
    return this.http.get(this.url + `patientHistory/getChiefTemplate`, {
      withCredentials: true,
    });
  }
createPhyAssessmentDoc(json){
  return this.http.post(this.url + `patientHistory/createPhyAssessmentDoc`,json, {
    withCredentials: true,
  });
  }
updatePhyAssessmentDoc(json){
  return this.http.put(this.url + `patientHistory/updatePhyAssessmentDoc`,json, {
    withCredentials: true,
  });
} 
deletePhyAssessmentDoc(json){
  return this.http.delete(this.url + `patientHistory/deletePhyAssessmentDoc?ZdocNr=${json.ZdocNr}`, {
    withCredentials: true,
  });
}  
getDocPdf(key){
  return this.http.get(this.url + `patientHistory/getDocPdf?ZdocNr=${key}`, {
    withCredentials: true,
  });
}
// nurs assess
getNursAssessmentDoc(json){
  return this.http.get(this.url + `patientHistory/getNursAssessmentDoc?einri=${json.einri}&falnr=${json.falnr}&lfdnr=${json.lfdnr}`, {
    withCredentials: true,
  });
}
createNursAssessmentDoc(json){
  return this.http.post(this.url + `patientHistory/createNursAssessmentDoc`,json, {
    withCredentials: true,
  });
  }
updateNursAssessmentDoc(json){
  return this.http.post(this.url + `patientHistory/updateNursAssessmentDoc`,json, {
    withCredentials: true,
  });
} 
deleteNursAssessmentDoc(json){
  return this.http.delete(this.url + `patientHistory/deleteNursAssessmentDoc?ZdocNr=${json.ZdocNr}`, {
    withCredentials: true,
  });
}  
getNursDocPdf(key){
  return this.http.get(this.url + `patientHistory/getNursDocPdf?ZdocNr=${key}`, {
    withCredentials: true,
  });
}
//attachments
getAttachmentsList(){
  return this.http.get(this.url + `patientHistory/getAttachmentsList`, {
    withCredentials: true,
  });
}
createAttachmentDoc(json){
  return this.http.post(this.url + `patientHistory/createAttachmentDoc`,json, {
    withCredentials: true,
  });
}
//special notes
getSpecialNotes(json){
  return this.http.get(this.url + `patientHistory/getSpecialNotes?einri=${json.einri}&falnr=${json.falnr}`, {
    withCredentials: true,
  });
}
saveSpecialNotes(json){
  return this.http.post(this.url + `patientHistory/saveSpecialNotes`,json, {
    withCredentials: true,
  });
}
deleteSpecialNotes(json){
  return this.http.delete(this.url + `patientHistory/deleteSpecialNotes?Einri=${json.Einri}&Falnr=${json.Falnr}`, {
    withCredentials: true,
  });
}
// 
getPastMedicalHistory(json){
  return this.http.get(this.url + `patientHistory/getPastMedicalHistory?patnr=${json.patnr}`, {
    withCredentials: true,
  });
}
getProblemCatalogSet(){
  return this.http.get(this.url + `patientHistory/getProblemCatalogSet`, {
    withCredentials: true,
  });
}
deleteForPastMed(json){
  return this.http.post(this.url + `patientHistory/deleteForPastMed`,json, {
    withCredentials: true,
  });
}
savePastMedList(json){
  return this.http.post(this.url + `patientHistory/savePastMedList`,json, {
    withCredentials: true,
  });
}
// past surgical
getPastSurgicalHistory(json){
  return this.http.get(this.url + `patientHistory/getPastSurgicalHistory?patnr=${json.patnr}`, {
    withCredentials: true,
  });
}
getSurgicalCatalogSet(){
  return this.http.get(this.url + `patientHistory/getSurgicalCatalogSet`, {
    withCredentials: true,
  });
}
savePastSurList(json){
  return this.http.post(this.url + `patientHistory/savePastSurList`,json, {
    withCredentials: true,
  });
}
deleteForPastSurg(json){
  return this.http.post(this.url + `patientHistory/deleteForPastSurg`,json, {
    withCredentials: true,
  });
  }
  

  getProblemList() {
    return this.http.get(this.url + `patientHistory/getProblemList`, {
      withCredentials: true,
    });
  }

  createFamilyHistory(json) {
    return this.http.post(this.url + `patientHistory/createFamilyHistory`, json, {
      withCredentials: true,
    });
  }

  getFamilyHistory(json) {
    return this.http.get(this.url + `patientHistory/getFamilyHistory?patnr=${json.patnr}`, {
      withCredentials: true,
    });
  }
  updateFamilyHistory(json){
    return this.http.post(this.url + `patientHistory/updateFamilyHistory`, json, {
      withCredentials: true,
    });
  }
  deleteFamilyHistory(json){
    return this.http.post(this.url + `patientHistory/deleteFamilyHistory`, json, {
      withCredentials: true,
    });
  }
}
