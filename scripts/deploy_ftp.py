"""Uploads the built site (dist/) to the Timeweb hosting over FTP.

Run `npm run build` first, then `python scripts/deploy_ftp.py`. The password (the same as for the
Timeweb control panel) is asked for in the terminal and is never stored or printed.
"""
import ftplib
import getpass
import os
import sys

HOST = "vh460.timeweb.ru"
USER = "cg388984"
REMOTE_ROOT = "public_html"
LOCAL_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")
# the host's placeholder page would be served instead of the site's index.html
PLACEHOLDERS = ("index.php",)


def connect(password):
    try:
        ftp = ftplib.FTP_TLS(HOST, timeout=60)
        ftp.login(USER, password)
        ftp.prot_p()
        print("Подключено по FTPS (зашифровано).")
        return ftp
    except ftplib.error_perm:
        raise
    except (ftplib.Error, OSError, EOFError) as error:
        print(f"Зашифрованное подключение не удалось ({error or 'сервер закрыл соединение'}).")
        if input("Подключиться по обычному FTP без шифрования? [y/N] ").strip().lower() != "y":
            sys.exit("Отменено.")
        ftp = ftplib.FTP(HOST, timeout=60)
        ftp.login(USER, password)
        return ftp


def ensure_dir(ftp, path):
    try:
        ftp.mkd(path)
    except ftplib.error_perm as error:
        if not str(error).startswith("550"):
            raise


def upload(ftp):
    count = 0
    for root, dirs, files in os.walk(LOCAL_ROOT):
        relative = os.path.relpath(root, LOCAL_ROOT).replace(os.sep, "/")
        remote_dir = REMOTE_ROOT if relative == "." else f"{REMOTE_ROOT}/{relative}"
        for name in sorted(dirs):
            ensure_dir(ftp, f"{remote_dir}/{name}")
        for name in sorted(files):
            with open(os.path.join(root, name), "rb") as source:
                ftp.storbinary(f"STOR {remote_dir}/{name}", source)
            count += 1
            print(f"  {remote_dir}/{name}")
    return count


def main():
    if not os.path.isfile(os.path.join(LOCAL_ROOT, "index.html")):
        sys.exit("Нет собранного сайта: сначала запустите npm run build.")
    password = getpass.getpass(f"Пароль от панели Timeweb для {USER} (ввод скрыт): ")
    try:
        ftp = connect(password)
    except ftplib.error_perm as error:
        sys.exit(f"Вход не удался: {error}")
    except (ftplib.Error, OSError, EOFError) as error:
        sys.exit(f"Не удалось подключиться к {HOST}: {error or 'сервер закрыл соединение'}. Проверьте VPN и доступ к порту 21.")
    with ftp:
        existing = ftp.nlst()
        if REMOTE_ROOT not in [name.rsplit("/", 1)[-1] for name in existing]:
            sys.exit(f"На сервере нет папки {REMOTE_ROOT}. Есть: {', '.join(existing)}")
        in_root = [name.rsplit("/", 1)[-1] for name in ftp.nlst(REMOTE_ROOT)]
        print(f"Сейчас в {REMOTE_ROOT}: {', '.join(in_root) or 'пусто'}")
        for name in PLACEHOLDERS:
            if name in in_root:
                ftp.rename(f"{REMOTE_ROOT}/{name}", f"{REMOTE_ROOT}/{name}.bak")
                print(f"Заглушка {name} переименована в {name}.bak")
        count = upload(ftp)
    print(f"Готово: загружено файлов: {count}.")


if __name__ == "__main__":
    main()
