// तुमची गुगल ॲप्स स्क्रिप्ट URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbyXqhQWTfi_Ca90AnAP0oDa0WEwSaqpW6Wbqq3514YKBgl1He2LJzMTNU8kK2oGbOy0kA/exec"; 

let masterData = [];

window.onload = async () => {
    document.getElementById('activityForm').action = GAS_URL;

    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        
        if(data.status === "success") {
            masterData = data.studentsData; 
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
    activities.forEach(act => select.innerHTML += `<option value="${act[1]}">${act[1]}</option>`);
}

function populateClasses() {
    const classSelect = document.getElementById('classSelect');
    const classes = [...new Set(masterData.map(item => item[0]))]; 
    classes.forEach(cls => classSelect.innerHTML += `<option value="${cls}">${cls}</option>`);
}

document.getElementById('classSelect').addEventListener('change', function() {
    const selectedClass = this.value;
    const sectionSelect = document.getElementById('sectionSelect');
    sectionSelect.innerHTML = '<option value="">-- निवडा --</option>';
    document.getElementById('studentSelect').innerHTML = '<option value="">-- निवडा --</option>';
    
    const sections = [...new Set(masterData.filter(item => item[0] == selectedClass).map(item => item[1]))];
    sections.forEach(sec => sectionSelect.innerHTML += `<option value="${sec}">${sec}</option>`);
});

document.getElementById('sectionSelect').addEventListener('change', function() {
    const selectedClass = document.getElementById('classSelect').value;
    const selectedSection = this.value;
    const studentSelect = document.getElementById('studentSelect');
    studentSelect.innerHTML = '<option value="">-- निवडा --</option>';
    
    const students = masterData.filter(item => item[0] == selectedClass && item[1] == selectedSection);
    students.forEach(std => studentSelect.innerHTML += `<option value="${std[2]}|${std[3]}">${std[2]} - ${std[3]}</option>`);
});

// फाईल साईझ तपासणे
document.getElementById('mediaFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileStatus = document.getElementById('fileStatus');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSize) {
        fileStatus.style.color = "red";
        fileStatus.innerText = `त्रुटी: फाईल ${fileSizeMB} MB आहे. ५० MB पेक्षा मोठी फाईल चालणार नाही.`;
        this.value = ""; 
        uploadBtn.disabled = true;
    } else {
        fileStatus.style.color = "green";
        fileStatus.innerText = `फाईल ओके: ${file.name} (${fileSizeMB} MB)`;
        uploadBtn.disabled = false;
    }
});

// फॉर्म सबमिट करताना युजरला सांगणे
document.getElementById('activityForm').addEventListener('submit', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.innerText = "अपलोड होत आहे, कृपया थांबा...";
    uploadBtn.style.background = "#ff9800";
    // बटण disabled करत नाही, कारण फॉर्म खरोखर सबमिट व्हायचा आहे.
});
