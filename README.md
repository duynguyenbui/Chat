# CT240 Principle of software construction - Chat Application

### Instructions:
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. mkdir certs in Chat Folder, run the following command:
  ```zsh
    mkdir certs
    cd certs
    mkcert -key-file chatapp.com.key -cert-file chatapp.com.crt app.chatapp.com api.chatapp.com 
  ```
3. In the Chat folder terminal, run the following command:
  ```zsh
    docker compose build && docker compose up
  ```
### Database:
![database](./img/database.png)



