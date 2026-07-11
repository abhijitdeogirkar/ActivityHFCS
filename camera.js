let stream;
let mediaRecorder;
let recordedChunks = [];
const videoPreview = document.getElementById('videoPreview');

// १. कॅमेरा सुरू करणे
document.getElementById('startCameraBtn').addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
        videoPreview.srcObject = stream;
        document.getElementById('startRecordBtn').disabled = false;
        document.getElementById('takePhotoBtn').disabled = false; // जर तुमच्या HTML मध्ये हे बटण असेल तर
    } catch (err) {
        alert("कॅमेरा सुरू झाला नाही: " + err);
    }
});

// २. व्हिडिओ रेकॉर्डिंग (Toggle Start/Stop)
document.getElementById('startRecordBtn').addEventListener('click', () => {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        window.recordedFileData = { 
            base64: await convertBlobToBase64(blob), 
            mimeType: 'video/webm', 
            extension: '.webm' 
        };
        document.getElementById('uploadBtn').disabled = false;
        alert("व्हिडिओ रेकॉर्ड झाला!");
    };
    mediaRecorder.start();
    document.getElementById('startRecordBtn').disabled = true;
    document.getElementById('stopRecordBtn').disabled = false;
});

document.getElementById('stopRecordBtn').addEventListener('click', () => {
    mediaRecorder.stop();
    document.getElementById('startRecordBtn').disabled = false;
    document.getElementById('stopRecordBtn').disabled = true;
});

// ३. फोटो काढणे (जर तुम्ही index.html मध्ये हे बटण ठेवले असेल तर)
document.getElementById('takePhotoBtn').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoPreview.videoWidth;
    canvas.height = videoPreview.videoHeight;
    canvas.getContext('2d').drawImage(videoPreview, 0, 0);
    window.recordedFileData = { 
        base64: canvas.toDataURL('image/jpeg').split(',')[1], 
        mimeType: 'image/jpeg', 
        extension: '.jpg' 
    };
    document.getElementById('uploadBtn').disabled = false;
    alert("फोटो घेतला!");
});

function convertBlobToBase64(blob) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
    });
}
