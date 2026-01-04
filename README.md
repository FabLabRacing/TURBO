# TURBO - Thumbdrive Unified Remote Browser Object

### A MASSO-themed, browser-based replacement for USB thumb drives

TURBO transforms a **Raspberry Pi Zero 2 W** into a **network-managed USB mass-storage device** that can upload files directly to your **MASSO CNC controller**.

It uses:

* FileBrowser Quantum (FBQ) for a clean web interface
* Custom scripts for A/B FAT32 image generation
* USB Gadget Mode so the Pi emulates a real USB thumb drive
* A MASSO forum–styled UI theme
* A Dirty / Sync / Attach / Detach workflow for safety and reliability
* **Selectable AP / Client networking modes (boot-time and on-demand)**

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

* Upload/delete files through a MASSO-themed web UI
* Automatic A/B FAT32 image build and swap
* “Dirty” indicator shows changed vs. committed files
* One-click Sync to USB
* Reliable USB re-enumeration with Attach/Detach
* **Selectable networking modes:**

  * **Client Mode:** joins your existing Wi-Fi network
  * **AP Mode:** TURBO creates its own Wi-Fi network (no infrastructure required)
* Deterministic, stateless network switching
* Runs entirely on the Pi — no cloud dependencies

---

## 1) Supported Hardware

* **Raspberry Pi Zero 2 W** (primary and supported target)

> Other Raspberry Pi models (Pi 3, Pi 4, etc.) may boot for development or testing, but **USB gadget mode and Ethernet operation are not supported** in the mainline TURBO project.
>
> TURBO is intentionally designed as a **wireless USB gadget appliance**. Ethernet-capable variants should be considered experimental or forked projects.

---

## 2) First-Boot System Prep

* Download the TURBO image (`.img.gz`) file from the GitHub **Releases** page
* Download the `turbo-config.ini.example` file
* Download an OS image flasher (balenaEtcher, Raspberry Pi Imager, etc.)
* Flash the TURBO image to your SD card

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

[network]
mode=client   # or: ap

[ap]
# Wi-Fi network name broadcast by TURBO in AP mode
ssid=PiThumbDrive

# WPA2 passphrase for the AP (8+ characters)
pass=ChangeMe123

# Static IP address assigned to TURBO in AP mode
ip=10.10.10.1

# Network mask in CIDR notation (24 = 255.255.255.0)
cidr=24

# DHCP address pool start
# First IP that will be handed out to clients
dhcp_start=10.10.10.10

# DHCP address pool end
# Last IP that will be handed out to clients
dhcp_end=10.10.10.200

# DHCP lease duration
# How long a client keeps its IP before renewal
lease=24h

# Wi-Fi channel used by the AP
# Choose a clear channel for best reliability
channel=6

# Regulatory country code (affects allowed channels and power)
country=US
```

* `USERNAME` and `PASSWORD` are for **local Raspberry Pi access**
* These are **not** the FileBrowser login credentials
* `mode=client` joins your existing Wi-Fi network
* `mode=ap` makes TURBO create its own Wi-Fi network (SSID: **PiThumbDrive**)

3. Save the file as `turbo-config.ini`
4. Copy it to the **root of the flashed SD card**
5. Remove the `.example` extension

---

## 4) Network Architecture (AP / Client)

TURBO networking is **explicit, deterministic, and stateless**.

* On boot, TURBO reads `/etc/turbo/turbo-config.ini`
* The requested mode is applied once by `turbo-net-apply`
* No background daemon continuously enforces network state

### AP Mode

* TURBO creates its own Wi-Fi network (SSID: **PiThumbDrive**)
* Clients receive an IP address automatically
* FileBrowser is reachable without external infrastructure
* NetworkManager is **runtime-masked** to prevent late-boot interference
* All AP configuration lives in RAM (`/run`)

### Client Mode

* NetworkManager manages Wi-Fi normally
* TURBO joins your existing network
* No AP services are running

You may switch modes manually at any time:

```bash
sudo turbo-net-apply --ap
sudo turbo-net-apply --client
```

> Note: If the mode is changed manually without editing the config file, the **next reboot will re-apply the configured mode**.

---

## 5) Install SD Card & Boot

* Insert the SD card into the Raspberry Pi

* Connect the Pi to the MASSO controller:

  `MASSO ↔ Power Blocker ↔ USB Cable ↔ Pi`

* **Optional:** Connect a monitor to observe boot output
  (The assigned IP address will be displayed once boot is complete)

> **Note:** First boot can take several minutes. This is normal.

---

## 6) Using the TURBO Web Interface

Open:

```
http://<pi-ip-address>
```

Default web login:

* **Username:** admin
* **Password:** admin

You’ll see:

* FileBrowser Quantum with MASSO-themed UI
* TURBO Controls sidebar:

  * Dirty indicator
  * Sync to USB
  * Attach / Detach

Typical workflow:

1. Upload files
2. Dirty indicator appears
3. Click **Sync to USB**
4. New FAT32 image is built
5. USB re-attaches
6. MASSO sees the updated files

---

## License

TURBO is released under the **MIT License**.

You may use, modify, and distribute this software freely, including for commercial use.
See the [`LICENSE`](LICENSE) file for full details.
