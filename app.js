// तुमची गुगल ॲप्स स्क्रिप्ट URL येथे टाका
const GAS_URL = "https://script.google.com/macros/s/AKfycbyXqhQWTfi_Ca90AnAP0oDa0WEwSaqpW6Wbqq3514YKBgl1He2LJzMTNU8kK2oGbOy0kA/exec"; 

let masterData = [];

window.onload = async () => {
    // फॉर्मची ॲक्शन URL सेट करणे
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

// ... (तुमचे जुने populateActivities, populateClasses आणि dropdown change event चे फंक्शन इथे तसेच राहू द्या) ...

// फाईल साईझ तपासणे
document.getElementById('mediaFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileStatus = document.getElementById('fileStatus');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (!file) {
        fileStatus.innerText = "";
        return;
    }

    // ५० MB ची मर्यादा (50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024; 
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSize) {
        fileStatus.style.color = "red";
        fileStatus.innerText = `त्रुटी: फाईलची साईझ ${fileSizeMB} MB आहे. ५० MB पेक्षा मोठी फाईल गुगल सर्व्हर स्वीकारत नाही.`;
        this.value = ""; // फाईल काढून टाकणे
        uploadBtn.disabled = true;
    } else {
        fileStatus.style.color = "green";
        fileStatus.innerText = `निवडलेली फाईल: ${file.name} (${fileSizeMB} MB)`;
        uploadBtn.disabled = false;
    }
});

// अपलोड बटण दाबल्यवर UI बदलणे
document.getElementById('activityForm').addEventListener('submit', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.innerText = "अपलोड होत आहे... कृपया ॲप बंद करू नका.";
    uploadBtn.style.background = "#ff9800"; // Orange color while uploading
    uploadBtn.disabled = true;
});

// गुगल स्क्रिप्टकडून आलेला रिस्पॉन्स ऐकणे (iFrame Communication)
window.addEventListener("message", function(event) {
    const uploadBtn = document.getElementById('uploadBtn');
    
    if(event.data && event.data.status === 'success') {
        alert("अपलोड यशस्वी! फाईल ड्राईव्हमध्ये सेव्ह झाली आणि एन्ट्री नोंदवली गेली.");
        uploadBtn.innerText = "अपलोड आणि सेंड करा";
        uploadBtn.style.background = "#007bff";
        uploadBtn.disabled = false;
        document.getElementById('activityForm').reset();
        document.getElementById('fileStatus').innerText = "";
    } else if(event.data && event.data.status === 'error') {
        alert("त्रुटी: " + event.data.message);
        uploadBtn.innerText = "अपलोड फेल. पुन्हा प्रयत्न करा";
        uploadBtn.style.background = "red";
        uploadBtn.disabled = false;
    }
});
