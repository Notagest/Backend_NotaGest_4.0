# 📦 Backend - Projeto Integrador (PI)

## 📌 Descrição
Este repositório contém o **backend** do Projeto Integrador (PI), responsável por fornecer a API da aplicação, gerenciar regras de negócio, autenticação e integração com banco de dados.

---

## 🚀 Tecnologias utilizadas
- Node.js  
- Express.js  
- TypeScript  
- MongoDB 
- Docker  
- Better Stack (Observabilidade)

---

## Docker

Este projeto utiliza Docker para facilitar a execução em qualquer ambiente.

---

## ⚙️ Comandos Docker

### 🔹 1. Build da imagem

```bash
docker build -t backendnotagest .
````

### 🔹 2. Rodar o container

```bash
docker run -d -p 5000:5000 backendnotagest
````
## 🔍 Observabilidade (Logs)

Foi implementado um sistema de observabilidade no backend utilizando middleware para interceptação de requisições, respostas e erros, com envio de logs para o Better Stack.

---

## 🧪 Testes de Observabilidade

### ✅ 1. Testes de Sucesso (LOG INFO)

Os logs de nível **INFO** são gerados quando as requisições são processadas com sucesso.

#### 🔹 1.1 Buscar usuário logado
- GET /api/users/me
  
<img width="579" height="56" alt="1 1" src="https://github.com/user-attachments/assets/1a7acfb6-e873-4148-9659-87411aaf0d16" />

<img width="739" height="348" alt="1 1 1" src="https://github.com/user-attachments/assets/7faede42-7702-48d2-83fe-14b42b20ff9d" />

#### 🔹 1.2 Buscar usuário por email
GET /api/users/byEmail/:email

<img width="610" height="55" alt="1 2 1" src="https://github.com/user-attachments/assets/21e49f09-eb4c-4460-ba2e-e000665e7db6" />

<img width="744" height="364" alt="1 2 2" src="https://github.com/user-attachments/assets/1843ed90-e427-4de3-b724-ad2c216dad8b" />

#### 🔹 1.3 Buscar perfil por ID
GET /api/users/:id

<img width="608" height="113" alt="1 3 1" src="https://github.com/user-attachments/assets/e1dbd1d6-a743-4bc6-bc22-72602312cd8b" />

<img width="744" height="405" alt="1 3 3" src="https://github.com/user-attachments/assets/f4be34bd-fa28-46b0-9cd2-103bb7c0587e" />

<img width="738" height="370" alt="1 3 2" src="https://github.com/user-attachments/assets/d834d573-ca76-4cd5-9981-00169832bf28" />

#### 🔹 1.4 Atualizar perfil
PUT /api/users/:id 

<img width="700" height="112" alt="1 4 1" src="https://github.com/user-attachments/assets/be844e5e-c246-4a4b-b21b-cc40179ee608" />

<img width="744" height="367" alt="1 4 2" src="https://github.com/user-attachments/assets/5d4eabc1-0135-43a5-9282-9ad2f50410c6" />

<img width="745" height="476" alt="1 4 3" src="https://github.com/user-attachments/assets/322dabff-c02b-4217-8ec5-fa14068ab61d" />

### ❌ 2. Testes de Erro (LOG ERROR)

#### 🔹 2.1 Token inválido
- GET /api/users/me

<img width="543" height="52" alt="2 1" src="https://github.com/user-attachments/assets/f4b7f028-f3cb-4227-adb0-b477cf3c44a9" />

<img width="736" height="378" alt="2 2" src="https://github.com/user-attachments/assets/41ededea-d672-423f-9b49-38e74db82a08" />

#### 🔹 2.2 Usuário não existe
- GET /api/users/ID_INEXISTENTE

<img width="691" height="52" alt="2 2 1" src="https://github.com/user-attachments/assets/3dcb6d4f-a2a6-4019-a914-07293054c8f4" />

<img width="747" height="394" alt="2 2 2" src="https://github.com/user-attachments/assets/3a79fec9-828a-4193-95a7-a027ed48eecc" />

### 🔹 2.3 Erro forçado 
 - PUT /api/users/:id
   Body inválido:
  {
    "email": 123
  }

<img width="718" height="53" alt="2 3 1" src="https://github.com/user-attachments/assets/3f9c854f-a3a1-4569-9a8c-d9e0cb7337a0" />

<img width="595" height="778" alt="2 3 2" src="https://github.com/user-attachments/assets/61f3073b-e22e-4dc8-b3e5-b905ec9b4b28" />

### ❗ 3. Testes para alerta

<img width="1153" height="257" alt="teste alerta" src="https://github.com/user-attachments/assets/3fc026da-74fd-4101-b430-f0225c46a3fc" />

### ALERTA - ERROS (500/401)

<img width="621" height="304" alt="alerta erros 500" src="https://github.com/user-attachments/assets/d3e05323-82a6-4161-a39e-99123f82cdf2" />

<img width="1187" height="391" alt="log" src="https://github.com/user-attachments/assets/5b14d7c5-88d5-428b-a2df-1cc6ca627a16" />

<img width="899" height="669" alt="log2" src="https://github.com/user-attachments/assets/f3dbbb6a-3cc7-494b-85b5-ec69df6b3735" />

### ALERTA  — PICO DE REQUEST
– GET http://localhost:5000/api/users/me  - 401 pois testei sem o Token 

<img width="739" height="142" alt="picorequest1" src="https://github.com/user-attachments/assets/1d0ebdb4-19f0-4a3b-a3e5-ccd9870b82a0" />

<img width="640" height="273" alt="picorequest2" src="https://github.com/user-attachments/assets/ccc0e035-08b1-4d4a-adf7-b0c4781dce9b" />

<img width="1182" height="398" alt="picorequest3" src="https://github.com/user-attachments/assets/c55d5f7d-5748-4d17-b1f5-c18b551b4490" />

<img width="629" height="641" alt="picorequest4" src="https://github.com/user-attachments/assets/092bf44f-4db5-4c74-9a79-1cd639abf998" />

### ALERTA — LENTIDÃO
Qualquer requisição acima de 1 (segundo) já dispara alerta
– GET http://localhost:5000/api/users/me  - 401 pois testei sem o Token 

<img width="542" height="243" alt="lentidao1" src="https://github.com/user-attachments/assets/40bfed35-593d-461a-8c43-95a15c1000b3" />

<img width="1162" height="385" alt="lentidao2" src="https://github.com/user-attachments/assets/a42592ba-5cf7-4143-b602-da70a83343a5" />

<img width="680" height="636" alt="lentidao3" src="https://github.com/user-attachments/assets/ea2facbe-a8d0-4bd3-9f46-8b6729141cde" />

### Integrantes do Projeto:
- Ana Laura Martins
- Bianca Benatti
- José Paulo
- Rodolfo Antunes

---

## 🚀 Entrega 3 - Orquestração e CI/CD

### 🐳 Docker Compose (Rodar Projeto Completo)
Este repositório contém o arquivo `docker-compose.yml` que orquestra todo o ecossistema NotaGest (Frontend, Backend, Microsserviço e Banco de Dados).

Para rodar tudo localmente, certifique-se de que as pastas `Frontend_NotaGest_4.0` e `Microsservico_NotaGest_4.0` estão no mesmo nível de diretório que esta pasta e execute:

```bash
docker-compose up --build
```

### 📦 Imagens no Docker Hub
As imagens oficiais e versionadas deste projeto estão disponíveis em:
- **Backend:** `[SEU-USUARIO]/notagest-backend`
- **Frontend:** `[SEU-USUARIO]/notagest-frontend`
- **Microsserviço:** `[SEU-USUARIO]/notagest-microservice`

### 🛡️ DevSecOps
Integração com **Sonar Cloud** configurada nos Workflows do GitHub Actions para análise de segurança e qualidade.
