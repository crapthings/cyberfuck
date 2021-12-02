### TODO

- [x] barely working socks5 server
- [x] add a client implementation
- [ ] add a custom authentication
- [ ] encrypt stream
- [ ] support ipv4
- [ ] support ipv6
- [ ] cache dns lookup

### DEV

```bash
nodemon server.js
nodemon client.js
curl https://www.163.com -H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36" --socks5-hostname localhost:8900
````
