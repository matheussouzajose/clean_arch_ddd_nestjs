# Clean Architecture com DDD e NestJS

Este é um exemplo que demonstra a aplicação de princípios de Clean Architecture e Domain-Driven Design (DDD) utilizando o framework NestJS para construção de APIs em Node.js.

## Estrutura do Projeto

Arquitetura baseada em Clean Architecture e DDD, composta por várias camadas:

1. **Camada de Infraestrutura**: Responsável por lidar com detalhes técnicos, como acesso a banco de dados, logging e configuração de servidores.
2. **Camada de Domínio**: Contém as entidades de negócio e as regras de domínio, mantendo-se independente de detalhes de implementação.
3. **Camada de Aplicação**: Gerencia casos de uso da aplicação, orquestrando a interação entre as entidades de domínio.
4. **Camada de Interface de Usuário**: Fornece interfaces para interação com o sistema, como APIs RESTful, GraphQL, entre outros.
