Leia a versão original aqui: [README.md](https://github.com/kiLeo13/SimpleNotesWebsite/blob/master/README.md).

# ✨ OnnyC

OnnyC é uma aplicação web leve e de alta performance, projetada para otimizar a anotação e o gerenciamento de arquivos, inspirada na interface do ChatGPT.

-----

## ❓ O Problema

Serviços tradicionais de armazenamento em nuvem, embora poderosos, podem se tornar lentos e complicados ao lidar com estruturas de pastas muito aninhadas. Essa complexidade frequentemente leva a uma queda na produtividade quando tudo o que você precisa é de acesso rápido às suas notas e arquivos.

## 💡 A Solução

OnnyC oferece um SPA simples, onde suas notas estão imediatamente acessíveis a partir de uma barra de navegação lateral esquerda. Esse design elimina a necessidade de clicar em várias pastas, permitindo que você crie, visualize e gerencie seu conteúdo com velocidade excepcional. Embora tenha sido inicialmente construído para uso interno de empresas para aumentar a produtividade, ele foi projetado para ser útil para qualquer pessoa.

-----

## ⚙ Arquitetura

O projeto é construído sobre uma arquitetura moderna e nativa da nuvem, projetada para escalabilidade, segurança e baixo custo, utilizando principalmente serviços da AWS e Cloudflare.

### Frontend

  * **Hospedagem:** O frontend é uma Single-Page Application (SPA) hospedada no Cloudflare Pages. Isso proporciona distribuição de conteúdo global através de sua CDN para tempos de acesso mais rápidos, proteção contra ataques DDoS e gerenciamento de TLS/SSL.
  * **Deployment:** Um fluxo de CI/CD é acionado automaticamente pela Cloudflare sempre que o código é enviado para a branch `master` no GitHub.

### Backend

  * **Compute:** O backend da API é uma aplicação multitenant escrita em Golang e executada dentro de um container Docker em uma instância AWS EC2.
  * **API Gateway & Segurança:** O AWS API Gateway atua como um proxy reverso. Ele lida com a terminação TLS (HTTPS), gerencia autorização e rate-limiting, e roteia as requisições de forma segura para a instância EC2.
  * **Autenticação:** A autenticação de usuários é totalmente gerenciada pelo AWS Cognito, que cuida do cadastro de usuários, hashing de senhas, verificação de e-mail e da geração/validação de JWTs.
  * **Armazenamento de Arquivos:** Todas as imagens e arquivos enviados pelos usuários são armazenados de forma segura em um bucket AWS S3 e servidos globalmente através da CDN AWS CloudFront para acesso de baixa latência.
  * **Gerenciamento de Secrets:** Todas as credenciais sensíveis, como chaves de API e detalhes de conexão com o banco de dados, são armazenadas e criptografadas de forma segura usando o AWS Systems Manager (SSM) Parameter Store.

-----

## 🖥 Como Executar & Fazer Deploy

### Configuração Local

1.  Clone o repositório do GitHub.
2.  Construa a imagem Docker:
    ```bash
    docker build -t onnyc .
    ```

> [!Note]
> Devido à profunda integração do projeto com os serviços da AWS (Cognito, S3, SSM), ele não funcionará corretamente em um ambiente local sem uma extensa configuração da AWS e de suas credenciais.

### Deployment

O deploy do backend é automatizado usando **Docker** e **WatchTower**.

1.  A aplicação Golang é compilada e enviada como uma imagem Docker para o GitHub Container Registry.
2.  Uma instância do WatchTower, em execução no servidor EC2, verifica o registro a cada 5 minutos.
3.  Se uma nova imagem for detectada, o WatchTower automaticamente baixa a nova versão e reinicia o container com o código atualizado.

-----

## 🔬 Stack de Tecnologias

### Cloud & Serviços AWS

  * **Compute:** AWS EC2
  * **Armazenamento:** AWS S3
  * **CDN:** AWS CloudFront, Cloudflare Pages
  * **Rede & API:** AWS API Gateway
  * **Segurança & Identidade:** AWS Cognito, AWS IAM
  * **Configuração & Secrets:** AWS SSM Parameter Store

### Backend

  * **Linguagem:** **Golang**
  * **Frameworks & Bibliotecas:**
      * [Echo v4](https://github.com/labstack/echo) - Framework web Go de alta performance e extensível.
      * [Gorm](https://github.com/go-gorm/gorm) - Uma fantástica biblioteca ORM para Go.
      * [AWS SDK for Go v2](https://github.com/aws/aws-sdk-go-v2) - SDK oficial da AWS para Go.
      * [go-playground/validator](https://github.com/go-playground/validator) - Para validação de structs.
      * [golang-jwt/jwt](https://github.com/golang-jwt/jwt) - Para parsing e validação de JWTs.

### Frontend

> O frontend está atualmente sendo reescrito em React para melhorar a manutenibilidade e a performance. A versão atual usa jQuery.

  * **Frameworks/Bibliotecas:**
      * [jQuery](https://github.com/jquery/jquery)
      * [DOMPurify](https://github.com/cure53/dompurify) - Sanitizador de XSS para HTML.
      * [jwt-decode](https://github.com/auth0/jwt-decode) - Para decodificar JWTs no lado do cliente.
      * [Marked](https://github.com/markedjs/marked) - Um parser de markdown.
  * **Ferramentas de Build:**
      * [Vite](https://github.com/vitejs/vite)
      * [Terser](https://github.com/terser/terser)

### Banco de Dados

  * **Banco de Dados**: **SQLite** (montado em um volume Docker para persistência).

### Containerização

  * **Ferramenta:** **Docker**.

-----

## 🤔 Limitações & Notas de Segurança

Este projeto foi desenhado para se encaixar nos free-tiers dos serviços em cloud. Isso levou a certas decisões de arquitetura e limitações.

  * **Segurança da API:** A comunicação entre o API Gateway e a instância EC2 é atualmente feita via HTTP, pois um link privado de VPC não é utilizado. Para mitigar o risco de acesso direto e não autorizado ao IP do EC2, a API possui um middleware que realiza uma segunda camada de validação do JWT usando a assinatura do Cognito.
  * **Segurança na Entrega de Conteúdo:** Uma melhoria planejada é proteger o conteúdo servido pelo CloudFront. Isso será implementado usando uma função **Lambda@Edge** para validar o token Cognito de um usuário antes de servir um arquivo privado do S3.
  * **Tokens de Autorização:** A aplicação atualmente usa `id_token`s do Cognito para autorização. Isso será atualizado em breve para usar `access_token`s com scopes adequados, de acordo com as melhores práticas do OAuth 2.0.
