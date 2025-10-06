# Cara menjalankan deployment di VPS

1. Login ke VPS via SSH:
```sh
ssh posma@<IP_VPS>
```

2. Masuk ke folder project:
```sh
cd ~/vue-weekly-tracker
```

3. Jalankan deploy.sh untuk update kode dan restart aplikasi:
```sh
bash deploy.sh
```

4. Jalankan setup-nginx.sh untuk setup/reload Nginx:
```sh
sudo bash setup-nginx.sh
```

5. Jalankan setup-ssl.sh untuk setup/renew SSL:
```sh
sudo bash setup-ssl.sh
```

6. Cek status aplikasi:
```sh
pm2 status
```

7. Jika ada error, cek log PM2:
```sh
pm2 logs tracker-api
```

---

Semua script sudah siap. Tinggal jalankan sesuai urutan di atas setiap kali update atau setup VPS baru.
