# Design QA

- Compared the supplied SAP-style field reference with a browser-rendered preview of the shared discharge-planning layout.
- Expected Length of Stay remains a compact, single-line field at 160px wide.
- Expected Length of Stay is limited to 10 characters in every target template, matching the working OBG field and SAP constraint.
- Physician retains all nine discharge-needs text areas.
- Pediatric uses Medications, Diet, Level of Mobility, Pain Management, Medical Equipment, Home-Community Support Services, Clinical Appointments, and Others; Smoking Cessation is excluded because it is not exposed by the Pediatric API.
- Newborn uses Medications, Diet, Level of Mobility, Pain Management, Medical Equipment, Clinical Appointments, and Others; Home-Community Support Services and Smoking Cessation are excluded to match the Newborn API.
- The text areas expose vertical resizing and retain the horizontal label/control layout.
- Verified all four target templates: Physician admission, Physician discharge, Pediatric, and Newborn.
- Verified the read paths: Physician patches the complete response, Pediatric explicitly maps every supported discharge-planning property, and Newborn initializes the form from the fetched response.
- Angular AOT compilation and the production build pass.
- Obstetrics & Gynecology files are unchanged.

Final result: passed.
