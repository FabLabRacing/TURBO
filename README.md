# TURBO - Thumbdrive Unified Remote Browser Object
### A MASSO-themed, browser-based replacement for USB thumb drives

TURBO transforms a **Raspberry Pi Zero 2 W** into a **network-managed USB mass-storage device** that can upload files directly to your **MASSO CNC controller**.

It uses:

- FileBrowser Quantum (FBQ) for a clean web interface
- Custom scripts for A/B FAT32 image generation
- USB Gadget Mode so the Pi emulates a real USB thumb drive
- A MASSO forum–styled UI theme
- A Dirty / Sync / Attach / Detach workflow for safety and reliability

No more removing USB sticks.  
No more walking back and forth.  
**MASSO Link — TURBO’d.**

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

# 0) Hardware & Software Requirements

- Raspberry Pi Zero 2 W (recommended)
- USB data cable (Pi ↔ MASSO or PC)
- Raspberry Pi-approved power supply
- Raspberry Pi OS Lite (64‑bit)
  - Preconfigure using Raspberry Pi Imager (hostname, Wi‑Fi optional, SSH)
- USB Power Blocker  
  Example: https://www.amazon.com/dp/B094G4P3P4
- Male A ↔ Male A USB cable  
  Example: https://www.amazon.com/dp/B07BZ2M3WM
- (Optional) USB Ethernet adapter
- (Optional) Mini‑HDMI → HDMI cable for console access

---

# 1) First-Boot System Prep

SSH into the Pi:

```
user: masso
pass: masso
```

Run:

```
sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx dosfstools util-linux rsync unzip python3 dnsmasq hostapd git unzip
sudo useradd -r -s /bin/false filebrowser
sudo reboot
```

---

# 2) Enable USB Gadget Mode

Edit:

### `/boot/firmware/config.txt`
```
[all]
dtoverlay=dwc2,dr_mode=peripheral
```

### `/boot/firmware/cmdline.txt`
Add **after `rootwait`**, keeping the file as **one line**:

```
modules-load=dwc2
```

Reboot and verify:

```
ls /sys/class/udc
# Expect something like: 3f980000.usb
```

---

# 3) Install TURBO Bundle

Copy the archive to the Pi and extract:

```
sudo tar --no-same-owner -xzf turbo_bundle_v1_0.tar.gz -C /
```

Make scripts executable:

```
sudo chmod +x /usr/local/bin/masso-attach \
              /usr/local/bin/masso-detach \
              /usr/local/bin/masso-commit \
              /usr/local/bin/masso-gadget-init \
              /usr/local/bin/masso-shim.py \
              /usr/local/bin/filebrowser
```

Set ownership:

```
sudo chown -R filebrowser:filebrowser /opt/filebrowser /opt/filebrowser/masso /opt/fbq-theme /usr/local/bin/filebrowser
```

Enable services:

```
sudo systemctl daemon-reload
sudo systemctl enable filebrowser
sudo systemctl start filebrowser
sudo systemctl enable --now masso-shim

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/fbq /etc/nginx/sites-enabled/fbq
sudo nginx -t && sudo systemctl reload nginx
```

---

# 4) Initialize USB Gadget & Create Initial Image

One‑time gadget init:

```
sudo /usr/local/bin/masso-gadget-init
```

Create image storage:

```
sudo mkdir /opt/masso_images
sudo fallocate -l 20G /opt/masso_images/massoA.img
sudo mkfs.vfat -F32 -n MASSOUSB /opt/masso_images/massoA.img
sudo ln -sf /opt/masso_images/massoA.img /opt/masso_images/current.img
```

Attach TURBO as a USB device:

```
sudo /usr/local/bin/masso-attach
```

MASSO should now detect a “MASSO USB” drive.

---

# 5) Using the TURBO Web Interface

Open:

```
http://<pi-ip-address>/
```

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

# 6) Health Checks & Troubleshooting

Status:

```
curl -s http://127.0.0.1:8090/status | jq .
journalctl -u masso-shim -n 80 --no-pager
```

USB Gadget state:

```
ls /sys/class/udc
sudo cat /sys/kernel/config/usb_gadget/masso/UDC
sudo cat /sys/kernel/config/usb_gadget/masso/functions/mass_storage.usb0/lun.0/file
```

Signatures:

```
cat /opt/masso_images/.last_commit.sig
```

Working signature:

```
bash -lc "cd /opt/filebrowser/masso; find . -type f -printf '%P\t%T@\t%s\n' | LC_ALL=C sort | sha256sum | cut -d' ' -f1"
```

If updates don't appear on MASSO:

- Try Detach → Sync → Attach
- Check kernel messages:

```
dmesg | tail -n 80
```

---

# 7) How the A/B Swap System Works

Working directory:

```
/opt/filebrowser/masso
```

Sync to USB performs:

1. Detach gadget  
2. Build fresh FAT32 image in inactive slot  
3. `rsync` content into image  
4. Flip `current.img` symlink  
5. Write new signature  
6. Re-attach gadget  

---

# 8) Tuning & Customization

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

# 9) Security Notes

- `masso-shim` runs only on `localhost:8090`
- `filebrowser` has restricted sudo access
- Use Nginx auth if exposing this on an untrusted network

---

# Appendix: Useful Commands

Restart services:

```
sudo systemctl restart masso-shim
sudo systemctl reload nginx
```

Force rebuild:

```
sudo /usr/local/bin/masso-detach
sudo /usr/local/bin/masso-commit
```

Clear signature:

```
sudo rm -f /opt/masso_images/.last_commit.sig
```

Clear stale loop devices:

```
sudo sh -c 'losetup -j /opt/masso_images/massoA.img | cut -d: -f1 | xargs -r losetup -d'
sudo sh -c 'losetup -j /opt/masso_images/massoB.img | cut -d: -f1 | xargs -r losetup -d'
```

---

# Licensing & Attribution

TURBO is released under the **MIT License**.  
You may use, modify, distribute, and include this software in commercial or closed-source projects.

Third‑party components (FileBrowser Quantum, Nginx, standard Linux tools) retain their original licenses.

---

# MIT License

Copyright (c) 2025 Jeff Akerson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
