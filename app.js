// येथे तुमची Google Apps Script Web App URL पेस्ट करा
const GAS_URL = "https://script.google.com/macros/s/AKfycbyXqhQWTfi_Ca90AnAP0oDa0WEwSaqpW6Wbqq3514YKBgl1He2LJzMTNU8kK2oGbOy0kA/exec"; 

let masterData = [];

window.onload = async () => {
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        
        if(data.status === "success") {
            masterData = data.studentsData; // Class, Section, Roll, Name
            populateActivities(data.activitiesData);
            populateClasses();
            
            document.getElementById('loader').style.display = 'none';
            document.getElementById('activityForm').style.display = 'block';
        }
    } catch (error) {
        document.getElementById('loader').innerText = "डेटा लोड करण्यात त्रुटी. इंटरनेट तपासा.";
    }
};

function populateActivities(activities) {
    const select = document.getElementById('activity');
    activities.forEach(act => {
        select.innerHTML += `<option value="${act[1]}">${act[1]}</option>`;
    });
}

function populateClasses() {
    const classSelect = document.getElementById('classSelect');
    const classes = [...new Set(masterData.map(item => item[0]))]; // Column 0 is Class
    classes.forEach(cls => {
        classSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
    });
}

document.getElementById('classSelect').addEventListener('change', function() {
    const selectedClass = this.value;
    const sectionSelect = document.getElementById('sectionSelect');
    sectionSelect.innerHTML = '<option value="">-- निवडा --</option>';
    document.getElementById('studentSelect').innerHTML = '<option value="">-- निवडा --</option>';
    
    const sections = [...new Set(masterData.filter(item => item[0] == selectedClass).map(item => item[1]))];
    sections.forEach(sec => {
        sectionSelect.innerHTML += `<option value="${sec}">${sec}</option>`;
    });
});

document.getElementById('sectionSelect').addEventListener('change', function() {
    const selectedClass = document.getElementById('classSelect').value;
    const selectedSection = this.value;
    const studentSelect = document.getElementById('studentSelect');
    studentSelect.innerHTML = '<option value="">-- निवडा --</option>';
    
    const students = masterData.filter(item => item[0] == selectedClass && item[1] == selectedSection);
    students.forEach(std => {
        studentSelect.innerHTML += `<option value="${std[2]}|${std[3]}">${std[2]} - ${std[3]}</option>`;
    });
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
    // 1. डेटा गोळा करा
    const activity = document.getElementById('activity').value;
    const cls = document.getElementById('classSelect').value;
    const sec = document.getElementById('sectionSelect').value;
    const studentVal = document.getElementById('studentSelect').value;
    const attempt = document.getElementById('attempt').value;

    // 2. व्हॅलिडेशन
    if(!activity || !cls || !sec || !studentVal) {
        alert("कृपया सर्व माहिती निवडा.");
        return;
    }

    // 3. फाईल डेटा चेक करा
    if (!window.recordedFileData || !window.recordedFileData.base64) {
        alert("फाईल रेकॉर्ड झालेली नाही!");
        return;
    }

    const [rollNo, studentName] = studentVal.split('|');
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.innerText = "अपलोड होत आहे...";
    uploadBtn.disabled = true;

    const payload = {
        activityName: activity,
        className: cls,
        sectionName: sec,
        rollNo: rollNo,
        studentName: studentName,
        attempt: attempt,
        fileBase64: window.recordedFileData.base64,
        mimeType: window.recordedFileData.mimeType,
        extension: window.recordedFileData.extension
    };

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors', // गुगल ॲप्स स्क्रिप्टसाठी कधीकधी हे लागते
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // note: no-cors मोडमध्ये रिस्पॉन्स वाचता येत नाही, म्हणून आपण फक्त सक्सेस मेसेज देऊ
        alert("डेटा सर्व्हरला पाठवला आहे!");
        uploadBtn.innerText = "अपलोड झाले!";
    } catch (error) {
        alert("त्रुटी: " + error.message);
        uploadBtn.innerText = "अपलोड आणि सेंड करा";
        uploadBtn.disabled = false;
    }
});
