
export const dashboard = {
    nursingDashboardRefreshTime :60000,
    OutPatientNursingRefreshTIme:60000
};
export const APIURL = {
    getApiUrl: (Erdat: string, datetime: string) => {
        return `http://localhost:6052/e-prescription/ExceptCheckedOut?einri=1000&Erdat=${Erdat}&datetime=${datetime}&Clinic=CAROPAMC,FAMMDAMC&AttendPhy=9000000000`;
    },
    nursingDashboardApi:'http://localhost:6052/emergencyListCheckInSet'
}



