let mediaRecorder;
let recordedChunks = [];
let stream;

const videoPreview = document.getElementById('videoPreview');
const startCameraBtn = document.getElementById('startCameraBtn');
const startRecordBtn = document.getElementById('startRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const takePhotoBtn = document.getElementById('takePhotoBtn');
const uploadBtn = document.getElementById('uploadBtn');
const recordingStatus = document.getElementById('recordingStatus');

startCameraBtn.addEventListener('click', async () => {
    try {
        // Low resolution constraints to save Google Drive Space
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
            audio: true 
        });
        videoPreview.srcObject = stream;
        
        startRecordBtn.disabled = false;
        takePhotoBtn.disabled = false;
        startCameraBtn.disabled = true;
    } catch (error) {
        alert("कॅमेरा सुरू करण्यात अडचण. परवानग्या तपासा.");
    }
});

startRecordBtn.addEventListener('click', () => {
    recordedChunks = [];
    // Lower bits per second for low size file
    const options = { mimeType: 'video/webm;codecs=vp8,opus', videoBitsPerSecond: 250000 };
    
    try {
        mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
        mediaRecorder = new MediaRecorder(stream); // Fallback for browsers not supporting specific options
    }

    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const base64 = await convertBlobToBase64(blob);
        
        window.recordedFileData = {
            base64: base64.split(',')[1],
            mimeType: 'video/webm',
            extension: '.webm'
        };
        
        recordingStatus.innerText = "व्हिडिओ रेकॉर्ड झाला. अपलोड करण्यासाठी तयार.";
        uploadBtn.disabled = false;
    };

    mediaRecorder.start();
    startRecordBtn.disabled = true;
    stopRecordBtn.disabled = false;
    recordingStatus.innerText = "रेकॉर्डिंग सुरू आहे... (लाल बिंदू)";
});

stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    recordingStatus.innerText = "रेकॉर्डिंग थांबवले. प्रोसेस करत आहे...";
});

takePhotoBtn.addEventListener('click', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoPreview.videoWidth;
    canvas.height = videoPreview.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
    
    // Lower quality JPEG (0.7) to save space
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
    
    window.recordedFileData = {
        base64: dataUrl.split(',')[1],
        mimeType: 'image/jpeg',
        extension: '.jpg'
    };

    recordingStatus.innerText = "फोटो काढला. अपलोड करण्यासाठी तयार.";
    uploadBtn.disabled = false;
});

function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}
