import os
import sys
import posixpath
import paramiko

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = "192.168.101.10"
USER = "thekevzin"
PASS = "KevinMakia2107"

LOCAL_PANEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Panel Admin"))
REMOTE_PANEL_DIR = "/home/thekevzin/servidor/panel"

EXCLUDE_DIRS = {".next", "node_modules", ".git"}
EXCLUDE_FILES = {
    "dev.db", "dev.db-journal", "drive-config.json", 
    "tsconfig.tsbuildinfo", ".DS_Store", "Thumbs.db"
}

def sftp_mkdir_p(sftp, remote_directory):
    if remote_directory in ("/", ""):
        return
    try:
        sftp.stat(remote_directory)
    except IOError:
        parent = posixpath.dirname(remote_directory)
        sftp_mkdir_p(sftp, parent)
        try:
            sftp.mkdir(remote_directory)
        except IOError:
            pass

def main():
    print(f"=== DEPLOY SERVERMAKIA PANEL TO {HOST} ===")
    print(f"Local source: {LOCAL_PANEL_DIR}")
    print(f"Remote destination: {REMOTE_PANEL_DIR}")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"\n[1/4] Connecting to {HOST}...")
        ssh.connect(HOST, username=USER, password=PASS, timeout=15)
        print("Connected successfully via SSH.")

        sftp = ssh.open_sftp()

        # Clean up legacy files that were removed locally
        legacy_removals = [
            f"{REMOTE_PANEL_DIR}/lib/data.ts",
            f"{REMOTE_PANEL_DIR}/middleware.ts"
        ]
        for rem_file in legacy_removals:
            try:
                sftp.remove(rem_file)
                print(f"  Removed obsolete remote file: {rem_file}")
            except IOError:
                pass

        print("\n[2/4] Syncing updated Panel Admin files to Ubuntu...")
        uploaded_count = 0
        for root, dirs, files in os.walk(LOCAL_PANEL_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if file in EXCLUDE_FILES or file.startswith(".env"):
                    continue

                local_path = os.path.join(root, file)
                rel_path = os.path.relpath(local_path, LOCAL_PANEL_DIR).replace("\\", "/")
                remote_path = posixpath.join(REMOTE_PANEL_DIR, rel_path)
                remote_dir = posixpath.dirname(remote_path)

                sftp_mkdir_p(sftp, remote_dir)

                # Check if file needs upload (compare mtime / size)
                should_upload = True
                try:
                    rstat = sftp.stat(remote_path)
                    lstat = os.stat(local_path)
                    if rstat.st_size == lstat.st_size and abs(rstat.st_mtime - lstat.st_mtime) < 2:
                        should_upload = False
                except IOError:
                    should_upload = True

                if should_upload:
                    sftp.put(local_path, remote_path)
                    uploaded_count += 1
                    if uploaded_count <= 25 or uploaded_count % 10 == 0:
                        print(f"  Uploaded: {rel_path}")

        print(f"Total files uploaded/updated: {uploaded_count}")
        sftp.close()

        print("\n[3/4] Building Next.js panel on remote server...")
        cmd = f"cd {REMOTE_PANEL_DIR} && npm install --prefer-offline && npm run build"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        for line in iter(stdout.readline, ""):
            if "Compiled successfully" in line or "Generating static pages" in line or "Route (app)" in line:
                print(" ", line.strip())

        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            err = stderr.read().decode(errors='replace')
            print(f"❌ Build failed with exit code {exit_status}!")
            print(err)
            return

        print("\n[4/4] Restarting PM2 service `panel`...")
        _, p_out, _ = ssh.exec_command("pm2 restart panel")
        print(p_out.read().decode())

        print("\n=== DEPLOYMENT COMPLETED SUCCESSFULLY! ===")
        print(f"Panel is LIVE at http://{HOST}:3000/")

    except Exception as e:
        print(f"\n❌ Deployment error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
