# TURBO - Thumbdrive Unified Remote Browser Object
### A MASSO-themed, browser-based replacement for USB thumb drives

TURBO transforms a **Raspberry Pi Zero 2 W** into a **network-managed USB mass-storage device** that can upload files directly to your **MASSO CNC controller**.

It uses:

- FileBrowser Quantum (FBQ) for a clean web interface
- Custom scripts for A/B FAT32 image generation
- USB Gadget Mode so the Pi emulates a real USB thumb drive
- A MASSO forum–styled UI theme
- A Dirty / Sync / Attach / Detach workflow for safety and reliability

No more remembering the directory structure  
**MASSO Link — TURBO’d.**

---

⚠️ **Safety Notice – USB Sync While Machining**

This project can detect if MASSO is running a G-code program from TURBO when the TURBO HAT is used.

Even though a RUN_LOCK has been implemented, it is still recommended that you **never** click “Sync to USB” or “Detach” while the machine is cutting.

Doing so is similar to unplugging a USB stick while MASSO is reading from it. This can cause the job to fail and may damage the part, tooling, or worse.

Treat this device exactly like a normal USB flash drive: only update or sync when the machine is idle and not running a program from USB.

---

## Features

- Upload/delete files through a MASSO-themed web UI
- Automatic A/B FAT32 image build and swap
- “Dirty” indicator shows changed vs. committed files
- One‑click Sync to USB
- Reliable USB re-enumeration with Attach/Detach
- Lightweight and CNC‑friendly
- Runs entirely on the Pi — no cloud dependencies

---

## 1) Hardware & Software Requirements

- Raspberry Pi Zero 2 W

- USB SD Card Reader  
  Example: https://www.amazon.com/dp/B0B9R7H765

- Raspberry Pi-approved power supply  
  Example: https://www.amazon.com/dp/B00MARDJZ4

- USB Power Blocker  
  Example: https://www.amazon.com/dp/B094G4P3P4

- USB data cable (Male Micro ↔ Male A)  
  Example: https://www.amazon.com/dp/B003YKX6WM

- (Optional) Mini‑HDMI → HDMI cable for console access

---

## 2) First-Boot System Prep

- Download the TURBO image (`.img.gz`) file from the GitHub **Releases** page
- Download the `turbo-config.ini.example` file
- Download an OS image flasher (balenaEtcher, Raspberry Pi Imager, etc.)
- Flash the TURBO image to your SD card

---

## 3) Configure TURBO (turbo-config.ini)

Edit the configuration file **before first boot**.

1. Open `turbo-config.ini.example`
2. Edit the values below (do **not** use quotation marks)

```ini
HOSTNAME=turbo
USERNAME=your_username
PASSWORD=your_password

WIFI_SSID=YourWiFiName
WIFI_PSK=YourWiFiPassword
WIFI_COUNTRY=US
```

- `USERNAME` and `PASSWORD` are for **local Raspberry Pi access**
- These are **not** the FileBrowser login credentials

3. Save the file as `turbo-config.ini`
4. Copy it to the **root of the flashed SD card**
5. Remove the `.example` extension

---

## 4) Install SD Card & Boot

- Insert the SD card into the Raspberry Pi
- Connect the Pi to the MASSO controller:

  `MASSO ↔ Power Blocker ↔ USB Cable ↔ Pi`

- **Optional:** Connect a monitor to observe boot output  
  (The assigned IP address will be displayed once boot is complete)

> **Note:** First boot can take several minutes. This is normal.

---

## 5) Using the TURBO Web Interface

Open:

```
http://<pi-ip-address>
```

Default web login:

- **Username:** admin  
- **Password:** admin  

You’ll see:

- FileBrowser Quantum with MASSO-themed UI
- TURBO Controls sidebar:
  - Dirty indicator
  - Sync to USB
  - Attach / Detach

Typical workflow:

1. Upload files
2. Dirty indicator appears
3. Click **Sync to USB**
4. New FAT32 image is built
5. USB re-attaches
6. MASSO sees the updated files

---

## 6) How the A/B Swap System Works

Working directory:

```
/opt/filebrowser/masso
```

**Sync to USB** performs:

1. Detach USB gadget
2. Build fresh FAT32 image in inactive slot
3. `rsync` content into image
4. Flip `current.img` symlink
5. Write new signature
6. Re-attach USB gadget

---

## 7) Tuning & Customization

Change USB image size:

```
/usr/local/bin/masso-commit
```

Theme customization:

```
/opt/fbq-theme/masso-forum.css
```

Sidebar card positioning:

```
/opt/fbq-theme/masso.js
```

---

## 8) Security Notes

- `masso-shim` runs only on `localhost:8090`
- FileBrowser has restricted sudo access
- Use Nginx authentication if exposing TURBO on an untrusted network

---

## Appendix: Useful Commands

Restart services:

```bash
sudo systemctl restart masso-shim
sudo systemctl reload nginx
```

Force rebuild:

```bash
sudo /usr/local/bin/masso-detach
sudo /usr/local/bin/masso-commit
```

Clear signature:

```bash
sudo rm -f /opt/masso_images/.last_commit.sig
```

Clear stale loop devices:

```bash
sudo sh -c 'losetup -j /opt/masso_images/massoA.img | cut -d: -f1 | xargs -r losetup -d'
sudo sh -c 'losetup -j /opt/masso_images/massoB.img | cut -d: -f1 | xargs -r losetup -d'
```

---

## License

TURBO is released under the **MIT License**.

You may use, modify, and distribute this software freely, including for commercial use.  
See the [`LICENSE`](LICENSE) file for full details.
