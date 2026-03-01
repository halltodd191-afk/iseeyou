import base64

# 1x1 transparent PNG base64
png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
png_data = base64.b64decode(png_b64)

with open("/home/dev/Iseeyou/Assets.xcassets/AppIcon.appiconset/transparent_icon.png", "wb") as f:
    f.write(png_data)

print("Transparent icon generated.")
