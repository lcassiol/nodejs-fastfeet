<h1>FastFeet backend</h1>

Este projeto faz parte do desafio final do curso GoStack da Rocketseat

**Descrição**: Backend de um sistema de entrega ficticio idealizado pela rocketseat para o desafio de conclusão, o sistema foi desenvolvido para que tenha duas frentes, a aplicação web por sua vez é o painel administrativo apenas acessado pelos admins da aplicação com usuario e senha, com as seguintes funções: <br><br>
- **Gerenciar Encomendas**,  
- **Gerenciar Entregadores**,   
- **Gerenciar Destinatários**, <br>
- **Gerenciar Problemas na encomenda**, 

e o aplicativo apenas para os entregadores com a possibilidade do entregador:

- **Ver suas entregas (Finalizadas ou ainda em andamento)**
- **Confirmar retirada de um pacote**
- **Reportar problemas na tentativa de entrega**
- **Listar problemas da entrega**
- **Finalizar a entrega sendo obrigado a tirar uma foto da confirmação da entrega (uma assinatura do cliente neste caso)**


-------------------------------------
-> Após o download dar o comando `yarn` para instalar as dependências do projeto e em seguida


-> Sugestão para rodar localmente sem precisar baixar o sgbd utilizar o docker, no meu caso utilizei o postgres usei este comando:

`docker run --name nome-dainstancia -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres`

- Depois deste comando o postgres ja vai estar rodando, é necessario criar o schema do banco, recomendo a utilização do DBeaverv  https://dbeaver.io

- Em seguida necessário rodar as migrações, para isso rode o comando
`yarn sequelize db:migrate`

- Seeds devem ser instaladas tambem, pois o usuario admin da aplicação vai ser criado ao rodar o comando
`yarn sequelize db:seed:all`

- Usuario admin: 

login: `admin@fastfeet.com`<br>
password: `123456`

**Para rodar a aplicação - `yarn dev`**


--------------------

### Frontend da aplicação em Reactjs <br>
https://github.com/lcassiol/reactjs-fastfeet

### Mobile React-native <br>
https://github.com/lcassiol/RN-fastfeet


