module.exports = {
  apps : [{
    name   : "tracker-api",
    script : "./server.js",

    // Baris ini sangat penting: secara eksplisit mematikan fitur 'watch'
    watch  : false, 

    // Menambahkan ini juga praktik yang baik
    ignore_watch: ["node_modules", "../schedule.db"],

    // Anda juga bisa menambahkan environment variables di sini
    env: {
      "NODE_ENV": "production",
    }
  }]
}
