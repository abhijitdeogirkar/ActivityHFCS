let stream;
let mediaRecorder;
let recordedChunks = [];
const videoPreview = document.getElementById('videoPreview');
const startCameraBtn = document.getElementById('startCameraBtn');
const startRecordBtn = document.getElementById('startRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const uploadBtn = document.getElementById('uploadBtn');

// १. कॅमेरा सुरू करणे
startCameraBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 }, 
            audio: true 
        });
        videoPreview.srcObject = stream;
        startRecordBtn.disabled = false;
        startCameraBtn.disabled = true;
    } catch (error) {
        alert("कॅमेरा सुरू झाला नाही. कृपया परवानग्या तपासा.");
    }
});

// २. रेकॉर्डिंग सुरू करणे
startRecordBtn.addEventListener('click', () => {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    
    mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        // बेस ६४ मध्ये रूपांतर
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            window.recordedFileData = { 
                base64: reader.result.split(',')[1], 
                mimeType: 'video/webm', 
                extension: '.webm' 
            };
            uploadBtn.disabled = false;
            alert("व्हिडिओ रेकॉर्ड झाला! आता 'अपलोड' बटण दाबा.");
        };
    };
    
    mediaRecorder.start();
    startRecordBtn.disabled = true;
    stopRecordBtn.disabled = false;
});

// ३. रेकॉर्डिंग थांबवणे
stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    stopRecordBtn.disabled = true;
    startRecordBtn.disabled = false;
});
