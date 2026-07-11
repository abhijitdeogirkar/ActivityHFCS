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

// Upload Logic
document.getElementById('uploadBtn').addEventListener('click', async () => {
    if(!window.recordedFileData) {
        alert("कृपया आधी व्हिडिओ रेकॉर्ड करा किंवा फोटो काढा.");
        return;
    }

    const activity = document.getElementById('activity').value;
    const cls = document.getElementById('classSelect').value;
    const sec = document.getElementById('sectionSelect').value;
    const studentVal = document.getElementById('studentSelect').value;
    const attempt = document.getElementById('attempt').value;

    if(!activity || !cls || !sec || !studentVal) {
        alert("सर्व माहिती भरणे आवश्यक आहे.");
        return;
    }

    const [rollNo, studentName] = studentVal.split('|');
    const uploadStatus = document.getElementById('uploadStatus');
    
    uploadStatus.innerText = "अपलोड सुरू आहे... कृपया प्रतीक्षा करा.";
    document.getElementById('uploadBtn').disabled = true;

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
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if(result.status === "success") {
            uploadStatus.style.color = "green";
            uploadStatus.innerText = "अपलोड यशस्वी! लिंक: " + result.url;
            window.recordedFileData = null; // Reset
        } else {
            uploadStatus.style.color = "red";
            uploadStatus.innerText = "त्रुटी: " + result.message;
        }
    } catch (error) {
        uploadStatus.style.color = "red";
        uploadStatus.innerText = "अपलोड फेल. पुन्हा प्रयत्न करा.";
    }
    document.getElementById('uploadBtn').disabled = false;
});
