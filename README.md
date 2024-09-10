# Sistema de Processamento e Armazenamento de Dados

Este projeto consiste em dois sistemas: um para limpar dados provenientes de arquivos TXT e outro para processar e armazenar esses dados em um banco de dados MySQL.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [MySQL](https://www.mysql.com/) (ou MariaDB)

## Configuração do Ambiente

### 1. Clone o Repositório

Clone o repositório para sua máquina local:

```bash
git clone <URL_DO_REPOSITORIO>
cd <DIRETORIO_DO_REPOSITORIO>
```

### 2. Instale as Dependências

Navegue até o diretório data-cleaning e instale as dependências necessárias para o sistema de limpeza de dados:

```bash
cd data-cleaning
npm install
```

Navegue até o diretório data-storage-api e instale as dependências necessárias para o sistema de armazenamento de dados:

```bash
cd ../data-storage-api
npm install
```

### 3. Configure o banco de dados

1. Crie um banco de dados no MySQL. Por exemplo, você pode criar um banco chamado data_processing.
2.Crie a tabela usuarios com a seguinte estrutura:

```bash
CREATE TABLE usuarios (
    id INT PRIMARY KEY,
    nome VARCHAR(255),
    idade INT,
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    data_cadastro DATE,
    ativo BOOLEAN,
    salario DECIMAL(10, 2)
);
```

### 4. Configure a Conexão com o Banco de Dados

1.Edite o arquivo api.js no diretório data-storage-api e configure as credenciais de conexão com o MySQL:

```bash
const db = mysql.createConnection({
    host: 'localhost',  // Nome do serviço do MySQL
    user: 'root',        // Seu usuário MySQL
    password: 'rootpassword', // Sua senha MySQL
    database: 'data_processing', // Nome do banco de dados
    port: 3306           // Porta do MySQL
});
```

### 5. Rodando o Sistema de Limpeza de Dados

1.Navegue até o diretório data-cleaning:

```bash
cd data-cleaning
```

2. Execute o script para processar e limpar os dados do arquivo JSON:

```bash
node data_cleaning.js
```

O script lerá o arquivo data/json.txt, processará os dados e salvará o resultado limpo em usuarios_limpos.json.

### 6. Rodando a API de Armazenamento de Dados

1. Navegue até o diretório data-storage-api:

```bash
cd data-storage-api
```

2. Inicie o servidor:

```bash
node api.js
```
O servidor começará a rodar na porta 3006 (ou outra configurada) e estará pronto para processar dados.

### 7. Testando a API

Para testar o endpoint /processar-dados da API, use uma ferramenta como Postman ou cURL para enviar uma requisição POST com os dados limpos em formato JSON. A URL será http://localhost:3006/processar-dados.


### Observações

1. **Substitua `<URL_DO_REPOSITORIO>` e `<DIRETORIO_DO_REPOSITORIO>`** com a URL do repositório GitHub e o nome do diretório que você clonou, respectivamente.
2. **Certifique-se de substituir** `'rootpassword'` com a senha real do seu usuário MySQL.
3. **Atualize a URL de teste** se a porta ou caminho de sua API forem diferentes.

Se precisar de mais assistência ou houver alguma dúvida, fique à vontade para perguntar!
